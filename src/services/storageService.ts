import { KasusKekerasan, PegawaiSIPELKA } from '../types';
import { sanitizeObjectData } from './securityService';

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

// ===================== LIVE GOOGLE SPREADSHEET CONFIG & FETCH =====================

export async function fetchSheetConfig(): Promise<GoogleSheetConfig> {
  try {
    const res = await fetch(`/api/sheet-config?_ts=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store'
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = (await res.json()) as Partial<GoogleSheetConfig>;
    return {
      sheetUrl: data.sheetUrl || '',
      webhookUrl: data.webhookUrl || '',
      autoSync: typeof data.autoSync === 'boolean' ? data.autoSync : true,
      lastSyncedAt: data.lastSyncedAt
    };
  } catch (err) {
    console.error('Gagal mengambil konfigurasi Google Sheet:', err);
    return { sheetUrl: '', webhookUrl: '', autoSync: true };
  }
}

export async function saveGoogleSheetConfig(config: GoogleSheetConfig): Promise<GoogleSheetConfig> {
  const res = await fetch('/api/sheet-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || 'Gagal menyimpan konfigurasi Google Sheet.');
  }

  return (await res.json()) as GoogleSheetConfig;
}

export async function fetchLatestFromGoogleSheet(): Promise<LiveSheetDataResult> {
  try {
    const res = await fetch(`/api/sheet-data?_ts=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store'
    });
    const data = (await res.json()) as Partial<LiveSheetDataResult>;
    return {
      configured: Boolean(data.configured),
      source: data.source,
      cases: Array.isArray(data.cases) ? data.cases : [],
      pegawai: Array.isArray(data.pegawai) ? data.pegawai : [],
      fetchedAt: data.fetchedAt,
      message: data.message,
      needsScriptUpdate: Boolean(data.needsScriptUpdate)
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil data terbaru dari Google Spreadsheet.';
    return {
      configured: true,
      cases: [],
      pegawai: [],
      message
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

    const body = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
      data?: unknown;
      syncedAt?: string;
    };

    if (!res.ok || body.success === false) {
      return {
        success: false,
        message: body.message || `Gagal menyinkronkan ke Google Sheet (HTTP ${res.status}).`
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
