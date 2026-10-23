import React, { useState } from 'react';
import { KasusKekerasan, KecamatanNagekeo, BentukKekerasan, KategoriKorban } from '../types';
import { DAFTAR_KECAMATAN, DAFTAR_BENTUK_KEKERASAN } from '../data/nagekeoData';
import { exportCasesToCSV } from '../services/storageService';
import { Printer, FileSpreadsheet, Download, Shield, Calendar, MapPin, BarChart3 } from 'lucide-react';

interface OfficialReportViewProps {
  cases: KasusKekerasan[];
  isAnonymized: boolean;
  onPrintOfficialReport: (periode: string) => void;
}

export const OfficialReportView: React.FC<OfficialReportViewProps> = ({
  cases,
  isAnonymized,
  onPrintOfficialReport
}) => {
  const [selectedTahun, setSelectedTahun] = useState('2026');
  const [selectedBulan, setSelectedBulan] = useState('Semua');

  // Filter cases for the report period
  const filteredCases = cases.filter((c) => {
    if (selectedTahun && !c.tanggalLapor.startsWith(selectedTahun)) {
      return false;
    }
    if (selectedBulan !== 'Semua') {
      const monthPrefix = `${selectedTahun}-${selectedBulan}`;
      if (!c.tanggalLapor.startsWith(monthPrefix)) {
        return false;
      }
    }
    return true;
  });

  const namaBulanMap: Record<string, string> = {
    '01': 'Januari',
    '02': 'Februari',
    '03': 'Maret',
    '04': 'April',
    '05': 'Mei',
    '06': 'Juni',
    '07': 'Juli',
    '08': 'Agustus',
    '09': 'September',
    '10': 'Oktober',
    '11': 'November',
    '12': 'Desember'
  };

  const periodeLabel =
    selectedBulan === 'Semua'
      ? `Tahun Anggaran ${selectedTahun}`
      : `Bulan ${namaBulanMap[selectedBulan]} ${selectedTahun}`;

  // Cross-Tabulation Matrix: Bentuk Kekerasan x Kategori Korban
  const kategoriList: KategoriKorban[] = [
    'Perempuan Dewasa',
    'Anak Perempuan',
    'Anak Laki-Laki',
    'Disabilitas / Rentan'
  ];

  const getMatrixCount = (bentuk: BentukKekerasan, kat: KategoriKorban) => {
    return filteredCases.filter((c) => c.bentukKekerasan.includes(bentuk) && c.kategoriKorban === kat)
      .length;
  };

  const getBentukTotal = (bentuk: BentukKekerasan) => {
    return filteredCases.filter((c) => c.bentukKekerasan.includes(bentuk)).length;
  };

  const getKategoriTotal = (kat: KategoriKorban) => {
    return filteredCases.filter((c) => c.kategoriKorban === kat).length;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Rekapitulasi & Pelaporan Resmi PPPA Nagekeo
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Format baku instrumen SIMFONI PPA untuk pelaporan berkala Pemerintah Kabupaten Nagekeo ke KemenPPPA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPrintOfficialReport(periodeLabel)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-700 via-sky-600 to-blue-800 hover:from-blue-800 hover:to-sky-700 rounded-lg transition-all shadow-sm ring-1 ring-amber-400/40"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak Format Dinas (PDF)</span>
          </button>

          <button
            onClick={() => exportCasesToCSV(filteredCases, isAnonymized)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Period Box */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Calendar className="w-4 h-4 text-indigo-700" />
            <span>Periode Pelaporan:</span>
          </div>

          <select
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800"
          >
            <option value="2026">Tahun 2026</option>
            <option value="2025">Tahun 2025</option>
            <option value="2024">Tahun 2024</option>
          </select>

          <select
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800"
          >
            <option value="Semua">Semua Bulan (Tahunan)</option>
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Maret</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            <option value="06">Juni</option>
            <option value="07">Juli</option>
            <option value="08">Agustus</option>
            <option value="09">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>
        </div>

        <div className="text-slate-600 font-medium">
          Total Kasus Periode Terpilih: <strong className="text-slate-900 font-mono tabular-nums">{filteredCases.length}</strong> Kasus
        </div>
      </div>

      {/* Matriks SIMFONI PPA KemenPPPA */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-700" />
            Matriks Rekapitulasi Kasus Berdasarkan Bentuk Kekerasan & Kategori Korban
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Format baku Sistem Informasi Online Perlindungan Perempuan dan Anak (SIMFONI PPA)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-slate-200 border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3 text-left border-r border-slate-200">
                  Bentuk Kekerasan
                </th>
                {kategoriList.map((kat) => (
                  <th
                    key={kat}
                    className="py-2.5 px-3 text-center border-r border-slate-200 font-semibold"
                  >
                    {kat}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center bg-indigo-50/50 font-bold text-indigo-950">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DAFTAR_BENTUK_KEKERASAN.map((bentuk) => (
                <tr key={bentuk} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-medium text-slate-800 border-r border-slate-200">
                    {bentuk}
                  </td>
                  {kategoriList.map((kat) => {
                    const count = getMatrixCount(bentuk, kat);
                    return (
                      <td
                        key={kat}
                        className={`py-2.5 px-3 text-center font-mono tabular-nums border-r border-slate-200 ${
                          count > 0 ? 'font-bold text-slate-900 bg-amber-50/30' : 'text-slate-400'
                        }`}
                      >
                        {count}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-3 text-center font-mono tabular-nums font-bold text-indigo-950 bg-indigo-50/30">
                    {getBentukTotal(bentuk)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-2.5 px-3 border-r border-slate-200">JUMLAH KORBAN</td>
                {kategoriList.map((kat) => (
                  <td
                    key={kat}
                    className="py-2.5 px-3 text-center font-mono tabular-nums border-r border-slate-200"
                  >
                    {getKategoriTotal(kat)}
                  </td>
                ))}
                <td className="py-2.5 px-3 text-center font-mono tabular-nums text-indigo-950 bg-indigo-100/50 text-sm">
                  {filteredCases.length}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Rekapitulasi Spasial per Kecamatan di Nagekeo */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-700" />
            Distribusi Kasus Berdasarkan Wilayah Kecamatan di Kabupaten Nagekeo
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis lokus kejadian untuk pertimbangan penetapan program sosialisasi dan advokasi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {DAFTAR_KECAMATAN.map((k) => {
            const count = filteredCases.filter((c) => c.kecamatanTKP === k.nama).length;
            const pct = filteredCases.length > 0 ? Math.round((count / filteredCases.length) * 100) : 0;
            return (
              <div
                key={k.nama}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">Kec. {k.nama}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{k.ibukota}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600">Jumlah Kasus:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                    {count} ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dokumen Pengesahan & Kop Surat Info */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-sky-950 text-white p-6 rounded-2xl border border-amber-400/30 shadow-md space-y-3">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-white">
              Sistem Validasi dan Pengesahan Laporan Resmi Pemkab Nagekeo
            </h3>
            <p className="text-xs text-sky-100/90 leading-relaxed">
              Format cetak telah disesuaikan dengan tata naskah dinas Pemerintah Kabupaten Nagekeo, lengkap dengan Kop Surat resmi Dinas PMDP3A (Pemberdayaan Masyarakat dan Desa, Pemberdayaan Perempuan dan Perlindungan Anak), tanggal penetapan di Mbay, serta lembar pengesahan tanda tangan Kepala Bidang PPPA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
