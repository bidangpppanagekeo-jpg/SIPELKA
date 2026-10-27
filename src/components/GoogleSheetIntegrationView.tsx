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
  Info
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
    if (!window.confirm(`Kirim sinyal HAPUS (DELETE_CASE) untuk nomor registrasi ${target.nomorRegistrasi} ke Google Sheet? Baris terkait akan dihapus dari sheet.`)) {
      return;
    }

    setIsTesting(true);
    const res = await sendDataToGoogleSheetWebhook({
      action: 'DELETE_CASE',
      timestamp: new Date().toISOString(),
      id: target.id,
      nomorRegistrasi: target.nomorRegistrasi
    }, config);
    setIsTesting(false);
    setTestResult({
      success: res.success,
      message: res.success
        ? `Sinyal HAPUS untuk ${target.nomorRegistrasi} berhasil dikirim ke Google Sheet.`
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
        showToast(`Berhasil menyinkronkan ${cases.length} data kasus ke Google Sheet.`);
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
    
    // 1. Baca payload baik dari e.postData.contents maupun e.parameter
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (errParse) {
        data = {};
      }
    }
    
    // Ambil parameter cadangan jika tidak ada di postData
    var action = (data.action || (e && e.parameter && e.parameter.action) || 'SAVE_CASE').toString().trim();
    var targetReg = (data.nomorRegistrasi || (e && e.parameter && e.parameter.nomorRegistrasi) || '').toString().trim();
    var targetId = (data.id || (e && e.parameter && e.parameter.id) || '').toString().trim();
    
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    var rowIndex = -1;
    
    // 2. Cari baris yang cocok di Google Sheet (berdasarkan Nomor Registrasi atau ID di semua kolom)
    if (lastRow > 1 && (targetReg || targetId)) {
      var range = sheet.getRange(1, 1, lastRow, Math.max(lastCol, 16));
      var values = range.getValues();
      
      for (var i = 1; i < values.length; i++) {
        var rowStr = values[i].join(' ').toUpperCase();
        var regUpper = targetReg.toUpperCase();
        var idUpper = targetId.toUpperCase();
        
        if (
          (regUpper && regUpper !== 'TEST_PING' && rowStr.indexOf(regUpper) !== -1) ||
          (idUpper && rowStr.indexOf(idUpper) !== -1)
        ) {
          rowIndex = i + 1; // 1-indexed baris pada sheet
          break;
        }
      }
    }
    
    // ==========================================
    // 3. AKSI HAPUS (DELETE_CASE)
    // JANGAN PERNAH panggil sheet.appendRow() saat hapus!
    // ==========================================
    if (action === 'DELETE_CASE') {
      if (rowIndex > 0) {
        sheet.deleteRow(rowIndex);
        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          action: 'DELETE_CASE',
          message: 'Baris ' + rowIndex + ' berhasil dihapus dari Google Sheet.',
          deletedRow: rowIndex
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'not_found',
          action: 'DELETE_CASE',
          message: 'Nomor registrasi/ID tidak ditemukan di sheet, tidak ada baris yang dihapus.'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Susun data kolom
    var rowData = [
      data.nomorRegistrasi || targetReg || '',
      data.id || targetId || '',
      data.tanggalLapor || '',
      data.namaKorban || '',
      data.usiaKorban || '',
      data.kategoriKorban || '',
      data.kecamatanTKP || '',
      data.bentukKekerasan ? (Array.isArray(data.bentukKekerasan) ? data.bentukKekerasan.join(', ') : data.bentukKekerasan) : '',
      data.namaPelaku || '',
      data.hubunganPelaku || '',
      data.tingkatUrgensi || '',
      data.statusPenanganan || '',
      data.petugasPendamping || '',
      data.petugasPolres || '',
      data.tenagaMedis || '',
      data.adminSipelka || ''
    ];
    
    // ==========================================
    // 4. AKSI EDIT (EDIT_CASE)
    // Menimpa baris yang ada, JANGAN menambah baris baru!
    // ==========================================
    if (action === 'EDIT_CASE') {
      if (rowIndex > 0) {
        sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          action: 'EDIT_CASE',
          message: 'Baris ' + rowIndex + ' berhasil diperbarui di tempat.',
          updatedRow: rowIndex
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'not_found',
          action: 'EDIT_CASE',
          message: 'Baris tidak ditemukan untuk ditimpa.'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // ==========================================
    // 5. AKSI SIMPAN BARU (SAVE_CASE)
    // ==========================================
    if (action === 'SAVE_CASE') {
      if (rowIndex > 0) {
        sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        action: 'SAVE_CASE',
        message: 'Data berhasil disimpan.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ==========================================
    // 6. SINKRONISASI SEMUA DATA (SYNC_ALL_CASES)
    // ==========================================
    if (action === 'SYNC_ALL_CASES' && Array.isArray(data.cases)) {
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
      }
      data.cases.forEach(function(c) {
        sheet.appendRow([
          c.nomorRegistrasi || '',
          c.id || '',
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
          c.petugasPendamping || '',
          c.petugasPolres || '',
          c.tenagaMedis || '',
          c.adminSipelka || ''
        ]);
      });
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        action: 'SYNC_ALL_CASES',
        count: data.cases.length
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Abaikan aksi lain tanpa menambah baris
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
              <span>Sinkronisasi Dua Arah Presisi</span>
              <span>·</span>
              <span className="text-white">Dinas PMDP3A Kabupaten Nagekeo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-amber-300" />
              Integrasi Google Sheet (Hapus & Edit Presisi Baris)
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
              Memastikan data yang <strong>Dihapus</strong> di web benar-benar terhapus dari baris Google Sheet, dan data yang <strong>Diedit</strong> menimpa baris yang sama tanpa menambah baris baru.
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
                <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
                <span>{isSyncingAll ? 'Menyinkronkan...' : 'Sinkronkan Semua Data'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Critical Instruction Alert Box */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-2 text-xs text-amber-950">
            <h3 className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
              <span>Langkah Wajib Agar Google Sheet Tidak Menambah Baris Baru:</span>
            </h3>
            <p className="leading-relaxed">
              Jika tombol Hapus atau Edit sebelumnya malah <em>menambah baris baru</em> di Google Sheet, penyebab utamanya adalah Google Apps Script masih menjalankan versi lama. Untuk memperbaikinya:
            </p>
            <ol className="list-decimal list-inside space-y-1 font-medium bg-white/70 p-3 rounded-xl border border-amber-200">
              <li>Salin kode skrip terbaru di panel sebelah kanan bawah (klik tombol <strong>Salin Kode</strong>).</li>
              <li>Buka Google Sheet Anda &gt; menu <strong>Extensions &gt; Apps Script</strong> &gt; tempelkan kode tersebut di <code>Code.gs</code>.</li>
              <li>Klik tombol <strong>Deploy (Penerapan)</strong> di pojok kanan atas &gt; pilih <strong>Manage deployments (Kelola penerapan)</strong>.</li>
              <li>Klik ikon <strong>Pensil (Edit)</strong> pada penerapan Web App Anda.</li>
              <li>Pada menu dropdown <strong>Version (Versi)</strong>, ubah dan pilih <strong className="text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded">New version (Versi baru)</strong>.</li>
              <li>Klik tombol <strong>Deploy (Terapkan)</strong>. Selesai! Sekarang Hapus dan Edit akan langsung akurat.</li>
            </ol>
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
                <Info className="w-4 h-4 text-sky-600" />
                <span>Uji Simulasi Sinyal Aksi (Verifikasi Langsung ke Sheet):</span>
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
                Anti Duplikasi
              </span>
            </div>

            <p className="text-xs text-sky-100 leading-relaxed">
              Skrip ini secara spesifik mengecek <code>DELETE_CASE</code> untuk menghapus baris tanpa <code>appendRow()</code>, dan <code>EDIT_CASE</code> untuk menimpa baris tanpa menambah baris baru.
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
