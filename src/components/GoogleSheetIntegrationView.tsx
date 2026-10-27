import React, { useState, useEffect } from 'react';
import { KasusKekerasan, PegawaiSIPELKA } from '../types';
import {
  getGoogleSheetConfig,
  saveGoogleSheetConfig,
  sendDataToGoogleSheetWebhook,
  GoogleSheetConfig
} from '../services/storageService';
import {
  FileSpreadsheet,
  Link,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Shield,
  RefreshCw,
  Database,
  Check,
  AlertTriangle,
  Trash2,
  Edit,
  Sparkles
} from 'lucide-react';

interface GoogleSheetIntegrationViewProps {
  cases: KasusKekerasan[];
  pegawaiList: PegawaiSIPELKA[];
  showToast: (msg: string) => void;
}

export const GoogleSheetIntegrationView: React.FC<GoogleSheetIntegrationViewProps> = ({
  cases,
  pegawaiList,
  showToast
}) => {
  const [config, setConfig] = useState<GoogleSheetConfig>({
    sheetUrl: '',
    webhookUrl: '',
    autoSync: true
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setConfig(getGoogleSheetConfig());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoogleSheetConfig(config);
    showToast('Konfigurasi Google Sheet & Webhook berhasil disimpan.');
  };

  const handleTestConnection = async () => {
    if (!config.webhookUrl) {
      setTestResult({ success: false, message: 'Harap isi URL Webhook terlebih dahulu.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const testPayload = {
      action: 'TEST_CONNECTION',
      app: 'SIPELKA Nagekeo',
      timestamp: new Date().toISOString(),
      totalCases: cases.length,
      totalPegawai: pegawaiList.length
    };

    const res = await sendDataToGoogleSheetWebhook(testPayload, config);
    setIsTesting(false);
    setTestResult(res);
    if (res.success) {
      showToast('Uji koneksi Webhook berhasil dikirim.');
    } else {
      showToast('Gagal mengirim uji koneksi Webhook.');
    }
  };

  const handleTestDeleteFirstCase = async () => {
    if (!config.webhookUrl) {
      showToast('Harap isi URL Webhook terlebih dahulu.');
      return;
    }
    if (cases.length === 0) {
      showToast('Tidak ada kasus untuk diuji.');
      return;
    }

    const target = cases[0];
    if (!window.confirm(`Kirim sinyal HAPUS (DELETE_CASE) untuk ${target.nomorRegistrasi} (${target.namaKorban}) ke Google Sheet? Baris terkait akan langsung terhapus dari Google Sheet.`)) {
      return;
    }

    setIsTesting(true);
    const res = await sendDataToGoogleSheetWebhook({
      action: 'DELETE_CASE',
      timestamp: new Date().toISOString(),
      id: target.id,
      nomorRegistrasi: target.nomorRegistrasi,
      namaKorban: target.namaKorban
    }, config);
    setIsTesting(false);
    setTestResult({
      success: res.success,
      message: res.success
        ? `Sinyal HAPUS untuk ${target.nomorRegistrasi} (${target.namaKorban}) berhasil dikirim ke Google Sheet.`
        : `Gagal mengirim sinyal Hapus: ${res.message}`
    });
    showToast(`Sinyal Hapus ${target.nomorRegistrasi} telah dikirim ke Google Sheet.`);
  };

  const handleTestEditFirstCase = async () => {
    if (!config.webhookUrl) {
      showToast('Harap isi URL Webhook terlebih dahulu.');
      return;
    }
    if (cases.length === 0) {
      showToast('Tidak ada kasus untuk diuji.');
      return;
    }

    const target = cases[0];
    setIsTesting(true);
    const res = await sendDataToGoogleSheetWebhook({
      action: 'EDIT_CASE',
      timestamp: new Date().toISOString(),
      originalNomorRegistrasi: target.nomorRegistrasi,
      ...target
    }, config);
    setIsTesting(false);
    setTestResult({
      success: res.success,
      message: res.success
        ? `Sinyal EDIT untuk ${target.nomorRegistrasi} berhasil dikirim ke Google Sheet (menimpa baris yang sama).`
        : `Gagal mengirim sinyal Edit: ${res.message}`
    });
    showToast(`Sinyal Edit ${target.nomorRegistrasi} telah dikirim ke Google Sheet.`);
  };

  const handleSyncAllCases = async () => {
    if (!config.webhookUrl) {
      showToast('Harap isi URL Webhook terlebih dahulu.');
      return;
    }

    if (!window.confirm('Sinkronkan seluruh data kasus ke Google Sheet? Ini akan merapikan tabel dan menghapus baris duplikat yang ada di sheet.')) {
      return;
    }

    setIsSyncingAll(true);
    try {
      const payload = {
        action: 'SYNC_ALL_CASES',
        app: 'SIPELKA Nagekeo',
        timestamp: new Date().toISOString(),
        casesCount: cases.length,
        cases: cases
      };

      const res = await sendDataToGoogleSheetWebhook(payload, config);
      if (res.success) {
        showToast(`Berhasil menyinkronkan & merapikan ${cases.length} data kasus ke Google Sheet.`);
      } else {
        showToast(`Gagal menyinkronkan data: ${res.message}`);
      }
    } catch (err: any) {
      showToast('Terjadi kesalahan saat menyinkronkan data.');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const appsScriptCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  try {
    var data = {};
    
    // 1. Ekstrak data dari payload JSON
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (errParse) {
        data = {};
      }
    }
    
    var action = (data.action || (e && e.parameter && e.parameter.action) || 'SAVE_CASE').toString().trim();
    var targetReg = (data.nomorRegistrasi || (e && e.parameter && e.parameter.nomorRegistrasi) || '').toString().trim();
    var originalReg = (data.originalNomorRegistrasi || '').toString().trim();
    var targetId = (data.id || (e && e.parameter && e.parameter.id) || '').toString().trim();
    
    var lastRow = sheet.getLastRow();
    var lastCol = Math.max(sheet.getLastColumn(), 15);
    
    // Ambil seluruh baris sheet dari Baris 1 sampai baris terakhir
    var values = lastRow > 0 ? sheet.getRange(1, 1, lastRow, lastCol).getValues() : [];
    
    // Fungsi pencocokan baris fleksibel (mencari Nomor Registrasi / ID di semua kolom baris)
    function isRowMatch(rowArray) {
      var rowText = rowArray.map(function(c) { return String(c || '').trim(); }).join(' ### ');
      if (targetReg && targetReg !== 'TEST_PING' && rowText.indexOf(targetReg) !== -1) return true;
      if (originalReg && originalReg !== 'TEST_PING' && rowText.indexOf(originalReg) !== -1) return true;
      if (targetId && rowText.indexOf(targetId) !== -1) return true;
      return false;
    }
    
    // Format Waktu Sekarang (WITA Nagekeo)
    var waktuSekarang = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+8", "yyyy-MM-dd HH:mm:ss");
    
    // ==========================================
    // 1. AKSI HAPUS (DELETE_CASE)
    // Menghapus baris dari Google Sheet (Mulai dari baris bawah ke atas agar indeks aman)
    // PENTING: Sama sekali TIDAK memanggil sheet.appendRow()!
    // ==========================================
    if (action === 'DELETE_CASE') {
      var deletedRows = 0;
      for (var r = values.length - 1; r >= 0; r--) {
        if (isRowMatch(values[r])) {
          sheet.deleteRow(r + 1); // deleteRow menggunakan indeks 1-based
          deletedRows++;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: deletedRows > 0 ? 'success' : 'not_found',
        action: 'DELETE_CASE',
        deletedRowsCount: deletedRows,
        nomorRegistrasi: targetReg
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Data yang akan ditulis (Sesuai urutan kolom Google Sheet Anda: Kolom A Waktu, Kolom B No. Reg, dst)
    var rowData = [
      waktuSekarang,                           // Kolom A: Waktu Input / Update
      data.nomorRegistrasi || targetReg || '',  // Kolom B: No. Registrasi
      data.tanggalLapor || '',                  // Kolom C: Tanggal Lapor
      data.namaKorban || '',                    // Kolom D: Nama Korban
      data.usiaKorban || '',                    // Kolom E: Usia Korban
      data.kategoriKorban || '',                // Kolom F: Kategori Korban
      data.kecamatanTKP || '',                  // Kolom G: Kecamatan TKP
      data.bentukKekerasan ? (Array.isArray(data.bentukKekerasan) ? data.bentukKekerasan.join(', ') : data.bentukKekerasan) : '', // Kolom H: Bentuk Kekerasan
      data.namaPelaku || '',                    // Kolom I: Nama Pelaku
      data.hubunganPelaku || '',                // Kolom J: Hubungan Pelaku
      data.tingkatUrgensi || '',                // Kolom K: Urgensi
      data.statusPenanganan || '',              // Kolom L: Status Penanganan
      data.petugasPendamping || ''              // Kolom M: Petugas Pendamping
    ];
    
    // ==========================================
    // 2. AKSI EDIT (EDIT_CASE)
    // Menimpa baris yang ada secara tepat di tempat (TIDAK menambah baris baru!)
    // ==========================================
    if (action === 'EDIT_CASE') {
      var foundRow = -1;
      
      // Cari baris pertama yang cocok
      for (var i = 0; i < values.length; i++) {
        if (isRowMatch(values[i])) {
          foundRow = i + 1; // 1-based index
          // Pertahankan timestamp awal jika ada
          if (values[i][0]) {
            rowData[0] = values[i][0];
          }
          // Timpa data tepat di baris tersebut
          sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
          break;
        }
      }
      
      // Jika sebelumnya ada baris duplikat di bawahnya, bersihkan duplikatnya
      if (foundRow > 0) {
        var refreshedValues = sheet.getDataRange().getValues();
        for (var k = refreshedValues.length - 1; k >= foundRow; k--) {
          if (isRowMatch(refreshedValues[k])) {
            sheet.deleteRow(k + 1);
          }
        }
        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          action: 'EDIT_CASE',
          updatedRow: foundRow
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Jika baris tidak ditemukan saat edit, JANGAN menambah baris baru!
      return ContentService.createTextOutput(JSON.stringify({
        status: 'not_found',
        action: 'EDIT_CASE',
        message: 'Baris tidak ditemukan untuk ditimpa.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ==========================================
    // 3. AKSI SIMPAN KASUS BARU (SAVE_CASE)
    // ==========================================
    if (action === 'SAVE_CASE') {
      var existingIndex = -1;
      for (var s = 0; s < values.length; s++) {
        if (isRowMatch(values[s])) {
          existingIndex = s + 1;
          if (values[s][0]) rowData[0] = values[s][0];
          sheet.getRange(existingIndex, 1, 1, rowData.length).setValues([rowData]);
          break;
        }
      }
      // Jika belum ada, baru tambahkan baris baru
      if (existingIndex <= 0) {
        sheet.appendRow(rowData);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        action: 'SAVE_CASE'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ==========================================
    // 4. SINKRONISASI BERSIH SEMUA DATA (SYNC_ALL_CASES)
    // Membersihkan baris-baris duplikat lama dan merapikan tabel secara utuh
    // ==========================================
    if (action === 'SYNC_ALL_CASES' && Array.isArray(data.cases)) {
      sheet.clearContents();
      
      // Tulis Header Kolom di Baris 1
      sheet.appendRow([
        'WAKTU INPUT',
        'NO. REGISTRASI',
        'TANGGAL LAPOR',
        'NAMA KORBAN',
        'USIA',
        'KATEGORI KORBAN',
        'KECAMATAN TKP',
        'BENTUK KEKERASAN',
        'NAMA PELAKU',
        'HUBUNGAN PELAKU',
        'TINGKAT URGENSI',
        'STATUS PENANGANAN',
        'PETUGAS PENDAMPING'
      ]);
      
      data.cases.forEach(function(c) {
        sheet.appendRow([
          waktuSekarang,
          c.nomorRegistrasi || '',
          c.tanggalLapor || '',
          c.namaKorban || '',
          c.usiaKorban || '',
          c.kategoriKorban || '',
          c.kecamatanTKP || '',
          c.bentukKekerasan ? (Array.isArray(c.bentukKekerasan) ? c.bentukKekerasan.join(', ') : c.bentukKekerasan) : '',
          c.namaPelaku || '',
          c.hubunganPelaku || '',
          c.tingkatUrgensi || '',
          c.statusPenanganan || '',
          c.petugasPendamping || ''
        ]);
      });
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        action: 'SYNC_ALL_CASES',
        total: data.cases.length
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Abaikan aksi lain tanpa menambah data
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ignored',
      action: action
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Webhook SIPELKA Nagekeo Aktif & Siap Menerima POST.")
    .setMimeType(ContentService.MimeType.TEXT);
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    showToast('Kode Google Apps Script berhasil disalin ke clipboard.');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-900 text-white p-6 sm:p-7 rounded-3xl border border-blue-200 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-sky-400/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-sky-400" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <span>Sinkronisasi Dua Arah Presisi Baris</span>
              <span>·</span>
              <span className="text-white">Dinas PMDP3A Kabupaten Nagekeo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-amber-300" />
              Integrasi Google Sheet (Hapus & Edit Presisi Baris)
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
              Memastikan data yang <strong>Dihapus</strong> di web langsung terhapus dari baris Google Sheet, dan data yang <strong>Diedit</strong> menimpa baris yang sama tanpa menambah baris baru.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {config.webhookUrl && (
              <button
                type="button"
                onClick={handleSyncAllCases}
                disabled={isSyncingAll}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all disabled:opacity-50 ring-1 ring-white/40"
              >
                <Sparkles className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
                <span>{isSyncingAll ? 'Merapikan...' : 'Sinkronkan & Rapikan Google Sheet'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Critical Instruction Alert Box */}
      <div className="bg-amber-50 border-2 border-amber-400/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-2.5 text-xs text-amber-950">
            <div>
              <h3 className="font-extrabold text-sm text-amber-900">
                Penyebab Tombol Hapus/Edit Menambah Baris 2 & 3:
              </h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                Di Google Sheet Anda, data kasus dimulai langsung dari <strong>Baris 1</strong> (Kolom A adalah Waktu, Kolom B adalah Nomor Registrasi). Skrip lama memeriksa baris mulai dari baris 2 sehingga Baris 1 tidak pernah terdeteksi, lalu mengeksekusi penambahan baris baru.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-amber-300 space-y-1.5 font-medium">
              <strong className="block text-slate-900 font-bold">Cara Memperbaikinya Sekarang (1 Menit):</strong>
              <ol className="list-decimal list-inside space-y-1 text-slate-800">
                <li>Klik tombol <strong className="text-blue-900">"Salin Kode"</strong> pada panel <code>Code.gs</code> di sebelah kanan bawah.</li>
                <li>Buka Google Sheet Anda &gt; menu <strong>Extensions &gt; Apps Script</strong> &gt; ganti seluruh isi skrip dengan kode yang baru disalin.</li>
                <li>Klik tombol <strong>Deploy (Penerapan)</strong> di pojok kanan atas &gt; pilih <strong>Manage deployments (Kelola penerapan)</strong>.</li>
                <li>Klik ikon <strong>Pensil (Edit)</strong> pada baris Web App Anda.</li>
                <li>Pada pilihan <strong>Version (Versi)</strong>, ubah dan pilih <strong className="text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">New version (Versi baru)</strong>.</li>
                <li>Klik tombol <strong>Deploy (Terapkan)</strong>. Selesai!</li>
                <li><em>(Opsional)</em> Klik tombol kuning <strong>"Sinkronkan & Rapikan Google Sheet"</strong> di atas untuk langsung membersihkan baris duplikat yang ada di sheet Anda.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Configuration Form & Testing Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border-2 border-blue-200 shadow-sm space-y-5">
          <div className="border-b border-blue-100 pb-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Link className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-blue-950">
                Pengaturan URL Google Sheet & Webhook
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Masukkan tautan spreadsheet dan endpoint Webhook Apps Script Anda di bawah ini
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                URL Google Sheet Anda
              </label>
              <div className="relative">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={config.sheetUrl}
                  onChange={(e) => setConfig({ ...config, sheetUrl: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-xs"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Tautan spreadsheet untuk memudahkan akses cepat ke lembar kerja Anda.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                URL Webhook (Google Apps Script Web App) *
              </label>
              <div className="relative">
                <Send className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-xs"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Endpoint URL dari Web App Google Apps Script (berisi doPost yang menangani DELETE_CASE & EDIT_CASE).
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={config.autoSync}
                  onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Kirim data otomatis saat kasus dicatat, diedit, atau dihapus di web</span>
              </label>

              {config.sheetUrl && (
                <a
                  href={config.sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
                >
                  <span>Buka Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-medium ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Direct Simulator Testing Area */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Shield className="w-4 h-4 text-sky-600" />
                <span>Uji Langsung Sinyal Aksi ke Google Sheet:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !config.webhookUrl}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>Uji Koneksi (Ping)</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestEditFirstCase}
                  disabled={isTesting || !config.webhookUrl || cases.length === 0}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs"
                  title="Kirim sinyal EDIT untuk data pertama"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                  <span>Uji Sinyal Edit (Menimpa Baris)</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestDeleteFirstCase}
                  disabled={isTesting || !config.webhookUrl || cases.length === 0}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs"
                  title="Kirim sinyal HAPUS untuk data pertama"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Uji Sinyal Hapus (Hapus Baris)</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-900 to-sky-700 hover:from-blue-800 hover:to-sky-600 text-white font-black rounded-xl shadow-md transition-all"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </form>
        </div>

        {/* 4. Guide & Apps Script Template */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 via-blue-900 to-sky-950 text-white p-6 sm:p-7 rounded-3xl border border-amber-400/30 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                Kode Google Apps Script Terbaru (Code.gs)
              </h3>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-400/30">
                Cocok Persis Sheet Anda
              </span>
            </div>

            <p className="text-xs text-sky-100 leading-relaxed">
              Skrip ini secara spesifik mengecek Nomor Registrasi di Kolom B (mulai dari Baris 1). Saat <strong>DELETE</strong> dieksekusi, baris langsung dihapus. Saat <strong>EDIT</strong> dieksekusi, baris lama ditimpa tanpa menambah baris baru.
            </p>

            <div className="relative pt-1">
              <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-t-xl border border-slate-700 text-[11px] font-mono text-slate-300">
                <span>Code.gs</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-amber-300 hover:text-white transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-b-xl border border-t-0 border-slate-800 text-[10px] font-mono text-sky-200 overflow-x-auto max-h-56 scrollbar-none">
                {appsScriptCode}
              </pre>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 text-[11px] text-sky-200 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Pasti menimpa baris saat diedit dan menghapus baris saat dihapus tanpa menambah data baru.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
