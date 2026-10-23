import React from 'react';
import { KasusKekerasan, KecamatanNagekeo } from '../types';
import { DAFTAR_KECAMATAN } from '../data/nagekeoData';
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
  MapPin
} from 'lucide-react';

interface DashboardViewProps {
  cases: KasusKekerasan[];
  isAnonymized: boolean;
  onSelectCase: (c: KasusKekerasan) => void;
  onNavigateToTab: (tab: 'dashboard' | 'register' | 'input' | 'laporan' | 'sop') => void;
}

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
      {/* Official Civic Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-indigo-950/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Shield className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src="/src/assets/images/nagekeo_pppa_seal_1792727445493.jpg"
              alt="Seal PPPA Kab. Nagekeo"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400/80 shadow-md object-cover bg-white shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
                <span>Pemerintah Kabupaten Nagekeo</span>
                <span>·</span>
                <span>Dinas Sosial PPPA</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                SIPELKA - Sistem Pencatatan & Pelaporan Kasus PPPA
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Pusat data terpadu kasus kekerasan terhadap perempuan dan anak di 7 kecamatan Kabupaten Nagekeo, Nusa Tenggara Timur. Terintegrasi dengan jejaring kepolisian, medis forensik, dan pemulihan korban.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateToTab('input')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              + Catat Kasus Baru
            </button>
            <button
              onClick={() => onNavigateToTab('laporan')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg border border-white/20 transition-colors"
            >
              Cetak Laporan Resmi
            </button>
          </div>
        </div>
      </div>

      {/* KPI Numerical Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Kasus</span>
            <FolderOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {totalKasus}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Tercatat di Sistem</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Pendampingan Aktif</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-800 tabular-nums">
            {kasusAktif}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Proses Hukum / Medis / Konseling</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>Kasus Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-800 tabular-nums">
            {kasusSelesai}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Selesai / Terminasi Layanan</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-indigo-700 text-xs font-medium">
            <span>Korban Anak</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-900 tabular-nums">
            {korbanAnak}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Usia di Bawah 18 Tahun</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-rose-200 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-rose-700 text-xs font-medium">
            <span>Kasus Atensi Darurat</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-800 tabular-nums">
            {kasusDarurat}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Butuh Respon Cepat Segera</p>
        </div>
      </div>

      {/* Main Grid: Spatial Distribution + Violence Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Spatial Map & Kecamatan Distribution (7 Kecamatans of Nagekeo) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-700" />
                Sebaran Spasial Kasus di 7 Kecamatan Nagekeo
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Konsentrasi laporan berdasarkan Tempat Kejadian Perkara (TKP)
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('register')}
              className="text-xs text-indigo-900 font-semibold hover:underline flex items-center gap-1"
            >
              Lihat di Register <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {kecamatanStats.map((item) => (
              <div key={item.kecamatan} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    Kecamatan {item.kecamatan}
                  </span>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-mono tabular-nums font-bold text-slate-900">
                      {item.count} Kasus
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.count >= 2
                        ? 'bg-indigo-900'
                        : item.count === 1
                        ? 'bg-indigo-600'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${Math.max(item.percentage, item.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p>
              Ibukota Kabupaten di <strong>Kecamatan Aesesa (Mbay)</strong> dan kecamatan padat penduduk seperti <strong>Boawae</strong> serta <strong>Mauponggo</strong> mencatat aktivitas laporan pengaduan tertinggi dan memerlukan penguatan posko satgas PPA tingkat desa/kelurahan.
            </p>
          </div>
        </div>

        {/* Breakdown Bentuk Kekerasan */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Klasifikasi Bentuk Kekerasan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Standar klasifikasi SIMFONI PPA Kementerian PPPA RI
            </p>
          </div>

          <div className="space-y-3">
            {sortedBentuk.map(([bentuk, count]) => {
              const pct = totalKasus > 0 ? Math.round((count / totalKasus) * 100) : 0;
              return (
                <div
                  key={bentuk}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-900">{bentuk}</p>
                    <p className="text-[11px] text-slate-500">
                      Terindikasi pada {pct}% dari total berkas
                    </p>
                  </div>
                  <span className="text-sm font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Hotline Helper for Nagekeo */}
          <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
              <PhoneCall className="w-4 h-4 text-indigo-700" />
              <span>Akses Darurat PPPA Kabupaten Nagekeo</span>
            </div>
            <p className="text-xs text-indigo-900/90 leading-relaxed">
              Unit PPA Satreskrim Polres Nagekeo: <strong>0821-4567-8910</strong> / Call Center <strong>110</strong>
              <br />
              Layanan UPTD PPA Dinsos Nagekeo: <strong>0812-3789-9821</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Urgent Cases Requiring Rapid Attention */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Daftar Pantauan Kasus Prioritas & Pendampingan Berjalan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kasus dengan tingkat urgensi tinggi yang membutuhkan intervensi berkala
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('register')}
            className="text-xs text-indigo-900 font-semibold hover:underline flex items-center gap-1"
          >
            Lihat Semua Kasus <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {urgentCases.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectCase(item)}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-pointer transition-all bg-white flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-600">
                    {item.nomorRegistrasi}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      item.tingkatUrgensi === 'Darurat'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.tingkatUrgensi === 'Tinggi'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Urgensi: {item.tingkatUrgensi}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isAnonymized ? item.namaSamaran : item.namaKorban}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{item.kategoriKorban}</span>
                    <span>·</span>
                    <span>Kec. {item.kecamatanTKP}</span>
                    <span>·</span>
                    <span>Tgl: {item.tanggalLapor}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.ringkasanKronologi}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-medium text-indigo-900">
                  Status: {item.statusPenanganan}
                </span>
                <span className="text-indigo-700 font-semibold flex items-center gap-1">
                  Buka Berkas <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
