import { KasusKekerasan, KecamatanNagekeo } from '../types';

export const DAFTAR_KECAMATAN: { nama: KecamatanNagekeo; ibukota: string; desa: string[] }[] = [
  {
    nama: 'Aesesa',
    ibukota: 'Mbay (Ibukota Kabupaten)',
    desa: ['Danga', 'Mbay I', 'Mbay II', 'Aeramo', 'Lape', 'Nangadhero', 'Marapokot', 'Towak', 'Tedamude', 'Waekokak', 'Tadambaleke']
  },
  {
    nama: 'Aesesa Selatan',
    ibukota: 'Jerebuu',
    desa: ['Rendu Tutubhada', 'Renduwawo', 'Rendubutowe', 'Wajomara']
  },
  {
    nama: 'Boawae',
    ibukota: 'Boawae',
    desa: ['Ngedukelu', 'Raba', 'Raja', 'Raja Selatan', 'Aloraja', 'Kelewae', 'Mulakoli', 'Wea Au', 'Golo Ndari', 'Rowa', 'Legude']
  },
  {
    nama: 'Mauponggo',
    ibukota: 'Mauponggo',
    desa: ['Mauponggo', 'Woloede', 'Bela', 'Keli', 'Sawu', 'Selalejo', 'Ua', 'Wolotelu', 'Aewora', 'Lokalaba', 'Jawapapa']
  },
  {
    nama: 'Nangaroro',
    ibukota: 'Nangaroro',
    desa: ['Nangaroro', 'Bagesalu', 'Degulesa', 'Koliwumbu', 'Utetoto', 'Woewutu', 'Tonggo', 'Woedoana', 'Pagomogo']
  },
  {
    nama: 'Keo Tengah',
    ibukota: 'Maundai',
    desa: ['Kotowuji Barat', 'Kotowuji Timur', 'Udiworowatu', 'Wajo', 'Lewangera', 'Ladolima', 'Ladolima Timur', 'Witurombaua']
  },
  {
    nama: 'Wolowae',
    ibukota: 'Tendatoto',
    desa: ['Anakoli', 'Tendatoto', 'Totomala']
  }
];

export const DAFTAR_BENTUK_KEKERASAN = [
  'Kekerasan Fisik',
  'Kekerasan Psikis',
  'Kekerasan Seksual',
  'Penelantaran Rumah Tangga',
  'Tindak Pidana Perdagangan Orang (TPPO)',
  'Eksploitasi Anak',
  'Kekerasan Berbasis Siber (KBSG)'
] as const;

export const DAFTAR_STATUS_PENANGANAN = [
  'Pengaduan Masuk',
  'Asesmen & Identifikasi',
  'Pendampingan Medis / Visum',
  'Pendampingan Hukum & Kepolisian',
  'Konseling Psikologis',
  'Rumah Aman / Shelter',
  'Mediasi / Restoratif',
  'Reintegrasi & Pemulihan',
  'Kasus Selesai'
] as const;

