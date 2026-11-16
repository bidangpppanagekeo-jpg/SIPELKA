import React, { useState } from 'react';
import { KasusKekerasan, KecamatanNagekeo, KategoriKorban } from '../types';
import { DAFTAR_KECAMATAN, DAFTAR_BENTUK_KEKERASAN } from '../data/nagekeoData';
import {
  AlertTriangle,
  FolderOpen,
  CheckCircle2,
  Users,
  Clock,
  ArrowRight,
  MapPin,
  FileSpreadsheet,
  PlusCircle,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react';

interface DashboardViewProps {
  cases: KasusKekerasan[];
  isAnonymized: boolean;
  onSelectCase: (c: KasusKekerasan) => void;
  onNavigateToTab: (tab: 'dashboard' | 'register' | 'input' | 'laporan' | 'sop' | 'pegawai' | 'integrasi' | 'panduan') => void;
}

const KATEGORI_COLORS: Record<KategoriKorban, { hex: string; bg: string; text: string }> = {
  'Perempuan Dewasa': { hex: '#1d4ed8', bg: 'bg-blue-600', text: 'text-blue-700' },
  'Anak Perempuan': { hex: '#0284c7', bg: 'bg-sky-600', text: 'text-sky-700' },
  'Anak Laki-Laki': { hex: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-700' },
  'Disabilitas / Rentan': { hex: '#e11d48', bg: 'bg-rose-600', text: 'text-rose-700' }
};

const BENTUK_BAR_COLORS: Record<string, string> = {
  'Kekerasan Fisik': 'bg-amber-500',
  'Kekerasan Psikis': 'bg-sky-600',
  'Kekerasan Seksual': 'bg-rose-600',
  'Penelantaran Rumah Tangga': 'bg-cyan-600',
  'Tindak Pidana Perdagangan Orang (TPPO)': 'bg-purple-600',
  'Eksploitasi Anak': 'bg-teal-600',
  'Kekerasan Berbasis Siber (KBSG)': 'bg-indigo-600'
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  isAnonymized,
  onSelectCase,
  onNavigateToTab
}) => {
  const [hoveredKecamatan, setHoveredKecamatan] = useState<string | null>(null);
  const [hoveredKategori, setHoveredKategori] = useState<KategoriKorban | null>(null);

  // 1. Core Metrics
  const totalKasus = cases.length;
  const kasusSelesai = cases.filter((c) => c.statusPenanganan === 'Kasus Selesai').length;
  const kasusAktif = totalKasus - kasusSelesai;
  const korbanAnak = cases.filter(
    (c) => c.kategoriKorban === 'Anak Perempuan' || c.kategoriKorban === 'Anak Laki-Laki' || c.usiaKorban < 18
  ).length;
  const kasusDarurat = cases.filter(
    (c) => c.tingkatUrgensi === 'Darurat' || c.tingkatUrgensi === 'Tinggi'
  ).length;

  // 2. Sebaran per Kecamatan (7 Kecamatan)
  const kecamatanStats: { kecamatan: KecamatanNagekeo; shortName: string; count: number; percentage: number }[] =
    DAFTAR_KECAMATAN.map((k) => {
      const count = cases.filter((c) => c.kecamatanTKP === k.nama).length;
      const percentage = totalKasus > 0 ? Math.round((count / totalKasus) * 100) : 0;
      const shortName = k.nama === 'Aesesa Selatan' ? 'Aesesa Sel.' : k.nama;
      return { kecamatan: k.nama, shortName, count, percentage };
    });

  const maxKecamatanCount = Math.max(...kecamatanStats.map((k) => k.count), 1);
  const topKecamatan = [...kecamatanStats].sort((a, b) => b.count - a.count)[0];

  // 3. Sebaran Kategori Korban (Donut Chart)
  const kategoriOrder: KategoriKorban[] = [
    'Perempuan Dewasa',
    'Anak Perempuan',
    'Anak Laki-Laki',
    'Disabilitas / Rentan'
  ];

  const kategoriStats = kategoriOrder.map((kat) => {
    const count = cases.filter((c) => c.kategoriKorban === kat).length;
    const percentage = totalKasus > 0 ? Math.round((count / totalKasus) * 100) : 0;
    return { kategori: kat, count, percentage, ...KATEGORI_COLORS[kat] };
  });

  // Compute SVG Donut segments
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;
  const donutSegments = kategoriStats.map((item) => {
    const fraction = totalKasus > 0 ? item.count / totalKasus : 0;
    const dashArray = `${fraction * circumference} ${circumference}`;
    const dashOffset = -cumulativePercent * circumference;
    cumulativePercent += fraction;
    return {
      ...item,
      dashArray,
      dashOffset
    };
  });

  // 4. Sebaran Bentuk Kekerasan
  const bentukStats = DAFTAR_BENTUK_KEKERASAN.map((bentuk) => {
    const count = cases.filter((c) => c.bentukKekerasan.includes(bentuk)).length;
    const percentage = totalKasus > 0 ? Math.round((count / totalKasus) * 100) : 0;
    return { bentuk, count, percentage };
  })
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count);

  const maxBentukCount = Math.max(...bentukStats.map((b) => b.count), 1);

  // 5. Sebaran Bulanan (12 bulan pada tahun berjalan / terbaru)
  const bulanLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthlyStats = bulanLabels.map((label, idx) => {
    const monthCode = String(idx + 1).padStart(2, '0');
    const count = cases.filter((c) => c.tanggalLapor?.slice(5, 7) === monthCode).length;
    return { label, monthCode, count };
  });
  const maxMonthlyCount = Math.max(...monthlyStats.map((m) => m.count), 1);

  // 6. Kasus Prioritas / Aktif (maks 5 baris)
  const urgentCases = cases
    .filter((c) => c.statusPenanganan !== 'Kasus Selesai')
    .sort((a, b) => {
      const order: Record<string, number> = { Darurat: 3, Tinggi: 2, Sedang: 1, Rendah: 0 };
      return (order[b.tingkatUrgensi] || 0) - (order[a.tingkatUrgensi] || 0);
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 1. Colorful Official Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-900 text-white p-6 sm:p-7 rounded-3xl border border-blue-200 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-sky-400/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-sky-400" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <span>Ringkasan Data Terpadu</span>
              <span>·</span>
              <span className="text-white">Dinas PMDP3A Kabupaten Nagekeo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Dashboard Ringkasan Kasus PPPA Nagekeo
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
              Rekapitulasi statistik laporan, grafik sebaran kasus di 7 kecamatan, klasifikasi kekerasan, dan pemantauan penanganan kasus aktif se-Kabupaten Nagekeo.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => onNavigateToTab('input')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 rounded-xl transition-all shadow-md hover:shadow-lg ring-1 ring-white/50 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Catat Kasus Baru</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('laporan')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-950 bg-white hover:bg-sky-50 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Rekap & Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Summary Cards (Simple, Clean & High Contrast) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs border-t-4 border-t-blue-600">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Kasus</span>
            <FolderOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
            {totalKasus}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Seluruh laporan masuk</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Sedang Ditangani</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
            {kasusAktif}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Pendampingan berjalan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs border-t-4 border-t-emerald-600">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Kasus Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
            {kasusSelesai}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Terminasi & pemulihan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs border-t-4 border-t-sky-600">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Korban Anak</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
            {korbanAnak}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Usia &lt; 18 tahun</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs border-t-4 border-t-rose-600 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Atensi Darurat</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-700 tabular-nums">
            {kasusDarurat}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Urgensi Darurat & Tinggi</div>
        </div>
      </div>

      {/* 3. GRAFIK SEBARAN KASUS: Wilayah Kecamatan & Kategori Korban */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Grafik 1: Grafik Batang Sebaran Kasus per Kecamatan */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Grafik Sebaran Kasus per Kecamatan
                </h3>
                <p className="text-[11px] text-slate-500">
                  Distribusi TKP pada 7 kecamatan di Kabupaten Nagekeo
                </p>
              </div>
            </div>
            {topKecamatan && topKecamatan.count > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                <MapPin className="w-3 h-3" />
                Tertinggi: {topKecamatan.kecamatan} ({topKecamatan.count})
              </span>
            )}
          </div>

          {/* Vertical Column Chart */}
          <div className="relative pt-6 pb-2">
            {/* Background Gridlines */}
            <div className="relative h-48 flex items-end justify-between gap-2 sm:gap-3 px-2 border-b border-slate-200">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[1, 0.5, 0].map((ratio, i) => (
                  <div key={i} className="w-full border-t border-dashed border-slate-100 relative">
                    {ratio > 0 && (
                      <span className="absolute -top-2.5 -left-1 text-[10px] font-mono text-slate-400 bg-white pr-1">
                        {Math.ceil(maxKecamatanCount * ratio)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {kecamatanStats.map((item) => {
                const heightPct = item.count > 0 ? Math.max((item.count / maxKecamatanCount) * 100, 12) : 0;
                const isHovered = hoveredKecamatan === item.kecamatan;

                return (
                  <div
                    key={item.kecamatan}
                    onMouseEnter={() => setHoveredKecamatan(item.kecamatan)}
                    onMouseLeave={() => setHoveredKecamatan(null)}
                    className="relative z-10 flex-1 flex flex-col items-center justify-end h-full group cursor-default"
                  >
                    {/* Value badge above bar */}
                    <div
                      className={`mb-1.5 text-[11px] font-mono font-extrabold tabular-nums transition-transform ${
                        item.count > 0
                          ? isHovered
                            ? 'text-blue-700 scale-110'
                            : 'text-slate-700'
                          : 'text-slate-300'
                      }`}
                    >
                      {item.count}
                    </div>

                    {/* Bar Column */}
                    <div
                      className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 relative ${
                        item.count > 0
                          ? isHovered
                            ? 'bg-gradient-to-t from-blue-800 to-sky-500 shadow-md'
                            : 'bg-gradient-to-t from-blue-700 to-sky-500/90'
                          : 'bg-slate-100 h-1'
                      }`}
                      style={item.count > 0 ? { height: `${heightPct}%` } : undefined}
                      title={`Kec. ${item.kecamatan}: ${item.count} kasus (${item.percentage}%)`}
                    >
                      {isHovered && item.count > 0 && (
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap shadow-md pointer-events-none">
                          {item.percentage}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="flex items-start justify-between gap-2 sm:gap-3 px-2 mt-2.5">
              {kecamatanStats.map((item) => (
                <div key={item.kecamatan} className="flex-1 text-center">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 leading-tight block truncate" title={item.kecamatan}>
                    {item.shortName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grafik 2: Grafik Donut Sebaran Kategori Korban */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Grafik Kategori Korban
                </h3>
                <p className="text-[11px] text-slate-500">
                  Proporsi kelompok usia & kerentanan korban
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 my-auto py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                {/* Base track circle */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="18"
                />
                {totalKasus > 0 &&
                  donutSegments.map((seg) =>
                    seg.count > 0 ? (
                      <circle
                        key={seg.kategori}
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="transparent"
                        stroke={seg.hex}
                        strokeWidth={hoveredKategori === seg.kategori ? '22' : '18'}
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={seg.dashOffset}
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredKategori(seg.kategori)}
                        onMouseLeave={() => setHoveredKategori(null)}
                      />
                    ) : null
                  )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 tabular-nums leading-none">
                  {hoveredKategori
                    ? kategoriStats.find((k) => k.kategori === hoveredKategori)?.count ?? totalKasus
                    : totalKasus}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                  {hoveredKategori ? 'Kasus' : 'Total Korban'}
                </span>
              </div>
            </div>

            {/* Clean Legend List */}
            <div className="flex-1 w-full space-y-2.5">
              {kategoriStats.map((item) => (
                <div
                  key={item.kategori}
                  onMouseEnter={() => setHoveredKategori(item.kategori)}
                  onMouseLeave={() => setHoveredKategori(null)}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-colors text-xs cursor-default ${
                    hoveredKategori === item.kategori
                      ? 'bg-slate-50 border-slate-300'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.bg}`} />
                    <span className="font-semibold text-slate-700 truncate">{item.kategori}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums">
                    <span className="font-black text-slate-900">{item.count}</span>
                    <span className="text-[11px] text-slate-500 w-9 text-right">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. REKAP BENTUK KEKERASAN & TREN LAPORAN BULANAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Grafik Batang Horizontal Bentuk Kekerasan */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Rekapitulasi Bentuk Kekerasan
              </h3>
              <p className="text-[11px] text-slate-500">
                Berdasarkan jenis kekerasan yang dialami korban
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              SIMFONI PPA
            </span>
          </div>

          {bentukStats.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada data kekerasan tercatat.</p>
          ) : (
            <div className="space-y-3">
              {bentukStats.map((item) => {
                const widthPct = Math.max((item.count / maxBentukCount) * 100, 8);
                const barColor = BENTUK_BAR_COLORS[item.bentuk] || 'bg-blue-600';
                return (
                  <div key={item.bentuk} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate pr-2">{item.bentuk}</span>
                      <span className="font-mono tabular-nums text-slate-700 shrink-0">
                        <strong className="font-black text-slate-900">{item.count}</strong>{' '}
                        <span className="text-[11px] text-slate-400">({item.percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Grafik Tren Pengaduan Bulanan */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Grafik Tren Laporan Bulanan
                </h3>
                <p className="text-[11px] text-slate-500">
                  Jumlah kasus masuk berdasarkan bulan pelaporan
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 pb-1">
            <div className="h-36 flex items-end justify-between gap-1.5 sm:gap-2 px-1 border-b border-slate-200">
              {monthlyStats.map((m) => {
                const heightPct = m.count > 0 ? Math.max((m.count / maxMonthlyCount) * 100, 15) : 0;
                return (
                  <div key={m.monthCode} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span
                      className={`text-[10px] font-mono font-bold mb-1 ${
                        m.count > 0 ? 'text-emerald-700' : 'text-slate-300'
                      }`}
                    >
                      {m.count > 0 ? m.count : ''}
                    </span>
                    <div
                      className={`w-full max-w-[24px] rounded-t-md transition-all duration-300 ${
                        m.count > 0
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                          : 'bg-slate-100 h-1'
                      }`}
                      style={m.count > 0 ? { height: `${heightPct}%` } : undefined}
                      title={`${m.label}: ${m.count} kasus`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-1 mt-2">
              {monthlyStats.map((m) => (
                <span key={m.monthCode} className="flex-1 text-center text-[10px] font-semibold text-slate-500">
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. TABEL RINGKASAN KASUS AKTIF / PRIORITAS (Mudah dibaca dalam sekali lihat) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Pantauan Kasus Aktif & Prioritas
            </h3>
            <p className="text-[11px] text-slate-500">
              Klik baris kasus untuk melihat detail penanganan dan progres terbaru
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('register')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Lihat Buku Register Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {urgentCases.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Seluruh berkas kasus telah berstatus selesai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-4">No. Registrasi</th>
                  <th className="py-2.5 px-4">Korban</th>
                  <th className="py-2.5 px-4">Kecamatan</th>
                  <th className="py-2.5 px-4">Bentuk Kekerasan</th>
                  <th className="py-2.5 px-4">Urgensi</th>
                  <th className="py-2.5 px-4">Status Penanganan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {urgentCases.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectCase(item)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {item.nomorRegistrasi}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {isAnonymized ? item.namaSamaran : item.namaKorban}
                      </div>
                      <div className="text-[11px] text-slate-500">{item.kategoriKorban}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      Kec. {item.kecamatanTKP}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                      {item.bentukKekerasan.join(', ')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          item.tingkatUrgensi === 'Darurat'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : item.tingkatUrgensi === 'Tinggi'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {item.tingkatUrgensi}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-900 whitespace-nowrap">
                      {item.statusPenanganan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
