import React from 'react';
import { KasusKekerasan, PegawaiSIPELKA } from '../types';
import sealImg from '../assets/images/nagekeo_pppa_seal_1792727445493.jpg';

interface PrintDocumentProps {
  type: 'berita_acara' | 'lembar_kasus' | 'laporan_bulanan';
  kasus?: KasusKekerasan;
  daftarKasus?: KasusKekerasan[];
  periode?: string;
  isAnonymized?: boolean;
  pegawaiList?: PegawaiSIPELKA[];
}

export const PrintDocument: React.FC<PrintDocumentProps> = ({
  type,
  kasus,
  daftarKasus = [],
  periode = 'Tahun 2026',
  isAnonymized = false,
  pegawaiList = []
}) => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Find synced officers
  const activeKabid =
    (kasus?.kepalaBidangId ? pegawaiList.find((p) => p.id === kasus.kepalaBidangId) : undefined) ||
    pegawaiList.find((p) => p.kategori === 'Kepala Bidang' && p.status === 'Aktif') ||
    pegawaiList.find((p) => p.kategori === 'Kepala Bidang');

  const activeAdmin =
    (kasus?.adminSipelkaId ? pegawaiList.find((p) => p.id === kasus.adminSipelkaId) : undefined) ||
    pegawaiList.find((p) => p.kategori === 'Admin SIPELKA' && p.status === 'Aktif') ||
    pegawaiList.find((p) => p.kategori === 'Admin SIPELKA');

  const activePendamping =
    (kasus?.petugasPendampingId ? pegawaiList.find((p) => p.id === kasus.petugasPendampingId) : undefined) ||
    (kasus?.petugasPendamping ? pegawaiList.find((p) => p.nama === kasus.petugasPendamping) : undefined);

  return (
    <div className="print-only hidden p-8 bg-white text-black font-serif text-sm">
      {/* Kop Surat Resmi Pemkab Nagekeo */}
      <div className="border-b-4 border-double border-black pb-3 mb-6 text-center relative">
        <div className="flex items-center justify-center gap-4 mb-1">
          <img
            src={sealImg}
            alt="Lambang PPPA Nagekeo"
            className="w-20 h-20 object-contain rounded-full border border-slate-300"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-base font-bold tracking-wider uppercase font-sans">
              PEMERINTAH KABUPATEN NAGEKEO
            </h1>
            <h2 className="text-base font-bold uppercase font-sans">
              DINAS PEMBERDAYAAN MASYARAKAT DAN DESA, PEMBERDAYAAN PEREMPUAN DAN PERLINDUNGAN ANAK (DINAS PMDP3A)
            </h2>
            <h3 className="text-sm font-semibold tracking-wide uppercase font-sans text-slate-800">
              UPTD / BIDANG PEMBERDAYAAN PEREMPUAN DAN PERLINDUNGAN ANAK (PPPA)
            </h3>
            <p className="text-xs italic text-slate-600 mt-1 font-sans">
              Kompleks Perkantoran Civic Center Mbay, Jl. Soekarno-Hatta, Kec. Aesesa, Kab. Nagekeo, Nusa Tenggara Timur
            </p>
            <p className="text-xs text-slate-600 font-sans">
              Email: bidangpppanagekeo@gmail.com | Layanan Terpadu PPA Nagekeo: 0812-3789-9821
            </p>
          </div>
        </div>
      </div>

      {/* Dokumen 1: Berita Acara Penerimaan Laporan Kasus */}
      {type === 'berita_acara' && kasus && (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-base font-bold underline uppercase">
              BERITA ACARA PENERIMAAN PENGADUAN & KONSULTASI KASUS
            </h3>
            <p className="text-xs font-mono font-semibold">
              NOMOR REGISTRASI: {kasus.nomorRegistrasi}
            </p>
          </div>

          <p className="mb-4 text-justify leading-relaxed">
            Pada hari ini, tanggal <strong>{kasus.tanggalLapor}</strong>, bertempat di Kantor Dinas PMDP3A Kabupaten Nagekeo, telah diterima laporan pengaduan kasus dugaan tindak kekerasan dengan identitas sebagai berikut:
          </p>

          {/* I. Data Pelapor */}
          <div className="mb-4">
            <h4 className="font-bold underline mb-1">I. DATA PELAPOR</h4>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr>
                  <td className="w-48 py-1">Nama Lengkap Pelapor</td>
                  <td className="w-4">:</td>
                  <td>{kasus.namaPelapor}</td>
                </tr>
                <tr>
                  <td className="py-1">Hubungan dengan Korban</td>
                  <td>:</td>
                  <td>{kasus.hubunganPelaporDenganKorban}</td>
                </tr>
                <tr>
                  <td className="py-1">Nomor Kontak / HP</td>
                  <td>:</td>
                  <td>{kasus.kontakPelapor}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* II. Data Korban */}
          <div className="mb-4">
            <h4 className="font-bold underline mb-1">II. DATA KORBAN</h4>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr>
                  <td className="w-48 py-1">Nama Korban</td>
                  <td className="w-4">:</td>
                  <td>
                    {isAnonymized ? `${kasus.namaSamaran} (Privasi Terjaga)` : kasus.namaKorban}
                  </td>
                </tr>
                <tr>
                  <td className="py-1">Jenis Kelamin / Usia</td>
                  <td>:</td>
                  <td>
                    {kasus.jenisKelaminKorban} / {kasus.usiaKorban} Tahun ({kasus.kategoriKorban})
                  </td>
                </tr>
                <tr>
                  <td className="py-1">Alamat Domisili</td>
                  <td>:</td>
                  <td>
                    {kasus.alamatKorban}, Kec. {kasus.kecamatanKorban}
                  </td>
                </tr>
                <tr>
                  <td className="py-1">Penyandang Disabilitas</td>
                  <td>:</td>
                  <td>
                    {kasus.disabilitas ? `Ya (${kasus.jenisDisabilitas || 'Ada'})` : 'Tidak Ada'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* III. Data Terduga Pelaku & Peristiwa */}
          <div className="mb-4">
            <h4 className="font-bold underline mb-1">III. PERISTIWA & TERDUGA PELAKU</h4>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr>
                  <td className="w-48 py-1">Nama Terduga Pelaku</td>
                  <td className="w-4">:</td>
                  <td>
                    {isAnonymized ? `Terlapor (${kasus.hubunganPelaku})` : kasus.namaPelaku}
                  </td>
                </tr>
                <tr>
                  <td className="py-1">Hubungan dengan Korban</td>
                  <td>:</td>
                  <td>{kasus.hubunganPelaku}</td>
                </tr>
                <tr>
                  <td className="py-1">Waktu Kejadian</td>
                  <td>:</td>
                  <td>{kasus.tanggalKejadian}</td>
                </tr>
                <tr>
                  <td className="py-1">Tempat Kejadian (TKP)</td>
                  <td>:</td>
                  <td>
                    {kasus.tempatKejadian} - Desa/Kel. {kasus.desaKelurahanTKP}, Kec. {kasus.kecamatanTKP}
                  </td>
                </tr>
                <tr>
                  <td className="py-1">Bentuk Kekerasan</td>
                  <td>:</td>
                  <td>{kasus.bentukKekerasan.join(', ')}</td>
                </tr>
                <tr>
                  <td className="py-1">Tingkat Urgensi</td>
                  <td>:</td>
                  <td>{kasus.tingkatUrgensi}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* IV. Tim Penanganan Terpadu (Synced Staff) */}
          <div className="mb-4">
            <h4 className="font-bold underline mb-1">IV. TIM PENANGANAN TERPADU KASUS</h4>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr>
                  <td className="w-48 py-1">Admin SIPELKA (Pencatat)</td>
                  <td className="w-4">:</td>
                  <td>{kasus.adminSipelka || activeAdmin?.nama || 'Yohanes Sina, S.Sos'}</td>
                </tr>
                <tr>
                  <td className="py-1">Tenaga Pendamping Utama PPPA</td>
                  <td>:</td>
                  <td>{kasus.petugasPendamping || activePendamping?.nama || 'Katarina Ose Wea, S.Tr.Sos'}</td>
                </tr>
                {kasus.petugasPolres && (
                  <tr>
                    <td className="py-1">Penyidik Unit PPA Polres</td>
                    <td>:</td>
                    <td>{kasus.petugasPolres}</td>
                  </tr>
                )}
                {kasus.tenagaMedis && (
                  <tr>
                    <td className="py-1">Tenaga Medis Visum (VeR)</td>
                    <td>:</td>
                    <td>{kasus.tenagaMedis}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* V. Ringkasan Kronologi */}
          <div className="mb-6">
            <h4 className="font-bold underline mb-1">V. RINGKASAN KRONOLOGI</h4>
            <p className="text-xs text-justify leading-relaxed p-2 bg-slate-50 border border-slate-300">
              {kasus.ringkasanKronologi}
            </p>
          </div>

          {/* Penandatangan Berita Acara */}
          <div className="mt-8 flex justify-between text-xs text-center font-sans">
            <div>
              <p className="mb-14">Pelapor / Korban,</p>
              <p className="font-bold underline">({isAnonymized ? kasus.namaSamaran : kasus.namaPelapor})</p>
            </div>
            <div>
              <p>Mbay, {currentDate}</p>
              <p className="mb-14">Petugas Penerima Laporan Bidang PPPA,</p>
              <p className="font-bold underline">
                ({activePendamping?.nama || kasus.petugasPendamping || 'Katarina Ose Wea, S.Tr.Sos'})
              </p>
              <p className="text-[10px] text-slate-600">
                NIP. {activePendamping?.nipOrIdentitas || '19920822 201701 2 003'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dokumen 2: Laporan Rekapitulasi Kasus */}
      {type === 'laporan_bulanan' && (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-base font-bold underline uppercase">
              REKAPITULASI DATA KASUS KEKERASAN PEREMPUAN DAN ANAK
            </h3>
            <p className="text-xs font-semibold">
              KABUPATEN NAGEKEO - PERIODE: {periode}
            </p>
          </div>

          <table className="w-full text-xs border border-black border-collapse mb-6">
            <thead>
              <tr className="bg-slate-200">
                <th className="border border-black p-1 text-center w-8">No</th>
                <th className="border border-black p-1 text-left">No. Registrasi</th>
                <th className="border border-black p-1 text-left">Tgl Lapor</th>
                <th className="border border-black p-1 text-left">Nama Korban</th>
                <th className="border border-black p-1 text-center">Usia</th>
                <th className="border border-black p-1 text-left">Kecamatan</th>
                <th className="border border-black p-1 text-left">Bentuk Kekerasan</th>
                <th className="border border-black p-1 text-left">Hub. Pelaku</th>
                <th className="border border-black p-1 text-left">Pendamping PPPA</th>
                <th className="border border-black p-1 text-left">Status Layanan</th>
              </tr>
            </thead>
            <tbody>
              {daftarKasus.map((item, idx) => (
                <tr key={item.id}>
                  <td className="border border-black p-1 text-center">{idx + 1}</td>
                  <td className="border border-black p-1 font-mono">{item.nomorRegistrasi}</td>
                  <td className="border border-black p-1">{item.tanggalLapor}</td>
                  <td className="border border-black p-1 font-medium">
                    {isAnonymized ? item.namaSamaran : item.namaKorban}
                  </td>
                  <td className="border border-black p-1 text-center">{item.usiaKorban} Th</td>
                  <td className="border border-black p-1">{item.kecamatanTKP}</td>
                  <td className="border border-black p-1">{item.bentukKekerasan.join(', ')}</td>
                  <td className="border border-black p-1">{item.hubunganPelaku}</td>
                  <td className="border border-black p-1">{item.petugasPendamping || '-'}</td>
                  <td className="border border-black p-1">{item.statusPenanganan}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 flex justify-between text-xs text-center font-sans">
            <div>
              <p>Mengetahui,</p>
              <p className="mb-14">Kepala Bidang Pemberdayaan Perempuan dan Perlindungan Anak</p>
              <p className="font-bold underline">
                {activeKabid?.nama || 'Dra. Bernadetha M. Soa, M.Si'}
              </p>
              <p className="text-[10px] text-slate-600">
                NIP. {activeKabid?.nipOrIdentitas || '19740512 200212 2 004'}
              </p>
            </div>
            <div>
              <p>Mbay, {currentDate}</p>
              <p className="mb-14">Pengelola Data SIMFONI PPA Nagekeo,</p>
              <p className="font-bold underline">
                {activeAdmin?.nama || 'Yohanes Sina, S.Sos'}
              </p>
              <p className="text-[10px] text-slate-600">
                NIP. {activeAdmin?.nipOrIdentitas || '19880914 201101 1 008'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
