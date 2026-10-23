export type KecamatanNagekeo =
  | 'Aesesa'
  | 'Aesesa Selatan'
  | 'Wolowae'
  | 'Boawae'
  | 'Mauponggo'
  | 'Nangaroro'
  | 'Keo Tengah';

export type KategoriKorban =
  | 'Perempuan Dewasa'
  | 'Anak Perempuan'
  | 'Anak Laki-Laki'
  | 'Disabilitas / Rentan';

export type BentukKekerasan =
  | 'Kekerasan Fisik'
  | 'Kekerasan Psikis'
  | 'Kekerasan Seksual'
  | 'Penelantaran Rumah Tangga'
  | 'Tindak Pidana Perdagangan Orang (TPPO)'
  | 'Eksploitasi Anak'
  | 'Kekerasan Berbasis Siber (KBSG)';

export type TempatKejadian =
  | 'Rumah Tangga (KDRT)'
  | 'Lingkungan Tempat Tinggal / Desa'
  | 'Sekolah / Satuan Pendidikan'
  | 'Tempat Kerja'
  | 'Fasilitas Umum / Jalan'
  | 'Media Daring / Siber'
  | 'Lainnya';

export type HubunganPelaku =
  | 'Suami / Pasangan'
  | 'Orang Tua / Wali'
  | 'Saudara / Keluarga Dekat'
  | 'Tetangga'
  | 'Teman / Pacar'
  | 'Tenaga Pendidik / Guru'
  | 'Majikan / Atasan'
  | 'Orang Tidak Dikenal'
  | 'Lainnya';

export type StatusPenanganan =
  | 'Pengaduan Masuk'
  | 'Asesmen & Identifikasi'
  | 'Pendampingan Medis / Visum'
  | 'Pendampingan Hukum & Kepolisian'
  | 'Konseling Psikologis'
  | 'Rumah Aman / Shelter'
  | 'Mediasi / Restoratif'
  | 'Reintegrasi & Pemulihan'
  | 'Kasus Selesai';

export type TingkatUrgensi = 'Darurat' | 'Tinggi' | 'Sedang' | 'Rendah';

export interface CatatanPenanganan {
  id: string;
  tanggal: string;
  petugas: string;
  instansi: string;
  tindakan: string;
  hasilDanCatatan: string;
}

export interface KasusKekerasan {
  id: string;
  nomorRegistrasi: string; // Misal: REG/PPA-NGK/2026/03/014
  tanggalLapor: string;
  tanggalKejadian: string;
  kecamatanTKP: KecamatanNagekeo;
  desaKelurahanTKP: string;
  tempatKejadian: TempatKejadian;

  // Pelapor
  namaPelapor: string;
  hubunganPelaporDenganKorban: string;
  kontakPelapor: string;

  // Korban
  namaKorban: string;
  namaSamaran: string; // misal "Ny. M" atau "An. B"
  nikKorban?: string;
  jenisKelaminKorban: 'Perempuan' | 'Laki-laki';
  usiaKorban: number;
  kategoriKorban: KategoriKorban;
  pendidikanKorban: string;
  pekerjaanKorban: string;
  alamatKorban: string;
  kecamatanKorban: KecamatanNagekeo;
  disabilitas: boolean;
  jenisDisabilitas?: string;

  // Terlapor / Terduga Pelaku
  namaPelaku: string;
  usiaPelaku?: number;
  jenisKelaminPelaku: 'Laki-laki' | 'Perempuan';
  hubunganPelaku: HubunganPelaku;
  pekerjaanPelaku?: string;
  domisiliPelaku?: string;

  // Detail Kasus
  bentukKekerasan: BentukKekerasan[];
  ringkasanKronologi: string;
  dampakKorban: string[]; // contoh: Luka fisik, Trauma psikologis, Tidak sekolah, Kehamilan

  // Penanganan & Urgensi
  tingkatUrgensi: TingkatUrgensi;
  statusPenanganan: StatusPenanganan;
  petugasPendamping: string;
  layananDibutuhkan: string[]; // ['Visum et Repertum', 'Pendampingan LP Polres', 'Trauma Healing', 'Bantuan Hukum']
  riwayatPenanganan: CatatanPenanganan[];
  keteranganTambahan?: string;
}

export interface FilterKasusState {
  searchQuery: string;
  kecamatan: string;
  kategoriKorban: string;
  bentukKekerasan: string;
  statusPenanganan: string;
  tingkatUrgensi: string;
  tahun: string;
  bulan: string;
}
