import { CatatanPenanganan, KasusKekerasan } from '../types';
import { INITIAL_KASUS_DATA } from '../data/nagekeoData';

const STORAGE_KEY = 'sipelka_nagekeo_cases_v1';
const ANONYMIZED_SETTING_KEY = 'sipelka_anonymized_mode';

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
    'Petugas Pendamping',
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

export function exportBackupJSON(cases: KasusKekerasan[]): void {
  const exportData = {
    app: 'SIPELKA Nagekeo',
    version: '1.0',
    dinas: 'Bidang PPPA Dinas PMDP3A Kabupaten Nagekeo',
    exportedAt: new Date().toISOString(),
    totalCases: cases.length,
    cases
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
