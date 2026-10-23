import React from 'react';
import { JEJARING_LAYANAN_NAGEKEO } from '../data/nagekeoData';
import { Shield, BookOpen, Phone, MapPin, Scale, HeartPulse, Building2, UserCheck, AlertCircle } from 'lucide-react';

export const SopNetworkView: React.FC = () => {
  const sopSteps = [
    {
      step: '01',
      title: 'Penerimaan Pengaduan & Registrasi',
      desc: 'Penerimaan aduan dari korban, keluarga, kader desa, atau aparat penegak hukum. Pencatatan identitas, verifikasi awal, dan penandatanganan persetujuan pendampingan (informed consent).',
      actor: 'Petugas UPTD PPA / Bidang PPPA Mbay'
    },
    {
      step: '02',
      title: 'Identifikasi Kebutuhan & Asesmen Awal',
      desc: 'Penilaian derajat risiko bahaya (urgensi), trauma emosional, luka fisik, dan perlindungan darurat yang dibutuhkan korban serta anak yang menyertai.',
      actor: 'Pekerja Sosial & Konselor PPPA'
    },
    {
      step: '03',
      title: 'Layanan Medis & Forensik (Visum et Repertum)',
      desc: 'Rujukan pemeriksaan medis darurat ke RSUD Aeramo Mbay atau Puskesmas terdekat, perawatan cedera fisik, serta penerbitan dokumen Visum et Repertum (VeR) untuk bukti pro justitia.',
      actor: 'Dokter Forensik / IGD RSUD Aeramo'
    },
    {
      step: '04',
      title: 'Pendampingan Hukum & Kepolisian',
      desc: 'Pendampingan pembuatan Laporan Polisi (LP) dan Berita Acara Pemeriksaan (BAP) di Unit PPA Satreskrim Polres Nagekeo, diversi anak yang berkonflik dengan hukum, dan saksi ahli.',
      actor: 'Unit PPA Satreskrim Polres Nagekeo & Advokat'
    },
    {
      step: '05',
      title: 'Konseling Psikologis & Rumah Aman (Shelter)',
      desc: 'Sesi psikoterapi trauma healing berkala bagi korban/anak, penempatan di Rumah Aman bila nyawa korban terancam atau pelaku tinggal satu atap.',
      actor: 'Psikolog Klinis Mitra & Pengelola Shelter'
    },
    {
      step: '06',
      title: 'Reintegrasi Sosial, Terminasi & Pemantauan',
      desc: 'Pemulihan keberfungsian sosial di lingkungan keluarga/sekolah, bantuan administrasi kependudukan (Disdukcapil), dan evaluasi berkala sebelum berkas ditutup.',
      actor: 'Bidang PPPA & Sakti Peksos Kemensos'
    }
  ];

  const dasarHukum = [
    {
      nama: 'UU RI No. 12 Tahun 2022',
      tentang: 'Tindak Pidana Kekerasan Seksual (UU TPKS)'
    },
    {
      nama: 'UU RI No. 35 Tahun 2014 jo UU No. 23 Tahun 2002',
      tentang: 'Perlindungan Anak'
    },
    {
      nama: 'UU RI No. 23 Tahun 2004',
      tentang: 'Penghapusan Kekerasan Dalam Rumah Tangga (PKDRT)'
    },
    {
      nama: 'UU RI No. 21 Tahun 2007',
      tentang: 'Pemberantasan Tindak Pidana Perdagangan Orang (TPPO)'
    },
    {
      nama: 'Permen PPPA RI No. 4 Tahun 2018',
      tentang: 'Pedoman Pembentukan dan Tata Kelola Unit Pelaksana Teknis Daerah PPA'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          SOP Alur Penanganan Kasus & Direktori Jejaring Nagekeo
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Pedoman operasional standar penanganan kasus kekerasan berbasis gender dan anak serta kontak lembaga rujukan di Kabupaten Nagekeo
        </p>
      </div>

      {/* SOP Flowchart / Step cards */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-700" />
            Alur Standar Pelayanan Minimal (SPM) Penanganan Kasus
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            6 Tahap penanganan terpadu mulai dari laporan masuk hingga pemulihan mandiri korban
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sopSteps.map((item) => (
            <div
              key={item.step}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-100/70 px-2 py-0.5 rounded tabular-nums">
                    Tahap {item.step}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Pelaksana: </span>
                {item.actor}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direktori Jejaring Rujukan di Nagekeo */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-700" />
            Direktori Jejaring Layanan Rujukan Terpadu Kabupaten Nagekeo
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kontak dan lokasi instansi mitra penanganan cepat darurat di Mbay dan sekitarnya
          </p>
        </div>

        <div className="space-y-4">
          {JEJARING_LAYANAN_NAGEKEO.map((j) => (
            <div
              key={j.nama}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
                    {j.kategori}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{j.nama}</h3>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-mono font-semibold">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{j.telepon}</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{j.alamat}</span>
              </div>

              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                <strong className="text-slate-800">Ruang Lingkup Layanan:</strong> {j.layanan}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dasar Hukum */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-700" />
            Landasan Hukum & Regulasi Perlindungan Perempuan dan Anak
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Peraturan perundang-undangan Republik Indonesia yang mendasari tugas pokok dan fungsi Bidang PPPA Nagekeo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {dasarHukum.map((d) => (
            <div key={d.nama} className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
              <span className="font-bold text-indigo-950 block">{d.nama}</span>
              <span className="text-slate-600 text-xs">{d.tentang}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
