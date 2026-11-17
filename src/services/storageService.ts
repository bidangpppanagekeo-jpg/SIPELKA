import { KasusKekerasan, PegawaiSIPELKA } from '../types';
import { sanitizeObjectData } from './securityService';
import {
  readSheetConfigFromFirestore,
  saveSheetConfigToFirestore,
  formatFirestoreErrorForUser
} from './firebaseService';

export interface GoogleSheetConfig {
  sheetUrl: string;
  webhookUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface LiveSheetDataResult {
  configured: boolean;
  source?: string;
  cases: KasusKekerasan[];
  pegawai: PegawaiSIPELKA[];
  fetchedAt?: string;
  message?: string;
  needsScriptUpdate?: boolean;
}

// ===================== SAFE JSON RESPONSE & CLIENT NORMALIZATION =====================

interface SafeJsonParseResult<T> {
  data: T | null;
  isHtml: boolean;
  rawText: string;
}

async function parseJsonSafely<T>(res: Response): Promise<SafeJsonParseResult<T>> {
  const rawText = await res.text();
  const trimmed = rawText.trim();
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const isHtml =
    contentType.includes('text/html') ||
    trimmed.startsWith('<!') ||
    trimmed.toLowerCase().startsWith('<html') ||
    trimmed.startsWith('<');

  if (isHtml || !trimmed) {
    return { data: null, isHtml, rawText };
  }

  try {
    return { data: JSON.parse(trimmed) as T, isHtml: false, rawText };
  } catch {
    return { data: null, isHtml: false, rawText };
  }
}

function getEnvSheetConfigFallback(): GoogleSheetConfig {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
  return {
    sheetUrl: (env.VITE_GOOGLE_SHEET_URL || '').trim(),
    webhookUrl: (env.VITE_GOOGLE_SHEET_WEBHOOK_URL || '').trim(),
    autoSync: true
  };
}

function normalizeClientCaseRecord(raw: Record<string, unknown>, idx: number): KasusKekerasan {
  const usia = Number(raw.usiaKorban || 0) || 0;
  const jk = raw.jenisKelaminKorban === 'Laki-laki' ? 'Laki-laki' : 'Perempuan';
  const namaKorban = String(raw.namaKorban || '').trim();
  const parts = namaKorban.split(/\s+/).filter(Boolean);
  const initials = parts.map((p) => p[0]?.toUpperCase() || '').join('') || 'K';
  const prefix = usia > 0 && usia < 18 ? 'An.' : jk === 'Laki-laki' ? 'Tn.' : 'Ny.';
  const fallbackSamaran = `${prefix} ${initials}${usia > 0 ? ` (${usia} th)` : ''}`;
  const nomorRegistrasi = String(raw.nomorRegistrasi || `REG/PPA-NGK/SHEET/${idx + 1}`).trim();

  const toList = (val: unknown, fallback: string[] = []): string[] =>
    Array.isArray(val)
      ? val.map((item) => String(item).trim()).filter(Boolean)
      : typeof val === 'string' && val.trim()
      ? val.split(/[,;]/).map((item) => item.trim()).filter(Boolean)
      : fallback;

  return {
    id: String(raw.id || `SHEET-KASUS-${nomorRegistrasi || idx + 1}`),
    nomorRegistrasi,
    tanggalLapor: String(raw.tanggalLapor || new Date().toISOString().slice(0, 10)).slice(0, 10),
    tanggalKejadian: String(raw.tanggalKejadian || raw.tanggalLapor || new Date().toISOString().slice(0, 10)).slice(0, 10),
    kecamatanTKP: (String(raw.kecamatanTKP || 'Aesesa').trim() || 'Aesesa') as KasusKekerasan['kecamatanTKP'],
    desaKelurahanTKP: String(raw.desaKelurahanTKP || '-').trim(),
    tempatKejadian: (String(raw.tempatKejadian || 'Rumah Tangga (KDRT)').trim() || 'Rumah Tangga (KDRT)') as KasusKekerasan['tempatKejadian'],
    namaPelapor: String(raw.namaPelapor || '-').trim(),
    hubunganPelaporDenganKorban: String(raw.hubunganPelaporDenganKorban || '-').trim(),
    kontakPelapor: String(raw.kontakPelapor || '-').trim(),
    namaKorban,
    namaSamaran: String(raw.namaSamaran || fallbackSamaran).trim(),
    nikKorban: raw.nikKorban ? String(raw.nikKorban) : '',
    jenisKelaminKorban: jk,
    usiaKorban: usia,
    kategoriKorban: (String(raw.kategoriKorban || (usia > 0 && usia < 18 ? (jk === 'Laki-laki' ? 'Anak Laki-Laki' : 'Anak Perempuan') : 'Perempuan Dewasa')).trim()) as KasusKekerasan['kategoriKorban'],
    pendidikanKorban: String(raw.pendidikanKorban || '-').trim(),
    pekerjaanKorban: String(raw.pekerjaanKorban || '-').trim(),
    alamatKorban: String(raw.alamatKorban || '-').trim(),
    kecamatanKorban: (String(raw.kecamatanKorban || raw.kecamatanTKP || 'Aesesa').trim() || 'Aesesa') as KasusKekerasan['kecamatanKorban'],
    disabilitas: Boolean(raw.disabilitas),
    jenisDisabilitas: raw.jenisDisabilitas ? String(raw.jenisDisabilitas) : '',
    namaPelaku: String(raw.namaPelaku || '-').trim(),
    usiaPelaku: raw.usiaPelaku ? Number(raw.usiaPelaku) : undefined,
    jenisKelaminPelaku: raw.jenisKelaminPelaku === 'Perempuan' ? 'Perempuan' : 'Laki-laki',
    hubunganPelaku: (String(raw.hubunganPelaku || 'Lainnya').trim() || 'Lainnya') as KasusKekerasan['hubunganPelaku'],
    pekerjaanPelaku: raw.pekerjaanPelaku ? String(raw.pekerjaanPelaku) : '',
    domisiliPelaku: raw.domisiliPelaku ? String(raw.domisiliPelaku) : '',
    bentukKekerasan: toList(raw.bentukKekerasan, ['Kekerasan Fisik']) as KasusKekerasan['bentukKekerasan'],
    ringkasanKronologi: String(raw.ringkasanKronologi || '-').trim(),
    dampakKorban: toList(raw.dampakKorban),
    tingkatUrgensi: (String(raw.tingkatUrgensi || 'Sedang').trim() || 'Sedang') as KasusKekerasan['tingkatUrgensi'],
    statusPenanganan: (String(raw.statusPenanganan || 'Pengaduan Masuk').trim() || 'Pengaduan Masuk') as KasusKekerasan['statusPenanganan'],
    petugasPendamping: String(raw.petugasPendamping || '-').trim(),
    petugasPendampingId: raw.petugasPendampingId ? String(raw.petugasPendampingId) : undefined,
    adminSipelka: raw.adminSipelka ? String(raw.adminSipelka) : undefined,
    adminSipelkaId: raw.adminSipelkaId ? String(raw.adminSipelkaId) : undefined,
    kepalaBidang: raw.kepalaBidang ? String(raw.kepalaBidang) : undefined,
    kepalaBidangId: raw.kepalaBidangId ? String(raw.kepalaBidangId) : undefined,
    petugasPolres: raw.petugasPolres ? String(raw.petugasPolres) : undefined,
    petugasPolresId: raw.petugasPolresId ? String(raw.petugasPolresId) : undefined,
    tenagaMedis: raw.tenagaMedis ? String(raw.tenagaMedis) : undefined,
    tenagaMedisId: raw.tenagaMedisId ? String(raw.tenagaMedisId) : undefined,
    layananDibutuhkan: toList(raw.layananDibutuhkan),
    riwayatPenanganan: Array.isArray(raw.riwayatPenanganan) ? (raw.riwayatPenanganan as KasusKekerasan['riwayatPenanganan']) : [],
    keteranganTambahan: raw.keteranganTambahan ? String(raw.keteranganTambahan) : ''
  };
}

function normalizeClientPegawaiRecord(raw: Record<string, unknown>, idx: number): PegawaiSIPELKA {
  const statusVal = String(raw.status || 'Aktif').trim();
  return {
    id: String(raw.id || `SHEET-PEG-${idx + 1}`).trim(),
    nama: String(raw.nama || '').trim(),
    nipOrIdentitas: String(raw.nipOrIdentitas || '-').trim(),
    kategori: (String(raw.kategori || 'Tenaga Pendamping Bidang PPPA').trim()) as PegawaiSIPELKA['kategori'],
    jabatan: String(raw.jabatan || '-').trim(),
    instansi: String(raw.instansi || 'Dinas PMDP3A Kab. Nagekeo').trim(),
    telepon: String(raw.telepon || '-').trim(),
    email: raw.email ? String(raw.email).trim() : '',
    keahlian: raw.keahlian ? String(raw.keahlian).trim() : '',
    status: statusVal === 'Non-Aktif' ? 'Non-Aktif' : 'Aktif',
    tanggalBergabung: raw.tanggalBergabung ? String(raw.tanggalBergabung).slice(0, 10) : ''
  };
}

// ===================== LIVE GOOGLE SPREADSHEET CONFIG & FETCH =====================

export async function fetchSheetConfig(): Promise<GoogleSheetConfig> {
  const fallback = getEnvSheetConfigFallback();

  // 1. Utama: Ambil konfigurasi permanen dari Cloud Firestore (berlaku untuk semua pengguna di mana saja)
  try {
    const cloudConfig = await readSheetConfigFromFirestore();
    if (cloudConfig && (cloudConfig.webhookUrl || cloudConfig.sheetUrl)) {
      return cloudConfig;
    }
  } catch (err) {
    console.warn('Membaca konfigurasi dari Firestore gagal, mencoba fallback server/env:', err);
  }

  // 2. Fallback: Ambil dari server Express (/api/sheet-config) atau VITE_* env
  try {
    const res = await fetch(`/api/sheet-config?_ts=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store'
    });
    const parsed = await parseJsonSafely<Partial<GoogleSheetConfig>>(res);
    if (!res.ok || parsed.isHtml || !parsed.data) {
      return fallback;
    }
    return {
      sheetUrl: parsed.data.sheetUrl || fallback.sheetUrl,
      webhookUrl: parsed.data.webhookUrl || fallback.webhookUrl,
      autoSync: typeof parsed.data.autoSync === 'boolean' ? parsed.data.autoSync : true,
      lastSyncedAt: parsed.data.lastSyncedAt
    };
  } catch (err) {
    console.error('Gagal mengambil konfigurasi Google Sheet:', err);
    return fallback;
  }
}

export interface SaveSheetConfigResult {
  config: GoogleSheetConfig;
  persistedOnServer: boolean;
  notice?: string;
}

export async function saveGoogleSheetConfig(config: GoogleSheetConfig): Promise<SaveSheetConfigResult> {
  const normalizedConfig: GoogleSheetConfig = {
    sheetUrl: (config.sheetUrl || '').trim(),
    webhookUrl: (config.webhookUrl || '').trim(),
    autoSync: Boolean(config.autoSync),
    lastSyncedAt: config.lastSyncedAt
  };

  // 1. Simpan permanen ke Cloud Firestore agar berlaku untuk seluruh pengguna di Shared App maupun Dev App
  let savedCloud: GoogleSheetConfig;
  try {
    savedCloud = await saveSheetConfigToFirestore(normalizedConfig);
  } catch (err) {
    throw new Error(formatFirestoreErrorForUser(err));
  }

  // 2. Sinkronisasi best-effort ke backend Express jika sedang berjalan (abaikan 404/405/HTML di hosting statis)
  try {
    await fetch('/api/sheet-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedCloud)
    });
  } catch {
    // Tidak masalah jika berjalan di mode statis (Shared App URL)
  }

  return {
    config: savedCloud,
    persistedOnServer: true
  };
}

export async function fetchLatestFromGoogleSheet(configOverride?: GoogleSheetConfig): Promise<LiveSheetDataResult> {
  try {
    const apiUrl = new URL('/api/sheet-data', window.location.origin);
    apiUrl.searchParams.set('_ts', String(Date.now()));
    if (configOverride?.webhookUrl) {
      apiUrl.searchParams.set('webhookUrl', configOverride.webhookUrl);
    }
    if (configOverride?.sheetUrl) {
      apiUrl.searchParams.set('sheetUrl', configOverride.sheetUrl);
    }

    const res = await fetch(apiUrl.pathname + apiUrl.search, {
      method: 'GET',
      cache: 'no-store'
    });
    const parsed = await parseJsonSafely<Partial<LiveSheetDataResult> & { error?: string }>(res);

    if (!parsed.isHtml && parsed.data && res.status !== 404 && res.status !== 405) {
      return {
        configured: Boolean(parsed.data.configured),
        source: parsed.data.source,
        cases: Array.isArray(parsed.data.cases) ? parsed.data.cases : [],
        pegawai: Array.isArray(parsed.data.pegawai) ? parsed.data.pegawai : [],
        fetchedAt: parsed.data.fetchedAt,
        message: parsed.data.message || parsed.data.error,
        needsScriptUpdate: Boolean(parsed.data.needsScriptUpdate)
      };
    }

    // Fallback langsung ke Apps Script Web App GET jika /api/sheet-data mengembalikan HTML atau 404/405 (mode statis)
    const fallbackWebhook = (
      configOverride?.webhookUrl ||
      getEnvSheetConfigFallback().webhookUrl
    ).trim();

    if (fallbackWebhook) {
      const targetUrl = new URL(fallbackWebhook);
      targetUrl.searchParams.set('action', 'GET_ALL');
      targetUrl.searchParams.set('_ts', String(Date.now()));

      const directRes = await fetch(targetUrl.toString(), {
        method: 'GET',
        redirect: 'follow'
      });
      const directParsed = await parseJsonSafely<{
        status?: string;
        cases?: Record<string, unknown>[];
        pegawai?: Record<string, unknown>[];
        fetchedAt?: string;
        message?: string;
      }>(directRes);

      if (!directParsed.isHtml && directParsed.data && (directParsed.data.status === 'success' || Array.isArray(directParsed.data.cases) || Array.isArray(directParsed.data.pegawai))) {
        const cases = Array.isArray(directParsed.data.cases)
          ? directParsed.data.cases.map((c, idx) => normalizeClientCaseRecord(c, idx)).filter((c) => c.nomorRegistrasi || c.namaKorban)
          : [];
        const pegawai = Array.isArray(directParsed.data.pegawai)
          ? directParsed.data.pegawai.map((p, idx) => normalizeClientPegawaiRecord(p, idx)).filter((p) => p.nama)
          : [];
        return {
          configured: true,
          source: 'apps_script_direct',
          cases,
          pegawai,
          fetchedAt: directParsed.data.fetchedAt || new Date().toISOString()
        };
      }

      if (directParsed.isHtml) {
        return {
          configured: true,
          needsScriptUpdate: true,
          cases: [],
          pegawai: [],
          message: 'Akses Web App Apps Script mengembalikan halaman HTML. Pastikan "Who has access / Yang memiliki akses" diatur ke "Anyone / Siapa saja" pada menu Deploy.'
        };
      }

      return {
        configured: true,
        needsScriptUpdate: true,
        cases: [],
        pegawai: [],
        message: 'Webhook Apps Script aktif, namun fungsi doGet() belum mengembalikan JSON data. Perbarui Code.gs di menu Integrasi Sheet lalu Deploy versi baru.'
      };
    }

    return {
      configured: false,
      cases: [],
      pegawai: [],
      message: 'Koneksi data Google Spreadsheet belum tersedia. Periksa pengaturan Webhook pada menu Integrasi Sheet atau muat ulang halaman.'
    };
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : '';
    const safeMessage =
      rawMsg && !rawMsg.includes('not valid JSON') && !rawMsg.includes('<!doctype')
        ? rawMsg
        : 'Gagal mengambil data terbaru dari Google Spreadsheet. Silakan coba Muat Ulang.';
    return {
      configured: true,
      cases: [],
      pegawai: [],
      message: safeMessage
    };
  }
}

export async function sendDataToGoogleSheetWebhook(
  payload: Record<string, unknown>,
  config?: GoogleSheetConfig
): Promise<{ success: boolean; message: string; data?: unknown; syncedAt?: string }> {
  try {
    const sanitizedPayload = sanitizeObjectData(payload);
    const res = await fetch('/api/sheet-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: sanitizedPayload,
        webhookUrl: config?.webhookUrl || undefined
      })
    });

    const parsed = await parseJsonSafely<{
      success?: boolean;
      message?: string;
      error?: string;
      data?: unknown;
      syncedAt?: string;
    }>(res);

    // Jika /api/sheet-sync mengembalikan HTML atau 404/405 (mode statis), kirim langsung ke Apps Script Webhook
    if ((parsed.isHtml || res.status === 404 || res.status === 405) && config?.webhookUrl) {
      const targetUrl = new URL(config.webhookUrl);
      if (sanitizedPayload.action) targetUrl.searchParams.set('action', String(sanitizedPayload.action));
      if (sanitizedPayload.nomorRegistrasi) targetUrl.searchParams.set('nomorRegistrasi', String(sanitizedPayload.nomorRegistrasi));
      if (sanitizedPayload.id) targetUrl.searchParams.set('id', String(sanitizedPayload.id));

      const directRes = await fetch(targetUrl.toString(), {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(sanitizedPayload)
      });
      const directParsed = await parseJsonSafely<{ status?: string; message?: string }>(directRes);
      if (directParsed.isHtml) {
        return {
          success: false,
          message: 'Google Apps Script mengembalikan halaman HTML. Pastikan Deploy Web App diatur ke "Anyone / Siapa saja".'
        };
      }
      if (!directRes.ok || directParsed.data?.status === 'error') {
        return {
          success: false,
          message: directParsed.data?.message || `Gagal mengirim ke Google Apps Script (HTTP ${directRes.status}).`
        };
      }
      return {
        success: true,
        message: 'Data berhasil dikirim langsung ke Google Spreadsheet.',
        data: directParsed.data,
        syncedAt: new Date().toISOString()
      };
    }

    if (parsed.isHtml || res.status === 404 || res.status === 405) {
      return {
        success: false,
        message: `Server sinkronisasi menolak permintaan (HTTP ${res.status}). Pastikan URL Webhook sudah diisi atau buka melalui Development App URL.`
      };
    }

    const body = parsed.data || {};
    if (!res.ok || body.success === false) {
      return {
        success: false,
        message: body.message || body.error || `Gagal menyinkronkan ke Google Sheet (HTTP ${res.status}).`
      };
    }

    return {
      success: true,
      message: body.message || 'Data berhasil dikirim ke Google Spreadsheet.',
      data: body.data,
      syncedAt: body.syncedAt
    };
  } catch (err: unknown) {
    console.error('Gagal mengirim ke Webhook Google Sheet:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Gagal terhubung ke server sinkronisasi.'
    };
  }
}

export function generateRegistrationNumber(existingCases: KasusKekerasan[]): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const countThisMonth =
    existingCases.filter((c) => c.tanggalLapor && c.tanggalLapor.startsWith(`${year}-${month}`))
      .length + 1;
  const seq = String(countThisMonth).padStart(3, '0');
  return `REG/PPA-NGK/${year}/${month}/${seq}`;
}

// ===================== EXPORTS (PURE CLIENT DOWNLOAD) =====================

export function exportPegawaiToCSV(pegawaiList: PegawaiSIPELKA[]): void {
  const headers = [
    'ID Pegawai',
    'Nama Lengkap',
    'NIP / NRP / SIP / NIK',
    'Kategori Pegawai',
    'Jabatan',
    'Instansi / Unit Kerja',
    'No. Telepon / WhatsApp',
    'Email',
    'Keahlian / Sertifikasi',
    'Status'
  ];

  const rows = pegawaiList.map((p) => [
    `"${p.id}"`,
    `"${p.nama.replace(/"/g, '""')}"`,
    `"${p.nipOrIdentitas}"`,
    `"${p.kategori}"`,
    `"${p.jabatan.replace(/"/g, '""')}"`,
    `"${p.instansi.replace(/"/g, '""')}"`,
    `"${p.telepon}"`,
    `"${p.email || ''}"`,
    `"${(p.keahlian || '').replace(/"/g, '""')}"`,
    `"${p.status}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `SIPELKA_Data_Pegawai_Nagekeo_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCasesToCSV(cases: KasusKekerasan[], isAnonymized: boolean = false): void {
  const headers = [
    'Nomor Registrasi',
    'Tanggal Lapor',
    'Tanggal Kejadian',
    'Kecamatan TKP',
    'Desa/Kelurahan TKP',
    'Tempat Kejadian',
    'Nama Korban',
    'Jenis Kelamin Korban',
    'Usia (Tahun)',
    'Kategori Korban',
    'Disabilitas',
    'Alamat Domisili',
    'Kecamatan Domisili',
    'Bentuk Kekerasan',
    'Nama Terlapor/Pelaku',
    'Hubungan Pelaku',
    'Tingkat Urgensi',
    'Status Penanganan',
    'Petugas Pendamping PPPA',
    'Petugas Unit PPA Polres',
    'Tenaga Medis Visum',
    'Admin Pencatat SIPELKA',
    'Layanan Rujukan',
    'Ringkasan Kronologi'
  ];

  const rows = cases.map((c) => {
    const namaKorban = isAnonymized ? c.namaSamaran : c.namaKorban;
    const namaPelaku = isAnonymized ? 'Terlapor (' + c.hubunganPelaku + ')' : c.namaPelaku;
    return [
      `"${c.nomorRegistrasi || ''}"`,
      `"${c.tanggalLapor || ''}"`,
      `"${c.tanggalKejadian || ''}"`,
      `"${c.kecamatanTKP || ''}"`,
      `"${c.desaKelurahanTKP || ''}"`,
      `"${c.tempatKejadian || ''}"`,
      `"${namaKorban.replace(/"/g, '""')}"`,
      `"${c.jenisKelaminKorban}"`,
      c.usiaKorban,
      `"${c.kategoriKorban}"`,
      c.disabilitas ? `"Ya (${c.jenisDisabilitas || 'Ada'})"` : '"Tidak"',
      `"${(c.alamatKorban || '').replace(/"/g, '""')}"`,
      `"${c.kecamatanKorban || ''}"`,
      `"${c.bentukKekerasan.join('; ')}"`,
      `"${namaPelaku.replace(/"/g, '""')}"`,
      `"${c.hubunganPelaku}"`,
      `"${c.tingkatUrgensi}"`,
      `"${c.statusPenanganan}"`,
      `"${c.petugasPendamping || ''}"`,
      `"${c.petugasPolres || ''}"`,
      `"${c.tenagaMedis || ''}"`,
      `"${c.adminSipelka || ''}"`,
      `"${c.layananDibutuhkan.join('; ')}"`,
      `"${(c.ringkasanKronologi || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r)].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `SIPELKA_Nagekeo_Data_Kasus_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportBackupJSON(cases: KasusKekerasan[], pegawaiList?: PegawaiSIPELKA[]): void {
  const exportData = {
    app: 'SIPELKA Nagekeo',
    version: '2.0',
    dinas: 'Dinas PMDP3A Kabupaten Nagekeo',
    bidang: 'Bidang Pemberdayaan Perempuan dan Perlindungan Anak',
    exportedAt: new Date().toISOString(),
    totalCases: cases.length,
    totalPegawai: pegawaiList?.length || 0,
    cases,
    pegawai: pegawaiList || []
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `BACKUP_SIPELKA_NAGEKEO_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
