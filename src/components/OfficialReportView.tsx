import React, { useState } from 'react';
import { KasusKekerasan, KecamatanNagekeo, BentukKekerasan, KategoriKorban, PegawaiSIPELKA } from '../types';
import { DAFTAR_KECAMATAN, DAFTAR_BENTUK_KEKERASAN } from '../data/nagekeoData';
import { exportCasesToCSV } from '../services/storageService';
import { Printer, FileSpreadsheet, Download, Shield, Calendar, MapPin, BarChart3, Users, Award } from 'lucide-react';

interface OfficialReportViewProps {
  cases: KasusKekerasan[];
  isAnonymized: boolean;
  pegawaiList?: PegawaiSIPELKA[];
  onPrintOfficialReport: (periode: string) => void;
}

export const OfficialReportView: React.FC<OfficialReportViewProps> = ({
  cases,
  isAnonymized,
  pegawaiList = [],
  onPrintOfficialReport
}) => {

  const [selectedTahun, setSelectedTahun] = useState('2026');
  const [selectedBulan, setSelectedBulan] = useState('Semua');

  const activeKabid =
    pegawaiList.find((p) => p.kategori === 'Kepala Bidang' && p.status === 'Aktif') ||
    pegawaiList.find((p) => p.kategori === 'Kepala Bidang');
  const activeAdmin =
    pegawaiList.find((p) => p.kategori === 'Admin SIPELKA' && p.status === 'Aktif') ||
    pegawaiList.find((p) => p.kategori === 'Admin SIPELKA');

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
      {/* 1. Colorful Official Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-900 text-white p-6 sm:p-7 rounded-3xl border border-blue-200 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-sky-400/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-sky-400" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <span>Pelaporan Terpadu SIMFONI PPA</span>
              <span>·</span>
              <span className="text-white">Dinas PMDP3A Kabupaten Nagekeo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Rekapitulasi & Pelaporan Resmi Data Kasus PPPA
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
              Format instrumen baku Sistem Informasi Online Perlindungan Perempuan dan Anak (SIMFONI PPA) Kementerian PPPA Republik Indonesia.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => onPrintOfficialReport(periodeLabel)}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 rounded-xl transition-all shadow-md hover:shadow-lg ring-1 ring-white/50"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Cetak Berkas Dinas (PDF)</span>
            </button>

            <button
              onClick={() => exportCasesToCSV(filteredCases, isAnonymized)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-blue-950 bg-white hover:bg-sky-50 rounded-xl transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Colorful Filter Period Box */}
      <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/80 to-indigo-50/60 p-5 rounded-2xl border-2 border-blue-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-blue-950 font-extrabold">
            <Calendar className="w-4 h-4 text-blue-700" />
            <span>Pilih Periode Laporan:</span>
          </div>

          <select
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(e.target.value)}
            className="px-3 py-2 bg-white border border-blue-200 rounded-xl font-bold text-blue-950 shadow-xs focus:ring-2 focus:ring-blue-600"
          >
            <option value="2026">Tahun Anggaran 2026</option>
            <option value="2025">Tahun Anggaran 2025</option>
            <option value="2024">Tahun Anggaran 2024</option>
          </select>

          <select
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
            className="px-3 py-2 bg-white border border-blue-200 rounded-xl font-bold text-blue-950 shadow-xs focus:ring-2 focus:ring-blue-600"
          >
            <option value="Semua">Semua Bulan (Laporan Tahunan)</option>
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

        <div className="text-blue-950 font-bold bg-white/80 px-3.5 py-1.5 rounded-xl border border-blue-200">
          Kasus Periode Ini: <span className="text-blue-700 font-mono text-sm tabular-nums font-black">{filteredCases.length}</span> Berkas Perkara
        </div>
      </div>

      {/* Matriks SIMFONI PPA KemenPPPA */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-blue-200 shadow-sm space-y-4">
        <div className="border-b border-blue-100 pb-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-blue-950">
              Matriks Rekapitulasi Kasus Berdasarkan Bentuk Kekerasan & Kategori Korban
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Format baku Sistem Informasi Online Perlindungan Perempuan dan Anak (SIMFONI PPA)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-blue-200">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-900 text-white font-bold">
                <th className="py-3 px-3.5 text-left border-r border-blue-700/50 text-sky-100">
                  Bentuk Kekerasan
                </th>
                {kategoriList.map((kat) => (
                  <th
                    key={kat}
                    className="py-3 px-3.5 text-center border-r border-blue-700/50 font-bold text-sky-100"
                  >
                    {kat}
                  </th>
                ))}
                <th className="py-3 px-3.5 text-center bg-blue-950 font-black text-amber-300">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {DAFTAR_BENTUK_KEKERASAN.map((bentuk) => (
                <tr key={bentuk} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-2.5 px-3.5 font-bold text-slate-800 border-r border-blue-100">
                    {bentuk}
                  </td>
                  {kategoriList.map((kat) => {
                    const count = getMatrixCount(bentuk, kat);
                    return (
                      <td
                        key={kat}
                        className={`py-2.5 px-3 text-center font-mono tabular-nums border-r border-blue-100 ${
                          count > 0 ? 'font-black text-blue-950 bg-sky-50' : 'text-slate-400'
                        }`}
                      >
                        {count}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-3 text-center font-mono tabular-nums font-black text-blue-950 bg-blue-50/80">
                    {getBentukTotal(bentuk)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-blue-100 via-sky-100 to-blue-50 font-black text-blue-950 border-t-2 border-blue-300">
                <td className="py-3 px-3.5 border-r border-blue-200 uppercase tracking-wide">TOTAL KORBAN TERLAYANI</td>
                {kategoriList.map((kat) => (
                  <td
                    key={kat}
                    className="py-3 px-3 text-center font-mono tabular-nums border-r border-blue-200 font-black text-blue-950"
                  >
                    {getKategoriTotal(kat)}
                  </td>
                ))}
                <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-950 bg-amber-300 font-black text-sm">
                  {filteredCases.length}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Rekapitulasi Spasial per Kecamatan di Nagekeo */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-blue-200 shadow-sm space-y-4">
        <div className="border-b border-blue-100 pb-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-blue-950">
              Distribusi Kasus Berdasarkan Wilayah Kecamatan di Kabupaten Nagekeo
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Analisis lokus kejadian untuk pertimbangan penetapan program sosialisasi dan advokasi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {DAFTAR_KECAMATAN.map((k, idx) => {
            const count = filteredCases.filter((c) => c.kecamatanTKP === k.nama).length;
            const pct = filteredCases.length > 0 ? Math.round((count / filteredCases.length) * 100) : 0;
            const cardThemes = [
              'border-blue-200 bg-gradient-to-br from-white to-blue-50/70',
              'border-sky-200 bg-gradient-to-br from-white to-sky-50/70',
              'border-indigo-200 bg-gradient-to-br from-white to-indigo-50/70',
              'border-teal-200 bg-gradient-to-br from-white to-teal-50/70',
              'border-cyan-200 bg-gradient-to-br from-white to-cyan-50/70',
              'border-amber-200 bg-gradient-to-br from-white to-amber-50/70',
              'border-blue-200 bg-gradient-to-br from-white to-blue-50/70'
            ];
            const theme = cardThemes[idx % cardThemes.length];

            return (
              <div
                key={k.nama}
                className={`p-4 rounded-2xl border-2 ${theme} flex flex-col justify-between shadow-xs hover:shadow-md transition-all`}
              >
                <div>
                  <div className="font-extrabold text-blue-950 text-sm">Kec. {k.nama}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{k.ibukota}</div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-blue-200/60 flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Kasus:</span>
                  <span className="font-mono font-black text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200 text-xs tabular-nums">
                    {count} ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dokumen Pengesahan & Kop Surat Info with Synced Signatories */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-sky-950 text-white p-6 rounded-2xl border border-amber-400/30 shadow-md space-y-4">
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

        <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white/10 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
              Pejabat Pengesah (Kepala Bidang PPPA)
            </span>
            <div className="font-bold text-white mt-1">
              {activeKabid?.nama || 'Dra. Bernadetha M. Soa, M.Si'}
            </div>
            <div className="text-[11px] text-sky-200 font-mono mt-0.5">
              NIP. {activeKabid?.nipOrIdentitas || '19740512 200212 2 004'}
            </div>
          </div>

          <div className="p-3 bg-white/10 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block">
              Pengelola Data & Operator SIMFONI PPA
            </span>
            <div className="font-bold text-white mt-1">
              {activeAdmin?.nama || 'Yohanes Sina, S.Sos'}
            </div>
            <div className="text-[11px] text-sky-200 font-mono mt-0.5">
              NIP. {activeAdmin?.nipOrIdentitas || '19880914 201101 1 008'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
