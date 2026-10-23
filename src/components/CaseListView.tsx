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
  onSelectCase,
  onEditCase,
  onDeleteCase,
  onPrintCase,
  onOpenNewCase,
  onResetData
}) => {
  const [filters, setFilters] = useState<FilterKasusState>({
    searchQuery: '',
    kecamatan: '',
    kategoriKorban: '',
    bentukKekerasan: '',
    statusPenanganan: '',
    tingkatUrgensi: '',
    tahun: '',
    bulan: ''
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter logic
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Search query matches No. Reg, Nama Korban, Terlapor, Ringkasan, Desa
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchReg = c.nomorRegistrasi.toLowerCase().includes(query);
        const matchKorban = c.namaKorban.toLowerCase().includes(query) || c.namaSamaran.toLowerCase().includes(query);
        const matchPelaku = c.namaPelaku.toLowerCase().includes(query);
        const matchDesa = c.desaKelurahanTKP.toLowerCase().includes(query);
        const matchKronologi = c.ringkasanKronologi.toLowerCase().includes(query);

        if (!matchReg && !matchKorban && !matchPelaku && !matchDesa && !matchKronologi) {
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
      {/* Title & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Buku Register Kasus Kekerasan PPPA Nagekeo
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar lengkap registrasi perkara, status pendampingan, dan rekam jejak penanganan korban
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportCasesToCSV(filteredCases, isAnonymized)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title="Download berkas tabel Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Ekspor Excel (CSV)</span>
          </button>

          <button
            onClick={() => exportBackupJSON(cases)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title="Cadangkan database lokal"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Backup Data (JSON)</span>
          </button>

          <button
            onClick={onOpenNewCase}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-900 rounded-lg hover:bg-indigo-950 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Tambah Kasus</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Cari nomor registrasi, nama korban/terlapor, kronologi, desa..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Kecamatan */}
            <select
              value={filters.kecamatan}
              onChange={(e) => setFilters({ ...filters, kecamatan: e.target.value })}
              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800 text-xs font-medium"
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
              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800 text-xs font-medium"
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
              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800 text-xs font-medium"
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
              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800 text-xs font-medium"
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
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 whitespace-nowrap"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Counter indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Menampilkan <span className="font-semibold text-slate-900 font-mono tabular-nums">{filteredCases.length}</span> dari{' '}
            <span className="font-semibold text-slate-900 font-mono tabular-nums">{cases.length}</span> total kasus
          </div>
          {isAnonymized && (
            <div className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
              Sensor privasi nama korban aktif
            </div>
          )}
        </div>
      </div>

      {/* Table Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">No. Registrasi & Tanggal</th>
                <th className="py-3 px-4">Korban</th>
                <th className="py-3 px-4">TKP / Wilayah</th>
                <th className="py-3 px-4">Bentuk Kekerasan</th>
                <th className="py-3 px-4">Pelaku / Hubungan</th>
                <th className="py-3 px-4">Status & Urgensi</th>
                <th className="py-3 px-4 text-right">Aksi Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                      <div className="font-medium text-indigo-950">
                        {item.statusPenanganan}
                      </div>
                      <div className="text-[11px] mt-0.5">
                        <span
                          className={`font-semibold ${
                            item.tingkatUrgensi === 'Darurat'
                              ? 'text-rose-700'
                              : item.tingkatUrgensi === 'Tinggi'
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          }`}
                        >
                          Urgensi: {item.tingkatUrgensi}
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
                          className="p-1.5 text-slate-600 hover:text-indigo-900 hover:bg-slate-100 rounded"
                          title="Buka Berkas Kasus"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditCase(item)}
                          className="p-1.5 text-slate-600 hover:text-indigo-900 hover:bg-slate-100 rounded"
                          title="Ubah Data Kasus"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onPrintCase(item)}
                          className="p-1.5 text-slate-600 hover:text-indigo-900 hover:bg-slate-100 rounded"
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
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Konfirmasi Penghapusan Berkas Kasus
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data kasus ini dari sistem register? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (confirmDeleteId) {
                    onDeleteCase(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
              >
                Ya, Hapus Kasus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
