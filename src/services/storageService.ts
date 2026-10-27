import { CatatanPenanganan, KasusKekerasan, PegawaiSIPELKA } from '../types';
import { INITIAL_KASUS_DATA, INITIAL_PEGAWAI_DATA } from '../data/nagekeoData';

const STORAGE_KEY = 'sipelka_nagekeo_cases_v1';
const PEGAWAI_STORAGE_KEY = 'sipelka_nagekeo_pegawai_v1';
const ANONYMIZED_SETTING_KEY = 'sipelka_anonymized_mode';

// ===================== KASUS STORAGE =====================

export function getStoredCases(): KasusKekerasan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_KASUS_DATA));
      return INITIAL_KASUS_DATA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_KASUS_DATA;
  } catch (err) {
    console.error('Gagal membaca data lokal SIPELKA:', err);
    return INITIAL_KASUS_DATA;
  }
}

export function saveCase(caseData: KasusKekerasan): KasusKekerasan[] {
  const current = getStoredCases();
  const existsIndex = current.findIndex((c) => c.id === caseData.id);

  let updated: KasusKekerasan[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = caseData;
  } else {
    updated = [caseData, ...current];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteCase(caseId: string): KasusKekerasan[] {
  const current = getStoredCases();
  const filtered = current.filter((c) => c.id !== caseId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}

export function addProgressNote(
  caseId: string,
  note: Omit<CatatanPenanganan, 'id'>,
  newStatus?: KasusKekerasan['statusPenanganan']
): KasusKekerasan[] {
  const current = getStoredCases();
  const targetIndex = current.findIndex((c) => c.id === caseId);

  if (targetIndex === -1) return current;

  const target = current[targetIndex];
  const newNote: CatatanPenanganan = {
    ...note,
    id: 'CAT-' + Date.now().toString()
  };

  const updatedCase: KasusKekerasan = {
    ...target,
    statusPenanganan: newStatus || target.statusPenanganan,
    riwayatPenanganan: [newNote, ...(target.riwayatPenanganan || [])]
  };

  const updatedList = [...current];
  updatedList[targetIndex] = updatedCase;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  return updatedList;
}

export function getAnonymizedPreference(): boolean {
  try {
    const pref = localStorage.getItem(ANONYMIZED_SETTING_KEY);
    return pref === 'true';
  } catch {
    return false;
  }
}

export function setAnonymizedPreference(val: boolean) {
  try {
    localStorage.setItem(ANONYMIZED_SETTING_KEY, String(val));
  } catch (err) {
    console.error(err);
  }
}

export function resetDefaultCases(): KasusKekerasan[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_KASUS_DATA));
  return INITIAL_KASUS_DATA;
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

// ===================== PEGAWAI STORAGE =====================

export function getStoredPegawai(): PegawaiSIPELKA[] {
  try {
    const raw = localStorage.getItem(PEGAWAI_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PEGAWAI_STORAGE_KEY, JSON.stringify(INITIAL_PEGAWAI_DATA));
      return INITIAL_PEGAWAI_DATA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PEGAWAI_DATA;
  } catch (err) {
    console.error('Gagal membaca data pegawai lokal SIPELKA:', err);
    return INITIAL_PEGAWAI_DATA;
  }
}

export function savePegawai(pegawaiData: PegawaiSIPELKA): PegawaiSIPELKA[] {
  const current = getStoredPegawai();
  const existsIndex = current.findIndex((p) => p.id === pegawaiData.id);

  let updated: PegawaiSIPELKA[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = pegawaiData;
  } else {
    updated = [pegawaiData, ...current];
  }

  localStorage.setItem(PEGAWAI_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deletePegawai(pegawaiId: string): PegawaiSIPELKA[] {
  const current = getStoredPegawai();
  const filtered = current.filter((p) => p.id !== pegawaiId);
  localStorage.setItem(PEGAWAI_STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}

export function resetDefaultPegawai(): PegawaiSIPELKA[] {
  localStorage.setItem(PEGAWAI_STORAGE_KEY, JSON.stringify(INITIAL_PEGAWAI_DATA));
  return INITIAL_PEGAWAI_DATA;
}

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

// ===================== EXPORTS =====================

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

  // UTF-8 BOM for Microsoft Excel
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
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
    version: '1.2',
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

// ===================== GOOGLE SHEET & WEBHOOK INTEGRATION =====================

const GOOGLE_SHEET_CONFIG_KEY = 'sipelka_google_sheet_config_v1';

export interface GoogleSheetConfig {
  sheetUrl: string;
  webhookUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export function getGoogleSheetConfig(): GoogleSheetConfig {
  try {
    const raw = localStorage.getItem(GOOGLE_SHEET_CONFIG_KEY);
    if (!raw) {
      return {
        sheetUrl: '',
        webhookUrl: '',
        autoSync: true
      };
    }
    return JSON.parse(raw);
  } catch {
    return { sheetUrl: '', webhookUrl: '', autoSync: true };
  }
}

export function saveGoogleSheetConfig(config: GoogleSheetConfig): void {
  try {
    localStorage.setItem(GOOGLE_SHEET_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Gagal menyimpan konfigurasi Google Sheet:', err);
  }
}

export async function sendDataToGoogleSheetWebhook(
  payload: any,
  config?: GoogleSheetConfig
): Promise<{ success: boolean; message: string }> {
  const cfg = config || getGoogleSheetConfig();
  if (!cfg.webhookUrl) {
    return { success: false, message: 'URL Webhook Google Sheet belum dikonfigurasi.' };
  }

  try {
    // Construct URL with query parameters for maximum compatibility with Google Apps Script
    let targetUrl = cfg.webhookUrl;
    try {
      const urlObj = new URL(cfg.webhookUrl);
      if (payload.action) urlObj.searchParams.set('action', String(payload.action));
      if (payload.nomorRegistrasi) urlObj.searchParams.set('nomorRegistrasi', String(payload.nomorRegistrasi));
      if (payload.id) urlObj.searchParams.set('id', String(payload.id));
      targetUrl = urlObj.toString();
    } catch {
      // Fallback if URL constructor fails
    }

    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const now = new Date().toISOString();
    saveGoogleSheetConfig({ ...cfg, lastSyncedAt: now });

    return { success: true, message: 'Data berhasil dikirim ke Webhook Google Sheet.' };
  } catch (err: any) {
    console.error('Gagal mengirim ke Webhook Google Sheet:', err);
    return { success: false, message: err?.message || 'Gagal terhubung ke Webhook.' };
  }
}

