import React from 'react';
import { KasusKekerasan } from '../types';
import sealImg from '../assets/images/nagekeo_pppa_seal_1792727445493.jpg';

interface PrintDocumentProps {
  type: 'berita_acara' | 'lembar_kasus' | 'laporan_bulanan';
  kasus?: KasusKekerasan;
  daftarKasus?: KasusKekerasan[];
  periode?: string;
  isAnonymized?: boolean;
}

export const PrintDocument: React.FC<PrintDocumentProps> = ({
  type,
  kasus,
  daftarKasus = [],
  periode = 'Tahun 2026',
  isAnonymized = false
}) => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

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
                  <td className="w-48 py-1">Nama Lengkap / Inisial</td>
                  <td className="w-4">:</td>
                  <td className="font-semibold">{isAnonymized ? kasus.namaSamaran : kasus.namaKorban}</td>
                </tr>
                <tr>
                  <td className="py-1">Jenis Kelamin / Usia</td>
                  <td>:</td>
                  <td>{kasus.jenisKelaminKorban} / {kasus.usiaKorban} Tahun</td>
                </tr>
                <tr>
                  <td className="py-1">Kategori Korban</td>
                  <td>:</td>
                  <td>{kasus.kategoriKorban}</td>
                </tr>
                <tr>
                  <td className="py-1">Status Disabilitas</td>
                  <td>:</td>
                  <td>{kasus.disabilitas ? `Ya (${kasus.jenisDisabilitas || 'Rentan'})` : 'Tidak'}</td>
                </tr>
                <tr>
                  <td className="py-1">Pekerjaan / Pendidikan</td>
                  <td>:</td>
                  <td>{kasus.pekerjaanKorban} / {kasus.pendidikanKorban}</td>
                </tr>
                <tr>
                  <td className="py-1">Alamat Domisili</td>
                  <td>:</td>
                  <td>{kasus.alamatKorban}, Kec. {kasus.kecamatanKorban}, Kab. Nagekeo</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* III. Data Terlapor */}
          <div className="mb-4">
            <h4 className="font-bold underline mb-1">III. DATA TERLAPOR / TERDUGA PELAKU</h4>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr>
                  <td className="w-48 py-1">Nama Terlapor</td>
                  <td className="w-4">:</td>
                  <td>{isAnonymized ? 'Terlapor (' + kasus.hubunganPelaku + ')' : kasus.namaPelaku}</td>
                </tr>
                <tr>
                  <td className="py-1">Hubungan dengan Korban</td>
                  <td>:</td>
                  <td>{kasus.hubunganPelaku}</td>
                </tr>
                <tr>
                  <td className="py-1">Domisili Terlapor</td>
                  <td>:</td>
                  <td>{kasus.domisiliPelaku || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* IV. Uraian Kejadian */}
          <div className="mb-4">
            <h4 className="font-bold underline mb-1">IV. PERISTIWA & BENTUK KEKERASAN</h4>
            <table className="w-full text-xs border-collapse mb-2">
              <tbody>
                <tr>
                  <td className="w-48 py-1">Tanggal & Tempat Kejadian</td>
                  <td className="w-4">:</td>
                  <td>{kasus.tanggalKejadian} di {kasus.desaKelurahanTKP}, Kec. {kasus.kecamatanTKP} ({kasus.tempatKejadian})</td>
                </tr>
                <tr>
                  <td className="py-1">Bentuk Kekerasan</td>
                  <td>:</td>
                  <td className="font-semibold">{kasus.bentukKekerasan.join(', ')}</td>
                </tr>
                <tr>
                  <td className="py-1">Tingkat Urgensi Kasus</td>
                  <td>:</td>
                  <td>{kasus.tingkatUrgensi}</td>
                </tr>
              </tbody>
            </table>
            <div className="p-3 border border-black text-xs leading-relaxed italic bg-slate-50">
              &quot;{kasus.ringkasanKronologi}&quot;
            </div>
          </div>

          {/* V. Rencana Pendampingan */}
          <div className="mb-6">
            <h4 className="font-bold underline mb-1">V. REKOMENDASI & TINDAK LANJUT LAYANAN</h4>
            <p className="text-xs mb-1">
              Layanan yang disepakati bersama korban/pelapor: <strong>{kasus.layananDibutuhkan.join(', ')}</strong>
            </p>
            <p className="text-xs">
              Petugas Pendamping Lapangan: <strong>{kasus.petugasPendamping}</strong>
            </p>
          </div>

          {/* Tanda Tangan */}
          <div className="mt-8 flex justify-between text-xs text-center font-sans">
            <div>
              <p className="mb-14">Pelapor / Korban,</p>
              <p className="font-bold underline">({isAnonymized ? kasus.namaSamaran : kasus.namaPelapor})</p>
            </div>
            <div>
              <p>Mbay, {currentDate}</p>
              <p className="mb-14">Petugas Penerima Laporan Bidang PPPA,</p>
              <p className="font-bold underline">({kasus.petugasPendamping || 'Staf Pelaksana PPPA'})</p>
              <p className="text-[10px] text-slate-600">NIP. ..............................................</p>
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
                  <td className="border border-black p-1">{item.statusPenanganan}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 flex justify-between text-xs text-center font-sans">
            <div>
              <p>Mengetahui,</p>
              <p className="mb-14">Kepala Bidang Pemberdayaan Perempuan dan Perlindungan Anak</p>
              <p className="font-bold underline">Dra. Bernadetha M. Soa, M.Si</p>
              <p className="text-[10px] text-slate-600">NIP. 19740512 200212 2 004</p>
            </div>
            <div>
              <p>Mbay, {currentDate}</p>
              <p className="mb-14">Pengelola Data SIMFONI PPA Nagekeo,</p>
              <p className="font-bold underline">Yohanes Sina, S.Sos</p>
              <p className="text-[10px] text-slate-600">NIP. 19880914 201101 1 008</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
