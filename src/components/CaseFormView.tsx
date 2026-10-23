import React, { useState, useEffect } from 'react';
import { KasusKekerasan, KecamatanNagekeo, BentukKekerasan, TingkatUrgensi, StatusPenanganan, TempatKejadian, HubunganPelaku } from '../types';
import { DAFTAR_KECAMATAN, DAFTAR_BENTUK_KEKERASAN, DAFTAR_STATUS_PENANGANAN } from '../data/nagekeoData';
import { generateRegistrationNumber } from '../services/storageService';
import { ArrowLeft, Save, Check, AlertCircle } from 'lucide-react';

interface CaseFormViewProps {
  initialCase?: KasusKekerasan | null;
  allCases: KasusKekerasan[];
  onSaveCase: (savedCase: KasusKekerasan) => void;
  onCancel: () => void;
}

const TEMPAT_KEJADIAN_OPTIONS: TempatKejadian[] = [
  'Rumah Tangga (KDRT)',
  'Lingkungan Tempat Tinggal / Desa',
  'Sekolah / Satuan Pendidikan',
  'Tempat Kerja',
  'Fasilitas Umum / Jalan',
  'Media Daring / Siber',
  'Lainnya'
];

const HUBUNGAN_PELAKU_OPTIONS: HubunganPelaku[] = [
  'Suami / Pasangan',
  'Orang Tua / Wali',
  'Saudara / Keluarga Dekat',
  'Tetangga',
  'Teman / Pacar',
  'Tenaga Pendidik / Guru',
  'Majikan / Atasan',
  'Orang Tidak Dikenal',
  'Lainnya'
];

const LAYANAN_OPTIONS = [
  'Visum et Repertum (RSUD Aeramo Mbay)',
  'Pendampingan LP & BAP ke Unit PPA Polres Nagekeo',
  'Konseling & Trauma Healing Psikologis',
  'Penempatan di Rumah Aman / Shelter',
  'Mediasi & Restorasi Keluarga',
  'Reintegrasi Sosial & Bantuan Administrasi Dukcapil',
  'Bantuan Hukum / Pengacara Pro Bono'
];

