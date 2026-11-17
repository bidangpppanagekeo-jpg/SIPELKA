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

export function getCurrentFirebaseUser(): User | null {
  return auth.currentUser;
}

export function subscribeFirebaseAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
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
  const user = auth.currentUser || (await signInGoogleAdmin());

  const cleanSheetUrl = (config.sheetUrl || '').trim().slice(0, 1000);
  const cleanWebhookUrl = (config.webhookUrl || '').trim().slice(0, 1000);
  const autoSync = Boolean(config.autoSync);

  if (!cleanWebhookUrl || !/^https?:\/\/.+/.test(cleanWebhookUrl)) {
    throw new Error('URL Webhook Google Apps Script wajib diisi dengan format https://...');
  }
  if (cleanSheetUrl && !/^https?:\/\/.+/.test(cleanSheetUrl)) {
    throw new Error('Format URL Google Sheet harus diawali dengan https://...');
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
        updatedByUid: user.uid,
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(ref, {
        sheetUrl: cleanSheetUrl,
        webhookUrl: cleanWebhookUrl,
        autoSync,
        updatedByUid: user.uid,
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
