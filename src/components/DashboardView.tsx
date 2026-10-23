import React from 'react';
import { KasusKekerasan, KecamatanNagekeo, BentukKekerasan } from '../types';
import { DAFTAR_KECAMATAN } from '../data/nagekeoData';
import sealImg from '../assets/images/nagekeo_pppa_seal_1792727445493.jpg';
import {
  AlertTriangle,
  FolderOpen,
  CheckCircle2,
  Users,
  Building2,
  PhoneCall,
  Clock,
  ArrowRight,
  Shield,
  MapPin,
  HeartHandshake,
  Activity,
  FileSpreadsheet,
  PlusCircle,
  Sparkles,
  Info
} from 'lucide-react';

interface DashboardViewProps {
  cases: KasusKekerasan[];
  isAnonymized: boolean;
  onSelectCase: (c: KasusKekerasan) => void;
  onNavigateToTab: (tab: 'dashboard' | 'register' | 'input' | 'laporan' | 'sop') => void;
}

const OFFICIAL_BANNER_SRC = '/assets/aistudio/Screenshot_2026-10-23_123646_9a98d16d.png';

// Color map for Bentuk Kekerasan to make each menu vibrant
const BENTUK_COLOR_MAP: Record<
  string,
  { bg: string; border: string; text: string; badge: string }