export const CaseFormView: React.FC<CaseFormViewProps> = ({
  initialCase,
  allCases,
  onSaveCase,
  onCancel
}) => {
  const isEditing = Boolean(initialCase);

  const [formData, setFormData] = useState<Partial<KasusKekerasan>>({
    id: initialCase?.id || `KASUS-${Date.now()}`,
    nomorRegistrasi: initialCase?.nomorRegistrasi || generateRegistrationNumber(allCases),
    tanggalLapor: initialCase?.tanggalLapor || new Date().toISOString().slice(0, 10),
    tanggalKejadian: initialCase?.tanggalKejadian || new Date().toISOString().slice(0, 10),
    kecamatanTKP: initialCase?.kecamatanTKP || 'Aesesa',
    desaKelurahanTKP: initialCase?.desaKelurahanTKP || 'Danga',
    tempatKejadian: initialCase?.tempatKejadian || 'Rumah Tangga (KDRT)',

    namaPelapor: initialCase?.namaPelapor || '',
    hubunganPelaporDenganKorban: initialCase?.hubunganPelaporDenganKorban || 'Korban Langsung',
    kontakPelapor: initialCase?.kontakPelapor || '',

    namaKorban: initialCase?.namaKorban || '',
    namaSamaran: initialCase?.namaSamaran || '',
    nikKorban: initialCase?.nikKorban || '',
    jenisKelaminKorban: initialCase?.jenisKelaminKorban || 'Perempuan',
    usiaKorban: initialCase?.usiaKorban || 18,
    kategoriKorban: initialCase?.kategoriKorban || 'Perempuan Dewasa',
    pendidikanKorban: initialCase?.pendidikanKorban || 'SMA',
    pekerjaanKorban: initialCase?.pekerjaanKorban || 'Ibu Rumah Tangga',
    alamatKorban: initialCase?.alamatKorban || '',
    kecamatanKorban: initialCase?.kecamatanKorban || 'Aesesa',
    disabilitas: initialCase?.disabilitas || false,
    jenisDisabilitas: initialCase?.jenisDisabilitas || '',

    namaPelaku: initialCase?.namaPelaku || '',
    usiaPelaku: initialCase?.usiaPelaku || 30,
    jenisKelaminPelaku: initialCase?.jenisKelaminPelaku || 'Laki-laki',
    hubunganPelaku: initialCase?.hubunganPelaku || 'Suami / Pasangan',
    pekerjaanPelaku: initialCase?.pekerjaanPelaku || '',
    domisiliPelaku: initialCase?.domisiliPelaku || '',

    bentukKekerasan: initialCase?.bentukKekerasan || ['Kekerasan Fisik'],
    ringkasanKronologi: initialCase?.ringkasanKronologi || '',
    dampakKorban: initialCase?.dampakKorban || ['Trauma emosional'],

    tingkatUrgensi: initialCase?.tingkatUrgensi || 'Sedang',
    statusPenanganan: initialCase?.statusPenanganan || 'Pengaduan Masuk',
    petugasPendamping: initialCase?.petugasPendamping || 'Staf Pendamping PPPA',
    layananDibutuhkan: initialCase?.layananDibutuhkan || ['Konseling & Trauma Healing Psikologis'],
    riwayatPenanganan: initialCase?.riwayatPenanganan || [],
    keteranganTambahan: initialCase?.keteranganTambahan || ''
  });

  const [dampakInput, setDampakInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-generate initials for namaSamaran when namaKorban changes if not manually set
  useEffect(() => {
    if (!initialCase && formData.namaKorban && !formData.namaSamaran) {
      const parts = formData.namaKorban.trim().split(/\s+/);
      const initials = parts.map((p) => p[0]?.toUpperCase()).join('');
      const prefix = (formData.usiaKorban || 0) < 18 ? 'An.' : formData.jenisKelaminKorban === 'Perempuan' ? 'Ny./Nn.' : 'Tn.';
      setFormData((prev) => ({
        ...prev,
        namaSamaran: `${prefix} ${initials} (${formData.usiaKorban || ''} th)`
      }));
    }
  }, [formData.namaKorban, formData.usiaKorban, formData.jenisKelaminKorban, initialCase]);

  // Adjust KategoriKorban automatically when usia changes
  const handleUsiaChange = (age: number) => {
    let cat = formData.kategoriKorban;
    if (age < 18) {
      cat = formData.jenisKelaminKorban === 'Perempuan' ? 'Anak Perempuan' : 'Anak Laki-Laki';
    } else {
      cat = formData.jenisKelaminKorban === 'Perempuan' ? 'Perempuan Dewasa' : 'Perempuan Dewasa';
    }
    setFormData((prev) => ({
      ...prev,
      usiaKorban: age,
      kategoriKorban: prev.disabilitas ? 'Disabilitas / Rentan' : cat
    }));
  };

  // Toggle Bentuk Kekerasan
  const toggleBentukKekerasan = (val: BentukKekerasan) => {
    const list = formData.bentukKekerasan || [];
    if (list.includes(val)) {
      if (list.length > 1) {
        setFormData({ ...formData, bentukKekerasan: list.filter((b) => b !== val) });
      }
    } else {
      setFormData({ ...formData, bentukKekerasan: [...list, val] });
    }
  };

  // Toggle Layanan
  const toggleLayanan = (val: string) => {
    const list = formData.layananDibutuhkan || [];
    if (list.includes(val)) {
      setFormData({ ...formData, layananDibutuhkan: list.filter((l) => l !== val) });
    } else {
      setFormData({ ...formData, layananDibutuhkan: [...list, val] });
    }
  };

  // Handle Desa dropdown depending on selected Kecamatan
  const selectedKecData = DAFTAR_KECAMATAN.find((k) => k.nama === formData.kecamatanTKP);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.namaKorban?.trim()) {
      setErrorMessage('Nama korban wajib diisi.');
      return;
    }
    if (!formData.ringkasanKronologi?.trim()) {
      setErrorMessage('Ringkasan kronologi kejadian wajib diisi untuk asesmen penanganan.');
      return;
    }
    if (!formData.namaPelapor?.trim()) {
      setErrorMessage('Nama pelapor wajib diisi.');
      return;
    }

    const payload: KasusKekerasan = {
      ...(formData as KasusKekerasan),
      riwayatPenanganan:
        formData.riwayatPenanganan && formData.riwayatPenanganan.length > 0
          ? formData.riwayatPenanganan
          : [
              {
                id: 'CAT-' + Date.now(),
                tanggal: formData.tanggalLapor || new Date().toISOString().slice(0, 10),
                petugas: formData.petugasPendamping || 'Staf PPPA',
                instansi: 'UPTD PPA Dinas PMDP3A Kab. Nagekeo',
                tindakan: 'Penerimaan Laporan & Penginputan Data ke SIPELKA',
                hasilDanCatatan: 'Berkas kasus berhasil didaftarkan ke sistem SIMFONI PPA Nagekeo.'
              }
            ]
    };

    onSaveCase(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Colorful Official Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-900 text-white p-6 sm:p-7 rounded-3xl border border-blue-200 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-sky-400/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-sky-400" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <span>Formulir Asesmen Terpadu SIMFONI PPA</span>
              <span>·</span>
              <span className="text-white">Dinas PMDP3A Nagekeo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isEditing ? `Ubah Berkas Kasus: ${formData.nomorRegistrasi}` : 'Formulir Penerimaan & Registrasi Kasus PPPA'}
            </h1>
            <p className="text-xs sm:text-sm text-sky-100">
              Pencatatan data pengaduan kekerasan perempuan dan anak sesuai standar Kementerian PPPA Republik Indonesia.
            </p>
          </div>

          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-950 bg-white hover:bg-sky-50 rounded-xl transition-all shadow-sm shrink-0 self-start sm:self-center"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Register</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center gap-3 text-xs text-rose-800 font-medium shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Nomor Registrasi & Pelapor (Soft Sky Blue) */}
        <div className="bg-gradient-to-br from-white via-sky-50/70 to-blue-50/80 p-6 sm:p-7 rounded-3xl border-2 border-blue-200/90 shadow-sm space-y-4">
          <div className="border-b border-blue-100 pb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              01
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-blue-950 uppercase tracking-wide">
                1. Data Penerimaan Laporan & Pihak Pelapor
              </h2>
              <p className="text-xs text-slate-500">
                Informasi pencatatan awal, nomor registrasi resmi, dan pihak yang menyampaikan aduan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Registrasi Resmi
              </label>
              <input
                type="text"
                value={formData.nomorRegistrasi}
                onChange={(e) => setFormData({ ...formData, nomorRegistrasi: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Lapor
              </label>
              <input
                type="date"
                value={formData.tanggalLapor}
                onChange={(e) => setFormData({ ...formData, tanggalLapor: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Petugas Pendamping Utama
              </label>
              <input
                type="text"
                value={formData.petugasPendamping}
                onChange={(e) => setFormData({ ...formData, petugasPendamping: e.target.value })}
                placeholder="Nama staf UPTD / PPA"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Lengkap Pelapor *
              </label>
              <input
                type="text"
                value={formData.namaPelapor}
                onChange={(e) => setFormData({ ...formData, namaPelapor: e.target.value })}
                placeholder="Nama orang yang melapor"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hubungan dengan Korban
              </label>
              <input
                type="text"
                value={formData.hubunganPelaporDenganKorban}
                onChange={(e) => setFormData({ ...formData, hubunganPelaporDenganKorban: e.target.value })}
                placeholder="Contoh: Korban Langsung, Ibu Kandung, Kader Desa"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kontak HP / Telepon Pelapor
              </label>
              <input
                type="text"
                value={formData.kontakPelapor}
                onChange={(e) => setFormData({ ...formData, kontakPelapor: e.target.value })}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Data Korban & Asesmen Kerentanan (Soft Indigo/Blue) */}
        <div className="bg-gradient-to-br from-white via-indigo-50/50 to-blue-50/70 p-6 sm:p-7 rounded-3xl border-2 border-indigo-200/90 shadow-sm space-y-4">
          <div className="border-b border-indigo-100 pb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              02
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
                2. Identitas Korban & Asesmen Kerentanan
              </h2>
              <p className="text-xs text-slate-500">
                Data identitas korban dilindungi kerahasiaannya sesuai UU Perlindungan Saksi dan Korban
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Lengkap Korban *
              </label>
              <input
                type="text"
                value={formData.namaKorban}
                onChange={(e) => setFormData({ ...formData, namaKorban: e.target.value })}
                placeholder="Sesuai KTP / Akta Kelahiran"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Samaran / Kode Privasi
              </label>
              <input
                type="text"
                value={formData.namaSamaran}
                onChange={(e) => setFormData({ ...formData, namaSamaran: e.target.value })}
                placeholder="Contoh: Ny. MGD (32 th) / An. TN (13 th)"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NIK Korban (16 Digit)
              </label>
              <input
                type="text"
                value={formData.nikKorban}
                onChange={(e) => setFormData({ ...formData, nikKorban: e.target.value })}
                placeholder="5316xxxxxxxxxxxx"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jenis Kelamin Korban
              </label>
              <select
                value={formData.jenisKelaminKorban}
                onChange={(e) => setFormData({ ...formData, jenisKelaminKorban: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
              >
                <option value="Perempuan">Perempuan</option>
                <option value="Laki-laki">Laki-laki (Anak)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Usia Korban (Tahun)
              </label>
              <input
                type="number"
                min={0}
                max={120}
                value={formData.usiaKorban}
                onChange={(e) => handleUsiaChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kategori Korban
              </label>
              <select
                value={formData.kategoriKorban}
                onChange={(e) => setFormData({ ...formData, kategoriKorban: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium"
              >
                <option value="Perempuan Dewasa">Perempuan Dewasa</option>
                <option value="Anak Perempuan">Anak Perempuan (&lt; 18 th)</option>
                <option value="Anak Laki-Laki">Anak Laki-Laki (&lt; 18 th)</option>
                <option value="Disabilitas / Rentan">Disabilitas / Rentan</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kecamatan Domisili Korban
              </label>
              <select
                value={formData.kecamatanKorban}
                onChange={(e) => setFormData({ ...formData, kecamatanKorban: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium"
              >
                {DAFTAR_KECAMATAN.map((k) => (
                  <option key={k.nama} value={k.nama}>
                    Kec. {k.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat Domisili Lengkap
              </label>
              <input
                type="text"
                value={formData.alamatKorban}
                onChange={(e) => setFormData({ ...formData, alamatKorban: e.target.value })}
                placeholder="RT/RW, Dusun, Desa/Kelurahan"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pendidikan Terakhir
              </label>
              <input
                type="text"
                value={formData.pendidikanKorban}
                onChange={(e) => setFormData({ ...formData, pendidikanKorban: e.target.value })}
                placeholder="SD / SMP / SMA / Perguruan Tinggi / Tidak Sekolah"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pekerjaan Korban
              </label>
              <input
                type="text"
                value={formData.pekerjaanKorban}
                onChange={(e) => setFormData({ ...formData, pekerjaanKorban: e.target.value })}
                placeholder="Pelajar / IRT / Petani / Honorer / Swasta"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.disabilitas}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disabilitas: e.target.checked,
                      kategoriKorban: e.target.checked ? 'Disabilitas / Rentan' : formData.kategoriKorban
                    })
                  }
                  className="rounded border-slate-300 text-indigo-900 focus:ring-indigo-600 w-4 h-4"
                />
                <span>Penyandang Disabilitas</span>
              </label>
              {formData.disabilitas && (
                <input
                  type="text"
                  value={formData.jenisDisabilitas}
                  onChange={(e) => setFormData({ ...formData, jenisDisabilitas: e.target.value })}
                  placeholder="Jenis disabilitas (Fisik / Rungu / Netra / Intelektual)"
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-xs flex-1"
                />
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Data Terlapor & TKP (Soft Amber/Gold) */}
        <div className="bg-gradient-to-br from-white via-amber-50/50 to-yellow-50/70 p-6 sm:p-7 rounded-3xl border-2 border-amber-200/90 shadow-sm space-y-4">
          <div className="border-b border-amber-200 pb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              03
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-amber-950 uppercase tracking-wide">
                3. Data Terlapor (Pelaku) & Tempat Kejadian Perkara (TKP)
              </h2>
              <p className="text-xs text-amber-800/80">
                Identitas terduga pelaku dan lokasi tempat kejadian perkara di 7 kecamatan Kabupaten Nagekeo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Terlapor / Terduga Pelaku *
              </label>
              <input
                type="text"
                value={formData.namaPelaku}
                onChange={(e) => setFormData({ ...formData, namaPelaku: e.target.value })}
                placeholder="Nama lengkap atau panggilan"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hubungan Pelaku dengan Korban
              </label>
              <select
                value={formData.hubunganPelaku}
                onChange={(e) => setFormData({ ...formData, hubunganPelaku: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium"
              >
                {HUBUNGAN_PELAKU_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Perkiraan Usia Pelaku (Tahun)
              </label>
              <input
                type="number"
                min={0}
                value={formData.usiaPelaku}
                onChange={(e) => setFormData({ ...formData, usiaPelaku: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Kejadian Perkara
              </label>
              <input
                type="date"
                value={formData.tanggalKejadian}
                onChange={(e) => setFormData({ ...formData, tanggalKejadian: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kecamatan TKP (Kabupaten Nagekeo) *
              </label>
              <select
                value={formData.kecamatanTKP}
                onChange={(e) => {
                  const newKec = e.target.value as KecamatanNagekeo;
                  const kecObj = DAFTAR_KECAMATAN.find((k) => k.nama === newKec);
                  setFormData({
                    ...formData,
                    kecamatanTKP: newKec,
                    desaKelurahanTKP: kecObj?.desa[0] || ''
                  });
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium"
              >
                {DAFTAR_KECAMATAN.map((k) => (
                  <option key={k.nama} value={k.nama}>
                    Kec. {k.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Desa / Kelurahan TKP
              </label>
              <select
                value={formData.desaKelurahanTKP}
                onChange={(e) => setFormData({ ...formData, desaKelurahanTKP: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium"
              >
                {selectedKecData?.desa.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Kategori Tempat Kejadian
              </label>
              <select
                value={formData.tempatKejadian}
                onChange={(e) => setFormData({ ...formData, tempatKejadian: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium"
              >
                {TEMPAT_KEJADIAN_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: Bentuk Kekerasan, Kronologi & Layanan (Soft Sky Blue) */}
        <div className="bg-gradient-to-br from-white via-sky-50/60 to-cyan-50/70 p-6 sm:p-7 rounded-3xl border-2 border-sky-200/90 shadow-sm space-y-4">
          <div className="border-b border-sky-200 pb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              04
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-blue-950 uppercase tracking-wide">
                4. Bentuk Kekerasan, Kronologi & Rencana Layanan
              </h2>
              <p className="text-xs text-sky-800/80">
                Klasifikasi jenis pelanggaran, uraian ringkas kejadian, serta penentuan urgensi respon terpadu
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Bentuk Kekerasan Multi-checkbox */}
            <div>
              <label className="block font-semibold text-slate-800 mb-2">
                Bentuk Kekerasan yang Dialami (Bisa pilih lebih dari satu) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {DAFTAR_BENTUK_KEKERASAN.map((bentuk) => {
                  const isChecked = (formData.bentukKekerasan || []).includes(bentuk);
                  return (
                    <label
                      key={bentuk}
                      onClick={() => toggleBentukKekerasan(bentuk)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-indigo-900 focus:ring-indigo-600"
                      />
                      <span>{bentuk}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Kronologi */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Ringkasan Kronologi Kejadian *
              </label>
              <textarea
                rows={4}
                value={formData.ringkasanKronologi}
                onChange={(e) => setFormData({ ...formData, ringkasanKronologi: e.target.value })}
                placeholder="Ceritakan secara kronologis peristiwa yang terjadi, waktu kejadian, tindakan pelaku, dan saksi yang mengetahui..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
                required
              />
            </div>

            {/* Tingkat Urgensi & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Tingkat Urgensi Penanganan
                </label>
                <select
                  value={formData.tingkatUrgensi}
                  onChange={(e) => setFormData({ ...formData, tingkatUrgensi: e.target.value as TingkatUrgensi })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="Darurat">Darurat (Ancaman jiwa, butuh evakuasi / Visum &lt;24 Jam)</option>
                  <option value="Tinggi">Tinggi (Luka berat / trauma akut / pelaku satu rumah)</option>
                  <option value="Sedang">Sedang (Butuh mediasi / konseling / pemulihan)</option>
                  <option value="Rendah">Rendah (Konsultasi / pemantauan rutin)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Status Penanganan Terkini
                </label>
                <select
                  value={formData.statusPenanganan}
                  onChange={(e) => setFormData({ ...formData, statusPenanganan: e.target.value as StatusPenanganan })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold"
                >
                  {DAFTAR_STATUS_PENANGANAN.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Layanan Rujukan yang dibutuhkan */}
            <div>
              <label className="block font-semibold text-slate-800 mb-2">
                Rencana Layanan & Rujukan Terpadu (UPTD PPA & Jejaring Kab. Nagekeo)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {LAYANAN_OPTIONS.map((layanan) => {
                  const isChecked = (formData.layananDibutuhkan || []).includes(layanan);
                  return (
                    <label
                      key={layanan}
                      onClick={() => toggleLayanan(layanan)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-amber-50 border-amber-300 text-amber-950 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span>{layanan}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Keterangan Tambahan */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Catatan Asesmen Tambahan / Tindak Lanjut Khusus
              </label>
              <input
                type="text"
                value={formData.keteranganTambahan}
                onChange={(e) => setFormData({ ...formData, keteranganTambahan: e.target.value })}
                placeholder="Contoh: Saksi adalah tetangga samping rumah; korban membutuhkan juru bahasa isyarat"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 rounded-xl transition-all shadow-md hover:shadow-lg ring-1 ring-white/50"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>{isEditing ? 'Simpan Perubahan Berkas' : 'Daftarkan Kasus ke SIPELKA'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
