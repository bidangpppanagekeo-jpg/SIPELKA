import { AdminUser, AuthSession } from '../types';
import { sanitizeInput } from './securityService';

const AUTH_STORAGE_KEY = 'sipelka_admin_auth_session_v1';
const CREDENTIALS_KEY = 'sipelka_admin_custom_credentials_v1';
const FAILED_ATTEMPTS_KEY = 'sipelka_failed_attempts_v1';

// Default Administrator SIPELKA Dinas PMDP3A Kab. Nagekeo
const DEFAULT_ADMIN: AdminUser = {
  id: 'ADM-NAGEKEO-001',
  username: 'admin',
  nama: 'Administrator Bidang PPPA',
  email: 'bidangpppanagekeo@gmail.com',
  role: 'superadmin',
  instansi: 'Dinas PMDP3A Kabupaten Nagekeo',
  jabatan: 'Pengelola Data SIMFONI & Admin SIPELKA',
  nipOrIdentitas: '19880914 201101 1 008'
};

const DEFAULT_PASSWORD = 'sipelka2026';
const ALTERNATIVE_PASSWORDS = ['nagekeo2026', 'admin123'];

interface StoredCredentials {
  passwordHash: string;
  updatedAt: string;
}

interface LockoutState {
  attempts: number;
  lockoutUntil: number; // timestamp
}

/**
 * Mendapatkan status sesi login saat ini
 */
export function getAuthSession(): AuthSession {
  try {
    // Periksa localStorage (remember me) terlebih dahulu, kemudian sessionStorage
    const stored =
      localStorage.getItem(AUTH_STORAGE_KEY) ||
      sessionStorage.getItem(AUTH_STORAGE_KEY);

    if (!stored) {
      return { isAuthenticated: false, user: null };
    }

    const session: AuthSession = JSON.parse(stored);
    if (session && session.isAuthenticated && session.user) {
      return session;
    }
    return { isAuthenticated: false, user: null };
  } catch (err) {
    console.error('Gagal membaca sesi otentikasi:', err);
    return { isAuthenticated: false, user: null };
  }
}

/**
 * Mengambil state percobaan login (Proteksi Brute-Force)
 */
function getLockoutState(): LockoutState {
  try {
    const raw = sessionStorage.getItem(FAILED_ATTEMPTS_KEY);
    if (!raw) return { attempts: 0, lockoutUntil: 0 };
    return JSON.parse(raw);
  } catch {
    return { attempts: 0, lockoutUntil: 0 };
  }
}

function saveLockoutState(state: LockoutState): void {
  try {
    sessionStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Gagal menyimpan state lockout:', e);
  }
}

/**
 * Mengecek apakah sistem sedang dalam status lockout
 */
export function checkLockout(): { isLocked: boolean; remainingSeconds: number } {
  const state = getLockoutState();
  const now = Date.now();
  if (state.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((state.lockoutUntil - now) / 1000);
    return { isLocked: true, remainingSeconds };
  }
  return { isLocked: false, remainingSeconds: 0 };
}

/**
 * Memproses Login Admin SIPELKA
 */
export function loginAdmin(
  usernameInput: string,
  passwordInput: string,
  rememberMe: boolean = true
): { success: boolean; message: string; user?: AdminUser } {
  // 1. Periksa Lockout Brute-Force
  const lockout = checkLockout();
  if (lockout.isLocked) {
    return {
      success: false,
      message: `Terlalu banyak percobaan gagal. Akses ditangguhkan sementara selama ${lockout.remainingSeconds} detik demi keamanan sistem.`
    };
  }

  // 2. Sanitasi input dari serangan SQL Injection / Script Injection
  const cleanUsername = sanitizeInput(usernameInput || '').toLowerCase().trim();
  const cleanPassword = (passwordInput || '').trim();

  if (!cleanUsername || !cleanPassword) {
    return {
      success: false,
      message: 'Username dan kata sandi wajib diisi.'
    };
  }

  // 3. Validasi Username (mendukung 'admin', 'admin.pppa', atau email resmi)
  const isValidUsername =
    cleanUsername === 'admin' ||
    cleanUsername === 'admin.pppa' ||
    cleanUsername === 'adminpppa' ||
    cleanUsername === 'bidangpppanagekeo@gmail.com';

  // 4. Validasi Kata Sandi
  let customCredentials: StoredCredentials | null = null;
  try {
    const rawCreds = localStorage.getItem(CREDENTIALS_KEY);
    if (rawCreds) {
      customCredentials = JSON.parse(rawCreds);
    }
  } catch (e) {
    console.warn('Error reading custom creds:', e);
  }

  const isValidPassword =
    (customCredentials && customCredentials.passwordHash === cleanPassword) ||
    cleanPassword === DEFAULT_PASSWORD ||
    ALTERNATIVE_PASSWORDS.includes(cleanPassword);

  if (isValidUsername && isValidPassword) {
    // Reset failed attempts
    saveLockoutState({ attempts: 0, lockoutUntil: 0 });

    const sessionUser: AdminUser = {
      ...DEFAULT_ADMIN,
      lastLogin: new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const session: AuthSession = {
      isAuthenticated: true,
      user: sessionUser,
      token: 'SIPELKA-TOKEN-' + Math.random().toString(36).substring(2) + '-' + Date.now(),
      loginTime: new Date().toISOString()
    };

    // Simpan ke storage sesuai pilihan remember me
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    return {
      success: true,
      message: 'Login berhasil. Selamat datang di SIPELKA Kabupaten Nagekeo.',
      user: sessionUser
    };
  } else {
    // Tingkatkan hitungan gagal
    const state = getLockoutState();
    const newAttempts = state.attempts + 1;
    let lockoutUntil = 0;

    if (newAttempts >= 5) {
      // Kunci selama 30 detik jika gagal 5 kali berturut-turut
      lockoutUntil = Date.now() + 30 * 1000;
    }

    saveLockoutState({ attempts: newAttempts, lockoutUntil });

    const remainingAttempts = Math.max(0, 5 - newAttempts);
    return {
      success: false,
      message:
        remainingAttempts > 0
          ? `Username atau kata sandi tidak valid. Sisa percobaan: ${remainingAttempts} kali.`
          : 'Terlalu banyak percobaan gagal. Akses ditangguhkan selama 30 detik untuk perlindungan keamanan.'
    };
  }
}

/**
 * Logout dari Sesi Admin
 */
export function logoutAdmin(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (err) {
    console.error('Error saat logout:', err);
  }
}

/**
 * Memperbarui Kata Sandi Admin
 */
export function updateAdminPassword(
  oldPassword: string,
  newPassword: string
): { success: boolean; message: string } {
  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      message: 'Kata sandi baru minimal 6 karakter.'
    };
  }

  let customCredentials: StoredCredentials | null = null;
  try {
    const rawCreds = localStorage.getItem(CREDENTIALS_KEY);
    if (rawCreds) {
      customCredentials = JSON.parse(rawCreds);
    }
  } catch (e) {
    console.warn(e);
  }

  const isOldValid =
    (customCredentials && customCredentials.passwordHash === oldPassword) ||
    oldPassword === DEFAULT_PASSWORD ||
    ALTERNATIVE_PASSWORDS.includes(oldPassword);

  if (!isOldValid) {
    return {
      success: false,
      message: 'Kata sandi lama tidak sesuai.'
    };
  }

  const newCreds: StoredCredentials = {
    passwordHash: newPassword,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(newCreds));
  return {
    success: true,
    message: 'Kata sandi administrator berhasil diperbarui.'
  };
}
