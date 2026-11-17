import React, { useState, useEffect } from 'react';
import { KasusKekerasan, PegawaiSIPELKA } from '../types';
import {
  fetchSheetConfig,
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
  Sparkles,
  Users
} from 'lucide-react';

interface GoogleSheetIntegrationViewProps {
  cases: KasusKekerasan[];
  pegawaiList: PegawaiSIPELKA[];
  showToast: (msg: string) => void;
  onConfigSaved?: (cfg: GoogleSheetConfig) => Promise<void> | void;
  onRefreshFromSheet?: () => Promise<void> | void;
}

export const GoogleSheetIntegrationView: React.FC<GoogleSheetIntegrationViewProps> = ({
  cases,
  pegawaiList,
  showToast,
  onConfigSaved,
  onRefreshFromSheet
}) => {
  const [config, setConfig] = useState<GoogleSheetConfig>({
    sheetUrl: '',
    webhookUrl: '',
    autoSync: true
  });

  const [isTesting, setIsTesting] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isSyncingPegawai, setIsSyncingPegawai] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    let active = true;
    fetchSheetConfig().then((cfg) => {
      if (active) setConfig(cfg);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const saved = await saveGoogleSheetConfig(config);
      setConfig(saved);
      showToast('Konfigurasi Google Sheet & Webhook tersimpan di server untuk semua pengguna.');
      if (onConfigSaved) {
        await onConfigSaved(saved);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal menyimpan konfigurasi Google Sheet.');
    } finally {
      setIsSavingConfig(false);
    }
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

  const handleSyncAllPegawai = async () => {
    if (!config.webhookUrl) {
      showToast('Harap isi URL Webhook terlebih dahulu.');
      return;
    }

    if (!window.confirm(`Sinkronkan seluruh ${pegawaiList.length} data pegawai & tim PPPA ke tab "Data Pegawai" pada Google Sheet yang sama?`)) {
      return;
    }

    setIsSyncingPegawai(true);
    try {
      const payload = {
        action: 'SYNC_ALL_PEGAWAI',
        app: 'SIPELKA Nagekeo',
        timestamp: new Date().toISOString(),
        pegawaiCount: pegawaiList.length,
        pegawai: pegawaiList
      };

      const res = await sendDataToGoogleSheetWebhook(payload, config);
      if (res.success) {
        setTestResult({
          success: true,
          message: `Berhasil mengirim ${pegawaiList.length} data pegawai ke Google Sheet (Tab "Data Pegawai").`
        });
        showToast(`Berhasil menyinkronkan ${pegawaiList.length} data pegawai ke tab "Data Pegawai".`);
      } else {
        setTestResult({ success: false, message: `Gagal menyinkronkan data pegawai: ${res.message}` });
        showToast(`Gagal menyinkronkan data pegawai: ${res.message}`);
      }
    } catch {
      showToast('Terjadi kesalahan saat menyinkronkan data pegawai.');
    } finally {
      setIsSyncingPegawai(false);
    }
  };

  const handleTestSaveFirstPegawai = async () => {
    if (!config.webhookUrl) {
      showToast('Harap isi URL Webhook terlebih dahulu.');
      return;
    }
    if (pegawaiList.length === 0) {
      showToast('Tidak ada data pegawai untuk diuji.');
      return;
    }

    const target = pegawaiList[0];
    setIsTesting(true);
    const res = await sendDataToGoogleSheetWebhook({
      action: 'SAVE_PEGAWAI',
      timestamp: new Date().toISOString(),
      ...target
    }, config);
    setIsTesting(false);
    setTestResult({
      success: res.success,
      message: res.success
        ? `Data pegawai "${target.nama}" berhasil dikirim ke tab "Data Pegawai" di Google Sheet.`
        : `Gagal mengirim data pegawai: ${res.message}`
    });
    showToast(res.success ? `Data pegawai "${target.nama}" berhasil dikirim.` : 'Gagal mengirim data pegawai.');
  };

  const appsScriptCode = `function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Helper: Ambil sheet Data Kasus (sheet pertama selain 'Data Pegawai')
  function getCasesSheet() {
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName() !== 'Data Pegawai') {
        return sheets[i];
      }
    }
    return sheets[0];
  }

  // Helper: Ambil atau buat otomatis tab 'Data Pegawai' di Spreadsheet yang sama
  function getPegawaiSheet() {
    var pSheet = ss.getSheetByName('Data Pegawai');
    if (!pSheet) {
      pSheet = ss.insertSheet('Data Pegawai');
    }
    if (pSheet.getLastRow() === 0) {
      pSheet.appendRow([
        'WAKTU UPDATE',
        'ID PEGAWAI',
        'NAMA LENGKAP',
        'NIP / NRP / SIP / NIK',
        'KATEGORI PEGAWAI',
        'JABATAN RESMI',
        'INSTANSI / UNIT KERJA',
        'NO. TELEPON / WA',
        'EMAIL',
        'KEAHLIAN / SERTIFIKASI',
        'STATUS',
        'TANGGAL BERGABUNG'
      ]);
    }
    return pSheet;
  }

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

    // Format Waktu Sekarang (WITA Nagekeo)
    var waktuSekarang = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+8", "yyyy-MM-dd HH:mm:ss");

    // =========================================================
    // A. HANDLER DATA PEGAWAI & TIM PPPA (TAB: "Data Pegawai")
    // =========================================================
    if (
      action === 'SAVE_PEGAWAI' ||
      action === 'EDIT_PEGAWAI' ||
      action === 'DELETE_PEGAWAI' ||
      action === 'SYNC_ALL_PEGAWAI'
    ) {
      var pSheet = getPegawaiSheet();
      var pLastRow = pSheet.getLastRow();
      var pLastCol = Math.max(pSheet.getLastColumn(), 12);
      var pValues = pLastRow > 0 ? pSheet.getRange(1, 1, pLastRow, pLastCol).getValues() : [];

      function isPegawaiMatch(rowArray, idToMatch) {
        var colId = String(rowArray[1] || '').trim(); // Kolom B = ID PEGAWAI
        if (idToMatch && colId === idToMatch) return true;
        var rowText = rowArray.map(function(c) { return String(c || '').trim(); }).join(' ### ');
        if (idToMatch && rowText.indexOf(idToMatch) !== -1) return true;
        return false;
      }

      // 1. HAPUS PEGAWAI
      if (action === 'DELETE_PEGAWAI') {
        var deletedPegawai = 0;
        for (var pr = pValues.length - 1; pr >= 1; pr--) {
          if (isPegawaiMatch(pValues[pr], targetId)) {
            pSheet.deleteRow(pr + 1);
            deletedPegawai++;
          }
        }
        return ContentService.createTextOutput(JSON.stringify({
          status: deletedPegawai > 0 ? 'success' : 'not_found',
          action: 'DELETE_PEGAWAI',
          deletedRowsCount: deletedPegawai,
          id: targetId
        })).setMimeType(ContentService.MimeType.JSON);
      }

      // 2. SINKRONISASI BERSIH SEMUA PEGAWAI
      if (action === 'SYNC_ALL_PEGAWAI' && Array.isArray(data.pegawai)) {
        pSheet.clearContents();
        pSheet.appendRow([
          'WAKTU UPDATE',
          'ID PEGAWAI',
          'NAMA LENGKAP',
          'NIP / NRP / SIP / NIK',
          'KATEGORI PEGAWAI',
          'JABATAN RESMI',
          'INSTANSI / UNIT KERJA',
          'NO. TELEPON / WA',
          'EMAIL',
          'KEAHLIAN / SERTIFIKASI',
          'STATUS',
          'TANGGAL BERGABUNG'
        ]);

        data.pegawai.forEach(function(p) {
          pSheet.appendRow([
            waktuSekarang,
            p.id || '',
            p.nama || '',
            p.nipOrIdentitas || '',
            p.kategori || '',
            p.jabatan || '',
            p.instansi || '',
            p.telepon || '',
            p.email || '',
            p.keahlian || '',
            p.status || 'Aktif',
            p.tanggalBergabung || ''
          ]);
        });

        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          action: 'SYNC_ALL_PEGAWAI',
          total: data.pegawai.length
        })).setMimeType(ContentService.MimeType.JSON);
      }

      // 3. SIMPAN / EDIT SATU DATA PEGAWAI (SAVE_PEGAWAI / EDIT_PEGAWAI)
      var pegawaiRow = [
        waktuSekarang,
        data.id || targetId || '',
        data.nama || '',
        data.nipOrIdentitas || '',
        data.kategori || '',
        data.jabatan || '',
        data.instansi || '',
        data.telepon || '',
        data.email || '',
        data.keahlian || '',
        data.status || 'Aktif',
        data.tanggalBergabung || ''
      ];

      var foundPegawaiRow = -1;
      for (var pi = 1; pi < pValues.length; pi++) {
        if (isPegawaiMatch(pValues[pi], targetId)) {
          foundPegawaiRow = pi + 1;
          pSheet.getRange(foundPegawaiRow, 1, 1, pegawaiRow.length).setValues([pegawaiRow]);
          break;
        }
      }

      if (foundPegawaiRow > 0) {
        // Bersihkan duplikat jika ada
        var refreshedP = pSheet.getDataRange().getValues();
        for (var pk = refreshedP.length - 1; pk >= foundPegawaiRow; pk--) {
          if (isPegawaiMatch(refreshedP[pk], targetId)) {
            pSheet.deleteRow(pk + 1);
          }
        }
        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          action: action,
          updatedRow: foundPegawaiRow
        })).setMimeType(ContentService.MimeType.JSON);
      }

      // Jika belum ada di tab Data Pegawai, tambahkan baris baru
      pSheet.appendRow(pegawaiRow);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        action: action,
        appended: true
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================
    // B. HANDLER DATA KASUS PPPA (SHEET UTAMA)
    // =========================================================
    if (action === 'TEST_CONNECTION') {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        action: 'TEST_CONNECTION',
        message: 'Koneksi SIPELKA Nagekeo aktif (Kasus & Data Pegawai).'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = getCasesSheet();
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

    // 1. AKSI HAPUS KASUS (DELETE_CASE)
    if (action === 'DELETE_CASE') {
      var deletedRows = 0;
      for (var r = values.length - 1; r >= 0; r--) {
        if (isRowMatch(values[r])) {
          sheet.deleteRow(r + 1);
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

    // Data Kasus (Kolom A Waktu, Kolom B No. Reg, ..., Kolom N JSON Detail Lengkap)
    var jsonDetail = '';
    try {
      var cleanObj = JSON.parse(JSON.stringify(data));
      delete cleanObj.action;
      delete cleanObj.timestamp;
      delete cleanObj.originalNomorRegistrasi;
      jsonDetail = JSON.stringify(cleanObj);
    } catch (errJson) {
      jsonDetail = '';
    }

    var rowData = [
      waktuSekarang,
      data.nomorRegistrasi || targetReg || '',
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
      jsonDetail
    ];

    // Pastikan baris header memiliki kolom JSON_DETAIL jika sheet baru
    if (sheet.getLastRow() === 0) {
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
        'PETUGAS PENDAMPING',
        'JSON_DETAIL'
      ]);
      values = sheet.getDataRange().getValues();
    }

    // 2. AKSI EDIT KASUS (EDIT_CASE)
    if (action === 'EDIT_CASE') {
      var foundRow = -1;
      for (var i = 0; i < values.length; i++) {
        if (isRowMatch(values[i])) {
          foundRow = i + 1;
          if (values[i][0]) {
            rowData[0] = values[i][0];
          }
          sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
          break;
        }
      }

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

      return ContentService.createTextOutput(JSON.stringify({
        status: 'not_found',
        action: 'EDIT_CASE',
        message: 'Baris tidak ditemukan untuk ditimpa.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. AKSI SIMPAN KASUS BARU (SAVE_CASE)
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
      if (existingIndex <= 0) {
        sheet.appendRow(rowData);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        action: 'SAVE_CASE'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. SINKRONISASI BERSIH SEMUA KASUS (SYNC_ALL_CASES)
    if (action === 'SYNC_ALL_CASES' && Array.isArray(data.cases)) {
      sheet.clearContents();
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
        'PETUGAS PENDAMPING',
        'JSON_DETAIL'
      ]);

      data.cases.forEach(function(c) {
        var cJson = '';
        try { cJson = JSON.stringify(c); } catch (eJson) { cJson = ''; }
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
          c.petugasPendamping || '',
          cJson
        ]);
      });

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        action: 'SYNC_ALL_CASES',
        total: data.cases.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

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
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var caseSheet = sheets[0];
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName() !== 'Data Pegawai') {
        caseSheet = sheets[i];
        break;
      }
    }

    var casesList = [];
    if (caseSheet && caseSheet.getLastRow() > 1) {
      var cValues = caseSheet.getDataRange().getValues();
      for (var r = 1; r < cValues.length; r++) {
        var row = cValues[r];
        if (!row[1] && !row[3]) continue;
        var detailObj = {};
        if (row[13] && String(row[13]).trim().charAt(0) === '{') {
          try {
            detailObj = JSON.parse(String(row[13]));
          } catch (errParse) {
            detailObj = {};
          }
        }
        var tanggalStr = row[2] instanceof Date
          ? Utilities.formatDate(row[2], Session.getScriptTimeZone() || "GMT+8", "yyyy-MM-dd")
          : String(row[2] || detailObj.tanggalLapor || '').slice(0, 10);
        var bentukArr = row[7]
          ? String(row[7]).split(',').map(function(x) { return x.trim(); }).filter(Boolean)
          : (detailObj.bentukKekerasan || []);

        var rawUsia = String(row[4] || '').replace(/[^0-9]/g, '');
        var parsedUsia = rawUsia ? parseInt(rawUsia, 10) : (Number(detailObj.usiaKorban || 0) || 0);

        var mergedCase = Object.assign({}, detailObj, {
          id: detailObj.id || ('SHEET-KASUS-' + r),
          nomorRegistrasi: String(row[1] || detailObj.nomorRegistrasi || ''),
          tanggalLapor: tanggalStr,
          namaKorban: String(row[3] || detailObj.namaKorban || ''),
          usiaKorban: parsedUsia,
          kategoriKorban: String(row[5] || detailObj.kategoriKorban || 'Perempuan Dewasa'),
          kecamatanTKP: String(row[6] || detailObj.kecamatanTKP || 'Aesesa'),
          bentukKekerasan: bentukArr,
          namaPelaku: String(row[8] || detailObj.namaPelaku || ''),
          hubunganPelaku: String(row[9] || detailObj.hubunganPelaku || 'Lainnya'),
          tingkatUrgensi: String(row[10] || detailObj.tingkatUrgensi || 'Sedang'),
          statusPenanganan: String(row[11] || detailObj.statusPenanganan || 'Pengaduan Masuk'),
          petugasPendamping: String(row[12] || detailObj.petugasPendamping || '-')
        });
        casesList.push(mergedCase);
      }
    }

    var pegawaiList = [];
    var pSheet = ss.getSheetByName('Data Pegawai');
    if (pSheet && pSheet.getLastRow() > 1) {
      var pValues = pSheet.getDataRange().getValues();
      for (var pr = 1; pr < pValues.length; pr++) {
        var prow = pValues[pr];
        if (!prow[1] && !prow[2]) continue;
        var tglGabung = prow[11] instanceof Date
          ? Utilities.formatDate(prow[11], Session.getScriptTimeZone() || "GMT+8", "yyyy-MM-dd")
          : String(prow[11] || '').slice(0, 10);
        pegawaiList.push({
          id: String(prow[1] || ('PEG-' + pr)),
          nama: String(prow[2] || ''),
          nipOrIdentitas: String(prow[3] || '-'),
          kategori: String(prow[4] || 'Tenaga Pendamping Bidang PPPA'),
          jabatan: String(prow[5] || '-'),
          instansi: String(prow[6] || 'Dinas PMDP3A Kab. Nagekeo'),
          telepon: String(prow[7] || '-'),
          email: String(prow[8] || ''),
          keahlian: String(prow[9] || ''),
          status: String(prow[10] || 'Aktif') === 'Non-Aktif' ? 'Non-Aktif' : 'Aktif',
          tanggalBergabung: tglGabung
        });
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      cases: casesList,
      pegawai: pegawaiList,
      fetchedAt: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (errGet) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: errGet.toString(),
      cases: [],
      pegawai: []
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
      {/* 1. Header Banner (Biru Muda) */}
      <div className="bg-gradient-to-r from-sky-200 via-sky-100 to-blue-200 text-sky-950 p-6 sm:p-7 rounded-3xl border border-sky-300 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-white/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-amber-400" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-sky-800 uppercase tracking-wider">
              <span>Sinkronisasi Dua Arah Presisi Baris</span>
              <span>·</span>
              <span className="text-blue-950">Dinas PMDP3A Kabupaten Nagekeo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-sky-950 tracking-tight flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-sky-700" />
              Integrasi Google Sheet (Data Kasus &amp; Data Pegawai)
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-2xl leading-relaxed">
              Menghubungkan <strong>Data Kasus PPPA</strong> (Sheet Utama) dan <strong>Data Pegawai &amp; Tim PPPA</strong> (Tab <code>Data Pegawai</code>) ke dalam <strong>1 Google Spreadsheet yang sama</strong> secara otomatis.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {onRefreshFromSheet && (
              <button
                type="button"
                onClick={() => onRefreshFromSheet()}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-sky-50 text-sky-950 text-xs font-extrabold rounded-xl shadow-xs transition-all border border-sky-300"
              >
                <RefreshCw className="w-4 h-4 text-sky-700" />
                <span>Ambil Data Terbaru</span>
              </button>
            )}
            {config.webhookUrl && (
              <>
                <button
                  type="button"
                  onClick={handleSyncAllPegawai}
                  disabled={isSyncingPegawai}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/85 hover:bg-white text-sky-950 text-xs font-extrabold rounded-xl shadow-xs transition-all disabled:opacity-50 border border-sky-300"
                >
                  <Users className={`w-4 h-4 text-sky-700 ${isSyncingPegawai ? 'animate-pulse' : ''}`} />
                  <span>{isSyncingPegawai ? 'Menyinkronkan...' : `Sinkronkan Data Pegawai (${pegawaiList.length})`}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSyncAllCases}
                  disabled={isSyncingAll}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all disabled:opacity-50 ring-1 ring-white/40"
                >
                  <Sparkles className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
                  <span>{isSyncingAll ? 'Merapikan...' : `Sinkronkan Data Kasus (${cases.length})`}</span>
                </button>
              </>
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
                Pembaruan Skrip Terpadu: Data Kasus &amp; Data Pegawai dalam 1 Spreadsheet
              </h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                Agar setiap input, ubah, dan hapus pada menu <strong>Data Pegawai &amp; Tim PPPA</strong> ikut terekam otomatis di Spreadsheet yang sama (pada tab baru bernama <strong>Data Pegawai</strong> yang dibuat otomatis oleh sistem), perbarui kode <code>Code.gs</code> Anda dengan skrip terbaru di bawah ini.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-amber-300 space-y-1.5 font-medium">
              <strong className="block text-slate-900 font-bold">Langkah Pembaruan Skrip Apps Script (1 Menit):</strong>
              <ol className="list-decimal list-inside space-y-1 text-slate-800">
                <li>Klik tombol <strong className="text-blue-900">&quot;Salin Kode&quot;</strong> pada panel <code>Code.gs</code> di sebelah kanan bawah.</li>
                <li>Buka Google Sheet Anda &gt; menu <strong>Extensions &gt; Apps Script</strong> &gt; ganti seluruh isi skrip dengan kode yang baru disalin.</li>
                <li>Klik tombol <strong>Deploy (Penerapan)</strong> di pojok kanan atas &gt; pilih <strong>Manage deployments (Kelola penerapan)</strong>.</li>
                <li>Klik ikon <strong>Pensil (Edit)</strong> pada baris Web App Anda.</li>
                <li>Pada pilihan <strong>Version (Versi)</strong>, ubah dan pilih <strong className="text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">New version (Versi baru)</strong>, lalu klik <strong>Deploy</strong>.</li>
                <li>Setelah itu, klik tombol <strong>&quot;Sinkronkan Data Pegawai&quot;</strong> di atas agar seluruh daftar pegawai langsung terbuat di tab <code>Data Pegawai</code> pada Spreadsheet Anda.</li>
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
                <span>Kirim data otomatis saat Data Kasus atau Data Pegawai dicatat, diedit, atau dihapus</span>
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
                  onClick={handleTestSaveFirstPegawai}
                  disabled={isTesting || !config.webhookUrl || pegawaiList.length === 0}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs"
                  title="Kirim 1 data pegawai ke tab Data Pegawai"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Uji Kirim Data Pegawai</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestEditFirstCase}
                  disabled={isTesting || !config.webhookUrl || cases.length === 0}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs"
                  title="Kirim sinyal EDIT untuk data kasus pertama"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                  <span>Uji Sinyal Edit Kasus</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestDeleteFirstCase}
                  disabled={isTesting || !config.webhookUrl || cases.length === 0}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs"
                  title="Kirim sinyal HAPUS untuk data kasus pertama"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Uji Sinyal Hapus Kasus</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingConfig}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white font-black rounded-xl shadow-md transition-all disabled:opacity-60"
              >
                {isSavingConfig ? 'Menyimpan...' : 'Simpan Konfigurasi'}
              </button>
            </div>
          </form>
        </div>

        {/* 4. Guide & Apps Script Template (Biru Muda) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-sky-100 via-blue-100 to-sky-200 text-sky-950 p-6 sm:p-7 rounded-3xl border-2 border-sky-300 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-sky-300 pb-3">
              <h3 className="font-extrabold text-sm text-sky-950 flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-700" />
                Kode Google Apps Script Terpadu (Code.gs)
              </h3>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                Kasus &amp; Pegawai
              </span>
            </div>

            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Skrip ini memisahkan sheet secara otomatis: <strong>Data Kasus</strong> disimpan di sheet utama, sedangkan <strong>Data Pegawai &amp; Tim PPPA</strong> otomatis dibuat dan direkam di tab <code>Data Pegawai</code> dalam Spreadsheet yang sama.
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

          <div className="pt-3 border-t border-sky-300 text-[11px] text-sky-900 font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-700 shrink-0" />
            <span>Mendukung input, edit, hapus presisi baris, serta sinkronisasi penuh untuk Data Kasus dan Data Pegawai.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
