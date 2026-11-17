import React, { useState, useMemo } from 'react';
import { KasusKekerasan, KecamatanNagekeo, KategoriKorban } from '../types';
import { DAFTAR_KECAMATAN, DAFTAR_BENTUK_KEKERASAN } from '../data/nagekeoData';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Info,
  ArrowRight,
  RefreshCw,
  History
} from 'lucide-react';

interface DashboardViewProps {
  cases: KasusKekerasan[];
  isAnonymized: boolean;
  selectedYear: string;
  selectedQuarter: string;
  onSelectCase: (c: KasusKekerasan) => void;
  onNavigateToTab: (
    tab: 'dashboard' | 'register' | 'input' | 'laporan' | 'sop' | 'pegawai' | 'integrasi' | 'panduan'
  ) => void;
}

const KATEGORI_CHART_STYLES: Record<
  KategoriKorban,
  { hex: string; swatch: string; label: string }
> = {
  'Perempuan Dewasa': { hex: '#1D70F2', swatch: 'bg-[#1D70F2]', label: 'Perempuan Dewasa' },
  'Anak Perempuan': { hex: '#10B981', swatch: 'bg-[#10B981]', label: 'Anak Perempuan' },
  'Anak Laki-Laki': { hex: '#F59E0B', swatch: 'bg-[#F59E0B]', label: 'Anak Laki-Laki' },
  'Disabilitas / Rentan': { hex: '#8B5CF6', swatch: 'bg-[#8B5CF6]', label: 'Disabilitas / Rentan' }
};

