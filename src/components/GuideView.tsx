import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  FileText,
  UserCheck,
  ShieldCheck,
  FileSpreadsheet,
  Users,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Database,
  Lock,
  Eye,
  Info,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Layers,
  HeartHandshake,
  Stethoscope,
  Gavel,
  Check
} from 'lucide-react';

interface GuideViewProps {
  onNavigateToTab: (tab: 'dashboard' | 'register' | 'input' | 'laporan' | 'sop' | 'pegawai' | 'integrasi' | 'panduan') => void;
  onOpenNewCase: () => void;
}

export const GuideView: React.FC<GuideViewProps> = ({
  onNavigateToTab,
  onOpenNewCase
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'semua' | 'input' | 'register' | 'pegawai' | 'sheet' | 'keamanan' | 'faq'
  >('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('langkah-input');

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const INPUT_STEPS = [
    {
      stepNumber: '01',
      title: 'Bagian 1: Data Penerimaan Laporan & Pelapor',
      tag: 'Administrasi Awal',
      color: 'blue',
      badgeBg: 'bg-blue-600',
      items: [
        {
          label: 'Nomor Registrasi Resmi',
          desc: 'Terisi otomatis oleh sistem dengan format standar SIMFONI: REG/PPA-NGK/TAHUN/BULAN/NOMOR (contoh: REG/PPA-NGK/2026/10/002). Jangan mengubah format nomor ini agar sinkronisasi Google Sheet berjalan tertib.'
        },
        {
          label: 'Tanggal Lapor & Tanggal Kejadian',
          desc: 'Pilih tanggal pengaduan diterima di dinas/UPTD dan perkiraan tanggal terjadinya peristiwa kekerasan.'
        },
        {
          label: 'Petugas Pendamping Utama *',
          desc: 'Pilih petugas pendamping dari daftar dropdown. Kolom ini terhubung langsung dengan master Data Pegawai berkategori "Tenaga Pendamping Bidang PPPA". Info jabatan dan kontak WhatsApp petugas otomatis muncul.'
        },
        {
          label: 'Data Lengkap Pelapor',
          desc: 'Isi nama pelapor, nomor telepon/HP aktif untuk koordinasi, serta hubungan dengan korban (Korban Langsung, Orang Tua/Wali, Saudara, Kader Desa, atau Tetangga).'
        }
      ]
    },
    {
      stepNumber: '02',
      title: 'Bagian 2: Data Identitas & Profil Korban',
      tag: 'Kerahasiaan Tinggi',
      color: 'indigo',
      badgeBg: 'bg-indigo-600',
      items: [
        {
          label: 'Nama Lengkap Korban & Nama Samaran',
          desc: 'Ketik nama lengkap korban sesuai KTP/KIA/Akta Lahir. Sistem otomatis membuat inisial nama samaran (misal: An. TN / Ny. MD) untuk melindungi privasi saat data ditampilkan di ruang publik atau dicetak dengan sensor privasi.'
        },
        {
          label: 'NIK & Usia Korban',
          desc: 'Masukkan 16 digit NIK korban dan usia dalam tahun. Sistem otomatis mengklasifikasikan kategori korban: Anak Perempuan (<18 th), Anak Laki-Laki (<18 th), atau Perempuan Dewasa (≥18 th).'
        },
        {
          label: 'Domisili & Kecamatan Asal Korban',
          desc: 'Pilih satu dari 7 Kecamatan di Kabupaten Nagekeo (Aesesa, Aesesa Selatan, Wolowae, Boawae, Mauponggo, Nangaroro, Keo Tengah) beserta alamat rincinya.'
        },
        {
          label: 'Status Disabilitas / Kelompok Rentan',
          desc: 'Centang jika korban menyandang disabilitas fisik, mental, sensorik, atau intelektual agar tim mempersiapkan akomodasi yang layak (seperti juru bahasa isyarat atau pendamping khusus).'
        }
      ]
    },
    {
      stepNumber: '03',
      title: 'Bagian 3: Data Identitas Terlapor / Pelaku',
      tag: 'Identifikasi Pelaku',
      color: 'rose',
      badgeBg: 'bg-rose-600',
      items: [
        {
          label: 'Nama Terlapor / Pelaku',
          desc: 'Isi nama terang atau panggilan pelaku. Jika pelaku belum diketahui (misal kejahatan siber atau perdagangan orang), isi dengan "Orang Tidak Dikenal / Dalam Penyelidikan".'
        },
        {
          label: 'Hubungan Pelaku dengan Korban',
          desc: 'Pilih hubungan yang paling tepat: Suami / Pasangan (KDRT), Orang Tua / Wali, Saudara, Tetangga, Teman / Pacar, Guru / Pendidik, Atasan Kerja, atau Orang Tidak Dikenal.'
        },
        {
          label: 'Usia & Pekerjaan Pelaku',
          desc: 'Informasi perkiraan usia dan profesi pelaku untuk melengkapi berkas rujukan hukum ke Unit PPA Polres Nagekeo.'
        }
      ]
    },
    {
      stepNumber: '04',
      title: 'Bagian 4: Bentuk Kekerasan, Kronologi & Asesmen',
      tag: 'Asesmen Kasus',
      color: 'amber',
      badgeBg: 'bg-amber-600',
      items: [
        {
          label: 'Pilihan Bentuk Kekerasan (Bisa Multi-Pilihan)',
          desc: 'Centang semua bentuk kekerasan yang terjadi: Kekerasan Fisik, Kekerasan Psikis, Kekerasan Seksual, Penelantaran Rumah Tangga, TPPO, Eksploitasi Anak, atau Kekerasan Berbasis Siber (KBSG).'
        },
        {
          label: 'Ringkasan Kronologi Kejadian *',
          desc: 'Tulis uraian fakta peristiwa secara runtut, objektif, dan faktual: apa yang terjadi, tempat kejadian perkara (TKP), modus pelaku, dan kondisi awal korban saat melapor.'
        },
        {
          label: 'Tingkat Urgensi Penanganan',
          desc: 'Tentukan derajat risiko: "Darurat" (nyawa terancam / luka parah / trauma berat), "Tinggi" (butuh shelter / VeR segera), "Sedang", atau "Rendah".'
        },
        {
          label: 'Kebutuhan Layanan Rujukan',
          desc: 'Pilih layanan yang dibutuhkan korban: Visum et Repertum (RSUD Aeramo), Pendampingan BAP (Unit PPA Polres), Trauma Healing Psikologis, Rumah Aman (Shelter), atau Bantuan Hukum.'
        }
      ]
    },
    {
      stepNumber: '05',
      title: 'Bagian 5: Tim Penanganan Terpadu & Sinkronisasi Petugas',
      tag: 'Sinkronisasi Pegawai',
      color: 'emerald',
      badgeBg: 'bg-emerald-600',
      items: [
        {
          label: 'Admin SIPELKA (Pencatat)',
          desc: 'Pilih admin verifikator yang mencatatkan perkara ke sistem SIPELKA.'
        },
        {
          label: 'Tenaga Pendamping Bidang PPPA',
          desc: 'Pilih pekerja sosial / konselor pendamping korban dari dinas PMDP3A.'
        },
        {
          label: 'Unit PPA Polres Nagekeo (Penyidik)',
          desc: 'Pilih penyidik pembantu dari Unit PPA Satreskrim Polres Nagekeo jika kasus dilaporkan ke ranah pidana.'
        },
        {
          label: 'Tenaga Medis Visum (RSUD Aeramo)',
          desc: 'Pilih dokter pemeriksa visum forensik dari RSUD Aeramo Mbay.'
        },
        {
          label: 'Kepala Bidang PPPA',
          desc: 'Pejabat pengesah Berita Acara dan laporan resmi Dinas PMDP3A Nagekeo.'
        }
      ]
    }
  ];

  const FAQ_ITEMS = [
    {
      q: 'Bagaimana cara mengubah (edit) data kasus yang salah ketik?',
      a: 'Buka menu "Buku Register", cari kasus yang ingin diubah pada tabel, lalu klik ikon pensil (Ubah Data Kasus) pada kolom Aksi Tindakan di sebelah kanan. Ubah data di formulir, lalu klik Simpan. Data di web dan di baris Google Sheet akan langsung diperbarui di tempat tanpa menambah baris baru.'
    },
    {
      q: 'Bagaimana cara menghapus kasus yang dibatalkan atau data ganda?',
      a: 'Pada menu "Buku Register", klik ikon tempat sampah (Hapus Kasus) pada baris kasus yang bersangkutan. Jendela konfirmasi akan menampilkan detail berkas. Klik "Ya, Hapus Data". Data akan terhapus bersih dari web dan baris terkait di Google Sheet langsung dihapus.'
    },
    {
      q: 'Mengapa identitas nama korban perlu disensor?',
      a: 'Sesuai UU Perlindungan Anak dan UU Tindak Pidana Kekerasan Seksual (TPKS), identitas korban kekerasan (khususnya anak dan perempuan) wajib dirahasiakan. Gunakan tombol "Sensor Nama" di pojok kanan atas bilah navigasi saat membuka aplikasi di depan pihak umum.'
    },
    {
      q: 'Bagaimana cara mencetak Berita Acara atau Surat Tugas Kasus?',
      a: 'Pada menu "Buku Register", klik ikon dokumen (Cetak Berita Acara) di kolom Aksi Tindakan. Sistem akan menyusun Berita Acara Resmi ber-KOP Surat Dinas PMDP3A Kabupaten Nagekeo lengkap dengan tanda tangan Kepala Bidang dan Petugas Pendamping, siap dicetak atau disimpan ke PDF.'
    },
    {
      q: 'Bagaimana cara mengekspor laporan bulanan ke Excel?',
      a: 'Masuk ke menu "Buku Register", lalu klik tombol "Ekspor Excel (CSV)". File spreadsheet berstandar UTF-8 Excel siap diunduh dan diolah untuk pelaporan instansi tingkat daerah dan pusat.'
    },
    {
      q: 'Mengapa klik kanan dan tombol F12 / inspect diblokir?',
      a: 'Aplikasi SIPELKA dilengkapi fitur Cyber Security Shield aktif untuk melindungi kerahasiaan identitas korban dari upaya peretasan, scraping masal, atau pencurian data melalui inspect element peramban.'
    },
    {
      q: 'Siapa saja yang memiliki hak akses login ke dalam aplikasi SIPELKA?',
      a: 'Aplikasi SIPELKA dilindungi dan dibatasi khusus untuk Administrator resmi Bidang PPPA Dinas PMDP3A Kabupaten Nagekeo menggunakan Username: admin (atau Email Dinas: bidangpppanagekeo@gmail.com) dan Kata Sandi: sipelka2026. Pembatasan ini diterapkan secara ketat demi menjamin keamanan dan kerahasiaan identitas korban, rekam medis visum, serta berkas hukum perkara.'
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Colorful Official Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-900 text-white p-6 sm:p-8 rounded-3xl border border-blue-200 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-sky-400/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-sky-400" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <span>Buku Panduan & Petunjuk Teknis Operasional</span>
              <span>·</span>
              <span className="text-white">Dinas PMDP3A Nagekeo</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-amber-300" />
              Panduan Penginputan & Pemakaian Aplikasi SIPELKA
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-3xl leading-relaxed">
              Panduan praktis langkah demi langkah pencatatan data pengaduan kasus kekerasan perempuan dan anak, manajemen buku register, sinkronisasi Google Sheet, pencetakan berita acara, serta protokol keamanan data.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={onOpenNewCase}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all hover:shadow-lg ring-1 ring-white/50"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Mulai Catat Kasus Sekarang</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Navigation Badges & Search Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-blue-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => setActiveCategory('semua')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeCategory === 'semua'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Panduan
            </button>
            <button
              onClick={() => setActiveCategory('input')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeCategory === 'input'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              1. Tata Cara Input Kasus
            </button>
            <button
              onClick={() => setActiveCategory('register')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeCategory === 'register'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              2. Buku Register & Aksi
            </button>
            <button
              onClick={() => setActiveCategory('pegawai')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeCategory === 'pegawai'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              3. Data Pegawai & Tim
            </button>
            <button
              onClick={() => setActiveCategory('sheet')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeCategory === 'sheet'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              4. Integrasi Google Sheet
            </button>
            <button
              onClick={() => setActiveCategory('faq')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeCategory === 'faq'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              5. Tanya Jawab (FAQ)
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik panduan..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 3. Section 1: Panduan Alur Penginputan Kasus Baru (5 Langkah) */}
      {(activeCategory === 'semua' || activeCategory === 'input') && (
        <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-sm overflow-hidden">
          <div
            onClick={() => toggleSection('langkah-input')}
            className="p-5 sm:p-6 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                1
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>Panduan Langkah Demi Langkah Input Kasus Baru (5 Bagian)</span>
                  <span className="text-[10px] font-extrabold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                    Standar SIMFONI PPA
                  </span>
                </h2>
                <p className="text-xs text-sky-200 mt-0.5">
                  Ikuti urutan 5 bagian formulir agar data kasus tercatat lengkap, valid, dan tersinkronisasi.
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sky-200">
              {expandedSection === 'langkah-input' ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </div>
          </div>

          {expandedSection === 'langkah-input' && (
            <div className="p-6 sm:p-8 space-y-8 divide-y divide-blue-100">
              {INPUT_STEPS.map((section, idx) => (
                <div key={section.stepNumber} className={idx > 0 ? 'pt-8' : ''}>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl ${section.badgeBg} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
                        {section.stepNumber}
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-blue-950">
                        {section.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                      {section.tag}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {section.items.map((item) => (
                      <div
                        key={item.label}
                        className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/40 border border-blue-100 hover:border-blue-300 transition-all space-y-1.5"
                      >
                        <div className="flex items-center gap-2 text-xs font-extrabold text-blue-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pl-6">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-sky-50/60 p-4 rounded-2xl border border-sky-200">
                <div className="flex items-center gap-3 text-xs text-blue-950">
                  <Info className="w-5 h-5 text-sky-600 shrink-0" />
                  <span>
                    Setelah seluruh kolom Bagian 1 s/d 5 terisi, klik tombol hijau <strong>"Simpan Berkas Kasus"</strong> di bagian bawah halaman.
                  </span>
                </div>
                <button
                  onClick={onOpenNewCase}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 whitespace-nowrap"
                >
                  Buka Formulir Input &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Section 2: Buku Register & Fitur Aksi Tindakan */}
      {(activeCategory === 'semua' || activeCategory === 'register') && (
        <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="border-b border-blue-100 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-black text-sm">
                2
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-blue-950">
                  Panduan Penggunaan Buku Register & Kolom Aksi Tindakan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cara mengelola daftar perkara, melakukan filter, mengubah, mencetak, dan menghapus berkas
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('register')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hidden sm:inline-flex items-center gap-1"
            >
              <span>Buka Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Action 1: Lihat Detail */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Eye className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-slate-900">1. Lihat Berkas Kasus</h4>
              <p className="text-slate-600 leading-relaxed">
                Klik ikon mata untuk membuka pop-up berkas perkara lengkap. Anda dapat menambahkan <strong>Catatan Progres Penanganan</strong> secara berkala (konseling, sidang, mediasi).
              </p>
            </div>

            {/* Action 2: Ubah Data Kasus */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-blue-950">2. Ubah Data Kasus (Edit)</h4>
              <p className="text-slate-600 leading-relaxed">
                Klik ikon pensil untuk memperbaiki identitas atau kronologi. Data yang disimpan akan <strong>langsung menimpa baris yang sama di Google Sheet</strong> tanpa menambah baris ganda.
              </p>
            </div>

            {/* Action 3: Cetak Berita Acara */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                <Printer className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-amber-950">3. Cetak Berita Acara</h4>
              <p className="text-slate-600 leading-relaxed">
                Klik ikon dokumen untuk mencetak Berita Acara Kasus dan Lembar Penanganan Resmi ber-KOP Dinas PMDP3A Nagekeo, lengkap dengan tanda tangan pejabat dan stempel.
              </p>
            </div>

            {/* Action 4: Hapus Kasus */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-rose-950">4. Hapus Kasus (Trash)</h4>
              <p className="text-slate-600 leading-relaxed">
                Klik ikon tempat sampah untuk membatalkan berkas. Sistem menampilkan konfirmasi, lalu <strong>menghapus baris kasus dari web dan Google Sheet</strong> secara bersih.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Section 3: Data Pegawai & Tim Penanganan */}
      {(activeCategory === 'semua' || activeCategory === 'pegawai') && (
        <div className="bg-white rounded-3xl border-2 border-indigo-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="border-b border-indigo-100 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-sm">
                3
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-blue-950">
                  Panduan Manajemen Data Pegawai & Tim Penanganan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pengelolaan petugas lintas instansi yang otomatis terhubung ke formulir input kasus
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('pegawai')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 hidden sm:inline-flex items-center gap-1"
            >
              <span>Buka Menu Pegawai</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 border border-indigo-200 space-y-2">
              <div className="font-extrabold text-indigo-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-700" />
                <span>5 Kategori Pegawai Resmi</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li><strong>Admin SIPELKA</strong>: Staf verifikator input sistem.</li>
                <li><strong>Kepala Bidang</strong>: Pejabat pengesah laporan.</li>
                <li><strong>Tenaga Pendamping PPPA</strong>: Konselor & Peksos.</li>
                <li><strong>Unit PPA Polres</strong>: Penyidik pembantu penegakan hukum.</li>
                <li><strong>Tenaga Medis Visum</strong>: Dokter forensik RSUD Aeramo.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50/50 via-white to-slate-50 border border-sky-200 space-y-2">
              <div className="font-extrabold text-sky-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-700" />
                <span>Sinkronisasi Otomatis</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Saat Anda menambah atau memperbarui pegawai di menu "Data Pegawai", nama petugas tersebut otomatis langsung muncul di opsi dropdown <strong>Petugas Pendamping Utama</strong> pada formulir input kasus.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 border border-emerald-200 space-y-2">
              <div className="font-extrabold text-emerald-950 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Ekspor & Rekap Petugas</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Daftar pegawai dapat diekspor ke format CSV / Excel, dan Anda dapat mengklik tombol "Lihat Kasus Dampingan" pada kartu pegawai untuk memfilter seluruh perkara yang ditangani oleh petugas tersebut.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Section 4: Integrasi Google Sheet & Webhook */}
      {(activeCategory === 'semua' || activeCategory === 'sheet') && (
        <div className="bg-white rounded-3xl border-2 border-emerald-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="border-b border-emerald-100 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                4
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-blue-950">
                  Panduan Integrasi Dua Arah Google Sheet & Webhook
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Memastikan data kasus sinkron otomatis ke spreadsheet Google Drive Dinas
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('integrasi')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hidden sm:inline-flex items-center gap-1"
            >
              <span>Menu Integrasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-mono text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                Langkah 1
              </span>
              <h4 className="font-extrabold text-slate-900">Pasang Webhook URL</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Buka tab <strong>Integrasi Sheet</strong>, masukkan URL spreadsheet Google Drive Anda dan Webhook URL dari Google Apps Script (berakhiran <code>/exec</code>).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-mono text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                Langkah 2
              </span>
              <h4 className="font-extrabold text-slate-900">Salin Skrip Code.gs Terbaru</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Salin kode skrip pada panel Google Apps Script, lalu tempel ke menu <strong>Extensions &gt; Apps Script</strong> di Google Sheet Anda untuk memastikan fitur Update & Delete tepat baris aktif.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-mono text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                Langkah 3
              </span>
              <h4 className="font-extrabold text-slate-900">Uji Sinyal & Sinkronisasi</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Gunakan tombol <strong>Uji Sinyal Edit</strong> dan <strong>Uji Sinyal Hapus</strong> untuk memastikan koneksi berjalan dua arah tanpa menambah baris ganda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. Section 5: Tanya Jawab (FAQ) */}
      {(activeCategory === 'semua' || activeCategory === 'faq') && (
        <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="border-b border-blue-100 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm">
              5
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-blue-950">
                Tanya Jawab yang Sering Ditanyakan (FAQ)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Solusi cepat untuk kendala operasional yang sering ditemui pengguna
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-100 space-y-1.5"
              >
                <div className="flex items-start gap-2.5 text-xs font-extrabold text-blue-950">
                  <HelpCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span>{item.q}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
