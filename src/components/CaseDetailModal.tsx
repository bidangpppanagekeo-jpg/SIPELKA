import React, { useState } from 'react';
import { KasusKekerasan, StatusPenanganan, CatatanPenanganan } from '../types';
import { DAFTAR_STATUS_PENANGANAN } from '../data/nagekeoData';
import {
  X,
  FileText,
  Printer,
  Edit,
  Clock,
  Shield,
  MapPin,
  User,
  Plus,
  Building,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface CaseDetailModalProps {
  kasus: KasusKekerasan;
  isAnonymized: boolean;
  onClose: () => void;
  onEdit: (c: KasusKekerasan) => void;
  onPrint: (c: KasusKekerasan) => void;
  onAddProgressNote: (
    caseId: string,
    note: Omit<CatatanPenanganan, 'id'>,
    newStatus?: StatusPenanganan
  ) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  kasus,
  isAnonymized,
  onClose,
  onEdit,
  onPrint,
  onAddProgressNote
}) => {
  const [activeTab, setActiveTab] = useState<'kronologi' | 'identitas' | 'riwayat'>('kronologi');
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);

  // Form state for adding progress note
  const [noteDate, setNoteDate] = useState(new Date().toISOString().slice(0, 10));
  const [noteOfficer, setNoteOfficer] = useState(kasus.petugasPendamping || 'Staf PPPA');
  const [noteAgency, setNoteAgency] = useState('UPTD PPA Dinas PMDP3A Nagekeo');
  const [noteAction, setNoteAction] = useState('');
  const [noteResult, setNoteResult] = useState('');
  const [noteStatus, setNoteStatus] = useState<StatusPenanganan>(kasus.statusPenanganan);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteAction.trim() || !noteResult.trim()) return;

    onAddProgressNote(
      kasus.id,
      {
        tanggal: noteDate,
        petugas: noteOfficer,
        instansi: noteAgency,
        tindakan: noteAction,
        hasilDanCatatan: noteResult
      },
      noteStatus
    );

    setNoteAction('');
    setNoteResult('');
    setShowAddNoteForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 tabular-nums">
                {kasus.nomorRegistrasi}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  kasus.tingkatUrgensi === 'Darurat'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : kasus.tingkatUrgensi === 'Tinggi'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}
              >
                Urgensi: {kasus.tingkatUrgensi}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {isAnonymized ? kasus.namaSamaran : kasus.namaKorban}
            </h2>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>{kasus.kategoriKorban}</span>
              <span>·</span>
              <span>TKP: Kec. {kasus.kecamatanTKP}, {kasus.desaKelurahanTKP}</span>
              <span>·</span>
              <span>Tgl Lapor: {kasus.tanggalLapor}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(kasus)}
              className="p-2 text-slate-600 hover:text-indigo-900 hover:bg-white rounded-lg border border-slate-200 transition-colors"
              title="Cetak Berita Acara & Lembar Kasus"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(kasus)}
              className="p-2 text-slate-600 hover:text-indigo-900 hover:bg-white rounded-lg border border-slate-200 transition-colors"
              title="Ubah Berkas"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-4 px-6 border-b border-slate-200 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('kronologi')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'kronologi'
                ? 'border-indigo-900 text-indigo-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Kronologi & Layanan
          </button>
          <button
            onClick={() => setActiveTab('identitas')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'identitas'
                ? 'border-indigo-900 text-indigo-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Data Lengkap Para Pihak
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'riwayat'
                ? 'border-indigo-900 text-indigo-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Riwayat Pendampingan</span>
            <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px]">
              {kasus.riwayatPenanganan?.length || 0}
            </span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: Kronologi & Layanan */}
          {activeTab === 'kronologi' && (
            <div className="space-y-5">
              {/* Status banner */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Status Penanganan Saat Ini
                  </span>
                  <div className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{kasus.statusPenanganan}</span>
                  </div>
                </div>
                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                  <span className="text-[11px] text-slate-500 block">Petugas Penanggung Jawab:</span>
                  <span className="font-semibold text-slate-800">{kasus.petugasPendamping}</span>
                </div>
              </div>

              {/* Bentuk Kekerasan */}
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Bentuk Kekerasan Teridentifikasi:</h3>
                <div className="flex flex-wrap gap-2">
                  {kasus.bentukKekerasan.map((b) => (
                    <span
                      key={b}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-950 rounded-lg border border-indigo-200 font-semibold text-xs"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Kronologi */}
              <div>
                <h3 className="font-bold text-slate-900 mb-1.5">Ringkasan Kronologi Perkara:</h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-800 leading-relaxed text-xs">
                  {kasus.ringkasanKronologi}
                </div>
              </div>

              {/* Layanan & Rekomendasi Rujukan */}
              <div>
                <h3 className="font-bold text-slate-900 mb-2">
                  Layanan Terpadu & Rujukan yang Dibutuhkan:
                </h3>
                <ul className="space-y-1.5">
                  {kasus.layananDibutuhkan.map((l) => (
                    <li
                      key={l}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-700"
                    >
                      <Shield className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keterangan Tambahan */}
              {kasus.keteranganTambahan && (
                <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-amber-900">
                  <span className="font-semibold block mb-0.5">Catatan Khusus Asesmen:</span>
                  <span>{kasus.keteranganTambahan}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Identitas Lengkap Para Pihak */}
          {activeTab === 'identitas' && (
            <div className="space-y-6">
              {/* Data Pelapor */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wide">
                  <User className="w-4 h-4 text-slate-600" />
                  Data Pihak Pelapor
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-500">Nama Pelapor:</span>
                    <p className="font-semibold text-slate-800">{kasus.namaPelapor}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Hubungan dengan Korban:</span>
                    <p className="font-semibold text-slate-800">{kasus.hubunganPelaporDenganKorban}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Nomor Telepon:</span>
                    <p className="font-mono font-medium text-slate-800">{kasus.kontakPelapor || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Tanggal Pengaduan:</span>
                    <p className="font-medium text-slate-800">{kasus.tanggalLapor}</p>
                  </div>
                </div>
              </div>

              {/* Data Korban */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wide">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Data Korban
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-500">Nama Lengkap / Resmi:</span>
                    <p className="font-semibold text-slate-900">
                      {isAnonymized ? kasus.namaSamaran : kasus.namaKorban}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">NIK:</span>
                    <p className="font-mono text-slate-800">
                      {isAnonymized ? '5316************' : kasus.nikKorban || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Jenis Kelamin / Usia:</span>
                    <p className="font-semibold text-slate-800">
                      {kasus.jenisKelaminKorban} ({kasus.usiaKorban} Tahun)
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Kategori:</span>
                    <p className="font-medium text-slate-800">{kasus.kategoriKorban}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Disabilitas:</span>
                    <p className="font-medium text-slate-800">
                      {kasus.disabilitas ? `Ya (${kasus.jenisDisabilitas})` : 'Tidak'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Pendidikan / Pekerjaan:</span>
                    <p className="font-medium text-slate-800">
                      {kasus.pendidikanKorban} / {kasus.pekerjaanKorban}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Alamat Domisili:</span>
                    <p className="font-medium text-slate-800">
                      {kasus.alamatKorban || '-'}, Kec. {kasus.kecamatanKorban}, Kab. Nagekeo
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Terlapor / Pelaku */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Data Terlapor / Terduga Pelaku & TKP
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-500">Nama Terlapor:</span>
                    <p className="font-semibold text-slate-800">
                      {isAnonymized ? 'Terlapor (' + kasus.hubunganPelaku + ')' : kasus.namaPelaku}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Hubungan dengan Korban:</span>
                    <p className="font-semibold text-slate-800">{kasus.hubunganPelaku}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Usia Terlapor:</span>
                    <p className="text-slate-800">{kasus.usiaPelaku ? `${kasus.usiaPelaku} Tahun` : '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Tanggal Kejadian:</span>
                    <p className="font-medium text-slate-800">{kasus.tanggalKejadian}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Kecamatan & Desa TKP:</span>
                    <p className="font-medium text-slate-800">
                      Kec. {kasus.kecamatanTKP}, {kasus.desaKelurahanTKP}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Tempat Kejadian:</span>
                    <p className="font-medium text-slate-800">{kasus.tempatKejadian}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Riwayat Pendampingan & Tindakan */}
          {activeTab === 'riwayat' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Catatan Tindakan Pendampingan Kasus</h3>
                  <p className="text-slate-500 text-[11px]">
                    Rekam jejak setiap langkah penanganan medis, hukum, psikologis, atau mediasi
                  </p>
                </div>
                {!showAddNoteForm && (
                  <button
                    onClick={() => setShowAddNoteForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-lg font-semibold text-xs shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Catatan Tindakan</span>
                  </button>
                )}
              </div>

              {/* Form Tambah Catatan */}
              {showAddNoteForm && (
                <form
                  onSubmit={handleSaveNote}
                  className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-3"
                >
                  <h4 className="font-bold text-indigo-950">Catat Tindakan Baru / Perkembangan Kasus</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Tanggal Tindakan</label>
                      <input
                        type="date"
                        value={noteDate}
                        onChange={(e) => setNoteDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Petugas / Pendamping</label>
                      <input
                        type="text"
                        value={noteOfficer}
                        onChange={(e) => setNoteOfficer(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Instansi Pelaksana</label>
                      <input
                        type="text"
                        value={noteAgency}
                        onChange={(e) => setNoteAgency(e.target.value)}
                        placeholder="UPTD PPA / RSUD Aeramo / Polres"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Bentuk Tindakan / Intervensi
                    </label>
                    <input
                      type="text"
                      value={noteAction}
                      onChange={(e) => setNoteAction(e.target.value)}
                      placeholder="Contoh: Pendampingan Visum di RSUD Aeramo / Pemeriksaan BAP di Polres Nagekeo"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Hasil & Catatan Perkembangan
                    </label>
                    <textarea
                      rows={2}
                      value={noteResult}
                      onChange={(e) => setNoteResult(e.target.value)}
                      placeholder="Uraikan hasil yang diperoleh dari tindakan tersebut..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs leading-relaxed"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <label className="text-slate-700 font-semibold whitespace-nowrap">
                        Perbarui Status Berkas:
                      </label>
                      <select
                        value={noteStatus}
                        onChange={(e) => setNoteStatus(e.target.value as StatusPenanganan)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                      >
                        {DAFTAR_STATUS_PENANGANAN.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddNoteForm(false)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-900 text-white rounded font-bold hover:bg-indigo-950"
                      >
                        Simpan Catatan
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Timeline list */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {kasus.riwayatPenanganan && kasus.riwayatPenanganan.length > 0 ? (
                  kasus.riwayatPenanganan.map((catatan) => (
                    <div key={catatan.id} className="relative space-y-1">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-900 ring-4 ring-white" />
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <span className="font-semibold text-slate-800">{catatan.tanggal}</span>
                        <span>·</span>
                        <span className="font-medium text-indigo-950">{catatan.instansi}</span>
                        <span>·</span>
                        <span>Oleh: {catatan.petugas}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                        <p className="font-semibold text-slate-900">{catatan.tindakan}</p>
                        <p className="text-slate-600 leading-relaxed">{catatan.hasilDanCatatan}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-50 rounded-lg text-slate-500 italic text-center">
                    Belum ada riwayat pendampingan yang dicatat.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
          <button
            onClick={() => onPrint(kasus)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-950 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-indigo-700" />
            <span>Cetak Berita Acara (Kop Surat Pemkab)</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition-colors"
          >
            Tutup Berkas
          </button>
        </div>
      </div>
    </div>
  );
};
