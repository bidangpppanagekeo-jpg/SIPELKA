import 'dotenv/config';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { KasusKekerasan, PegawaiSIPELKA } from './src/types/index.ts';

interface SheetConfig {
  sheetUrl: string;
  webhookUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(import.meta.dirname, '.sipelka-data');
const CONFIG_FILE = path.join(DATA_DIR, 'sheet-config.json');

function getEnvDefaultConfig(): SheetConfig {
  return {
    sheetUrl: (process.env.GOOGLE_SHEET_URL || '').trim(),
    webhookUrl: (process.env.GOOGLE_SHEET_WEBHOOK_URL || '').trim(),
    autoSync: true
  };
}

async function readSheetConfig(): Promise<SheetConfig> {
  const envDefaults = getEnvDefaultConfig();
  try {
    const raw = await fs.readFile(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<SheetConfig>;
    return {
      sheetUrl: typeof parsed.sheetUrl === 'string' && parsed.sheetUrl.trim() ? parsed.sheetUrl.trim() : envDefaults.sheetUrl,
      webhookUrl: typeof parsed.webhookUrl === 'string' && parsed.webhookUrl.trim() ? parsed.webhookUrl.trim() : envDefaults.webhookUrl,
      autoSync: typeof parsed.autoSync === 'boolean' ? parsed.autoSync : true,
      lastSyncedAt: parsed.lastSyncedAt
    };
  } catch {
    return envDefaults;
  }
}

async function writeSheetConfig(config: SheetConfig): Promise<SheetConfig> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const normalized: SheetConfig = {
    sheetUrl: (config.sheetUrl || '').trim(),
    webhookUrl: (config.webhookUrl || '').trim(),
    autoSync: typeof config.autoSync === 'boolean' ? config.autoSync : true,
    lastSyncedAt: config.lastSyncedAt
  };
  await fs.writeFile(CONFIG_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
  return normalized;
}

function isValidHttpUrl(value: string): boolean {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function extractSpreadsheetId(sheetUrl: string): string | null {
  const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

function buildSamaran(nama: string, usia: number, jk: string): string {
  const parts = (nama || '').trim().split(/\s+/).filter(Boolean);
  const initials = parts.map((p) => p[0]?.toUpperCase() || '').join('') || 'K';
  const prefix = usia > 0 && usia < 18 ? 'An.' : jk === 'Laki-laki' ? 'Tn.' : 'Ny.';
  return `${prefix} ${initials}${usia > 0 ? ` (${usia} th)` : ''}`;
}

function normalizeCaseRecord(raw: Record<string, unknown>, idx: number): KasusKekerasan {
  const usia = Number(raw.usiaKorban || 0) || 0;
  const jk = raw.jenisKelaminKorban === 'Laki-laki' ? 'Laki-laki' : 'Perempuan';
  const namaKorban = String(raw.namaKorban || '').trim();
  const nomorRegistrasi = String(raw.nomorRegistrasi || `REG/PPA-NGK/SHEET/${idx + 1}`).trim();
  const bentukRaw = raw.bentukKekerasan;
  const bentukKekerasan = Array.isArray(bentukRaw)
    ? bentukRaw.map((b) => String(b).trim()).filter(Boolean)
    : typeof bentukRaw === 'string' && bentukRaw.trim()
    ? bentukRaw.split(/[,;]/).map((b) => b.trim()).filter(Boolean)
    : ['Kekerasan Fisik'];

  const dampakRaw = raw.dampakKorban;
  const dampakKorban = Array.isArray(dampakRaw)
    ? dampakRaw.map((d) => String(d).trim()).filter(Boolean)
    : typeof dampakRaw === 'string' && dampakRaw.trim()
    ? dampakRaw.split(/[,;]/).map((d) => d.trim()).filter(Boolean)
    : [];

  const layananRaw = raw.layananDibutuhkan;
  const layananDibutuhkan = Array.isArray(layananRaw)
    ? layananRaw.map((l) => String(l).trim()).filter(Boolean)
    : typeof layananRaw === 'string' && layananRaw.trim()
    ? layananRaw.split(/[,;]/).map((l) => l.trim()).filter(Boolean)
    : [];

  const riwayatRaw = raw.riwayatPenanganan;
  const riwayatPenanganan = Array.isArray(riwayatRaw) ? riwayatRaw : [];

  return {
    id: String(raw.id || `SHEET-KASUS-${nomorRegistrasi || idx + 1}`),
    nomorRegistrasi,
    tanggalLapor: String(raw.tanggalLapor || new Date().toISOString().slice(0, 10)).slice(0, 10),
    tanggalKejadian: String(raw.tanggalKejadian || raw.tanggalLapor || new Date().toISOString().slice(0, 10)).slice(0, 10),
    kecamatanTKP: (String(raw.kecamatanTKP || 'Aesesa').trim() || 'Aesesa') as KasusKekerasan['kecamatanTKP'],
    desaKelurahanTKP: String(raw.desaKelurahanTKP || '-').trim(),
    tempatKejadian: (String(raw.tempatKejadian || 'Rumah Tangga (KDRT)').trim() || 'Rumah Tangga (KDRT)') as KasusKekerasan['tempatKejadian'],
    namaPelapor: String(raw.namaPelapor || '-').trim(),
    hubunganPelaporDenganKorban: String(raw.hubunganPelaporDenganKorban || '-').trim(),
    kontakPelapor: String(raw.kontakPelapor || '-').trim(),
    namaKorban,
    namaSamaran: String(raw.namaSamaran || buildSamaran(namaKorban, usia, jk)).trim(),
    nikKorban: raw.nikKorban ? String(raw.nikKorban) : '',
    jenisKelaminKorban: jk,
    usiaKorban: usia,
    kategoriKorban: (String(raw.kategoriKorban || (usia > 0 && usia < 18 ? (jk === 'Laki-laki' ? 'Anak Laki-Laki' : 'Anak Perempuan') : 'Perempuan Dewasa')).trim()) as KasusKekerasan['kategoriKorban'],
    pendidikanKorban: String(raw.pendidikanKorban || '-').trim(),
    pekerjaanKorban: String(raw.pekerjaanKorban || '-').trim(),
    alamatKorban: String(raw.alamatKorban || '-').trim(),
    kecamatanKorban: (String(raw.kecamatanKorban || raw.kecamatanTKP || 'Aesesa').trim() || 'Aesesa') as KasusKekerasan['kecamatanKorban'],
    disabilitas: Boolean(raw.disabilitas),
    jenisDisabilitas: raw.jenisDisabilitas ? String(raw.jenisDisabilitas) : '',
    namaPelaku: String(raw.namaPelaku || '-').trim(),
    usiaPelaku: raw.usiaPelaku ? Number(raw.usiaPelaku) : undefined,
    jenisKelaminPelaku: raw.jenisKelaminPelaku === 'Perempuan' ? 'Perempuan' : 'Laki-laki',
    hubunganPelaku: (String(raw.hubunganPelaku || 'Lainnya').trim() || 'Lainnya') as KasusKekerasan['hubunganPelaku'],
    pekerjaanPelaku: raw.pekerjaanPelaku ? String(raw.pekerjaanPelaku) : '',
    domisiliPelaku: raw.domisiliPelaku ? String(raw.domisiliPelaku) : '',
    bentukKekerasan: bentukKekerasan as KasusKekerasan['bentukKekerasan'],
    ringkasanKronologi: String(raw.ringkasanKronologi || '-').trim(),
    dampakKorban,
    tingkatUrgensi: (String(raw.tingkatUrgensi || 'Sedang').trim() || 'Sedang') as KasusKekerasan['tingkatUrgensi'],
    statusPenanganan: (String(raw.statusPenanganan || 'Pengaduan Masuk').trim() || 'Pengaduan Masuk') as KasusKekerasan['statusPenanganan'],
    petugasPendamping: String(raw.petugasPendamping || '-').trim(),
    petugasPendampingId: raw.petugasPendampingId ? String(raw.petugasPendampingId) : undefined,
    adminSipelka: raw.adminSipelka ? String(raw.adminSipelka) : undefined,
    adminSipelkaId: raw.adminSipelkaId ? String(raw.adminSipelkaId) : undefined,
    kepalaBidang: raw.kepalaBidang ? String(raw.kepalaBidang) : undefined,
    kepalaBidangId: raw.kepalaBidangId ? String(raw.kepalaBidangId) : undefined,
    petugasPolres: raw.petugasPolres ? String(raw.petugasPolres) : undefined,
    petugasPolresId: raw.petugasPolresId ? String(raw.petugasPolresId) : undefined,
    tenagaMedis: raw.tenagaMedis ? String(raw.tenagaMedis) : undefined,
    tenagaMedisId: raw.tenagaMedisId ? String(raw.tenagaMedisId) : undefined,
    layananDibutuhkan,
    riwayatPenanganan: riwayatPenanganan as KasusKekerasan['riwayatPenanganan'],
    keteranganTambahan: raw.keteranganTambahan ? String(raw.keteranganTambahan) : ''
  };
}

function normalizePegawaiRecord(raw: Record<string, unknown>, idx: number): PegawaiSIPELKA {
  const statusVal = String(raw.status || 'Aktif').trim();
  return {
    id: String(raw.id || `SHEET-PEG-${idx + 1}`).trim(),
    nama: String(raw.nama || '').trim(),
    nipOrIdentitas: String(raw.nipOrIdentitas || '-').trim(),
    kategori: (String(raw.kategori || 'Tenaga Pendamping Bidang PPPA').trim()) as PegawaiSIPELKA['kategori'],
    jabatan: String(raw.jabatan || '-').trim(),
    instansi: String(raw.instansi || 'Dinas PMDP3A Kab. Nagekeo').trim(),
    telepon: String(raw.telepon || '-').trim(),
    email: raw.email ? String(raw.email).trim() : '',
    keahlian: raw.keahlian ? String(raw.keahlian).trim() : '',
    status: statusVal === 'Non-Aktif' ? 'Non-Aktif' : 'Aktif',
    tanggalBergabung: raw.tanggalBergabung ? String(raw.tanggalBergabung).slice(0, 10) : ''
  };
}

async function fetchGvizTable(spreadsheetId: string, sheetName?: string): Promise<string[][]> {
  const url = new URL(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq`);
  url.searchParams.set('tqx', 'out:json');
  if (sheetName) {
    url.searchParams.set('sheet', sheetName);
  }
  const res = await fetch(url.toString(), {
    method: 'GET',
    redirect: 'follow',
    headers: { 'Cache-Control': 'no-cache' }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const text = await res.text();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Spreadsheet tidak dapat dibaca secara publik.');
  }
  const json = JSON.parse(text.slice(start, end + 1)) as {
    status?: string;
    table?: {
      cols?: Array<{ label?: string }>;
      rows?: Array<{ c?: Array<{ v?: unknown; f?: string } | null> }>;
    };
  };
  if (json.status === 'error' || !json.table) {
    throw new Error('Sheet tidak ditemukan atau akses dibatasi.');
  }
  const rows: string[][] = [];
  const colLabels = (json.table.cols || []).map((c) => String(c.label || '').trim());
  if (colLabels.some(Boolean)) {
    rows.push(colLabels);
  }
  for (const r of json.table.rows || []) {
    const cells = (r.c || []).map((cell) => {
      if (!cell) return '';
      if (typeof cell.f === 'string' && cell.f.trim()) return cell.f.trim();
      return cell.v !== undefined && cell.v !== null ? String(cell.v).trim() : '';
    });
    if (cells.some(Boolean)) {
      rows.push(cells);
    }
  }
  return rows;
}

function parseGvizRowsToCases(rows: string[][]): KasusKekerasan[] {
  if (rows.length === 0) return [];
  const headerIdx = rows.findIndex((r) =>
    r.some((cell) => cell.toUpperCase().includes('NO. REGISTRASI') || cell.toUpperCase().includes('NAMA KORBAN'))
  );
  const startRow = headerIdx >= 0 ? headerIdx + 1 : 0;
  const results: KasusKekerasan[] = [];
  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => !c)) continue;
    const jsonCol = row[13];
    if (jsonCol && jsonCol.startsWith('{')) {
      try {
        const parsed = JSON.parse(jsonCol) as Record<string, unknown>;
        results.push(
          normalizeCaseRecord(
            {
              ...parsed,
              nomorRegistrasi: row[1] || parsed.nomorRegistrasi,
              tanggalLapor: row[2] || parsed.tanggalLapor,
              namaKorban: row[3] || parsed.namaKorban,
              usiaKorban: row[4] || parsed.usiaKorban,
              kategoriKorban: row[5] || parsed.kategoriKorban,
              kecamatanTKP: row[6] || parsed.kecamatanTKP,
              bentukKekerasan: row[7] || parsed.bentukKekerasan,
              namaPelaku: row[8] || parsed.namaPelaku,
              hubunganPelaku: row[9] || parsed.hubunganPelaku,
              tingkatUrgensi: row[10] || parsed.tingkatUrgensi,
              statusPenanganan: row[11] || parsed.statusPenanganan,
              petugasPendamping: row[12] || parsed.petugasPendamping
            },
            i
          )
        );
        continue;
      } catch {
        // Fallback to column mapping
      }
    }
    if (!row[1] && !row[3]) continue;
    results.push(
      normalizeCaseRecord(
        {
          nomorRegistrasi: row[1],
          tanggalLapor: row[2],
          namaKorban: row[3],
          usiaKorban: row[4],
          kategoriKorban: row[5],
          kecamatanTKP: row[6],
          bentukKekerasan: row[7],
          namaPelaku: row[8],
          hubunganPelaku: row[9],
          tingkatUrgensi: row[10],
          statusPenanganan: row[11],
          petugasPendamping: row[12]
        },
        i
      )
    );
  }
  return results;
}

function parseGvizRowsToPegawai(rows: string[][]): PegawaiSIPELKA[] {
  if (rows.length === 0) return [];
  const headerIdx = rows.findIndex((r) =>
    r.some((cell) => cell.toUpperCase().includes('ID PEGAWAI') || cell.toUpperCase().includes('NAMA LENGKAP'))
  );
  const startRow = headerIdx >= 0 ? headerIdx + 1 : 0;
  const results: PegawaiSIPELKA[] = [];
  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row || (!row[1] && !row[2])) continue;
    results.push(
      normalizePegawaiRecord(
        {
          id: row[1],
          nama: row[2],
          nipOrIdentitas: row[3],
          kategori: row[4],
          jabatan: row[5],
          instansi: row[6],
          telepon: row[7],
          email: row[8],
          keahlian: row[9],
          status: row[10],
          tanggalBergabung: row[11]
        },
        i
      )
    );
  }
  return results;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.get('/api/sheet-config', async (_req, res) => {
    const config = await readSheetConfig();
    res.setHeader('Cache-Control', 'no-store');
    res.json(config);
  });

  app.post('/api/sheet-config', async (req, res) => {
    try {
      const body = (req.body || {}) as Partial<SheetConfig>;
      const sheetUrl = typeof body.sheetUrl === 'string' ? body.sheetUrl.trim() : '';
      const webhookUrl = typeof body.webhookUrl === 'string' ? body.webhookUrl.trim() : '';
      const autoSync = typeof body.autoSync === 'boolean' ? body.autoSync : true;

      if (!isValidHttpUrl(sheetUrl) || !isValidHttpUrl(webhookUrl)) {
        res.status(400).json({ error: 'Format URL Google Sheet atau Webhook tidak valid.' });
        return;
      }

      const existing = await readSheetConfig();
      const saved = await writeSheetConfig({
        sheetUrl,
        webhookUrl,
        autoSync,
        lastSyncedAt: existing.lastSyncedAt
      });
      res.json(saved);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan konfigurasi.';
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/sheet-data', async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const config = await readSheetConfig();

    if (!config.webhookUrl && !config.sheetUrl) {
      res.json({
        configured: false,
        cases: [],
        pegawai: [],
        message: 'Google Spreadsheet belum dikonfigurasi. Atur URL Webhook pada menu Integrasi Sheet.'
      });
      return;
    }

    let webhookHtmlDetected = false;
    let webhookPlainTextDetected = false;

    // 1. Primary: Read directly from Apps Script Web App doGet JSON endpoint
    if (config.webhookUrl) {
      try {
        const target = new URL(config.webhookUrl);
        target.searchParams.set('action', 'GET_ALL');
        target.searchParams.set('_ts', String(Date.now()));

        const upstream = await fetch(target.toString(), {
          method: 'GET',
          redirect: 'follow',
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        const text = await upstream.text();
        const trimmed = text.trim();
        if (trimmed.startsWith('{')) {
          const parsed = JSON.parse(trimmed) as {
            status?: string;
            cases?: Record<string, unknown>[];
            pegawai?: Record<string, unknown>[];
            fetchedAt?: string;
            message?: string;
          };

          if (parsed.status === 'success' || Array.isArray(parsed.cases) || Array.isArray(parsed.pegawai)) {
            const normalizedCases = Array.isArray(parsed.cases)
              ? parsed.cases.map((c, idx) => normalizeCaseRecord(c, idx)).filter((c) => c.nomorRegistrasi || c.namaKorban)
              : [];
            const normalizedPegawai = Array.isArray(parsed.pegawai)
              ? parsed.pegawai.map((p, idx) => normalizePegawaiRecord(p, idx)).filter((p) => p.nama)
              : [];

            res.json({
              configured: true,
              source: 'apps_script',
              cases: normalizedCases,
              pegawai: normalizedPegawai,
              fetchedAt: parsed.fetchedAt || new Date().toISOString()
            });
            return;
          }
        } else if (trimmed.startsWith('<')) {
          webhookHtmlDetected = true;
        } else if (trimmed.length > 0) {
          webhookPlainTextDetected = true;
        }
      } catch (err) {
        console.warn('Apps Script doGet fetch warning:', err);
      }
    }

    // 2. Fallback: Read directly from Google Spreadsheet public gviz JSON endpoint if sheetUrl is provided
    const spreadsheetId = config.sheetUrl ? extractSpreadsheetId(config.sheetUrl) : null;
    if (spreadsheetId) {
      try {
        const casesRows = await fetchGvizTable(spreadsheetId);
        let pegawaiRows: string[][] = [];
        try {
          pegawaiRows = await fetchGvizTable(spreadsheetId, 'Data Pegawai');
        } catch {
          pegawaiRows = [];
        }

        res.json({
          configured: true,
          source: 'google_sheet_gviz',
          cases: parseGvizRowsToCases(casesRows),
          pegawai: parseGvizRowsToPegawai(pegawaiRows),
          fetchedAt: new Date().toISOString()
        });
        return;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal membaca Google Spreadsheet.';
        res.status(200).json({
          configured: true,
          needsScriptUpdate: Boolean(config.webhookUrl),
          cases: [],
          pegawai: [],
          message: webhookHtmlDetected
            ? 'Akses Web App Apps Script mengembalikan halaman login/HTML. Pastikan opsi "Who has access / Yang memiliki akses" disetel ke "Anyone / Siapa saja" dan Code.gs telah di-Deploy versi baru.'
            : config.webhookUrl || webhookPlainTextDetected
            ? 'Webhook Apps Script aktif, namun fungsi doGet() belum mengembalikan JSON data. Perbarui Code.gs di menu Integrasi Sheet lalu Deploy versi baru.'
            : `Gagal membaca Google Spreadsheet: ${msg}`
        });
        return;
      }
    }

    res.status(200).json({
      configured: true,
      needsScriptUpdate: Boolean(config.webhookUrl),
      cases: [],
      pegawai: [],
      message: webhookHtmlDetected
        ? 'Akses Web App Apps Script mengembalikan halaman HTML. Pastikan "Who has access / Yang memiliki akses" diatur ke "Anyone / Siapa saja" saat Deploy.'
        : 'Skrip Apps Script belum mengembalikan data JSON. Perbarui Code.gs pada menu Integrasi Sheet lalu Deploy versi baru.'
    });
  });

  app.post('/api/sheet-sync', async (req, res) => {
    try {
      const body = (req.body || {}) as {
        payload?: Record<string, unknown>;
        webhookUrl?: string;
      };
      const config = await readSheetConfig();
      const targetWebhook = (body.webhookUrl || config.webhookUrl || '').trim();

      if (!targetWebhook) {
        res.status(400).json({
          success: false,
          message: 'URL Webhook Google Sheet belum dikonfigurasi.'
        });
        return;
      }

      if (!isValidHttpUrl(targetWebhook)) {
        res.status(400).json({
          success: false,
          message: 'URL Webhook Google Sheet tidak valid.'
        });
        return;
      }

      const payload = body.payload || {};
      const targetUrl = new URL(targetWebhook);
      if (payload.action) targetUrl.searchParams.set('action', String(payload.action));
      if (payload.nomorRegistrasi) targetUrl.searchParams.set('nomorRegistrasi', String(payload.nomorRegistrasi));
      if (payload.id) targetUrl.searchParams.set('id', String(payload.id));

      const upstream = await fetch(targetUrl.toString(), {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const rawText = await upstream.text();
      const trimmed = rawText.trim();
      let parsed: Record<string, unknown> | null = null;
      if (trimmed.startsWith('{')) {
        try {
          parsed = JSON.parse(trimmed) as Record<string, unknown>;
        } catch {
          parsed = null;
        }
      }

      if (trimmed.startsWith('<')) {
        res.status(200).json({
          success: false,
          message:
            'Google Apps Script mengembalikan halaman HTML (akses ditolak atau perlu otorisasi ulang). Pastikan Deploy Web App diatur ke "Anyone / Siapa saja".'
        });
        return;
      }

      if (!upstream.ok || (parsed && parsed.status === 'error')) {
        res.status(200).json({
          success: false,
          message: String(parsed?.message || `Google Apps Script error (HTTP ${upstream.status}).`)
        });
        return;
      }

      const now = new Date().toISOString();
      if (!body.webhookUrl || body.webhookUrl === config.webhookUrl) {
        await writeSheetConfig({
          ...config,
          lastSyncedAt: now
        });
      }

      res.json({
        success: true,
        message: 'Data berhasil disinkronkan langsung ke Google Spreadsheet.',
        data: parsed,
        syncedAt: now
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal terhubung ke Webhook Google Sheet.';
      res.status(200).json({ success: false, message });
    }
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Endpoint API tidak ditemukan.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(import.meta.dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIPELKA Nagekeo server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SIPELKA server:', err);
  process.exit(1);
});