export const JEJARING_LAYANAN_NAGEKEO = [
  {
    kategori: 'Instansi Utama & Perlindungan',
    nama: 'Bidang PPPA & UPTD PPA Dinas Sosial PPPA Kab. Nagekeo',
    alamat: 'Kompleks Civic Center Mbay, Jl. Soekarno-Hatta, Kec. Aesesa, Kab. Nagekeo, NTT',
    telepon: '0812-3789-9821 / (0386) 21102',
    email: 'bidangpppanagekeo@gmail.com',
    layanan: 'Penerimaan aduan, asesmen korban, pendampingan terpadu, rujukan, rumah aman sementara.'
  },
  {
    kategori: 'Penegakan Hukum & Keamanan',
    nama: 'Unit PPA Satuan Reskrim Kepolisian Resor (Polres) Nagekeo',
    alamat: 'Jl. Trans Flores, Mbay, Kec. Aesesa, Kab. Nagekeo, NTT',
    telepon: '0821-4567-8910 / Call Center 110',
    email: 'satreskrim.polresnagekeo@polri.go.id',
    layanan: 'Penerimaan Laporan Polisi (LP), penyidikan tindak pidana perempuan & anak, pengamanan darurat, diversi anak.'
  },
  {
    kategori: 'Layanan Medis & Forensik',
    nama: 'RSUD Aeramo Kabupaten Nagekeo',
    alamat: 'Jl. Aeramo - Marapokot, Kel. Aeramo, Kec. Aesesa, Kab. Nagekeo',
    telepon: '(0386) 222345 / IGD 24 Jam: 0813-5333-8822',
    email: 'rsud.aeramo@nagekeokab.go.id',
    layanan: 'Pemeriksaan medis darurat, pengobatan cedera, Visum et Repertum (VeR), rujukan psikiatri.'
  },
  {
    kategori: 'Layanan Medis Primer',
    nama: 'Puskesmas Danga & 6 Puskesmas se-Kabupaten Nagekeo',
    alamat: 'Tersebar di 7 Kecamatan (Danga, Boawae, Mauponggo, Nangaroro, Keo Tengah, Wolowae, Aesesa Sel.)',
    telepon: 'Hotline Dinkes Nagekeo: 0813-3921-1200',
    email: 'dinkes@nagekeokab.go.id',
    layanan: 'Pertolongan pertama medis di tingkat kecamatan, koordinasi rujukan ke RSUD Aeramo.'
  },
  {
    kategori: 'Pusat Layanan Nasional',
    nama: 'Layanan Sahabat Perempuan dan Anak (SAPA 129 KemenPPPA)',
    alamat: 'Kementerian Pemberdayaan Perempuan dan Perlindungan Anak RI, Jakarta',
    telepon: 'Hotline 129 (Bebas Pulsa) / WhatsApp: 08111-129-129',
    email: 'layanan@kemenpppa.go.id',
    layanan: 'Penerimaan aduan 24 jam skala nasional, koordinasi lintas daerah kasus TPPO & darurat.'
  }
];

