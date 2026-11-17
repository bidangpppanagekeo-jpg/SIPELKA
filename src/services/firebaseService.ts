import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { GoogleSheetConfig } from './storageService';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

const SETTINGS_COLLECTION = 'settings';
const GOOGLE_SHEET_DOC_ID = 'google_sheet';
const GOOGLE_SHEET_DOC_PATH = `${SETTINGS_COLLECTION}/${GOOGLE_SHEET_DOC_ID}`;

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

export function getCurrentFirebaseUser(): User | null {
  return auth.currentUser;
}

export function subscribeFirebaseAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export function isUnauthorizedDomainError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const code = (err as { code?: string } | null)?.code || '';
  return code === 'auth/unauthorized-domain' || msg.includes('auth/unauthorized-domain');
}

export function formatFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string } | null)?.code || '';
  const raw = err instanceof Error ? err.message : String(err);
  if (code === 'auth/unauthorized-domain' || raw.includes('auth/unauthorized-domain')) {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    return `Domain "${host}" belum didaftarkan di Authorized Domains Firebase Authentication. Tambahkan domain ini di Firebase Console > Authentication > Settings > Authorized domains, lalu coba lagi.`;
  }
  if (code === 'auth/popup-blocked' || raw.includes('auth/popup-blocked')) {
    return 'Popup login Google diblokir oleh browser. Izinkan popup untuk situs ini lalu coba lagi.';
  }
  if (code === 'auth/popup-closed-by-user' || raw.includes('auth/popup-closed-by-user')) {
    return 'Jendela login Google ditutup sebelum verifikasi selesai.';
  }
  return raw;
}

export async function signInGoogleAdmin(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function signOutGoogleAdmin(): Promise<void> {
  await signOut(auth);
}

export async function readSheetConfigFromFirestore(): Promise<GoogleSheetConfig | null> {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, GOOGLE_SHEET_DOC_ID);
    let snap;
    try {
      snap = await getDocFromServer(ref);
    } catch (serverErr) {
      if (
        serverErr instanceof Error &&
        (serverErr.message.includes('offline') || serverErr.message.includes('unavailable'))
      ) {
        snap = await getDoc(ref);
      } else {
        throw serverErr;
      }
    }

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data() as {
      sheetUrl?: string;
      webhookUrl?: string;
      autoSync?: boolean;
      updatedAt?: { toDate?: () => Date };
    };

    const webhookUrl = typeof data.webhookUrl === 'string' ? data.webhookUrl.trim() : '';
    const sheetUrl = typeof data.sheetUrl === 'string' ? data.sheetUrl.trim() : '';
    if (!webhookUrl && !sheetUrl) {
      return null;
    }

    let lastSyncedAt: string | undefined;
    if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
      lastSyncedAt = data.updatedAt.toDate().toISOString();
    }

    return {
      sheetUrl,
      webhookUrl,
      autoSync: typeof data.autoSync === 'boolean' ? data.autoSync : true,
      lastSyncedAt
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, GOOGLE_SHEET_DOC_PATH);
  }
}

export async function saveSheetConfigToFirestore(
  config: GoogleSheetConfig
): Promise<GoogleSheetConfig> {
  const writerUid = auth.currentUser?.uid || 'ADM-NAGEKEO-001';

  const cleanSheetUrl = (config.sheetUrl || '').trim().slice(0, 1000);
  const cleanWebhookUrl = (config.webhookUrl || '').trim().slice(0, 1000);
  const autoSync = Boolean(config.autoSync);

  if (
    !cleanWebhookUrl ||
    !/^https:\/\/script\.google\.com\/.*macros\/.+\/exec(\?.*)?$/.test(cleanWebhookUrl)
  ) {
    throw new Error(
      'URL Webhook harus berupa endpoint Google Apps Script Web App yang valid (diawali https://script.google.com/.../exec).'
    );
  }
  if (cleanSheetUrl && !/^https:\/\/docs\.google\.com\/spreadsheets\/.+/.test(cleanSheetUrl)) {
    throw new Error(
      'URL Google Sheet harus berupa tautan Google Spreadsheet yang valid (diawali https://docs.google.com/spreadsheets/...).'
    );
  }

  const ref = doc(db, SETTINGS_COLLECTION, GOOGLE_SHEET_DOC_ID);
  let exists = false;
  try {
    const existingSnap = await getDoc(ref);
    exists = existingSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, GOOGLE_SHEET_DOC_PATH);
  }

  try {
    if (exists) {
      await updateDoc(ref, {
        sheetUrl: cleanSheetUrl,
        webhookUrl: cleanWebhookUrl,
        autoSync,
        updatedByUid: writerUid,
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(ref, {
        sheetUrl: cleanSheetUrl,
        webhookUrl: cleanWebhookUrl,
        autoSync,
        updatedByUid: writerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      exists ? OperationType.UPDATE : OperationType.CREATE,
      GOOGLE_SHEET_DOC_PATH
    );
  }

  return {
    sheetUrl: cleanSheetUrl,
    webhookUrl: cleanWebhookUrl,
    autoSync,
    lastSyncedAt: new Date().toISOString()
  };
}

export function formatFirestoreErrorForUser(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw) as Partial<FirestoreErrorInfo>;
      const msg = parsed.error || raw;
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('insufficient')) {
        const email = parsed.authInfo?.email;
        return email
          ? `Akses simpan ke Cloud ditolak untuk akun ${email}. Pastikan Anda login menggunakan akun Google Admin terdaftar (bidangpppanagekeo@gmail.com).`
          : 'Akses simpan ke Cloud ditolak. Silakan verifikasi login menggunakan akun Google Admin resmi (bidangpppanagekeo@gmail.com).';
      }
      return msg;
    } catch {
      return raw;
    }
  }
  return raw;
}