> = {
  'Kekerasan Fisik': {
    bg: 'bg-amber-50/80',
    border: 'border-amber-200',
    text: 'text-amber-950',
    badge: 'bg-amber-500 text-slate-950'
  },
  'Kekerasan Psikis': {
    bg: 'bg-sky-50/80',
    border: 'border-sky-200',
    text: 'text-sky-950',
    badge: 'bg-sky-600 text-white'
  },
  'Kekerasan Seksual': {
    bg: 'bg-rose-50/80',
    border: 'border-rose-200',
    text: 'text-rose-950',
    badge: 'bg-rose-600 text-white'
  },
  'Penelantaran Rumah Tangga': {
    bg: 'bg-cyan-50/80',
    border: 'border-cyan-200',
    text: 'text-cyan-950',
    badge: 'bg-cyan-600 text-white'
  },
  'Tindak Pidana Perdagangan Orang (TPPO)': {
    bg: 'bg-purple-50/80',
    border: 'border-purple-200',
    text: 'text-purple-950',
    badge: 'bg-purple-600 text-white'
  },
  'Eksploitasi Anak': {
    bg: 'bg-teal-50/80',
    border: 'border-teal-200',
    text: 'text-teal-950',
    badge: 'bg-teal-600 text-white'
  },
  'Kekerasan Berbasis Siber (KBSG)': {
    bg: 'bg-indigo-50/80',
    border: 'border-indigo-200',
    text: 'text-indigo-950',
    badge: 'bg-indigo-600 text-white'
  }
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  isAnonymized,
  onSelectCase,
  onNavigateToTab
}) => {
  // Metrics
  const totalKasus = cases.length;
  const kasusSelesai = cases.filter((c) => c.statusPenanganan === 'Kasus Selesai').length;
  const kasusAktif = totalKasus - kasusSelesai;
  const korbanAnak = cases.filter(
    (c) => c.kategoriKorban === 'Anak Perempuan' || c.kategoriKorban === 'Anak Laki-Laki' || c.usiaKorban < 18
  ).length;
  const kasusDarurat = cases.filter(
    (c) => c.tingkatUrgensi === 'Darurat' || c.tingkatUrgensi === 'Tinggi'
  ).length;

  // Spatial distribution across 7 Kecamatans of Nagekeo
  const kecamatanColors = [
    'from-blue-600 to-sky-500',
    'from-sky-500 to-cyan-400',
    'from-indigo-600 to-blue-500',
    'from-blue-500 to-teal-400',
    'from-teal-500 to-sky-400',
    'from-cyan-600 to-blue-400',
    'from-sky-600 to-indigo-500'
  ];

  const kecamatanStats: { kecamatan: KecamatanNagekeo; count: number; percentage: number }[] =
    DAFTAR_KECAMATAN.map((k) => {
      const count = cases.filter((c) => c.kecamatanTKP === k.nama).length;
      const percentage = totalKasus > 0 ? Math.round((count / totalKasus) * 100) : 0;
      return { kecamatan: k.nama, count, percentage };
    }).sort((a, b) => b.count - a.count);

  // Forms of Violence distribution
  const bentukCounts: Record<string, number> = {};
  cases.forEach((c) => {
    c.bentukKekerasan.forEach((b) => {
      bentukCounts[b] = (bentukCounts[b] || 0) + 1;
    });
  });

  const sortedBentuk = Object.entries(bentukCounts).sort((a, b) => b[1] - a[1]);

  // Urgent cases requiring follow-up
  const urgentCases = cases
    .filter((c) => c.statusPenanganan !== 'Kasus Selesai')
    .sort((a, b) => {
      const order: Record<string, number> = { Darurat: 3, Tinggi: 2, Sedang: 1, Rendah: 0 };
      return (order[b.tingkatUrgensi] || 0) - (order[a.tingkatUrgensi] || 0);
    })
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* 1. Official Civic Header Card featuring User's Blue-Gold Wave Banner */}
      <div className="rounded-3xl overflow-hidden shadow-lg border border-blue-200 bg-white">
        {/* Banner Graphic Area */}
        <div className="relative w-full bg-gradient-to-r from-sky-50 via-white to-blue-50 overflow-hidden">
          <img
            src={OFFICIAL_BANNER_SRC}
            alt="Bersama Wujudkan Layanan yang Responsif, Aman dan Ramah bagi Perempuan dan Anak"
            className="w-full h-auto max-h-56 object-cover object-center"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Institution Info & Direct Action Toolbar in Royal Blue & Golden Yellow */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-900 text-white p-6 sm:p-7 relative overflow-hidden">
          {/* Subtle wave accents */}
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-sky-400/10 to-transparent pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 h-1 w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-sky-400" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <img
                src={sealImg}
                alt="Emblem Dinas PMDP3A Kabupaten Nagekeo"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-400 shadow-md object-cover bg-white shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                  <span>Pemerintah Kabupaten Nagekeo</span>
                  <span>·</span>
                  <span className="text-white">Dinas PMDP3A</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  SIPELKA - Sistem Pencatatan & Pelaporan Kasus PPPA
                </h1>
                <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed max-w-2xl">
                  Pusat layanan terpadu pencatatan, pemantauan, dan rujukan kasus kekerasan terhadap perempuan dan anak di 7 kecamatan Kabupaten Nagekeo, Nusa Tenggara Timur.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                onClick={() => onNavigateToTab('input')}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 ring-1 ring-white/40"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>+ Catat Kasus Baru</span>
              </button>

              <button
                onClick={() => onNavigateToTab('laporan')}
                className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl border border-white/30 backdrop-blur-xs transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                <span>Cetak Laporan Resmi</span>
              </button>

              <button
                onClick={() => onNavigateToTab('sop')}
                className="px-4 py-2.5 bg-sky-700/60 hover:bg-sky-600/70 text-sky-100 text-xs font-semibold rounded-xl border border-sky-400/40 transition-colors"
              >
                Panduan SOP & Helpline
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FIVE COLORFUL VIBRANT METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Kasus: Deep Ocean Blue Gradient */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-600 text-white p-5 rounded-2xl shadow-md shadow-blue-600/15 border border-blue-500/40 hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between text-sky-100 text-xs font-bold">
            <span>Total Kasus</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-white tabular-nums tracking-tight">
            {totalKasus}
          </div>
          <div className="mt-2 text-[11px] font-medium text-sky-100/90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 inline-block" />
            <span>Tercatat di Dinas PMDP3A</span>
          </div>
        </div>

        {/* Pendampingan Aktif: Warm Gold & Amber Gradient (Matching the user's yellow wave) */}
        <div className="bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 text-slate-950 p-5 rounded-2xl shadow-md shadow-amber-500/15 border border-amber-300 hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between text-slate-900 text-xs font-black">
            <span>Pendampingan Aktif</span>
            <div className="w-8 h-8 rounded-xl bg-white/40 backdrop-blur-xs flex items-center justify-center">
              <Clock className="w-4 h-4 text-slate-950" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-950 tabular-nums tracking-tight">
            {kasusAktif}
          </div>
          <div className="mt-2 text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-800 inline-block" />
            <span>Proses Medis / Hukum / Konseling</span>
          </div>
        </div>

        {/* Kasus Selesai: Mint & Cyan Turquoise Gradient */}
        <div className="bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 text-white p-5 rounded-2xl shadow-md shadow-teal-500/15 border border-teal-400/40 hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between text-teal-100 text-xs font-bold">
            <span>Kasus Selesai</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-white tabular-nums tracking-tight">
            {kasusSelesai}
          </div>
          <div className="mt-2 text-[11px] font-medium text-teal-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 inline-block" />
            <span>Pemulihan & Terminasi Selesai</span>
          </div>
        </div>

        {/* Korban Anak: Sky Blue & Blue Indigo Gradient */}
        <div className="bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-md shadow-sky-500/15 border border-sky-400/40 hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between text-sky-100 text-xs font-bold">
            <span>Korban Anak</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-white tabular-nums tracking-tight">
            {korbanAnak}
          </div>
          <div className="mt-2 text-[11px] font-medium text-sky-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 inline-block" />
            <span>Usia di Bawah 18 Tahun</span>
          </div>
        </div>

        {/* Kasus Atensi Darurat: Coral / Ruby Red Gradient */}
        <div className="bg-gradient-to-br from-rose-600 via-red-600 to-pink-600 text-white p-5 rounded-2xl shadow-md shadow-rose-500/15 border border-rose-400/40 col-span-2 lg:col-span-1 hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between text-rose-100 text-xs font-bold">
            <span>Atensi Darurat</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-white tabular-nums tracking-tight">
            {kasusDarurat}
          </div>
          <div className="mt-2 text-[11px] font-medium text-rose-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 inline-block" />
            <span>Butuh Respon Cepat Segera</span>
          </div>
        </div>
      </div>

      {/* 3. DUA MENU UTAMA BERWARNA: SEBARAN SPASIAL & KLASIFIKASI KEKERASAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Menu Sebaran Spasial Kasus di 7 Kecamatan Nagekeo */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-blue-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6 sm:p-7 space-y-5">
            {/* Header Menu Berwarna */}
            <div className="flex items-center justify-between border-b border-blue-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-blue-950">
                    Sebaran Spasial Kasus di 7 Kecamatan Nagekeo
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Konsentrasi laporan Tempat Kejadian Perkara (TKP) di Kabupaten Nagekeo
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('register')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60 transition-colors"
              >
                <span>Buka Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List 7 Kecamatan dengan Progress Bar Berwarna */}
            <div className="space-y-4">
              {kecamatanStats.map((item, idx) => (
                <div key={item.kecamatan} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                      Kecamatan {item.kecamatan}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums font-black text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {item.count} Kasus
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono tabular-nums text-xs font-bold text-sky-700">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${kecamatanColors[idx % kecamatanColors.length]}`}
                      style={{ width: `${Math.max(item.percentage, item.count > 0 ? 10 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* District Highlights footer in Soft Blue */}
          <div className="p-4 bg-gradient-to-r from-sky-50 via-blue-50/60 to-white border-t border-blue-100 text-xs text-slate-700 flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Kawasan perkotaan <strong>Kecamatan Aesesa (Mbay)</strong> dan kecamatan padat seperti <strong>Boawae</strong> dan <strong>Mauponggo</strong> memerlukan penguatan satgas PPA tingkat desa/kelurahan oleh Dinas PMDP3A Nagekeo.
            </p>
          </div>
        </div>

        {/* Menu Klasifikasi Bentuk Kekerasan (Warna-warni SIMFONI PPA) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-blue-200/80 shadow-sm p-6 sm:p-7 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-blue-950">
                    Klasifikasi Bentuk Kekerasan
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Standar klasifikasi SIMFONI PPA KemenPPPA RI
                  </p>
                </div>
              </div>
            </div>

            {/* Colorful Cards per Violence Type */}
            <div className="space-y-2.5">
              {sortedBentuk.map(([bentuk, count]) => {
                const colors = BENTUK_COLOR_MAP[bentuk] || {
                  bg: 'bg-blue-50/80',
                  border: 'border-blue-200',
                  text: 'text-blue-950',
                  badge: 'bg-blue-600 text-white'
                };
                const pct = totalKasus > 0 ? Math.round((count / totalKasus) * 100) : 0;

                return (
                  <div
                    key={bentuk}
                    className={`p-3.5 rounded-2xl border ${colors.border} ${colors.bg} flex items-center justify-between transition-all hover:shadow-xs`}
                  >
                    <div className="space-y-0.5">
                      <p className={`text-xs font-bold ${colors.text}`}>{bentuk}</p>
                      <p className="text-[11px] text-slate-600">
                        Terindikasi pada <strong className="font-mono">{pct}%</strong> dari seluruh perkara
                      </p>
                    </div>
                    <span className={`text-sm font-mono font-black px-3 py-1 rounded-xl shadow-xs tabular-nums ${colors.badge}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Helpline Box in Official Blue & Gold Theme */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-sky-900 text-white border-2 border-amber-400/40 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-amber-300">
              <PhoneCall className="w-4 h-4 text-amber-300" />
              <span>Kontak Cepat Layanan PPPA Kabupaten Nagekeo</span>
            </div>
            <div className="text-xs text-sky-100 space-y-1">
              <div className="flex items-center justify-between">
                <span>UPTD PPA Dinas PMDP3A:</span>
                <strong className="font-mono text-white">0812-3789-9821</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Unit PPA Polres Nagekeo:</span>
                <strong className="font-mono text-white">0821-4567-8910 (Call 110)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MENU KASUS ATENSI PRIORITAS / MONITORING BERJALAN */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-blue-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-blue-950">
                Daftar Pantauan Kasus Prioritas & Pendampingan Berjalan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kasus atensi darurat & tinggi yang memerlukan monitoring intervensi rutin
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('register')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60"
          >
            Lihat Semua Berkas <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {urgentCases.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectCase(item)}
              className="p-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-sky-50/20 to-blue-50/40 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">
                    {item.nomorRegistrasi}
                  </span>
                  <span
                    className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                      item.tingkatUrgensi === 'Darurat'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : item.tingkatUrgensi === 'Tinggi'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    Urgensi: {item.tingkatUrgensi}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {isAnonymized ? item.namaSamaran : item.namaKorban}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-semibold text-blue-800">{item.kategoriKorban}</span>
                    <span>·</span>
                    <span>Kec. {item.kecamatanTKP}</span>
                    <span>·</span>
                    <span>Tgl Lapor: {item.tanggalLapor}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-100">
                  {item.ringkasanKronologi}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between text-xs">
                <span className="font-bold text-blue-900">
                  Status: {item.statusPenanganan}
                </span>
                <span className="text-sky-700 font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Buka Berkas <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
