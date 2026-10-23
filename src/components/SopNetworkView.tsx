import React from 'react';
import { JEJARING_LAYANAN_NAGEKEO } from '../data/nagekeoData';
import {
  Shield,
  BookOpen,
  Phone,
  MapPin,
  Scale,
  Building2,
  PhoneCall,
  UserCheck,
  Stethoscope,
  Gavel,
  HeartHandshake,
  CheckCircle2,
  ExternalLink,
  Mail,
  Award
} from 'lucide-react';

export const SopNetworkView: React.FC = () => {
  const sopSteps = [
    {
      step: '01',
      title: 'Penerimaan Pengaduan & Registrasi',
      desc: 'Penerimaan aduan dari korban, keluarga, kader desa, atau aparat penegak hukum. Pencatatan identitas, verifikasi awal, dan penandatanganan persetujuan pendampingan (informed consent).',
      actor: 'Petugas UPTD PPA / Bidang PPPA Dinas PMDP3A Mbay',
      gradient: 'from-blue-500/10 via-sky-500/5 to-white',
      border: 'border-sky-300 hover:border-sky-500',
      badgeBg: 'bg-gradient-to-r from-blue-700 to-sky-600 text-white',
      icon: PhoneCall,
      iconColor: 'text-sky-600 bg-sky-100'
    },
    {
      step: '02',
      title: 'Identifikasi Kebutuhan & Asesmen Awal',
      desc: 'Penilaian derajat risiko bahaya (urgensi), trauma emosional, luka fisik, dan perlindungan darurat yang dibutuhkan korban serta anak yang menyertai.',
      actor: 'Pekerja Sosial & Konselor PPPA Nagekeo',
      gradient: 'from-indigo-500/10 via-blue-500/5 to-white',
      border: 'border-indigo-300 hover:border-indigo-500',
      badgeBg: 'bg-gradient-to-r from-indigo-700 to-blue-600 text-white',
      icon: UserCheck,
      iconColor: 'text-indigo-600 bg-indigo-100'
    },
    {
      step: '03',
      title: 'Layanan Medis & Forensik (Visum et Repertum)',
      desc: 'Rujukan pemeriksaan medis darurat ke RSUD Aeramo Mbay atau Puskesmas terdekat, perawatan cedera fisik, serta penerbitan dokumen Visum et Repertum (VeR) untuk bukti pro justitia.',
      actor: 'Dokter Forensik / IGD RSUD Aeramo',
      gradient: 'from-emerald-500/10 via-teal-500/5 to-white',
      border: 'border-emerald-300 hover:border-emerald-500',
      badgeBg: 'bg-gradient-to-r from-emerald-700 to-teal-600 text-white',
      icon: Stethoscope,
      iconColor: 'text-emerald-600 bg-emerald-100'
    },
    {
      step: '04',
      title: 'Pendampingan Hukum & Kepolisian',
      desc: 'Pendampingan pembuatan Laporan Polisi (LP) dan Berita Acara Pemeriksaan (BAP) di Unit PPA Satreskrim Polres Nagekeo, diversi anak yang berkonflik dengan hukum, dan saksi ahli.',
      actor: 'Unit PPA Satreskrim Polres Nagekeo & Advokat',
      gradient: 'from-amber-500/10 via-yellow-500/5 to-white',
      border: 'border-amber-300 hover:border-amber-500',
      badgeBg: 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white',
      icon: Gavel,
      iconColor: 'text-amber-700 bg-amber-100'
    },
    {
      step: '05',
      title: 'Konseling Psikologis & Rumah Aman (Shelter)',
      desc: 'Sesi psikoterapi trauma healing berkala bagi korban/anak, penempatan di Rumah Aman bila nyawa korban terancam atau pelaku tinggal satu atap.',
      actor: 'Psikolog Klinis Mitra & Pengelola Shelter Dinas PMDP3A',
      gradient: 'from-rose-500/10 via-pink-500/5 to-white',
      border: 'border-rose-300 hover:border-rose-500',
      badgeBg: 'bg-gradient-to-r from-rose-700 to-pink-600 text-white',
      icon: HeartHandshake,
      iconColor: 'text-rose-600 bg-rose-100'
    },
    {
      step: '06',
      title: 'Reintegrasi Sosial, Terminasi & Pemantauan',
      desc: 'Pemulihan keberfungsian sosial di lingkungan keluarga/sekolah, bantuan administrasi kependudukan (Disdukcapil), dan evaluasi berkala sebelum berkas ditutup.',
      actor: 'Bidang PPPA Dinas PMDP3A & Sakti Peksos Kemensos',
      gradient: 'from-cyan-500/10 via-sky-500/5 to-white',
      border: 'border-cyan-300 hover:border-cyan-500',
      badgeBg: 'bg-gradient-to-r from-cyan-700 to-blue-600 text-white',
      icon: CheckCircle2,
      iconColor: 'text-cyan-700 bg-cyan-100'
    }
  ];

  const dasarHukum = [
    {
      nama: 'UU RI No. 12 Tahun 2022',
      tentang: 'Tindak Pidana Kekerasan Seksual (UU TPKS)',
      badge: 'Landasan TPKS',
      badgeColor: 'bg-blue-100 text-blue-900'
    },
    {
      nama: 'UU RI No. 35 Tahun 2014 jo UU No. 23 Tahun 2002',
      tentang: 'Perlindungan Anak & Pemenuhan Hak Anak',
      badge: 'Perlindungan Anak',
      badgeColor: 'bg-sky-100 text-sky-900'
    },
    {
      nama: 'UU RI No. 23 Tahun 2004',
      tentang: 'Penghapusan Kekerasan Dalam Rumah Tangga (PKDRT)',
      badge: 'Penanganan KDRT',
      badgeColor: 'bg-amber-100 text-amber-900'
    },
    {
      nama: 'UU RI No. 21 Tahun 2007',
      tentang: 'Pemberantasan Tindak Pidana Perdagangan Orang (TPPO)',
      badge: 'Anti TPPO',
      badgeColor: 'bg-rose-100 text-rose-900'
    },
    {
      nama: 'Permen PPPA RI No. 4 Tahun 2018',
      tentang: 'Pedoman Pembentukan dan Tata Kelola Unit Pelaksana Teknis Daerah PPA',
      badge: 'Tata Kelola SPM',
      badgeColor: 'bg-indigo-100 text-indigo-900'
    }
  ];

  const getKategoriBadgeColor = (kategori: string) => {
    if (kategori.includes('Utama')) return 'bg-blue-100 text-blue-900 border-blue-200';
    if (kategori.includes('Hukum')) return 'bg-amber-100 text-amber-900 border-amber-200';
    if (kategori.includes('Medis')) return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    return 'bg-purple-100 text-purple-900 border-purple-200';
  };

  return (
    <div className="space-y-8">
      {/* 1. Colorful Official Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-900 text-white p-6 sm:p-7 rounded-3xl border border-blue-200 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-sky-400/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-sky-400" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <span>SOP & SPM Terpadu</span>
              <span>·</span>
              <span className="text-white">Dinas PMDP3A Kabupaten Nagekeo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-amber-300" />
              SOP Alur Penanganan Kasus & Jejaring Rujukan
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
              Standar Operasional Prosedur 6 Layanan Minimal penanganan kekerasan perempuan dan anak serta panduan rujukan terpadu di Kabupaten Nagekeo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:129"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-blue-950 font-bold text-xs rounded-xl shadow-md transition-all transform active:scale-95"
            >
              <Phone className="w-4 h-4 text-blue-950" />
              <span>Hotline Bebas Pulsa: 129</span>
            </a>
            <div className="px-3.5 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-xs text-sky-100 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Layanan Darurat Aktif 24 Jam</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SOP Flowchart / Step cards with rich colorful styling */}
      <div className="bg-gradient-to-br from-white via-sky-50/40 to-blue-50/50 p-6 sm:p-7 rounded-3xl border border-sky-200/80 shadow-sm space-y-6">
        <div className="border-b border-sky-200/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-800" />
              Alur Standar Pelayanan Minimal (SPM) Penanganan Kasus
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              6 Tahap penanganan terpadu mulai dari laporan masuk hingga pemulihan mandiri korban di Kabupaten Nagekeo
            </p>
          </div>
          <span className="self-start sm:self-auto text-[11px] font-bold text-blue-800 bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200">
            Sesuai Permen PPPA No. 4/2018
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sopSteps.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.step}
                className={`p-5 rounded-2xl border ${item.border} bg-gradient-to-br ${item.gradient} shadow-sm space-y-3 flex flex-col justify-between transition-all duration-200 hover:shadow-md`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg shadow-xs ${item.badgeBg}`}>
                      Tahap {item.step}
                    </span>
                    <div className={`p-2 rounded-xl ${item.iconColor}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 bg-white/60 -mx-2 -mb-2 p-2.5 rounded-xl">
                  <span className="font-bold text-blue-950 block text-[10px] uppercase tracking-wider mb-0.5">
                    Pelaksana Teknis:
                  </span>
                  <span className="font-semibold text-slate-800">{item.actor}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Direktori Jejaring Rujukan di Nagekeo with colorful styling */}
      <div className="bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40 p-6 sm:p-7 rounded-3xl border border-blue-200/80 shadow-sm space-y-6">
        <div className="border-b border-blue-200/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-800" />
              Direktori Jejaring Layanan Rujukan Terpadu Kabupaten Nagekeo
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Kontak dan lokasi instansi mitra penanganan cepat darurat di Mbay dan sekitarnya
            </p>
          </div>
          <span className="self-start sm:self-auto text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
            {JEJARING_LAYANAN_NAGEKEO.length} Lembaga Siaga
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {JEJARING_LAYANAN_NAGEKEO.map((j) => (
            <div
              key={j.nama}
              className="p-5 rounded-2xl border border-blue-100 bg-white/90 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all space-y-3 text-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getKategoriBadgeColor(j.kategori)}`}>
                    {j.kategori}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{j.telepon}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{j.nama}</h3>

                <div className="flex items-start gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">{j.alamat}</span>
                </div>

                {j.email && (
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-mono">{j.email}</span>
                  </div>
                )}
              </div>

              <div className="mt-2 text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100/80 leading-relaxed text-[11px]">
                <strong className="text-blue-950 font-bold block mb-0.5">Ruang Lingkup Penanganan:</strong>
                {j.layanan}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Dasar Hukum & Regulasi with colorful accents */}
      <div className="bg-gradient-to-br from-white via-amber-50/30 to-sky-50/40 p-6 sm:p-7 rounded-3xl border border-amber-200/80 shadow-sm space-y-5">
        <div className="border-b border-amber-200/60 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-700" />
              Landasan Hukum & Regulasi Perlindungan Perempuan dan Anak
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Peraturan perundang-undangan Republik Indonesia yang mendasari tugas pokok dan fungsi Dinas PMDP3A Kabupaten Nagekeo
            </p>
          </div>
          <span className="self-start sm:self-auto text-[11px] font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            Regulasi Nasional RI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          {dasarHukum.map((d) => (
            <div
              key={d.nama}
              className="p-4 bg-white/90 hover:bg-white rounded-2xl border border-amber-200/60 shadow-xs hover:shadow-sm transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between gap-1">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${d.badgeColor}`}>
                  {d.badge}
                </span>
                <Award className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="font-bold text-blue-950 block text-xs leading-snug">{d.nama}</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">{d.tentang}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
