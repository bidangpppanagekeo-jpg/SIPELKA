import React, { useState, useEffect } from 'react';
import {
  KasusKekerasan,
  KecamatanNagekeo,
  BentukKekerasan,
  TingkatUrgensi,
  StatusPenanganan,
  TempatKejadian,
  HubunganPelaku,
  PegawaiSIPELKA
} from '../types';
import { DAFTAR_KECAMATAN, DAFTAR_BENTUK_KEKERASAN, DAFTAR_STATUS_PENANGANAN } from '../data/nagekeoData';
import { generateRegistrationNumber } from '../services/storageService';
import { sanitizeObjectData, detectSecurityThreat } from '../services/securityService';
import {
  ArrowLeft,
  Save,
  Check,
  AlertCircle,
  Shield,
  UserCheck,
  Gavel,
  Stethoscope,
  Award,
  Users,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import formBgBiruImg from '../assets/images/form_ibu_anak_biru_1794804190809.jpg';
import formBgIndigoImg from '../assets/images/form_ibu_anak_indigo_1794804190861.jpg';
import formBgEmasImg from '../assets/images/form_ibu_anak_emas_1794804192901.jpg';
import formBgHijauImg from '../assets/images/form_ibu_anak_hijau_1794804193174.jpg';
import formBgPelangiImg from '../assets/images/form_ibu_anak_pelangi_1794804192967.jpg';

interface CaseFormViewProps {
  initialCase?: KasusKekerasan | null;
  allCases: KasusKekerasan[];
  pegawaiList: PegawaiSIPELKA[];
  onSaveCase: (savedCase: KasusKekerasan) => void;
  onCancel: () => void;
  onOpenGuide?: () => void;
  isReadOnly?: boolean;
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
  pegawaiList,
  onSaveCase,
  onCancel,
  onOpenGuide,
  isReadOnly = false
}) => {
  const isEditing = Boolean(initialCase);

  const adminPegawai = pegawaiList.filter((p) => p.kategori === 'Admin SIPELKA');
  const kabidPegawai = pegawaiList.filter((p) => p.kategori === 'Kepala Bidang');
  const pppaPegawai = pegawaiList.filter((p) => p.kategori === 'Tenaga Pendamping Bidang PPPA');
  const polresPegawai = pegawaiList.filter((p) => p.kategori === 'Tenaga Pendamping Unit PPA Polres');
  const medisPegawai = pegawaiList.filter((p) => p.kategori === 'Tenaga Medis Visum');

  const defaultAdmin = adminPegawai.find((p) => p.status === 'Aktif') || adminPegawai[0];
  const defaultKabid = kabidPegawai.find((p) => p.status === 'Aktif') || kabidPegawai[0];
  const defaultPppa = pppaPegawai.find((p) => p.status === 'Aktif') || pppaPegawai[0];

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
    desaKelurahanKorban: initialCase?.desaKelurahanKorban || 'Kelurahan Danga',
    rtRwKorban: initialCase?.rtRwKorban || '',
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
    
    // Sinkronisasi Pegawai & Tim Penanganan
    petugasPendamping: initialCase?.petugasPendamping || defaultPppa?.nama || 'Katarina Ose Wea, S.Tr.Sos',
    petugasPendampingId: initialCase?.petugasPendampingId || defaultPppa?.id || '',
    adminSipelka: initialCase?.adminSipelka || defaultAdmin?.nama || 'Yohanes Sina, S.Sos',
    adminSipelkaId: initialCase?.adminSipelkaId || defaultAdmin?.id || '',
    kepalaBidang: initialCase?.kepalaBidang || defaultKabid?.nama || 'Dra. Bernadetha M. Soa, M.Si',
    kepalaBidangId: initialCase?.kepalaBidangId || defaultKabid?.id || '',
    petugasPolres: initialCase?.petugasPolres || '',
    petugasPolresId: initialCase?.petugasPolresId || '',
    tenagaMedis: initialCase?.tenagaMedis || '',
    tenagaMedisId: initialCase?.tenagaMedisId || '',

    layananDibutuhkan: initialCase?.layananDibutuhkan || ['Konseling & Trauma Healing Psikologis'],
    riwayatPenanganan: initialCase?.riwayatPenanganan || [],
    keteranganTambahan: initialCase?.keteranganTambahan || ''
  });

  const [dampakInput, setDampakInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showQuickGuide, setShowQuickGuide] = useState(false);

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

    // Cyber Security Check: Pindai seluruh isian terhadap SQL Injection & XSS
    const fieldsToCheck = [
      formData.namaKorban || '',
      formData.namaPelapor || '',
      formData.namaPelaku || '',
      formData.ringkasanKronologi || '',
      formData.keteranganTambahan || '',
      formData.nikKorban || ''
    ];

    for (const text of fieldsToCheck) {
      const threat = detectSecurityThreat(text);
      if (threat.isMalicious) {
        console.warn('Peringatan Keamanan: Terdeteksi upaya payload tidak aman:', threat.reason);
      }
    }

    const constructedAlamat = `${formData.rtRwKorban ? `RT/RW ${formData.rtRwKorban}, ` : ''}${formData.desaKelurahanKorban ? `${formData.desaKelurahanKorban}, ` : ''}Kec. ${formData.kecamatanKorban || 'Aesesa'}`;
    const formWithAddress = {
      ...formData,
      alamatKorban: constructedAlamat
    };

    const sanitizedFormData = sanitizeObjectData(formWithAddress);

    const existingHistory =
      formData.riwayatPenanganan && formData.riwayatPenanganan.length > 0
        ? [...formData.riwayatPenanganan]
        : [
            {
              id: 'CAT-' + Date.now(),
              tanggal: formData.tanggalLapor || new Date().toISOString().slice(0, 10),
              petugas: formData.petugasPendamping || 'Staf PPPA',
              instansi: 'UPTD PPA Dinas PMDP3A Kab. Nagekeo',
              tindakan: 'Penerimaan Laporan & Penginputan Data ke SIPELKA',
              hasilDanCatatan: 'Berkas kasus berhasil didaftarkan ke sistem SIPELKA Nagekeo.',
              statusLayanan: (initialCase?.statusPenanganan || formData.statusPenanganan || 'Pengaduan Masuk') as KasusKekerasan['statusPenanganan']
            }
          ];

    if (
      initialCase &&
      formData.statusPenanganan &&
      formData.statusPenanganan !== initialCase.statusPenanganan
    ) {
      existingHistory.unshift({
        id: 'CAT-' + (Date.now() + 1),
        tanggal: new Date().toISOString().slice(0, 10),
        petugas: formData.petugasPendamping || 'Staf PPPA',
        instansi: 'UPTD PPA Dinas PMDP3A Kab. Nagekeo',
        tindakan: `Pembaruan Status Layanan: ${formData.statusPenanganan}`,
        hasilDanCatatan: `Status penanganan berubah dari "${initialCase.statusPenanganan}" menjadi "${formData.statusPenanganan}".`,
        statusLayanan: formData.statusPenanganan
      });
    }

    const payload: KasusKekerasan = {
      ...(sanitizedFormData as KasusKekerasan),
      riwayatPenanganan: existingHistory
    };

    onSaveCase(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {isReadOnly && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs sm:text-sm text-amber-900 font-bold flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span>Mode Pimpinan (Hanya Melihat - Read Only): Anda masuk sebagai Pimpinan / Kepala Bidang PPPA. Formulir ini ditampilkan dalam mode baca saja. Perubahan data tidak dapat disimpan.</span>
          </div>
        </div>
      )}

      {/* 1. Colorful Official Header Banner (Biru Muda) */}
      <div className="bg-gradient-to-r from-sky-200 via-sky-100 to-blue-200 text-sky-950 p-6 sm:p-7 rounded-3xl border border-sky-300 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-white/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-amber-400" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-sky-800 uppercase tracking-wider">
              <span>Formulir Asesmen Terpadu SIPELKA</span>
              <span>·</span>
              <span className="text-blue-950">Dinas PMDP3A Nagekeo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-sky-950 tracking-tight">
              {isEditing ? `Ubah Berkas Kasus: ${formData.nomorRegistrasi}` : 'Formulir Penerimaan & Registrasi Kasus PPPA'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              Pencatatan data pengaduan kekerasan perempuan dan anak sesuai standar Kementerian PPPA Republik Indonesia.
            </p>
          </div>

          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-sky-950 bg-white hover:bg-sky-50 border border-sky-300 rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-center"
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

      {/* Quick Guide & Instructions Alert (Biru Muda) */}
      <div className="bg-gradient-to-r from-sky-100 via-blue-100 to-cyan-100 rounded-2xl p-4 sm:p-5 text-sky-950 shadow-xs border border-sky-300 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-sky-950 flex items-center gap-2">
                <span>Panduan Cepat Pengisian Berkas Kasus (5 Bagian)</span>
              </h3>
              <p className="text-[11px] text-slate-700 font-medium">
                Isi data secara berurutan: Pelapor &rarr; Korban &rarr; Pelaku &rarr; Kronologi/Asesmen &rarr; Tim Petugas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setShowQuickGuide(!showQuickGuide)}
              className="px-3 py-1.5 bg-white/90 hover:bg-white text-sky-950 text-xs font-bold rounded-lg border border-sky-300 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-700" />
              <span>{showQuickGuide ? 'Tutup Tips' : 'Lihat Tips Pengisian'}</span>
              {showQuickGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {onOpenGuide && (
              <button
                type="button"
                onClick={onOpenGuide}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-extrabold rounded-lg shadow-sm transition-colors flex items-center gap-1"
              >
                <span>Buku Panduan Lengkap</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              </button>
            )}
          </div>
        </div>

        {showQuickGuide && (
          <div className="pt-3 border-t border-white/15 grid grid-cols-1 md:grid-cols-5 gap-2.5 text-[11px] animate-fade-in">
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 space-y-1">
              <strong className="text-amber-300 block font-bold">1. Pelapor</strong>
              <span className="text-sky-100 block">Nomor registrasi otomatis, pilih Petugas Pendamping Utama PPPA.</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 space-y-1">
              <strong className="text-amber-300 block font-bold">2. Korban</strong>
              <span className="text-sky-100 block">NIK 16 digit, usia, domisili kecamatan, dan inisial samaran privasi.</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 space-y-1">
              <strong className="text-amber-300 block font-bold">3. Pelaku</strong>
              <span className="text-sky-100 block">Identitas terlapor & hubungan dengan korban (KDRT, tetangga, dll).</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 space-y-1">
              <strong className="text-amber-300 block font-bold">4. Kronologi</strong>
              <span className="text-sky-100 block">Centang bentuk kekerasan, uraikan fakta kejadian & tingkat urgensi.</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 space-y-1">
              <strong className="text-amber-300 block font-bold">5. Tim Petugas</strong>
              <span className="text-sky-100 block">Pilih petugas Unit PPA Polres, Dokter Forensik VeR, & Admin Pencatat.</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Nomor Registrasi & Pelapor (Soft Sky Blue + Floral Mother & Daughter) */}
        <div className="relative overflow-hidden bg-transparent p-6 sm:p-7 rounded-3xl border-2 border-sky-300/90 shadow-sm">
          <div className="absolute inset-0 pointer-events-none select-none z-0" aria-hidden="true">
            <img
              src={formBgBiruImg}
              alt="Latar Ibu dan Anak Nuansa Biru Langit"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-35 brightness-110 contrast-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 space-y-4">
          <div className="pb-1 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-sky-200/90 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                01
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-blue-950 uppercase tracking-wide">
                  1. Data Penerimaan Laporan & Pihak Pelapor
                </h2>
                <p className="text-xs font-medium text-slate-700">
                  Informasi pencatatan awal, nomor registrasi resmi, dan pihak yang menyampaikan aduan
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Nomor Registrasi Resmi
              </label>
              <input
                type="text"
                value={formData.nomorRegistrasi}
                onChange={(e) => setFormData({ ...formData, nomorRegistrasi: e.target.value })}
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
                required
              />
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Tanggal Lapor
              </label>
              <input
                type="date"
                value={formData.tanggalLapor}
                onChange={(e) => setFormData({ ...formData, tanggalLapor: e.target.value })}
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
                required
              />
            </div>

            {/* Petugas Pendamping Utama - Terkoneksi ke Data Pegawai Tenaga Pendamping Bidang PPPA */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label className="inline-block font-bold text-slate-900 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                  Petugas Pendamping Utama *
                </label>
                <span className="text-[10px] font-bold text-indigo-800 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                  Data Pegawai PPPA
                </span>
              </div>
              <select
                value={
                  formData.petugasPendampingId ||
                  pppaPegawai.find((p) => p.nama === formData.petugasPendamping)?.id ||
                  (pppaPegawai.some((p) => p.nama === formData.petugasPendamping) ? '' : formData.petugasPendamping ? 'custom' : '')
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    // Biarkan manual jika custom
                    return;
                  }
                  const sel = pppaPegawai.find((p) => p.id === val);
                  if (sel) {
                    setFormData({
                      ...formData,
                      petugasPendampingId: sel.id,
                      petugasPendamping: sel.nama
                    });
                  } else {
                    setFormData({
                      ...formData,
                      petugasPendampingId: '',
                      petugasPendamping: ''
                    });
                  }
                }}
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
                required
              >
                <option value="">-- Pilih Tenaga Pendamping Bidang PPPA --</option>
                {pppaPegawai.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} — {p.jabatan} {p.status === 'Aktif' ? '(Aktif)' : `(${p.status})`}
                  </option>
                ))}
                {formData.petugasPendamping && !pppaPegawai.some((p) => p.nama === formData.petugasPendamping) && (
                  <option value="custom">
                    {formData.petugasPendamping} (Data Kustom / Manual)
                  </option>
                )}
              </select>

              {/* Info ringkas pegawai yang terpilih */}
              {(() => {
                const currentPppa = pppaPegawai.find(
                  (p) => p.id === formData.petugasPendampingId || p.nama === formData.petugasPendamping
                );
                if (currentPppa) {
                  return (
                    <div className="mt-1.5 p-2 bg-white/95 backdrop-blur-xs border border-indigo-200 rounded-lg text-[11px] text-indigo-950 flex flex-wrap items-center gap-x-2 gap-y-0.5 shadow-2xs">
                      <span className="font-bold text-indigo-900">{currentPppa.jabatan}</span>
                      <span>·</span>
                      <span className="text-slate-700 font-medium">{currentPppa.instansi}</span>
                      {currentPppa.telepon && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-emerald-700 font-semibold">WA: {currentPppa.telepon}</span>
                        </>
                      )}
                    </div>
                  );
                }
                return (
                  <p className="inline-block text-[11px] font-medium text-slate-800 mt-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md shadow-2xs">
                    Pilih pegawai dari kategori Tenaga Pendamping Bidang PPPA.
                  </p>
                );
              })()}
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Nama Lengkap Pelapor *
              </label>
              <input
                type="text"
                value={formData.namaPelapor}
                onChange={(e) => setFormData({ ...formData, namaPelapor: e.target.value })}
                placeholder="Nama orang yang melapor"
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
                required
              />
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Hubungan dengan Korban
              </label>
              <input
                type="text"
                value={formData.hubunganPelaporDenganKorban}
                onChange={(e) => setFormData({ ...formData, hubunganPelaporDenganKorban: e.target.value })}
                placeholder="Contoh: Korban Langsung, Ibu Kandung, Kader Desa"
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
                required
              />
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Kontak HP / Telepon Pelapor
              </label>
              <input
                type="text"
                value={formData.kontakPelapor}
                onChange={(e) => setFormData({ ...formData, kontakPelapor: e.target.value })}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
              />
            </div>
          </div>
          </div>
        </div>

        {/* SECTION 2: Data Korban & Asesmen Kerentanan (Lavender / Indigo + Mother & Child in Meadow) */}
        <div className="relative overflow-hidden bg-transparent p-6 sm:p-7 rounded-3xl border-2 border-indigo-300/90 shadow-sm">
          <div className="absolute inset-0 pointer-events-none select-none z-0" aria-hidden="true">
            <img
              src={formBgIndigoImg}
              alt="Latar Ibu dan Anak Nuansa Lavender Indigo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-35 brightness-110 contrast-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 space-y-4">
          <div className="pb-1 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-indigo-200/90 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                02
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
                  2. Identitas Korban & Asesmen Kerentanan
                </h2>
                <p className="text-xs font-medium text-slate-700">
                  Data identitas korban dilindungi kerahasiaannya sesuai UU Perlindungan Saksi dan Korban
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Nama Lengkap Korban *
              </label>
              <input
                type="text"
                value={formData.namaKorban}
                onChange={(e) => setFormData({ ...formData, namaKorban: e.target.value })}
                placeholder="Sesuai KTP / Akta Kelahiran"
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
                required
              />
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Nama Samaran / Kode Privasi
              </label>
              <input
                type="text"
                value={formData.namaSamaran}
                onChange={(e) => setFormData({ ...formData, namaSamaran: e.target.value })}
                placeholder="Contoh: Ny. MGD (32 th) / An. TN (13 th)"
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
                required
              />
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                NIK Korban (16 Digit)
              </label>
              <input
                type="text"
                value={formData.nikKorban}
                onChange={(e) => setFormData({ ...formData, nikKorban: e.target.value })}
                placeholder="5316xxxxxxxxxxxx"
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              />
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Jenis Kelamin Korban
              </label>
              <select
                value={formData.jenisKelaminKorban}
                onChange={(e) => setFormData({ ...formData, jenisKelaminKorban: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              >
                <option value="Perempuan">Perempuan</option>
                <option value="Laki-laki">Laki-laki (Anak)</option>
              </select>
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Usia Korban (Tahun)
              </label>
              <input
                type="number"
                min={0}
                max={120}
                value={formData.usiaKorban}
                onChange={(e) => handleUsiaChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
                required
              />
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Kategori Korban
              </label>
              <select
                value={formData.kategoriKorban}
                onChange={(e) => setFormData({ ...formData, kategoriKorban: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              >
                <option value="Perempuan Dewasa">Perempuan Dewasa</option>
                <option value="Anak Perempuan">Anak Perempuan (&lt; 18 th)</option>
                <option value="Anak Laki-Laki">Anak Laki-Laki (&lt; 18 th)</option>
                <option value="Disabilitas / Rentan">Disabilitas / Rentan</option>
              </select>
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Kecamatan Domisili Korban
              </label>
              <select
                value={formData.kecamatanKorban}
                onChange={(e) => {
                  const newKec = e.target.value as KecamatanNagekeo;
                  const kecObj = DAFTAR_KECAMATAN.find((k) => k.nama === newKec);
                  const firstDesa = kecObj?.desa[0] || '';
                  setFormData({
                    ...formData,
                    kecamatanKorban: newKec,
                    desaKelurahanKorban: firstDesa
                  });
                }}
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              >
                {DAFTAR_KECAMATAN.map((k) => (
                  <option key={k.nama} value={k.nama}>
                    Kec. {k.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Desa / Kelurahan Domisili (2026)
              </label>
              <select
                value={formData.desaKelurahanKorban || ''}
                onChange={(e) => setFormData({ ...formData, desaKelurahanKorban: e.target.value })}
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              >
                {(DAFTAR_KECAMATAN.find((k) => k.nama === formData.kecamatanKorban)?.desa || []).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                RT / RW / Dusun / Nama Jalan
              </label>
              <input
                type="text"
                value={formData.rtRwKorban || ''}
                onChange={(e) => setFormData({ ...formData, rtRwKorban: e.target.value })}
                placeholder="Contoh: RT 04 / RW 02, Dusun Wolokoli"
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              />
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Pendidikan Terakhir
              </label>
              <select
                value={formData.pendidikanKorban || 'SMA'}
                onChange={(e) => setFormData({ ...formData, pendidikanKorban: e.target.value })}
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              >
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="SI">SI (Sarjana)</option>
                <option value="D3">D3</option>
                <option value="Tidak Sekolah">Tidak Sekolah</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Pekerjaan Korban
              </label>
              <input
                type="text"
                value={formData.pekerjaanKorban}
                onChange={(e) => setFormData({ ...formData, pekerjaanKorban: e.target.value })}
                placeholder="Pelajar / IRT / Petani / Honorer / Swasta"
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-900 bg-white/92 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/80 shadow-2xs">
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
                  className="rounded border-slate-400 text-indigo-900 focus:ring-indigo-600 w-4 h-4"
                />
                <span>Penyandang Disabilitas</span>
              </label>
              {formData.disabilitas && (
                <input
                  type="text"
                  value={formData.jenisDisabilitas}
                  onChange={(e) => setFormData({ ...formData, jenisDisabilitas: e.target.value })}
                  placeholder="Jenis disabilitas (Fisik / Rungu / Netra / Intelektual)"
                  className="px-2.5 py-1.5 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg text-xs font-medium text-slate-900 flex-1 shadow-xs"
                />
              )}
            </div>
          </div>
          </div>
        </div>

        {/* SECTION 3: Data Terlapor & TKP (Warm Amber / Gold + Mother & Son Rice Terraces) */}
        <div className="relative overflow-hidden bg-transparent p-6 sm:p-7 rounded-3xl border-2 border-amber-300/90 shadow-sm">
          <div className="absolute inset-0 pointer-events-none select-none z-0" aria-hidden="true">
            <img
              src={formBgEmasImg}
              alt="Latar Ibu dan Anak Nuansa Emas Pedesaan"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-35 brightness-110 contrast-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 space-y-4">
          <div className="pb-1 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-amber-200/90 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                03
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-amber-950 uppercase tracking-wide">
                  3. Data Terlapor (Pelaku) & Tempat Kejadian Perkara (TKP)
                </h2>
                <p className="text-xs font-medium text-slate-700">
                  Identitas terduga pelaku dan lokasi tempat kejadian perkara di 7 kecamatan Kabupaten Nagekeo
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Nama Terlapor / Terduga Pelaku *
              </label>
              <input
                type="text"
                value={formData.namaPelaku}
                onChange={(e) => setFormData({ ...formData, namaPelaku: e.target.value })}
                placeholder="Nama lengkap atau panggilan"
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                required
              />
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Hubungan Pelaku dengan Korban
              </label>
              <select
                value={formData.hubunganPelaku}
                onChange={(e) => setFormData({ ...formData, hubunganPelaku: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              >
                {HUBUNGAN_PELAKU_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Perkiraan Usia Pelaku (Tahun)
              </label>
              <input
                type="number"
                min={0}
                value={formData.usiaPelaku}
                onChange={(e) => setFormData({ ...formData, usiaPelaku: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Tanggal Kejadian Perkara
              </label>
              <input
                type="date"
                value={formData.tanggalKejadian}
                onChange={(e) => setFormData({ ...formData, tanggalKejadian: e.target.value })}
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                required
              />
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
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
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              >
                {DAFTAR_KECAMATAN.map((k) => (
                  <option key={k.nama} value={k.nama}>
                    Kec. {k.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Desa / Kelurahan TKP
              </label>
              <select
                value={formData.desaKelurahanTKP}
                onChange={(e) => setFormData({ ...formData, desaKelurahanTKP: e.target.value })}
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              >
                {selectedKecData?.desa.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Kategori Tempat Kejadian
              </label>
              <select
                value={formData.tempatKejadian}
                onChange={(e) => setFormData({ ...formData, tempatKejadian: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
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
        </div>

        {/* SECTION 4: Bentuk Kekerasan, Kronologi & Layanan (Emerald / Teal + Mother & Child Reading) */}
        <div className="relative overflow-hidden bg-transparent p-6 sm:p-7 rounded-3xl border-2 border-emerald-300/90 shadow-sm">
          <div className="absolute inset-0 pointer-events-none select-none z-0" aria-hidden="true">
            <img
              src={formBgHijauImg}
              alt="Latar Ibu dan Anak Nuansa Hijau Pemulihan"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-35 brightness-110 contrast-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 space-y-4">
          <div className="pb-1 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-emerald-200/90 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                04
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wide">
                  4. Bentuk Kekerasan, Kronologi & Rencana Layanan
                </h2>
                <p className="text-xs font-medium text-slate-700">
                  Klasifikasi jenis pelanggaran, uraian ringkas kejadian, serta penentuan urgensi respon terpadu
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Bentuk Kekerasan Multi-checkbox */}
            <div>
              <label className="inline-block font-bold text-slate-900 mb-2 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Bentuk Kekerasan yang Dialami (Bisa pilih lebih dari satu) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {DAFTAR_BENTUK_KEKERASAN.map((bentuk) => {
                  const isChecked = (formData.bentukKekerasan || []).includes(bentuk);
                  return (
                    <label
                      key={bentuk}
                      onClick={() => toggleBentukKekerasan(bentuk)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors backdrop-blur-xs shadow-2xs ${
                        isChecked
                          ? 'bg-indigo-50/95 border-indigo-400 text-indigo-950 font-bold'
                          : 'bg-white/95 border-slate-300 text-slate-800 font-medium hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-400 text-indigo-900 focus:ring-indigo-600"
                      />
                      <span>{bentuk}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Kronologi */}
            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Ringkasan Kronologi Kejadian *
              </label>
              <textarea
                rows={4}
                value={formData.ringkasanKronologi}
                onChange={(e) => setFormData({ ...formData, ringkasanKronologi: e.target.value })}
                placeholder="Ceritakan secara kronologis peristiwa yang terjadi, waktu kejadian, tindakan pelaku, dan saksi yang mengetahui..."
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed shadow-xs"
                required
              />
            </div>

            {/* Tingkat Urgensi & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                  Tingkat Urgensi Penanganan
                </label>
                <select
                  value={formData.tingkatUrgensi}
                  onChange={(e) => setFormData({ ...formData, tingkatUrgensi: e.target.value as TingkatUrgensi })}
                  className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
                >
                  <option value="Darurat">Darurat (Ancaman jiwa, butuh evakuasi / Visum &lt;24 Jam)</option>
                  <option value="Tinggi">Tinggi (Luka berat / trauma akut / pelaku satu rumah)</option>
                  <option value="Sedang">Sedang (Butuh mediasi / konseling / pemulihan)</option>
                  <option value="Rendah">Rendah (Konsultasi / pemantauan rutin)</option>
                </select>
              </div>

              <div>
                <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                  Status Penanganan Terkini
                </label>
                <select
                  value={formData.statusPenanganan}
                  onChange={(e) => setFormData({ ...formData, statusPenanganan: e.target.value as StatusPenanganan })}
                  className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
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
              <label className="inline-block font-bold text-slate-900 mb-2 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Rencana Layanan & Rujukan Terpadu (UPTD PPA & Jejaring Kab. Nagekeo)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {LAYANAN_OPTIONS.map((layanan) => {
                  const isChecked = (formData.layananDibutuhkan || []).includes(layanan);
                  return (
                    <label
                      key={layanan}
                      onClick={() => toggleLayanan(layanan)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors backdrop-blur-xs shadow-2xs ${
                        isChecked
                          ? 'bg-amber-50/95 border-amber-400 text-amber-950 font-bold'
                          : 'bg-white/95 border-slate-300 text-slate-800 font-medium hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-400 text-amber-600 focus:ring-amber-500"
                      />
                      <span>{layanan}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Keterangan Tambahan */}
            <div>
              <label className="inline-block font-bold text-slate-900 mb-1.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                Catatan Asesmen Tambahan / Tindak Lanjut Khusus
              </label>
              <input
                type="text"
                value={formData.keteranganTambahan}
                onChange={(e) => setFormData({ ...formData, keteranganTambahan: e.target.value })}
                placeholder="Contoh: Saksi adalah tetangga samping rumah; korban membutuhkan juru bahasa isyarat"
                className="w-full px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
              />
            </div>
          </div>
          </div>
        </div>

        {/* SECTION 5: Tim Penanganan Terpadu & Sinkronisasi Petugas SIPELKA (Vibrant Flores Colors) */}
        <div className="relative overflow-hidden bg-transparent p-6 sm:p-7 rounded-3xl border-2 border-rose-300/80 shadow-sm">
          <div className="absolute inset-0 pointer-events-none select-none z-0" aria-hidden="true">
            <img
              src={formBgPelangiImg}
              alt="Latar Ibu dan Anak Tenun Flores Berwarna"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-35 brightness-110 contrast-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 space-y-4">
          <div className="pb-1 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-rose-200/90 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                05
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-blue-950 uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4 text-rose-600" />
                  5. Penugasan Tim Penanganan Terpadu & Sinkronisasi Petugas
                </h2>
                <p className="text-xs font-medium text-slate-700">
                  Data petugas yang dipilih akan tersinkron otomatis ke lembar penanganan, berita acara, dan riwayat kasus
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-[10px] font-bold text-rose-900 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-rose-200 shadow-xs">
              Sinkronisasi SIPELKA
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* 1. Admin SIPELKA Pencatat */}
            <div className="space-y-1.5">
              <label className="inline-flex items-center gap-1.5 font-bold text-slate-900 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-blue-700" />
                <span>Admin SIPELKA (Pencatat) *</span>
              </label>
              <select
                value={formData.adminSipelkaId || ''}
                onChange={(e) => {
                  const sel = adminPegawai.find((p) => p.id === e.target.value);
                  setFormData({
                    ...formData,
                    adminSipelkaId: e.target.value,
                    adminSipelka: sel?.nama || ''
                  });
                }}
                className="w-full px-2.5 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
              >
                <option value="">-- Pilih Admin SIPELKA --</option>
                {adminPegawai.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} ({p.jabatan})
                  </option>
                ))}
              </select>
              <p className="inline-block text-[10px] font-medium text-slate-800 bg-white/92 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs">
                Petugas yang memverifikasi input perkara.
              </p>
            </div>

            {/* 2. Tenaga Pendamping Bidang PPPA */}
            <div className="space-y-1.5">
              <label className="inline-flex items-center gap-1.5 font-bold text-slate-900 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                <UserCheck className="w-3.5 h-3.5 text-indigo-700" />
                <span>Tenaga Pendamping PPPA *</span>
              </label>
              <select
                value={formData.petugasPendampingId || ''}
                onChange={(e) => {
                  const sel = pppaPegawai.find((p) => p.id === e.target.value);
                  setFormData({
                    ...formData,
                    petugasPendampingId: e.target.value,
                    petugasPendamping: sel?.nama || ''
                  });
                }}
                className="w-full px-2.5 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              >
                <option value="">-- Pilih Pendamping PPPA --</option>
                {pppaPegawai.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} - {p.jabatan}
                  </option>
                ))}
              </select>
              <p className="inline-block text-[10px] font-medium text-slate-800 bg-white/92 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs">
                Pekerja sosial / konselor pendamping korban.
              </p>
            </div>

            {/* 3. Tenaga Pendamping Unit PPA Polres */}
            <div className="space-y-1.5">
              <label className="inline-flex items-center gap-1.5 font-bold text-slate-900 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                <Gavel className="w-3.5 h-3.5 text-teal-700" />
                <span>Unit PPA Polres (Penyidik)</span>
              </label>
              <select
                value={formData.petugasPolresId || ''}
                onChange={(e) => {
                  const sel = polresPegawai.find((p) => p.id === e.target.value);
                  setFormData({
                    ...formData,
                    petugasPolresId: e.target.value,
                    petugasPolres: sel ? `${sel.nama} (${sel.jabatan})` : ''
                  });
                }}
                className="w-full px-2.5 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-xs"
              >
                <option value="">-- Tidak Ada / Koordinasi Menyusul --</option>
                {polresPegawai.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} ({p.jabatan})
                  </option>
                ))}
              </select>
              <p className="inline-block text-[10px] font-medium text-slate-800 bg-white/92 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs">
                Penyidik pembantu pendamping proses hukum.
              </p>
            </div>

            {/* 4. Tenaga Medis Visum */}
            <div className="space-y-1.5">
              <label className="inline-flex items-center gap-1.5 font-bold text-slate-900 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
                <span>Tenaga Medis Visum (VeR)</span>
              </label>
              <select
                value={formData.tenagaMedisId || ''}
                onChange={(e) => {
                  const sel = medisPegawai.find((p) => p.id === e.target.value);
                  setFormData({
                    ...formData,
                    tenagaMedisId: e.target.value,
                    tenagaMedis: sel ? `${sel.nama} (${sel.instansi})` : ''
                  });
                }}
                className="w-full px-2.5 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
              >
                <option value="">-- Tidak Ada / Medis Menyusul --</option>
                {medisPegawai.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} ({p.instansi})
                  </option>
                ))}
              </select>
              <p className="inline-block text-[10px] font-medium text-slate-800 bg-white/92 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs">
                Dokter pemeriksa luka & Visum et Repertum.
              </p>
            </div>

            {/* 5. Kepala Bidang PPPA Pengesah */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
              <label className="inline-flex items-center gap-1.5 font-bold text-slate-900 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs">
                <Award className="w-3.5 h-3.5 text-amber-700" />
                <span>Kepala Bidang PPPA (Pejabat Pengesah Laporan Resmi) *</span>
              </label>
              <select
                value={formData.kepalaBidangId || ''}
                onChange={(e) => {
                  const sel = kabidPegawai.find((p) => p.id === e.target.value);
                  setFormData({
                    ...formData,
                    kepalaBidangId: e.target.value,
                    kepalaBidang: sel?.nama || ''
                  });
                }}
                className="w-full px-2.5 py-2 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600 shadow-xs"
              >
                <option value="">-- Pilih Kepala Bidang --</option>
                {kabidPegawai.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} (NIP: {p.nipOrIdentitas})
                  </option>
                ))}
              </select>
              <p className="inline-block text-[10px] font-medium text-slate-800 bg-white/92 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs">
                Nama pejabat yang tercantum pada lembar pengesahan berita acara dan laporan resmi.
              </p>
            </div>
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
            {isReadOnly ? 'Kembali' : 'Batal'}
          </button>
          {!isReadOnly && (
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 rounded-xl transition-all shadow-md hover:shadow-lg ring-1 ring-white/50"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>{isEditing ? 'Simpan Perubahan Berkas' : 'Daftarkan Kasus ke SIPELKA'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
