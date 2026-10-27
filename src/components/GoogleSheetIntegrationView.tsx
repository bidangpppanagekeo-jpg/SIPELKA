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
  Check
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
    var data = JSON.parse(e.postData.contents);
    var action = data.action || 'SAVE_CASE';
    var targetReg = data.nomorRegistrasi || '';
    
    var rows = sheet.getDataRange().getValues();
    var rowIndex = -1;
    
    if (targetReg && targetReg !== 'TEST_PING') {
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === targetReg) {
          rowIndex = i + 1; // 1-indexed row number
          break;
        }
      }
    }
    
    if (action === 'DELETE_CASE') {
      if (rowIndex > 0) {
        sheet.deleteRow(rowIndex);
      }
    } else if (action === 'EDIT_CASE' || action === 'SAVE_CASE') {
      var rowData = [
        data.nomorRegistrasi || '',
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
        data.petugasPendamping || ''
      ];
      if (rowIndex > 0) {
        sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
    } else if (action === 'SYNC_ALL_CASES' && Array.isArray(data.cases)) {
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
      }
      data.cases.forEach(function(c) {
        sheet.appendRow([
          c.nomorRegistrasi || '',
          c.tanggalLapor || '',
          c.namaKorban || '',
          c.usiaKorban || '',
          c.kategoriKorban || '',
          c.kecamatanTKP || '',
          c.bentukKekerasan ? c.bentukKekerasan.join(', ') : '',
          c.namaPelaku || '',
          c.hubunganPelaku || '',
          c.tingkatUrgensi || '',
          c.statusPenanganan || '',
          c.petugasPendamping || ''
        ]);
      });
    } else {
      // Test ping
      sheet.appendRow([
        data.nomorRegistrasi || 'TEST_PING',
        data.tanggalLapor || new Date().toISOString().slice(0, 10),
        data.namaKorban || 'Test Korban',
        data.usiaKorban || '0',
        data.kategoriKorban || 'Test',
        data.kecamatanTKP || 'Aesesa',
        data.bentukKekerasan || 'Uji Koneksi Bi-directional',
        data.namaPelaku || '-',
        data.hubunganPelaku || '-',
        data.tingkatUrgensi || 'Normal',
        data.statusPenanganan || data.action || 'OK',
        data.petugasPendamping || 'System'
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "action": action}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
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
              <span>Integrasi Dua Arah SIPELKA</span>
              <span>·</span>
              <span className="text-white">Dinas PMDP3A Kabupaten Nagekeo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-amber-300" />
              Integrasi Google Sheet & Webhook (Edit & Hapus Dua Arah)
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
              Setiap tindakan edit, tambah kasus baru, pembaruan catatan, maupun penghapusan data di web akan langsung disinkronkan secara dua arah ke baris Google Sheet Anda.
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

      {/* 2. Configuration Form */}
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
                URL Webhook (Google Apps Script Web App / Zapier / Make) *
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
                Endpoint URL yang menerima method POST berformat JSON (mendukung EDIT_CASE, SAVE_CASE, DELETE_CASE).
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
                <span>Kirim data otomatis saat kasus dicatat, diedit, atau dihapus</span>
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

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !config.webhookUrl}
                className="px-4 py-2.5 bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Menguji...' : 'Uji Koneksi Webhook'}</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-900 to-sky-700 hover:from-blue-800 hover:to-sky-600 text-white font-black rounded-xl shadow-md transition-all"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </form>
        </div>

        {/* 3. Guide & Apps Script Template */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 via-blue-900 to-sky-950 text-white p-6 sm:p-7 rounded-3xl border border-amber-400/30 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                Panduan Google Apps Script Dua Arah (Edit & Hapus)
              </h3>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-400/30">
                Dua Arah
              </span>
            </div>

            <ol className="text-xs text-sky-100 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Buka Google Sheet Anda, klik menu <strong>Extensions &gt; Apps Script</strong>.</li>
              <li>Hapus kode lama dan tempel kode skrip baru di bawah ini.</li>
              <li>Klik <strong>Deploy &gt; New deployment</strong> (Pilih Web app, Execute as: Me, Who has access: Anyone).</li>
              <li>Salin URL Web App dan tempel ke kolom Webhook di samping.</li>
            </ol>

            <div className="relative pt-2">
              <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-t-xl border border-slate-700 text-[11px] font-mono text-slate-300">
                <span>Code.gs (Dua Arah: Save, Edit, Delete)</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-amber-300 hover:text-white transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-b-xl border border-t-0 border-slate-800 text-[10px] font-mono text-sky-200 overflow-x-auto max-h-48 scrollbar-none">
                {appsScriptCode}
              </pre>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 text-[11px] text-sky-200 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Operasi Edit dan Hapus otomatis mencocokkan Nomor Registrasi di baris Google Sheet.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