const getQuarterCode = (dateStr?: string): 'TW1' | 'TW2' | 'TW3' | 'TW4' | null => {
  if (!dateStr || dateStr.length < 7) return null;
  const month = parseInt(dateStr.slice(5, 7), 10);
  if (month >= 1 && month <= 3) return 'TW1';
  if (month >= 4 && month <= 6) return 'TW2';
  if (month >= 7 && month <= 9) return 'TW3';
  if (month >= 10 && month <= 12) return 'TW4';
  return null;
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  isAnonymized,
  selectedYear,
  selectedQuarter,
  onSelectCase,
  onNavigateToTab
}) => {
  const [hoveredKategori, setHoveredKategori] = useState<KategoriKorban | null>(null);
  const [kecamatanCategoryFilter, setKecamatanCategoryFilter] = useState<string>('Semua');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  });

  // Cases filtered by Year & Quarter from the top bar
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (selectedYear !== 'Semua' && c.tanggalLapor && !c.tanggalLapor.startsWith(selectedYear)) {
        return false;
      }
      if (selectedQuarter !== 'Semua') {
        if (getQuarterCode(c.tanggalLapor) !== selectedQuarter) return false;
      }
      return true;
    });
  }, [cases, selectedYear, selectedQuarter]);

  // Cases filtered only by Year (for the 4-quarter bar chart so all 4 quarters stay comparable)
  const yearCases = useMemo(() => {
    if (selectedYear === 'Semua') return cases;
    return cases.filter((c) => c.tanggalLapor && c.tanggalLapor.startsWith(selectedYear));
  }, [cases, selectedYear]);

  // 1. Core KPI Metrics
  const totalKasus = filteredCases.length;
  const kasusSelesai = filteredCases.filter((c) => c.statusPenanganan === 'Kasus Selesai').length;
  const kasusAktif = totalKasus - kasusSelesai;
  const kasusDarurat = filteredCases.filter(
    (c) => c.tingkatUrgensi === 'Darurat' || c.tingkatUrgensi === 'Tinggi'
  ).length;
  const kasusTertangani = filteredCases.filter(
    (c) => c.statusPenanganan !== 'Pengaduan Masuk'
  ).length;

  const pctTertangani =
    totalKasus > 0 ? Math.round((kasusTertangani / totalKasus) * 1000) / 10 : 0;
  const pctSelesai =
    totalKasus > 0 ? Math.round((kasusSelesai / totalKasus) * 1000) / 10 : 0;

  // 2. Quarterly Bar Chart Data (Triwulan I - IV)
  const quarterMeta = [
    { code: 'TW1' as const, label: 'Triwulan I', range: '(Jan–Mar)' },
    { code: 'TW2' as const, label: 'Triwulan II', range: '(Apr–Jun)' },
    { code: 'TW3' as const, label: 'Triwulan III', range: '(Jul–Sep)' },
    { code: 'TW4' as const, label: 'Triwulan IV', range: '(Okt–Des)' }
  ];

  const quarterlyStats = quarterMeta.map((q) => {
    const qCases = yearCases.filter((c) => getQuarterCode(c.tanggalLapor) === q.code);
    const masuk = qCases.length;
    const tertangani = qCases.filter((c) => c.statusPenanganan !== 'Pengaduan Masuk').length;
    const pct = masuk > 0 ? Math.round((tertangani / masuk) * 100) : 0;
    return { ...q, masuk, tertangani, pct };
  });

  const maxQuarterVal = Math.max(
    ...quarterlyStats.flatMap((q) => [q.masuk, q.tertangani]),
    4
  );

  // 3. Donut Chart: Proporsi Kategori Korban
  const kategoriOrder: KategoriKorban[] = [
    'Perempuan Dewasa',
    'Anak Perempuan',
    'Anak Laki-Laki',
    'Disabilitas / Rentan'
  ];

  const kategoriStats = kategoriOrder.map((kat) => {
    const count = filteredCases.filter((c) => c.kategoriKorban === kat).length;
    const percentage = totalKasus > 0 ? Math.round((count / totalKasus) * 1000) / 10 : 0;
    return {
      kategori: kat,
      count,
      percentage,
      ...KATEGORI_CHART_STYLES[kat]
    };
  });

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let cumulativeFraction = 0;
  const donutSegments = kategoriStats.map((item) => {
    const fraction = totalKasus > 0 ? item.count / totalKasus : 0;
    const dashArray = `${fraction * circumference} ${circumference}`;
    const dashOffset = -cumulativeFraction * circumference;
    cumulativeFraction += fraction;
    return { ...item, dashArray, dashOffset };
  });

  // 4. Horizontal Grouped Chart: Sebaran Kasus Berdasarkan Kecamatan
  const kecamatanFilteredCases = useMemo(() => {
    if (kecamatanCategoryFilter === 'Semua') return filteredCases;
    if (kecamatanCategoryFilter === 'Anak') {
      return filteredCases.filter(
        (c) =>
          c.kategoriKorban === 'Anak Perempuan' ||
          c.kategoriKorban === 'Anak Laki-Laki' ||
          c.usiaKorban < 18
      );
    }
    return filteredCases.filter((c) => c.kategoriKorban === kecamatanCategoryFilter);
  }, [filteredCases, kecamatanCategoryFilter]);

  const kecamatanStats: {
    kecamatan: KecamatanNagekeo;
    total: number;
    prosesOrSelesai: number;
  }[] = DAFTAR_KECAMATAN.map((k) => {
    const list = kecamatanFilteredCases.filter((c) => c.kecamatanTKP === k.nama);
    const total = list.length;
    const prosesOrSelesai = list.filter(
      (c) => c.riwayatPenanganan && c.riwayatPenanganan.length > 0
    ).length;
    return {
      kecamatan: k.nama,
      total,
      prosesOrSelesai
    };
  });

  const maxKecamatanVal = Math.max(
    ...kecamatanStats.flatMap((k) => [k.total, k.prosesOrSelesai]),
    3
  );

  // 5. Priority / Monitoring Table Cases (top 4)
  const monitoringCases = [...filteredCases]
    .sort((a, b) => {
      const urgOrder: Record<string, number> = { Darurat: 3, Tinggi: 2, Sedang: 1, Rendah: 0 };
      const diff = (urgOrder[b.tingkatUrgensi] || 0) - (urgOrder[a.tingkatUrgensi] || 0);
      if (diff !== 0) return diff;
      return (b.tanggalLapor || '').localeCompare(a.tanggalLapor || '');
    })
    .slice(0, 4);

  // 6. Status Breakdown for Ringkasan Status
  const statusProsesPendampingan = filteredCases.filter(
    (c) => c.statusPenanganan !== 'Kasus Selesai' && c.tingkatUrgensi !== 'Darurat'
  ).length;
  const statusDaruratCount = filteredCases.filter(
    (c) => c.statusPenanganan !== 'Kasus Selesai' && c.tingkatUrgensi === 'Darurat'
  ).length;

  // 7. Riwayat Pembaruan Data Kasus (latest 4 based on tanggalLapor / riwayatPenanganan)
  const recentUpdates = useMemo(() => {
    return [...filteredCases]
      .sort((a, b) => (b.tanggalLapor || '').localeCompare(a.tanggalLapor || ''))
      .slice(0, 4)
      .map((c) => {
        const latestNote = c.riwayatPenanganan?.[0];
        return {
          kasus: c,
          tanggal: latestNote?.tanggal || c.tanggalLapor,
          aktivitas: latestNote?.tindakan || c.bentukKekerasan[0] || 'Registrasi Kasus',
          periode: getQuarterCode(c.tanggalLapor) || 'TW I',
          status: c.statusPenanganan === 'Kasus Selesai' ? 'Selesai' : c.tingkatUrgensi === 'Darurat' ? 'Darurat' : 'Aktif',
          petugas: latestNote?.petugas || c.petugasPendamping || 'Admin PPPA'
        };
      });
  }, [filteredCases]);

  // 8. Top Bentuk Kekerasan summary (compact caption inside status summary)
  const topBentuk = useMemo(() => {
    const counts = DAFTAR_BENTUK_KEKERASAN.map((b) => ({
      nama: b,
      count: filteredCases.filter((c) => c.bentukKekerasan.includes(b)).length
    }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count);
    return counts[0] || null;
  }, [filteredCases]);

  const handleRefreshTimestamp = () => {
    const now = new Date();
    setLastRefreshedAt(
      now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) +
        ', ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. ROW 1: 4 Vivid Gradient KPI Cards matching reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Royal Blue */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B73F1] via-[#1562D8] to-[#0E4AB8] text-white p-4 sm:p-5 shadow-sm">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/18 border border-white/20 flex items-center justify-center shrink-0">
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-sky-100 truncate">
                Total Kasus Terdaftar
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums mt-0.5 leading-none">
                {totalKasus} Kasus
              </div>
              <div className="text-[11px] text-sky-100/85 mt-1.5 truncate">
                {selectedYear === 'Semua' ? 'Seluruh periode register' : `Tahun Lapor ${selectedYear}`}
              </div>
            </div>
          </div>
        </div>

        {/* KPI 2: Emerald Green */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#12A96B] via-[#0B925B] to-[#077648] text-white p-4 sm:p-5 shadow-sm">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/18 border border-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-emerald-50 truncate">
                Kasus Tertangani
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums mt-0.5 leading-none">
                {kasusTertangani} Kasus
              </div>
              <div className="text-[11px] text-emerald-100 font-medium mt-1.5 truncate">
                ↑ {kasusSelesai} kasus selesai / pemulihan
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3: Amber / Orange */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F9A91D] via-[#F28C14] to-[#E16B0B] text-white p-4 sm:p-5 shadow-sm">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/12 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-amber-50 truncate">
                Dalam Pendampingan
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums mt-0.5 leading-none">
                {kasusAktif} Kasus
              </div>
              <div className="text-[11px] text-amber-50/95 font-medium mt-1.5 truncate">
                {kasusDarurat} kasus prioritas darurat / tinggi
              </div>
            </div>
          </div>
        </div>

        {/* KPI 4: Deep Navy */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F3970] via-[#0B2C59] to-[#072043] text-white p-4 sm:p-5 shadow-sm">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/8 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/12 border border-white/15 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-sky-200" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-sky-100/90 truncate">
                Persentase Penanganan
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums leading-none">
                  {pctTertangani}%
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 tabular-nums">
                  ↑ {pctSelesai}% selesai
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(pctTertangani, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ROW 2: Quarterly Column Chart (7 cols) + Donut Chart (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left: Laporan & Penanganan Kasus per Triwulan */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-5 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#0B254B]">
                Laporan & Penanganan Kasus per Triwulan
              </h2>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#2176FF]" />
                <span>Kasus Masuk</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#18B26B]" />
                <span>Tertangani</span>
              </span>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="relative pt-4 pb-1 flex-1 flex flex-col justify-end">
            <div className="relative h-52 flex items-end justify-around gap-3 sm:gap-5 pl-8 pr-2 border-b border-slate-300">
              {/* Y-axis horizontal dashed lines */}
              <div className="absolute inset-y-0 left-8 right-0 flex flex-col justify-between pointer-events-none">
                {[1, 0.75, 0.5, 0.25, 0].map((ratio, idx) => (
                  <div
                    key={idx}
                    className={`w-full relative ${
                      ratio === 0 ? '' : 'border-t border-slate-200/80'
                    }`}
                  >
                    <span className="absolute -left-8 -top-2 text-[11px] font-mono tabular-nums text-slate-500">
                      {Math.round(maxQuarterVal * ratio)}
                    </span>
                  </div>
                ))}
              </div>

              {quarterlyStats.map((q) => {
                const masukH = q.masuk > 0 ? Math.max((q.masuk / maxQuarterVal) * 100, 12) : 2;
                const tertanganiH =
                  q.tertangani > 0 ? Math.max((q.tertangani / maxQuarterVal) * 100, 12) : 2;

                const badgeTone =
                  q.masuk === 0
                    ? 'bg-slate-100 text-slate-500'
                    : q.pct >= 80
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                    : q.pct >= 50
                    ? 'bg-amber-50 text-amber-700 border border-amber-200/70'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/70';

                const isHighlighted = selectedQuarter === 'Semua' || selectedQuarter === q.code;

                return (
                  <div
                    key={q.code}
                    className={`relative z-10 flex-1 flex flex-col items-center justify-end h-full transition-opacity ${
                      isHighlighted ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    {/* Percentage Chip */}
                    <div
                      className={`mb-auto mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tabular-nums ${badgeTone}`}
                    >
                      {q.masuk > 0 ? `${q.pct}%` : '0%'}
                    </div>

                    {/* Paired Bars */}
                    <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2 h-[72%]">
                      <div className="flex flex-col items-center justify-end h-full flex-1 max-w-[36px]">
                        <span className="text-[11px] font-mono font-bold text-slate-800 tabular-nums mb-1">
                          {q.masuk}
                        </span>
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-[#1868E5] to-[#3B8BFF] transition-all duration-300"
                          style={{ height: `${masukH}%` }}
                          title={`${q.label}: ${q.masuk} kasus masuk`}
                        />
                      </div>

                      <div className="flex flex-col items-center justify-end h-full flex-1 max-w-[36px]">
                        <span className="text-[11px] font-mono font-bold text-slate-800 tabular-nums mb-1">
                          {q.tertangani}
                        </span>
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-[#109D5C] to-[#2DD484] transition-all duration-300"
                          style={{ height: `${tertanganiH}%` }}
                          title={`${q.label}: ${q.tertangani} kasus tertangani`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Quarter Labels */}
            <div className="flex items-start justify-around gap-3 sm:gap-5 pl-8 pr-2 mt-2.5">
              {quarterlyStats.map((q) => (
                <div key={q.code} className="flex-1 text-center">
                  <div className="text-xs font-bold text-slate-800">{q.label}</div>
                  <div className="text-[11px] text-slate-500">{q.range}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Proporsi Kategori Korban (Donut Chart) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#0B254B]">
              Proporsi Kategori Korban
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto py-2">
            {/* Donut SVG */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#EEF2F7"
                  strokeWidth="20"
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
                        strokeWidth={hoveredKategori === seg.kategori ? '23' : '20'}
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={seg.dashOffset}
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredKategori(seg.kategori)}
                        onMouseLeave={() => setHoveredKategori(null)}
                      />
                    ) : null
                  )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                <span className="text-2xl font-extrabold text-[#0B254B] tabular-nums leading-none">
                  {hoveredKategori
                    ? `${
                        kategoriStats.find((k) => k.kategori === hoveredKategori)?.percentage ?? 0
                      }%`
                    : `${pctTertangani}%`}
                </span>
                <span className="text-[11px] font-medium text-slate-500 mt-1 leading-tight">
                  {hoveredKategori
                    ? `${
                        kategoriStats.find((k) => k.kategori === hoveredKategori)?.count ?? 0
                      } Kasus`
                    : 'Tertangani'}
                </span>
              </div>
            </div>

            {/* Clean Legend List */}
            <div className="flex-1 w-full space-y-3">
              {kategoriStats.map((item) => (
                <div
                  key={item.kategori}
                  onMouseEnter={() => setHoveredKategori(item.kategori)}
                  onMouseLeave={() => setHoveredKategori(null)}
                  className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-default ${
                    hoveredKategori === item.kategori ? 'bg-slate-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-xs shrink-0 ${item.swatch}`} />
                    <span className="text-xs font-medium text-slate-700 leading-snug">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono tabular-nums text-[#0B254B] shrink-0">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. ROW 3: Monitoring Penanganan Kasus (6 cols) + Detail Sebaran Kecamatan (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left: Monitoring Penanganan Kasus */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#0B254B]">
                Monitoring Penanganan Kasus
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('register')}
              className="text-xs font-semibold text-[#1A73E8] hover:text-blue-800 inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 Status Highlight Tiles */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl bg-[#FFF1F2] border border-rose-100 p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="text-xl font-extrabold text-[#0B254B] tabular-nums leading-none">
                  {kasusDarurat}
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-700 mt-1.5 leading-tight">
                Atensi Darurat & Tinggi
              </div>
            </div>

            <div className="rounded-xl bg-[#FFFBEB] border border-amber-100 p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xl font-extrabold text-[#0B254B] tabular-nums leading-none">
                  {kasusAktif}
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-700 mt-1.5 leading-tight">
                Dalam Pendampingan
              </div>
            </div>

            <div className="rounded-xl bg-[#ECFDF5] border border-emerald-100 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xl font-extrabold text-[#0B254B] tabular-nums leading-none">
                  {kasusSelesai}
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-700 mt-1.5 leading-tight">
                Kasus Selesai / Pulih
              </div>
            </div>
          </div>

          {/* Compact Monitoring Table */}
          <div className="overflow-x-auto -mx-1">
            {monitoringCases.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Tidak ada data kasus untuk filter tahun/periode yang dipilih.
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2 px-2 w-8">No</th>
                    <th className="py-2 px-2">No. Reg & Korban</th>
                    <th className="py-2 px-2">Kecamatan</th>
                    <th className="py-2 px-2">Bentuk Kekerasan</th>
                    <th className="py-2 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monitoringCases.map((item, idx) => {
                    const isDone = item.statusPenanganan === 'Kasus Selesai';
                    const isUrgent = item.tingkatUrgensi === 'Darurat';

                    return (
                      <tr
                        key={item.id}
                        onClick={() => onSelectCase(item)}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-2 font-mono text-slate-500 tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="font-semibold text-slate-900 truncate max-w-[165px]">
                            {isAnonymized ? item.namaSamaran : item.namaKorban}
                          </div>
                          <div className="text-[10.5px] font-mono text-slate-500 tabular-nums">
                            {item.nomorRegistrasi}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-slate-700 whitespace-nowrap">
                          {item.kecamatanTKP}
                        </td>
                        <td className="py-2.5 px-2 text-slate-700 truncate max-w-[140px]">
                          {item.bentukKekerasan[0]}
                        </td>
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isUrgent
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {isDone ? 'Selesai' : isUrgent ? 'Darurat' : 'Proses'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Detail Sebaran Kasus Berdasarkan Kecamatan (Horizontal Grouped Bar Chart) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-5 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#0B254B]">
                Detail Sebaran per Kecamatan
              </h2>
            </div>

            <select
              value={kecamatanCategoryFilter}
              onChange={(e) => setKecamatanCategoryFilter(e.target.value)}
              aria-label="Filter Kategori Sebaran Kecamatan"
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Perempuan Dewasa">Perempuan Dewasa</option>
              <option value="Anak">Korban Anak (&lt; 18 Th)</option>
              <option value="Disabilitas / Rentan">Disabilitas / Rentan</option>
            </select>
          </div>

          <div className="flex items-center justify-center gap-5 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#2176FF]" />
              <span>Total Kasus</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#18B26B]" />
              <span>Sudah Ditindaklanjuti</span>
            </span>
          </div>

          {/* Horizontal Paired Bars */}
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {kecamatanStats.map((k) => {
              const totalW = k.total > 0 ? Math.max((k.total / maxKecamatanVal) * 100, 6) : 0;
              const tindakW =
                k.prosesOrSelesai > 0
                  ? Math.max((k.prosesOrSelesai / maxKecamatanVal) * 100, 6)
                  : 0;

              return (
                <div key={k.kecamatan} className="grid grid-cols-12 items-center gap-3">
                  <div className="col-span-4 sm:col-span-3 text-right text-xs font-medium text-slate-700 truncate">
                    {k.kecamatan}
                  </div>
                  <div className="col-span-8 sm:col-span-9 space-y-1">
                    {/* Bar 1: Total Kasus */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100/80 rounded-r-md h-3 overflow-hidden">
                        <div
                          className="h-full rounded-r-md bg-gradient-to-r from-[#1A73E8] to-[#3B8BFF] transition-all duration-300"
                          style={{ width: `${totalW}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-800 tabular-nums w-5 text-right">
                        {k.total}
                      </span>
                    </div>

                    {/* Bar 2: Ditindaklanjuti */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100/80 rounded-r-md h-3 overflow-hidden">
                        <div
                          className="h-full rounded-r-md bg-gradient-to-r from-[#109D5C] to-[#2DD484] transition-all duration-300"
                          style={{ width: `${tindakW}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-600 tabular-nums w-5 text-right">
                        {k.prosesOrSelesai}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>7 Kecamatan Kabupaten Nagekeo</span>
            <span className="font-mono tabular-nums">
              Total Terfilter: <strong className="text-slate-800">{kecamatanFilteredCases.length}</strong> kasus
            </span>
          </div>
        </div>
      </div>

      {/* 4. ROW 4: Ringkasan Status Penanganan (6 cols) + Riwayat Pembaruan Data (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left: Ringkasan Status Penanganan */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-5 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#0B254B]">
                Ringkasan Status Penanganan
              </h2>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Update Terakhir: {lastRefreshedAt}</span>
              <button
                type="button"
                onClick={handleRefreshTimestamp}
                className="p-1 text-[#1A73E8] hover:bg-blue-50 rounded-md transition-colors"
                title="Perbarui waktu sinkronisasi"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-[#ECFDF5] border border-emerald-100 p-3.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-2xl font-extrabold text-[#0B254B] tabular-nums leading-none">
                  {kasusSelesai}
                </span>
              </div>
              <div className="text-xs font-bold text-emerald-800 mt-2">Selesai</div>
              <div className="text-[11px] text-emerald-700/90 mt-0.5">Pemulihan tuntas</div>
            </div>

            <div className="rounded-xl bg-[#FFFBEB] border border-amber-100 p-3.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-2xl font-extrabold text-[#0B254B] tabular-nums leading-none">
                  {statusProsesPendampingan}
                </span>
              </div>
              <div className="text-xs font-bold text-amber-800 mt-2">Pendampingan</div>
              <div className="text-[11px] text-amber-700/90 mt-0.5">Hukum / Medis / Konseling</div>
            </div>

            <div className="rounded-xl bg-[#FFF1F2] border border-rose-100 p-3.5">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="text-2xl font-extrabold text-[#0B254B] tabular-nums leading-none">
                  {statusDaruratCount}
                </span>
              </div>
              <div className="text-xs font-bold text-rose-800 mt-2">Darurat</div>
              <div className="text-[11px] text-rose-700/90 mt-0.5">Butuh respon cepat</div>
            </div>

            <div className="rounded-xl bg-[#EFF6FF] border border-blue-100 p-3.5">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#1A73E8] shrink-0" />
                <span className="text-2xl font-extrabold text-[#0B254B] tabular-nums leading-none">
                  {totalKasus}
                </span>
              </div>
              <div className="text-xs font-bold text-[#0B254B] mt-2">Total Kasus</div>
              <div className="text-[11px] text-slate-600 mt-0.5">Register terdata</div>
            </div>
          </div>

          {topBentuk && (
            <div className="text-xs text-slate-600 pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
              <span>
                Bentuk kekerasan dominan:{' '}
                <strong className="text-[#0B254B]">{topBentuk.nama}</strong>
              </span>
              <span className="font-mono tabular-nums text-slate-500">
                {topBentuk.count} kasus tercatat
              </span>
            </div>
          )}
        </div>

        {/* Right: Riwayat Pembaruan Data */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
                <History className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#0B254B]">
                Riwayat Pembaruan Data Kasus
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('register')}
              className="text-xs font-semibold text-[#1A73E8] hover:text-blue-800 inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <span>Lihat Detail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto -mx-1">
            {recentUpdates.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Belum ada riwayat pembaruan kasus untuk periode ini.
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2 px-2 w-8">No</th>
                    <th className="py-2 px-2">Tanggal</th>
                    <th className="py-2 px-2">No. Reg & Tindakan</th>
                    <th className="py-2 px-2">Periode</th>
                    <th className="py-2 px-2 text-center">Status</th>
                    <th className="py-2 px-2">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentUpdates.map((row, idx) => (
                    <tr
                      key={row.kasus.id}
                      onClick={() => onSelectCase(row.kasus)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-2 font-mono text-slate-500 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-700 whitespace-nowrap tabular-nums">
                        {row.tanggal}
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="font-mono font-semibold text-slate-900">
                          {row.kasus.nomorRegistrasi}
                        </div>
                        <div className="text-[10.5px] text-slate-500 truncate max-w-[155px]">
                          {row.aktivitas}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-600 whitespace-nowrap">
                        {row.periode}
                      </td>
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${
                            row.status === 'Selesai'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : row.status === 'Darurat'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-700 truncate max-w-[100px]">
                        {row.petugas}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