export const INITIAL_KASUS_DATA: KasusKekerasan[] = [
  {
    id: 'KASUS-2026-001',
    nomorRegistrasi: 'REG/PPA-NGK/2026/01/003',
    tanggalLapor: '2026-01-14',
    tanggalKejadian: '2026-01-12',
    kecamatanTKP: 'Aesesa',
    desaKelurahanTKP: 'Danga',
    tempatKejadian: 'Rumah Tangga (KDRT)',
    namaPelapor: 'Yustina Wea (Kader Posyandu)',
    hubunganPelaporDenganKorban: 'Kader Desa / Tetangga',
    kontakPelapor: '0812-4678-9901',

    namaKorban: 'Maria Goreti Dhema',
    namaSamaran: 'Ny. MGD (32 th)',
    nikKorban: '5316015509930002',
    jenisKelaminKorban: 'Perempuan',
    usiaKorban: 32,
    kategoriKorban: 'Perempuan Dewasa',
    pendidikanKorban: 'SMA',
    pekerjaanKorban: 'Ibu Rumah Tangga / Petani',
    alamatKorban: 'RT 04 / RW 02 Kelurahan Danga, Kec. Aesesa',
    kecamatanKorban: 'Aesesa',
    disabilitas: false,

    namaPelaku: 'Antonius M.',
    usiaPelaku: 37,
    jenisKelaminPelaku: 'Laki-laki',
    hubunganPelaku: 'Suami / Pasangan',
    pekerjaanPelaku: 'Wiraswasta / Buruh',
    domisiliPelaku: 'Kelurahan Danga, Aesesa',

    bentukKekerasan: ['Kekerasan Fisik', 'Kekerasan Psikis'],
    ringkasanKronologi:
      'Korban mengalami pemukulan pada bagian wajah dan punggung oleh suami berulang kali setelah perselisihan nafkah keluarga. Korban sempat melarikan diri ke rumah orang tua dan dibantu oleh kader posyandu untuk melaporkan ke UPTD PPA.',
    dampakKorban: ['Memar di mata kiri dan lengan', 'Trauma psikologis ketakutan bertemu pelaku'],

    tingkatUrgensi: 'Tinggi',
    statusPenanganan: 'Pendampingan Medis / Visum',
    petugasPendamping: 'Katarina E. (Konselor Bidang PPPA)',
    layananDibutuhkan: ['Visum et Repertum di RSUD Aeramo', 'Pendampingan LP Polres Nagekeo', 'Konseling Pemulihan'],
    riwayatPenanganan: [
      {
        id: 'CAT-001',
        tanggal: '2026-01-14',
        petugas: 'Katarina E.',
        instansi: 'UPTD PPA Nagekeo',
        tindakan: 'Penerimaan Laporan & Asesmen Awal',
        hasilDanCatatan: 'Korban datang diantar kader dalam kondisi syok. Dicatat data awal dan persetujuan pendampingan.'
      },
      {
        id: 'CAT-002',
        tanggal: '2026-01-15',
        petugas: 'dr. Hendra / Tim Forensik',
        instansi: 'RSUD Aeramo',
        tindakan: 'Pemeriksaan Visum et Repertum',
        hasilDanCatatan: 'Visum selesai dilaksanakan di RSUD Aeramo, hasil tercatat luka memar benda tumpul.'
      }
    ]
  },
  {
    id: 'KASUS-2026-002',
    nomorRegistrasi: 'REG/PPA-NGK/2026/02/011',
    tanggalLapor: '2026-02-08',
    tanggalKejadian: '2026-02-05',
    kecamatanTKP: 'Boawae',
    desaKelurahanTKP: 'Raba',
    tempatKejadian: 'Lingkungan Tempat Tinggal / Desa',
    namaPelapor: 'Fransiska B. (Ibu Kandung)',
    hubunganPelaporDenganKorban: 'Orang Tua / Ibu Kandung',
    kontakPelapor: '0821-3901-4452',

    namaKorban: 'Theresia N. (Inisial An. TN)',
    namaSamaran: 'An. TN (13 th)',
    nikKorban: '5316024108120001',
    jenisKelaminKorban: 'Perempuan',
    usiaKorban: 13,
    kategoriKorban: 'Anak Perempuan',
    pendidikanKorban: 'SMP Kelas VII',
    pekerjaanKorban: 'Pelajar',
    alamatKorban: 'Dusun Wolokoli, Desa Raba, Kec. Boawae',
    kecamatanKorban: 'Boawae',
    disabilitas: false,

    namaPelaku: 'Markus T.',
    usiaPelaku: 45,
    jenisKelaminPelaku: 'Laki-laki',
    hubunganPelaku: 'Tetangga',
    pekerjaanPelaku: 'Petani',
    domisiliPelaku: 'Desa Raba, Boawae',

    bentukKekerasan: ['Kekerasan Seksual', 'Kekerasan Psikis'],
    ringkasanKronologi:
      'Korban diiming-imingi uang saku saat pulang sekolah oleh terlapor dan ditarik ke dalam pondok kebun. Pelaku melakukan perbuatan cabul dan mengancam korban agar tidak bercerita. Guru BK sekolah mencurigai perubahan perilaku korban yang menangis dan enggan masuk kelas, lalu menghubungi keluarga dan UPTD PPA.',
    dampakKorban: ['Trauma psikologis berat', 'Menolak masuk sekolah', 'Rasa malu dan ketakutan mendalam'],

    tingkatUrgensi: 'Darurat',
    statusPenanganan: 'Pendampingan Hukum & Kepolisian',
    petugasPendamping: 'Yohanes S. (Pekerja Sosial PPA) & Briptu Clara (Unit PPA Polres)',
    layananDibutuhkan: ['Visum di RSUD Aeramo', 'Pendampingan Berita Acara Pemeriksaan (BAP) Anak', 'Trauma Healing Berkelanjutan', 'Bantuan Psikolog Klinis'],
    riwayatPenanganan: [
      {
        id: 'CAT-101',
        tanggal: '2026-02-08',
        petugas: 'Yohanes S.',
        instansi: 'UPTD PPA Nagekeo',
        tindakan: 'Konseling Kedaruratan & Pendampingan Awal',
        hasilDanCatatan: 'Anak didampingi ibu kandung. Diberikan rasa aman dan penguatan mental awal.'
      },
      {
        id: 'CAT-102',
        tanggal: '2026-02-09',
        petugas: 'Tim Medis RSUD Aeramo',
        instansi: 'RSUD Aeramo Mbay',
        tindakan: 'Pemeriksaan Fisik & Visum VeR Lengkap',
        hasilDanCatatan: 'Surat visum et repertum telah diterbitkan dan diserahkan kepada penyidik PPA Polres Nagekeo.'
      },
      {
        id: 'CAT-103',
        tanggal: '2026-02-12',
        petugas: 'Aipda Dominikus & Briptu Clara',
        instansi: 'Unit PPA Polres Nagekeo',
        tindakan: 'Pemeriksaan Saksi Korban dengan Perlakuan Khusus Anak',
        hasilDanCatatan: 'Proses BAP anak selesai dengan didampingi petugas PPA. Terduga pelaku telah ditahan di Mapolres Nagekeo.'
      }
    ]
  },
  {
    id: 'KASUS-2026-003',
    nomorRegistrasi: 'REG/PPA-NGK/2026/02/018',
    tanggalLapor: '2026-02-23',
    tanggalKejadian: '2025-11-10',
    kecamatanTKP: 'Mauponggo',
    desaKelurahanTKP: 'Mauponggo',
    tempatKejadian: 'Media Daring / Siber',
    namaPelapor: 'Kornelis D. (Kepala Desa)',
    hubunganPelaporDenganKorban: 'Pemerintah Desa / Aparat',
    kontakPelapor: '0813-8899-7712',

    namaKorban: 'Elisabeth M. (Inisial EM)',
    namaSamaran: 'Sdri. EM (22 th)',
    nikKorban: '5316045903040003',
    jenisKelaminKorban: 'Perempuan',
    usiaKorban: 22,
    kategoriKorban: 'Perempuan Dewasa',
    pendidikanKorban: 'SMA',
    pekerjaanKorban: 'Pekerja Migran (Eks PMI non-prosedural)',
    alamatKorban: 'Desa Mauponggo, Kec. Mauponggo',
    kecamatanKorban: 'Mauponggo',
    disabilitas: false,

    namaPelaku: 'Oknum Calo Perekrut / Jaringan Ilegal',
    usiaPelaku: 40,
    jenisKelaminPelaku: 'Laki-laki',
    hubunganPelaku: 'Orang Tidak Dikenal',
    pekerjaanPelaku: 'Perekrut Tenaga Kerja Ilegal',
    domisiliPelaku: 'Luar Daerah / Batam',

    bentukKekerasan: ['Tindak Pidana Perdagangan Orang (TPPO)', 'Penelantaran Rumah Tangga'],
    ringkasanKronologi:
      'Korban direkrut secara non-prosedural dengan janji bekerja di restoran di Malaysia, namun ditampung secara tidak layak di penampungan ilegal dan gaji ditahan selama 6 bulan serta dokumen disita. Setelah dipulangkan oleh satgas TPPO BP3MI, korban mengalami depresi dan membutuhkan bantuan reintegrasi sosial.',
    dampakKorban: ['Depresi sedang', 'Kerugian finansial berat', 'Kehilangan dokumen kependudukan'],

    tingkatUrgensi: 'Sedang',
    statusPenanganan: 'Reintegrasi & Pemulihan',
    petugasPendamping: 'Yosefina R. (Bidang PPPA)',
    layananDibutuhkan: ['Pemulihan Psikososial', 'Bantuan Administrasi Kependudukan', 'Pelatihan Keterampilan Usaha Dinas PPPA'],
    riwayatPenanganan: [
      {
        id: 'CAT-201',
        tanggal: '2026-02-23',
        petugas: 'Yosefina R.',
        instansi: 'Dinas Sosial PPPA Nagekeo',
        tindakan: 'Penerimaan Kepulangan Korban & Registrasi Kasus TPPO',
        hasilDanCatatan: 'Koordinasi dengan Disnakertrans Nagekeo dan Dukcapil untuk pembaharuan KTP/KK korban.'
      },
      {
        id: 'CAT-202',
        tanggal: '2026-03-02',
        petugas: 'Tim Psikolog Mitra PPPA',
        instansi: 'UPTD PPA Nagekeo',
        tindakan: 'Sesi Konseling Pemulihan Psikologis 1',
        hasilDanCatatan: 'Korban menunjukkan perkembangan positif, mulai terbuka berkomunikasi dengan keluarga.'
      }
    ]
  },
  {
    id: 'KASUS-2026-004',
    nomorRegistrasi: 'REG/PPA-NGK/2026/03/024',
    tanggalLapor: '2026-03-10',
    tanggalKejadian: '2026-03-08',
    kecamatanTKP: 'Nangaroro',
    desaKelurahanTKP: 'Woewutu',
    tempatKejadian: 'Rumah Tangga (KDRT)',
    namaPelapor: 'Silvester K. (Paman Korban)',
    hubunganPelaporDenganKorban: 'Saudara / Keluarga Dekat',
    kontakPelapor: '0852-3344-9911',

    namaKorban: 'Gabriel S. (Inisial An. GS)',
    namaSamaran: 'An. GS (8 th)',
    nikKorban: '5316051206180004',
    jenisKelaminKorban: 'Laki-laki',
    usiaKorban: 8,
    kategoriKorban: 'Anak Laki-Laki',
    pendidikanKorban: 'SD Kelas II',
    pekerjaanKorban: 'Pelajar',
    alamatKorban: 'Desa Woewutu, Kec. Nangaroro',
    kecamatanKorban: 'Nangaroro',
    disabilitas: false,

    namaPelaku: 'Bonaventura S.',
    usiaPelaku: 39,
    jenisKelaminPelaku: 'Laki-laki',
    hubunganPelaku: 'Orang Tua / Wali',
    pekerjaanPelaku: 'Petani',
    domisiliPelaku: 'Desa Woewutu, Nangaroro',

    bentukKekerasan: ['Kekerasan Fisik', 'Penelantaran Rumah Tangga'],
    ringkasanKronologi:
      'Anak laki-laki usia 8 tahun sering mendapat perlakuan kasar dan dipukul dengan rotan oleh ayah kandung karena dianggap lamban bekerja di kebun, hingga tubuh korban penuh bekas luka cambukan dan anak takut pulang ke rumah.',
    dampakKorban: ['Luka lecet dan lebam di punggung dan kaki', 'Trauma emosional mendalam', 'Bolos sekolah'],

    tingkatUrgensi: 'Tinggi',
    statusPenanganan: 'Rumah Aman / Shelter',
    petugasPendamping: 'Katarina E. & Tim Sakti Peksos Nagekeo',
    layananDibutuhkan: ['Pengobatan medis di Puskesmas Nangaroro', 'Penempatan sementara di rumah keluarga aman', 'Mediasi & Konseling Pengasuhan Keluarga'],
    riwayatPenanganan: [
      {
        id: 'CAT-301',
        tanggal: '2026-03-10',
        petugas: 'Sakti Peksos & PPA',
        instansi: 'UPTD PPA Nagekeo',
        tindakan: 'Evakuasi & Penyelamatan Anak',
        hasilDanCatatan: 'Anak diamankan ke rumah paman di desa tetangga. Telah dilakukan pengobatan luka.'
      },
      {
        id: 'CAT-302',
        tanggal: '2026-03-14',
        petugas: 'Babinsa, Bhabinkamtibmas, Staf PPPA',
        instansi: 'Kecamatan Nangaroro',
        tindakan: 'Mediasi dan Surat Perjanjian Pengasuhan Tertulis',
        hasilDanCatatan: 'Orang tua menandatangani surat peringatan keras dengan komitmen penghentian kekerasan serta pengawasan berkala aparat desa.'
      }
    ]
  },
  {
    id: 'KASUS-2026-005',
    nomorRegistrasi: 'REG/PPA-NGK/2026/03/031',
    tanggalLapor: '2026-03-18',
    tanggalKejadian: '2026-03-17',
    kecamatanTKP: 'Keo Tengah',
    desaKelurahanTKP: 'Kotowuji Barat',
    tempatKejadian: 'Sekolah / Satuan Pendidikan',
    namaPelapor: 'Ibu Guru Martha (Wali Kelas)',
    hubunganPelaporDenganKorban: 'Tenaga Pendidik / Guru',
    kontakPelapor: '0812-7788-2233',

    namaKorban: 'Clara V. (Inisial An. CV)',
    namaSamaran: 'An. CV (11 th - Disabilitas Rungu)',
    nikKorban: '5316065502150001',
    jenisKelaminKorban: 'Perempuan',
    usiaKorban: 11,
    kategoriKorban: 'Disabilitas / Rentan',
    pendidikanKorban: 'SD',
    pekerjaanKorban: 'Pelajar',
    alamatKorban: 'Desa Kotowuji Barat, Kec. Keo Tengah',
    kecamatanKorban: 'Keo Tengah',
    disabilitas: true,
    jenisDisabilitas: 'Disabilitas Pendengaran (Tunarungu)',

    namaPelaku: 'Tersangka Remaja L.',
    usiaPelaku: 16,
    jenisKelaminPelaku: 'Laki-laki',
    hubunganPelaku: 'Tetangga',
    pekerjaanPelaku: 'Pelajar',
    domisiliPelaku: 'Keo Tengah',

    bentukKekerasan: ['Kekerasan Seksual', 'Eksploitasi Anak'],
    ringkasanKronologi:
      'Korban yang menyandang disabilitas rungu dieksploitasi secara seksual oleh pelaku di lorong sepi dekat sekolah. Korban bercerita melalui bahasa isyarat dan coretan gambar kepada wali kelas bahwa ada perlakuan tidak pantas pada tubuhnya.',
    dampakKorban: ['Rasa takut berlebihan', 'Isolasi diri dari teman sebaya'],

    tingkatUrgensi: 'Darurat',
    statusPenanganan: 'Pendampingan Hukum & Kepolisian',
    petugasPendamping: 'Yohanes S. & Pendamping Juru Bahasa Isyarat',
    layananDibutuhkan: ['Visum Medis di RSUD Aeramo', 'Pendamping Juru Bahasa Isyarat dalam BAP', 'Diversi Hukum Sesuai UU SPPA'],
    riwayatPenanganan: [
      {
        id: 'CAT-401',
        tanggal: '2026-03-18',
        petugas: 'Yohanes S.',
        instansi: 'UPTD PPA Nagekeo',
        tindakan: 'Respon Cepat Aduan Guru',
        hasilDanCatatan: 'Tim langsung bergerak ke Keo Tengah bersama penerjemah bahasa isyarat.'
      },
      {
        id: 'CAT-402',
        tanggal: '2026-03-19',
        petugas: 'dr. Spesialis Forensik RSUD Aeramo',
        instansi: 'RSUD Aeramo',
        tindakan: 'Pemeriksaan Visum',
        hasilDanCatatan: 'Hasil visum diserahkan ke penyidik Unit PPA Polres Nagekeo untuk proses diversi anak berhadapan dengan hukum (ABH).'
      }
    ]
  },
  {
    id: 'KASUS-2026-006',
    nomorRegistrasi: 'REG/PPA-NGK/2026/04/035',
    tanggalLapor: '2026-04-02',
    tanggalKejadian: '2026-03-29',
    kecamatanTKP: 'Wolowae',
    desaKelurahanTKP: 'Tendatoto',
    tempatKejadian: 'Rumah Tangga (KDRT)',
    namaPelapor: 'Bernadetha F. (Korban Sendiri)',
    hubunganPelaporDenganKorban: 'Korban Langsung',
    kontakPelapor: '0821-6677-1122',

    namaKorban: 'Bernadetha F. (Inisial BF)',
    namaSamaran: 'Ny. BF (28 th)',
    nikKorban: '5316074404980005',
    jenisKelaminKorban: 'Perempuan',
    usiaKorban: 28,
    kategoriKorban: 'Perempuan Dewasa',
    pendidikanKorban: 'D3',
    pekerjaanKorban: 'Honorer Desa',
    alamatKorban: 'Desa Tendatoto, Kec. Wolowae',
    kecamatanKorban: 'Wolowae',
    disabilitas: false,

    namaPelaku: 'Petrus K.',
    usiaPelaku: 31,
    jenisKelaminPelaku: 'Laki-laki',
    hubunganPelaku: 'Suami / Pasangan',
    pekerjaanPelaku: 'Wiraswasta',
    domisiliPelaku: 'Desa Tendatoto, Wolowae',

    bentukKekerasan: ['Penelantaran Rumah Tangga', 'Kekerasan Psikis'],
    ringkasanKronologi:
      'Korban bersama dua balitanya ditinggalkan oleh suami selama lebih dari 8 bulan tanpa nafkah lahir, uang belanja, maupun kabar. Korban mengalami intimidasi verbal dan teror lewat pesan WhatsApp saat meminta tanggung jawab nafkah anak.',
    dampakKorban: ['Kesulitan ekonomi pemenuhan gizi anak', 'Tekanan mental dan kecemasan'],

    tingkatUrgensi: 'Sedang',
    statusPenanganan: 'Mediasi / Restoratif',
    petugasPendamping: 'Yosefina R. (Bidang PPPA)',
    layananDibutuhkan: ['Mediasi Kekeluargaan', 'Bantuan Sosial Ketahanan Pangan Anak', 'Konseling Pasangan'],
    riwayatPenanganan: [
      {
        id: 'CAT-501',
        tanggal: '2026-04-02',
        petugas: 'Yosefina R.',
        instansi: 'Bidang PPPA Nagekeo',
        tindakan: 'Asesmen Kasus Penelantaran',
        hasilDanCatatan: 'Pemanggilan pihak keluarga besar kedua belah pihak untuk mediasi adat dan formal.'
      }
    ]
  }
];
