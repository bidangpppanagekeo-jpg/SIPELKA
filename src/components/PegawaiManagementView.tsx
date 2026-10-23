import React, { useState, useMemo } from 'react';
import { PegawaiSIPELKA, KategoriPegawai, KasusKekerasan } from '../types';
import { exportPegawaiToCSV } from '../services/storageService';
import {
  Users,
  UserPlus,
  Shield,
  Phone,
  Mail,
  Award,
  Building,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Search,
  Filter,
  UserCheck,
  Stethoscope,
  Gavel,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';

interface PegawaiManagementViewProps {
  pegawaiList: PegawaiSIPELKA[];
  cases: KasusKekerasan[];
  onSavePegawai: (p: PegawaiSIPELKA) => void;
  onDeletePegawai: (id: string) => void;
  onResetPegawai: () => void;
  onViewOfficerCases: (officerName: string) => void;
}

const KATEGORI_OPTIONS: KategoriPegawai[] = [
  'Admin SIPELKA',
  'Kepala Bidang',
  'Tenaga Pendamping Bidang PPPA',
  'Tenaga Pendamping Unit PPA Polres',
  'Tenaga Medis Visum'
];

export const PegawaiManagementView: React.FC<PegawaiManagementViewProps> = ({
  pegawaiList,
  cases,
  onSavePegawai,
  onDeletePegawai,
  onResetPegawai,
  onViewOfficerCases
}) => {
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<PegawaiSIPELKA | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<PegawaiSIPELKA>>({
    nama: '',
    nipOrIdentitas: '',
    kategori: 'Tenaga Pendamping Bidang PPPA',
    jabatan: '',
    instansi: 'Dinas PMDP3A Kab. Nagekeo',
    telepon: '',
    email: '',
    keahlian: '',
    status: 'Aktif'
  });

  const handleOpenNewModal = () => {
    setEditingPegawai(null);
    setFormData({
      nama: '',
      nipOrIdentitas: '',
      kategori: 'Tenaga Pendamping Bidang PPPA',
      jabatan: '',
      instansi: 'Dinas PMDP3A Kab. Nagekeo',
      telepon: '',
      email: '',
      keahlian: '',
      status: 'Aktif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: PegawaiSIPELKA) => {
    setEditingPegawai(p);
    setFormData({ ...p });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama?.trim() || !formData.kategori) return;

    const payload: PegawaiSIPELKA = {
      id: editingPegawai?.id || `PEG-${Date.now()}`,
      nama: formData.nama.trim(),
      nipOrIdentitas: formData.nipOrIdentitas?.trim() || '-',
      kategori: formData.kategori as KategoriPegawai,
      jabatan: formData.jabatan?.trim() || 'Petugas Pendamping',
      instansi: formData.instansi?.trim() || 'Dinas PMDP3A Kab. Nagekeo',
      telepon: formData.telepon?.trim() || '-',
      email: formData.email?.trim() || '',
      keahlian: formData.keahlian?.trim() || '',
      status: (formData.status as 'Aktif' | 'Non-Aktif') || 'Aktif',
      tanggalBergabung: editingPegawai?.tanggalBergabung || new Date().toISOString().slice(0, 10)
    };

    onSavePegawai(payload);
    setIsModalOpen(false);
  };

  // Filtered pegawai
  const filteredPegawai = useMemo(() => {
    return pegawaiList.filter((p) => {
      const matchKategori = selectedKategori === 'Semua' || p.kategori === selectedKategori;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        p.nama.toLowerCase().includes(q) ||
        p.nipOrIdentitas.toLowerCase().includes(q) ||
        p.jabatan.toLowerCase().includes(q) ||
        p.instansi.toLowerCase().includes(q) ||
        p.telepon.toLowerCase().includes(q);

      return matchKategori && matchSearch;
    });
  }, [pegawaiList, selectedKategori, searchQuery]);

  // Count synced cases for each officer
  const getSyncedCasesCount = (pegawai: PegawaiSIPELKA) => {
    return cases.filter((c) => {
      return (
        c.petugasPendampingId === pegawai.id ||
        c.petugasPendamping === pegawai.nama ||
        c.petugasPolresId === pegawai.id ||
        c.petugasPolres === pegawai.nama ||
        c.tenagaMedisId === pegawai.id ||
        c.tenagaMedis === pegawai.nama ||
        c.adminSipelkaId === pegawai.id ||
        c.adminSipelka === pegawai.nama ||
        c.kepalaBidangId === pegawai.id ||
        c.kepalaBidang === pegawai.nama ||
        (c.riwayatPenanganan &&
          c.riwayatPenanganan.some(
            (r) => r.petugasId === pegawai.id || r.petugas?.includes(pegawai.nama)
          ))
      );
    }).length;
  };

  // KPI Stats
  const stats = useMemo(() => {
    const adminCount = pegawaiList.filter((p) => p.kategori === 'Admin SIPELKA').length;
    const kabidCount = pegawaiList.filter((p) => p.kategori === 'Kepala Bidang').length;
    const pppaCount = pegawaiList.filter(
      (p) => p.kategori === 'Tenaga Pendamping Bidang PPPA'
    ).length;
    const polresCount = pegawaiList.filter(
      (p) => p.kategori === 'Tenaga Pendamping Unit PPA Polres'
    ).length;
    const medisCount = pegawaiList.filter((p) => p.kategori === 'Tenaga Medis Visum').length;

    return {
      total: pegawaiList.length,
      adminCount,
      kabidCount,
      pppaCount,
      polresCount,
      medisCount
    };
  }, [pegawaiList]);

  const getKategoriBadge = (kat: KategoriPegawai) => {
    switch (kat) {
      case 'Admin SIPELKA':
        return {
          bg: 'bg-blue-100 text-blue-900 border-blue-200',
          icon: Shield,
          iconColor: 'text-blue-700 bg-blue-100',
          gradient: 'from-blue-500/10 via-sky-500/5 to-white',
          border: 'border-blue-300'
        };
      case 'Kepala Bidang':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-200',
          icon: Award,
          iconColor: 'text-amber-700 bg-amber-100',
          gradient: 'from-amber-500/10 via-yellow-500/5 to-white',
          border: 'border-amber-300'
        };
      case 'Tenaga Pendamping Bidang PPPA':
        return {
          bg: 'bg-indigo-100 text-indigo-900 border-indigo-200',
          icon: UserCheck,
          iconColor: 'text-indigo-700 bg-indigo-100',
          gradient: 'from-indigo-500/10 via-blue-500/5 to-white',
          border: 'border-indigo-300'
        };
      case 'Tenaga Pendamping Unit PPA Polres':
        return {
          bg: 'bg-teal-100 text-teal-900 border-teal-200',
          icon: Gavel,
          iconColor: 'text-teal-700 bg-teal-100',
          gradient: 'from-teal-500/10 via-emerald-500/5 to-white',
          border: 'border-teal-300'
        };
      case 'Tenaga Medis Visum':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          icon: Stethoscope,
          iconColor: 'text-emerald-700 bg-emerald-100',
          gradient: 'from-emerald-500/10 via-green-500/5 to-white',
          border: 'border-emerald-300'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: Users,
          iconColor: 'text-slate-600 bg-slate-100',
          gradient: 'from-white to-slate-50',
          border: 'border-slate-300'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-900 text-white p-6 sm:p-7 rounded-3xl border border-blue-200 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-sky-400/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-sky-400" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <span>Data Pegawai & Petugas Terpadu</span>
              <span>·</span>
              <span className="text-white">Dinas PMDP3A Kabupaten Nagekeo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 text-amber-300" />
              Kelola Data Pegawai & Tim Penanganan PPPA
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
              Pencatatan data Admin SIPELKA, Kepala Bidang, Tenaga Pendamping PPPA, Tenaga Pendamping Unit PPA Polres, dan Tenaga Medis Visum. Data tersinkronisasi otomatis dengan register perkara dan riwayat penanganan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => exportPegawaiToCSV(pegawaiList)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all backdrop-blur-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={handleOpenNewModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-blue-950 font-black text-xs rounded-xl shadow-md transition-all transform active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-blue-950" />
              <span>Tambah Pegawai Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-gradient-to-br from-white to-blue-50/70 p-4 rounded-2xl border-2 border-blue-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Admin SIPELKA</div>
            <div className="text-lg font-black text-blue-950">{stats.adminCount} Petugas</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-amber-50/70 p-4 rounded-2xl border-2 border-amber-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kepala Bidang</div>
            <div className="text-lg font-black text-amber-950">{stats.kabidCount} Pejabat</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-indigo-50/70 p-4 rounded-2xl border-2 border-indigo-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pendamping PPPA</div>
            <div className="text-lg font-black text-indigo-950">{stats.pppaCount} Petugas</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-teal-50/70 p-4 rounded-2xl border-2 border-teal-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unit PPA Polres</div>
            <div className="text-lg font-black text-teal-950">{stats.polresCount} Penyidik</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50/70 p-4 rounded-2xl border-2 border-emerald-200/80 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tenaga Medis Visum</div>
            <div className="text-lg font-black text-emerald-950">{stats.medisCount} Dokter</div>
          </div>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/80 to-indigo-50/60 p-4 sm:p-5 rounded-2xl border border-blue-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-blue-800 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama pegawai, NIP/NRP/SIP, instansi, atau keahlian..."
              className="w-full pl-9 pr-4 py-2 bg-white text-xs border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedKategori('Semua')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedKategori === 'Semua'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white/80 text-slate-700 hover:bg-white border border-blue-100'
              }`}
            >
              Semua ({pegawaiList.length})
            </button>
            {KATEGORI_OPTIONS.map((kat) => {
              const count = pegawaiList.filter((p) => p.kategori === kat).length;
              return (
                <button
                  key={kat}
                  onClick={() => setSelectedKategori(kat)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    selectedKategori === kat
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-white/80 text-slate-700 hover:bg-white border border-blue-100'
                  }`}
                >
                  {kat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Sync Info Notification Pill */}
        <div className="flex items-center gap-2 text-[11px] text-blue-950 bg-blue-100/70 px-3.5 py-1.5 rounded-xl border border-blue-200">
          <Layers className="w-3.5 h-3.5 text-blue-700 shrink-0" />
          <span>
            <strong>Sinkronisasi Aktif:</strong> Setiap pegawai yang ditambahkan di sini langsung muncul di pilihan menu <strong>Input Kasus</strong>, <strong>Riwayat Kasus</strong>, serta <strong>Lembar Pengesahan Laporan Resmi</strong>.
          </span>
        </div>
      </div>

      {/* 4. Pegawai Cards Grid */}
      {filteredPegawai.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Data Pegawai Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada pegawai yang sesuai dengan kriteria pencarian atau filter yang dipilih.
          </p>
          <button
            onClick={() => {
              setSelectedKategori('Semua');
              setSearchQuery('');
            }}
            className="text-xs text-blue-700 font-bold hover:underline"
          >
            Reset Filter Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPegawai.map((p) => {
            const badgeStyle = getKategoriBadge(p.kategori);
            const IconComp = badgeStyle.icon;
            const syncedCount = getSyncedCasesCount(p);

            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border-2 ${badgeStyle.border} bg-gradient-to-br ${badgeStyle.gradient} shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  {/* Top category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${badgeStyle.bg}`}
                    >
                      {p.kategori}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        p.status === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          p.status === 'Aktif' ? 'bg-emerald-600' : 'bg-slate-400'
                        }`}
                      />
                      <span>{p.status}</span>
                    </span>
                  </div>

                  {/* Name and Officer details */}
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${badgeStyle.iconColor}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-blue-950 text-sm leading-snug truncate">
                        {p.nama}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-600 font-semibold mt-0.5">
                        Identitas: {p.nipOrIdentitas}
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-1">{p.jabatan}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{p.instansi}</span>
                      </div>
                    </div>
                  </div>

                  {/* Keahlian & Kontak */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/70 text-xs">
                    {p.keahlian && (
                      <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                        <strong className="text-blue-950 font-bold block mb-0.5">Keahlian / Fokus:</strong>
                        {p.keahlian}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                      <a
                        href={`tel:${p.telepon}`}
                        className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{p.telepon}</span>
                      </a>
                      {p.email && (
                        <span className="text-slate-500 truncate max-w-[150px] font-mono">
                          {p.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom sync indicator & Actions */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewOfficerCases(p.nama)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-900 bg-blue-100/70 hover:bg-blue-200/80 px-2.5 py-1 rounded-lg transition-colors"
                    title="Buka register untuk kasus yang melibatkan petugas ini"
                  >
                    <span>{syncedCount} Kasus Terhubung</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Pegawai"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus data pegawai ${p.nama}?`)) {
                          onDeletePegawai(p.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Pegawai"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modal Tambah / Edit Pegawai */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-950 via-blue-900 to-sky-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg">
                  {editingPegawai ? 'Edit Data Pegawai & Petugas' : 'Tambah Pegawai & Petugas Baru'}
                </h3>
                <p className="text-xs text-sky-200 mt-0.5">
                  Input data resmi untuk disinkronkan dengan riwayat kasus SIPELKA
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Katarina Ose Wea, S.Tr.Sos / Aipda Fransiskus X. Ndolu, S.H."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Kategori Pegawai / Peran *
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) =>
                      setFormData({ ...formData, kategori: e.target.value as KategoriPegawai })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {KATEGORI_OPTIONS.map((kat) => (
                      <option key={kat} value={kat}>
                        {kat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    NIP / NRP / SIP / NIK *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nipOrIdentitas}
                    onChange={(e) => setFormData({ ...formData, nipOrIdentitas: e.target.value })}
                    placeholder="NIP PNS / NRP Polri / SIP Dokter"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Jabatan Resmi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    placeholder="Contoh: Pekerja Sosial / Kanit PPA / Dokter Forensik"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Instansi / Satuan Kerja *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.instansi}
                    onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                    placeholder="Dinas PMDP3A / Polres Nagekeo / RSUD Aeramo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Nomor Telepon / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="0812-XXXX-XXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Email Resmi (Opsional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@nagekeokab.go.id"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Keahlian / Sertifikasi Khusus
                  </label>
                  <input
                    type="text"
                    value={formData.keahlian}
                    onChange={(e) => setFormData({ ...formData, keahlian: e.target.value })}
                    placeholder="Contoh: Sertifikasi Asesmen Risiko Bahaya, Trauma Healing, Saksi Ahli Medis"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Status Keaktifan</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Non-Aktif' })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif / Pindah Tugas</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-900 to-sky-700 hover:from-blue-800 hover:to-sky-600 text-white font-black rounded-xl shadow-md transition-all"
                >
                  {editingPegawai ? 'Simpan Perubahan' : 'Daftarkan Pegawai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
