import React, { useState, useMemo } from 'react';
import { KasusKekerasan, FilterKasusState } from '../types';
import { DAFTAR_KECAMATAN, DAFTAR_BENTUK_KEKERASAN, DAFTAR_STATUS_PENANGANAN } from '../data/nagekeoData';
import { exportCasesToCSV, exportBackupJSON } from '../services/storageService';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Plus,
  Eye,
  FileText,
  Trash2,
  Edit,
  RotateCcw
} from 'lucide-react';

interface CaseListViewProps {
  cases: KasusKekerasan[];
  isAnonymized: boolean;
  initialSearchQuery?: string;
  onSelectCase: (c: KasusKekerasan) => void;
  onEditCase: (c: KasusKekerasan) => void;
  onDeleteCase: (id: string) => void;
  onPrintCase: (c: KasusKekerasan) => void;
  onOpenNewCase: () => void;
  onResetData: () => void;
}

export const CaseListView: React.FC<CaseListViewProps> = ({
  cases,
  isAnonymized,
  initialSearchQuery = '',
  onSelectCase,
  onEditCase,
  onDeleteCase,
  onPrintCase,
  onOpenNewCase,
  onResetData
}) => {
  const [filters, setFilters] = useState<FilterKasusState>({
    searchQuery: initialSearchQuery || '',
    kecamatan: '',
    kategoriKorban: '',
    bentukKekerasan: '',
    statusPenanganan: '',
    tingkatUrgensi: '',
    tahun: '',
    bulan: ''
  });

  // Keep in sync if initialSearchQuery changes
  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setFilters((prev) => ({ ...prev, searchQuery: initialSearchQuery }));
    }
  }, [initialSearchQuery]);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter logic
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Search query matches No. Reg, Nama Korban, Terlapor, Ringkasan, Desa, Petugas
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchReg = c.nomorRegistrasi.toLowerCase().includes(query);
        const matchKorban = c.namaKorban.toLowerCase().includes(query) || c.namaSamaran.toLowerCase().includes(query);
        const matchPelaku = c.namaPelaku.toLowerCase().includes(query);
        const matchDesa = c.desaKelurahanTKP.toLowerCase().includes(query);
        const matchKronologi = c.ringkasanKronologi.toLowerCase().includes(query);
        const matchPetugas =
          (c.petugasPendamping && c.petugasPendamping.toLowerCase().includes(query)) ||
          (c.petugasPolres && c.petugasPolres.toLowerCase().includes(query)) ||
          (c.tenagaMedis && c.tenagaMedis.toLowerCase().includes(query)) ||
          (c.adminSipelka && c.adminSipelka.toLowerCase().includes(query));

        if (!matchReg && !matchKorban && !matchPelaku && !matchDesa && !matchKronologi && !matchPetugas) {
          return false;
        }
      }

      // Kecamatan
      if (filters.kecamatan && c.kecamatanTKP !== filters.kecamatan) {
        return false;
      }

      // Kategori Korban
      if (filters.kategoriKorban && c.kategoriKorban !== filters.kategoriKorban) {
        return false;
      }

      // Bentuk Kekerasan
      if (filters.bentukKekerasan && !c.bentukKekerasan.includes(filters.bentukKekerasan as any)) {
        return false;
      }

      // Status Penanganan
      if (filters.statusPenanganan && c.statusPenanganan !== filters.statusPenanganan) {
        return false;
      }

      // Tingkat Urgensi
      if (filters.tingkatUrgensi && c.tingkatUrgensi !== filters.tingkatUrgensi) {
        return false;
      }

      return true;
    });
  }, [cases, filters]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      kecamatan: '',
      kategoriKorban: '',
      bentukKekerasan: '',
      statusPenanganan: '',
      tingkatUrgensi: '',
      tahun: '',
      bulan: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Colorful Official Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-900 text-white p-6 sm:p-7 rounded-3xl border border-blue-200 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-sky-400/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-sky-400" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <span>Buku Catatan Register Resmi</span>
              <span>·</span>
              <span className="text-white">Dinas PMDP3A Kabupaten Nagekeo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Buku Register Kasus Kekerasan PPPA Nagekeo
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
              Daftar rekapitulasi perkara, administrasi berkas perkara terpadu, pemantauan riwayat intervensi korban, dan status rujukan hukum/medis se-Kabupaten Nagekeo.
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
              <span className="bg-white/20 px-3 py-1 rounded-full font-bold text-white">
                Total: {cases.length} Kasus
              </span>
              <span className="bg-amber-400/30 text-amber-200 px-3 py-1 rounded-full font-bold border border-amber-300/40">
                Aktif: {cases.filter((c) => c.statusPenanganan !== 'Kasus Selesai').length} Perkara
              </span>
              {isAnonymized && (
                <span className="bg-yellow-400 text-slate-950 px-3 py-1 rounded-full font-extrabold">
                  Mode Privasi Sensor Aktif
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => exportCasesToCSV(filteredCases, isAnonymized)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-950 bg-white hover:bg-sky-50 rounded-xl transition-all shadow-sm"
              title="Download berkas tabel Excel/CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Excel (CSV)</span>
            </button>

            <button
              onClick={() => exportBackupJSON(cases)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl transition-all backdrop-blur-xs"
              title="Cadangkan database lokal"
            >
              <Download className="w-4 h-4 text-sky-200" />
              <span>Backup JSON</span>
            </button>

            <button
              onClick={onOpenNewCase}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 rounded-xl transition-all shadow-md hover:shadow-lg ring-1 ring-white/50"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Catat Kasus Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter and Search Bar with Colorful Sky/Blue Gradient Background */}
      <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/80 to-indigo-50/60 p-5 rounded-2xl border-2 border-blue-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Cari nomor registrasi, nama korban/terlapor, kronologi, desa..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Kecamatan */}
            <select
              value={filters.kecamatan}
              onChange={(e) => setFilters({ ...filters, kecamatan: e.target.value })}
              className="px-3 py-2 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 text-xs font-semibold shadow-xs"
            >
              <option value="">Semua Kecamatan (7)</option>
              {DAFTAR_KECAMATAN.map((k) => (
                <option key={k.nama} value={k.nama}>
                  Kec. {k.nama}
                </option>
              ))}
            </select>

            {/* Kategori Korban */}
            <select
              value={filters.kategoriKorban}
              onChange={(e) => setFilters({ ...filters, kategoriKorban: e.target.value })}
              className="px-3 py-2 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 text-xs font-semibold shadow-xs"
            >
              <option value="">Semua Korban</option>
              <option value="Perempuan Dewasa">Perempuan Dewasa</option>
              <option value="Anak Perempuan">Anak Perempuan</option>
              <option value="Anak Laki-Laki">Anak Laki-Laki</option>
              <option value="Disabilitas / Rentan">Disabilitas / Rentan</option>
            </select>

            {/* Bentuk Kekerasan */}
            <select
              value={filters.bentukKekerasan}
              onChange={(e) => setFilters({ ...filters, bentukKekerasan: e.target.value })}
              className="px-3 py-2 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 text-xs font-semibold shadow-xs"
            >
              <option value="">Bentuk Kekerasan</option>
              {DAFTAR_BENTUK_KEKERASAN.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Status Penanganan */}
            <select
              value={filters.statusPenanganan}
              onChange={(e) => setFilters({ ...filters, statusPenanganan: e.target.value })}
              className="px-3 py-2 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 text-xs font-semibold shadow-xs"
            >
              <option value="">Semua Status</option>
              {DAFTAR_STATUS_PENANGANAN.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {(filters.searchQuery ||
            filters.kecamatan ||
            filters.kategoriKorban ||
            filters.bentukKekerasan ||
            filters.statusPenanganan ||
            filters.tingkatUrgensi) && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-bold text-blue-900 hover:text-white border border-blue-300 rounded-xl bg-white hover:bg-blue-800 transition-colors whitespace-nowrap shadow-xs"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Counter indicator */}
        <div className="flex items-center justify-between text-xs text-blue-950 font-medium pt-1">
          <div>
            Menampilkan <strong className="font-bold text-blue-800 font-mono tabular-nums">{filteredCases.length}</strong> dari{' '}
            <strong className="font-bold text-blue-800 font-mono tabular-nums">{cases.length}</strong> total berkas perkara
          </div>
          {isAnonymized && (
            <div className="text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-md text-[11px] font-bold border border-amber-300">
              Sensor privasi nama korban aktif
            </div>
          )}
        </div>
      </div>

      {/* 3. Table Data Grid with Colorful Header and Row Styles */}
      <div className="bg-white rounded-2xl border-2 border-blue-200/90 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-900 text-white font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 text-sky-100">No. Registrasi & Tanggal</th>
                <th className="py-3.5 px-4 text-sky-100">Korban</th>
                <th className="py-3.5 px-4 text-sky-100">TKP / Wilayah</th>
                <th className="py-3.5 px-4 text-sky-100">Bentuk Kekerasan</th>
                <th className="py-3.5 px-4 text-sky-100">Pelaku / Hubungan</th>
                <th className="py-3.5 px-4 text-sky-100">Status & Urgensi</th>
                <th className="py-3.5 px-4 text-right text-sky-100">Aksi Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <Filter className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-slate-700">
                        Tidak ada data kasus yang cocok
                      </p>
                      <p className="text-xs text-slate-500">
                        Coba sesuaikan kata kunci pencarian atau bersihkan filter di atas.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="px-3.5 py-1.5 text-xs font-semibold text-indigo-900 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                      >
                        Bersihkan Semua Filter
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCases.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectCase(item)}
                  >
                    {/* No. Registrasi & Tgl */}
                    <td className="py-3 px-4 align-top">
                      <div className="font-mono font-semibold text-slate-900 tabular-nums">
                        {item.nomorRegistrasi}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Tgl Lapor: {item.tanggalLapor}
                      </div>
                    </td>

                    {/* Korban */}
                    <td className="py-3 px-4 align-top">
                      <div className="font-semibold text-slate-900">
                        {isAnonymized ? item.namaSamaran : item.namaKorban}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{item.kategoriKorban}</span>
                        <span>·</span>
                        <span>{item.usiaKorban} Th</span>
                        {item.disabilitas && (
                          <>
                            <span>·</span>
                            <span className="text-amber-800 font-medium">Disabilitas</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* TKP */}
                    <td className="py-3 px-4 align-top">
                      <div className="font-medium text-slate-800">
                        Kec. {item.kecamatanTKP}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.desaKelurahanTKP} ({item.tempatKejadian})
                      </div>
                    </td>

                    {/* Bentuk Kekerasan */}
                    <td className="py-3 px-4 align-top">
                      <div className="text-slate-800 font-medium">
                        {item.bentukKekerasan.slice(0, 2).join(', ')}
                        {item.bentukKekerasan.length > 2 && (
                          <span className="text-slate-500 text-[11px]">
                            {' '}+{item.bentukKekerasan.length - 2} lainnya
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.ringkasanKronologi}
                      </div>
                    </td>

                    {/* Pelaku */}
                    <td className="py-3 px-4 align-top">
                      <div className="text-slate-800">
                        {isAnonymized ? 'Terlapor' : item.namaPelaku}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.hubunganPelaku}
                      </div>
                    </td>

                    {/* Status & Urgensi */}
                    <td className="py-3 px-4 align-top">
                      <div className="font-bold text-blue-950">
                        {item.statusPenanganan}
                      </div>
                      <div className="text-[11px] mt-0.5">
                        <span
                          className={`font-semibold ${
                            item.tingkatUrgensi === 'Darurat'
                              ? 'text-rose-700'
                              : item.tingkatUrgensi === 'Tinggi'
                              ? 'text-amber-700'
                              : 'text-blue-700'
                          }`}
                        >
                          Urgensi: {item.tingkatUrgensi}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                        <span className="text-slate-400">Tim:</span>
                        <span className="truncate max-w-[130px] font-semibold text-slate-700" title={item.petugasPendamping}>
                          {item.petugasPendamping}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3 px-4 align-top text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectCase(item)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="Buka Berkas Kasus"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditCase(item)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="Ubah Data Kasus"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onPrintCase(item)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="Cetak Berita Acara Kasus"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus Kasus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & Data Reset */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Standar pelaporan mengacu pada Petunjuk Teknis SIMFONI PPA Kementerian PPPA RI.
          </div>
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors"
            title="Muat ulang data sampel kasus Nagekeo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Contoh Data Nagekeo</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (() => {
        const itemToDelete = cases.find((c) => c.id === confirmDeleteId);
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-rose-200 shadow-2xl animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Konfirmasi Hapus Berkas Kasus
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Penghapusan langsung dari Web & Google Sheet
                  </p>
                </div>
              </div>

              {itemToDelete && (
                <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200 text-xs space-y-1">
                  <div className="font-mono font-bold text-rose-950">
                    {itemToDelete.nomorRegistrasi}
                  </div>
                  <div className="text-rose-900 font-medium">
                    Korban: {isAnonymized ? itemToDelete.namaSamaran : itemToDelete.namaKorban} ({itemToDelete.usiaKorban} Th)
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus data kasus ini? Baris data pada register web dan <strong>baris terkait di Google Sheet akan langsung terhapus</strong> tanpa menambah baris baru.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirmDeleteId) {
                      onDeleteCase(confirmDeleteId);
                      setConfirmDeleteId(null);
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Data</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
