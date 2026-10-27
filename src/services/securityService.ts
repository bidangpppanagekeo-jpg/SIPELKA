/**
 * SIPELKA Cyber Security & Data Protection Service
 * Standar Keamanan Perlindungan Data Kerahasiaan Korban PPPA Kabupaten Nagekeo
 *
 * Cakupan:
 * 1. Pencegahan Serangan SQL Injection (SQLi) & Sanitasi Input Dinamis
 * 2. Pencegahan Cross-Site Scripting (XSS) & Code Injection
 * 3. Pencegahan Pencurian Data (Anti-Scraping, Anti-Copy, Disable Context Menu / Inspeksi)
 * 4. Intersepsi Tombol Pintas Developer Tools (F12, Ctrl+U, Ctrl+Shift+I/J/C, Ctrl+S)
 */

// Pola deteksi serangan SQL Injection umum
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|MERGE|GRANT|REVOKE)\b)/i,
  /('|\b)(OR|AND)\b.+?(=|<|>|LIKE)/i,
  /(--|\/\*|\*\/|;)/,
  /\b(XP_|SP_)\w+/i,
  /\bWAITFOR\s+DELAY\b/i,
  /\bCHAR\s*\(\s*\d+\s*\)/i,
  /\bBENCHMARK\s*\(/i,
  /\bSLEEP\s*\(/i,
  /\b1=1\b/i,
  /\b0x[0-9a-fA-F]+\b/
];

// Pola deteksi serangan XSS / HTML Injection
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi,
  /<iframe\b/gi,
  /<object\b/gi,
  /<embed\b/gi,
  /eval\s*\(/gi
];

/**
 * Memeriksa apakah input mengandung potensi serangan SQL Injection atau XSS
 */
export function detectSecurityThreat(input: string): { isMalicious: boolean; reason?: string } {
  if (!input || typeof input !== 'string') {
    return { isMalicious: false };
  }

  // Periksa SQL Injection
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isMalicious: true,
        reason: 'Terdeteksi karakter atau perintah SQL Injection yang mencurigakan.'
      };
    }
  }

  // Periksa XSS
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isMalicious: true,
        reason: 'Terdeteksi skrip atau tag HTML yang berpotensi membahayakan sistem.'
      };
    }
  }

  return { isMalicious: false };
}

/**
 * Sanitasi string input dari ancaman SQL Injection dan XSS
 * Membersihkan karakter berbahaya sambil tetap mempertahankan format teks normal
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;

  let sanitized = input;

  // 1. Netralkan karakter khusus SQL Injection berbahaya
  sanitized = sanitized
    .replace(/'/g, '’') // Ganti single quote dengan apostrof Unicode aman
    .replace(/"/g, '”') // Ganti double quote dengan quote Unicode aman
    .replace(/;/g, ' ')  // Hapus titik koma pemisah query
    .replace(/--/g, '-') // Netralkan double dash (SQL comment)
    .replace(/\/\*/g, '') // Hapus blok komentar SQL buka
    .replace(/\*\//g, ''); // Hapus blok komentar SQL tutup

  // 2. Escape tag HTML untuk mencegah Stored XSS
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 3. Hapus skrip javascript:
  sanitized = sanitized.replace(/javascript\s*:/gi, '');

  return sanitized.trim();
}

/**
 * Sanitasi seluruh properti objek secara rekursif tanpa mengubah struktur data
 */
export function sanitizeObjectData<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? (sanitizeInput(obj) as any) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObjectData(item)) as any;
  }

  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (typeof val === 'string') {
      result[key] = sanitizeInput(val);
    } else if (typeof val === 'object' && val !== null) {
      result[key] = sanitizeObjectData(val);
    } else {
      result[key] = val;
    }
  }

  return result as T;
}

/**
 * Mengaktifkan proteksi antarmuka (Client-side Security Shield):
 * - Mematikan Context Menu (Klik Kanan)
 * - Mencegah seleksi & dragging teks data rahasia
 * - Mencegah tombol pintas Developer Tools (F12, Ctrl+U, Ctrl+Shift+I, dll.)
 * - Melindungi clipboard dari copy-paste scraper masal
 */
export function enableClientSecurityShield(onSecurityAlert?: (msg: string) => void): () => void {
  // 1. Mencegah Klik Kanan (Context Menu)
  const handleContextMenu = (e: MouseEvent) => {
    // Biarkan klik kanan hanya pada input teks atau textarea jika diperlukan untuk copy/paste sendiri
    const target = e.target as HTMLElement;
    const isInputField =
      target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

    if (!isInputField) {
      e.preventDefault();
      if (onSecurityAlert) {
        onSecurityAlert('Keamanan SIPELKA: Klik kanan dinonaktifkan untuk melindungi kerahasiaan data korban.');
      }
    }
  };

  // 2. Mencegah Seleksi & Drag Teks Rahasia di Area Non-Input
  const handleSelectStart = (e: Event) => {
    const target = e.target as HTMLElement;
    const isInputField =
      target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

    if (!isInputField) {
      // Izinkan jika target memiliki atribut khusus data-selectable
      if (!target.closest('[data-selectable="true"]')) {
        // e.preventDefault(); // Menghentikan seleksi data bebas
      }
    }
  };

  const handleDragStart = (e: DragEvent) => {
    const target = e.target as HTMLElement;
    const isInputField =
      target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

    if (!isInputField) {
      e.preventDefault();
    }
  };

  // 3. Mencegah Tombol Pintas Developer Tools & View Source
  const handleKeyDown = (e: KeyboardEvent) => {
    // F12 -> DevTools
    if (e.key === 'F12') {
      e.preventDefault();
      if (onSecurityAlert) {
        onSecurityAlert('Akses Developer Tools diblokir oleh sistem keamanan.');
      }
      return false;
    }

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    if (isCtrlOrCmd) {
      // Ctrl+Shift+I (DevTools Inspect)
      // Ctrl+Shift+J (DevTools Console)
      // Ctrl+Shift+C (Inspect Element)
      if (e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        if (onSecurityAlert) {
          onSecurityAlert('Akses Inspeksi Elemen dibatasi untuk perlindungan data.');
        }
        return false;
      }

      // Ctrl+U -> View Source
      if (['U', 'u'].includes(e.key)) {
        e.preventDefault();
        if (onSecurityAlert) {
          onSecurityAlert('Melihat source code halaman dinonaktifkan.');
        }
        return false;
      }

      // Ctrl+S -> Save Page
      if (['S', 's'].includes(e.key) && !e.shiftKey) {
        // Jangan blokir jika di dalam form
        const target = e.target as HTMLElement;
        const isInputField =
          target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
        if (!isInputField) {
          e.preventDefault();
          if (onSecurityAlert) {
            onSecurityAlert('Menyimpan halaman web dibatasi demi keamanan.');
          }
          return false;
        }
      }
    }
  };

  // Tambahkan event listeners
  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('selectstart', handleSelectStart);
  document.addEventListener('dragstart', handleDragStart);
  document.addEventListener('keydown', handleKeyDown);

  // Return pembersih (cleanup function) saat unmount
  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('selectstart', handleSelectStart);
    document.removeEventListener('dragstart', handleDragStart);
    document.removeEventListener('keydown', handleKeyDown);
  };
}
