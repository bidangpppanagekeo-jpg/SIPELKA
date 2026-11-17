/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { KasusKekerasan, StatusPenanganan, CatatanPenanganan, PegawaiSIPELKA, AdminUser, AuthSession } from './types';
import {
  fetchSheetConfig,
  fetchLatestFromGoogleSheet,
  sendDataToGoogleSheetWebhook,
  GoogleSheetConfig
} from './services/storageService';
import { enableClientSecurityShield } from './services/securityService';
import { getAuthSession, logoutAdmin } from './services/authService';
import { signOutGoogleAdmin } from './services/firebaseService';
import { sanitizeObjectData } from './services/securityService';
import { Header } from './components/Header';
import { Sidebar, AppTab } from './components/Sidebar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { CaseListView } from './components/CaseListView';
import { CaseFormView } from './components/CaseFormView';
import { PegawaiManagementView } from './components/PegawaiManagementView';
import { OfficialReportView } from './components/OfficialReportView';
import { SopNetworkView } from './components/SopNetworkView';
import { GoogleSheetIntegrationView } from './components/GoogleSheetIntegrationView';
import { GuideView } from './components/GuideView';
import { CaseDetailModal } from './components/CaseDetailModal';
import { PrintDocument } from './components/PrintDocument';
import { RefreshCw, AlertCircle, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [authSession, setAuthSession] = useState<AuthSession>(() => getAuthSession());
  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard');
  const [cases, setCases] = useState<KasusKekerasan[]>([]);
  const [pegawaiList, setPegawaiList] = useState<PegawaiSIPELKA[]>([]);
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>({
    sheetUrl: '',
    webhookUrl: '',
    autoSync: true
  });
  const [isLoadingSheetData, setIsLoadingSheetData] = useState<boolean>(false);
  const [sheetSyncNotice, setSheetSyncNotice] = useState<{
    configured: boolean;
    message?: string;
    needsScriptUpdate?: boolean;
  }>({ configured: true });

  const [isAnonymized, setIsAnonymized] = useState<boolean>(false);
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<KasusKekerasan | null>(null);
  const [caseToEdit, setCaseToEdit] = useState<KasusKekerasan | null>(null);
  const [officerFilterQuery, setOfficerFilterQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Semua');

  const availableYears = React.useMemo(() => {
    const years = new Set<string>(['2026']);
    cases.forEach((c) => {
      if (c.tanggalLapor && c.tanggalLapor.length >= 4) {
        years.add(c.tanggalLapor.slice(0, 4));
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [cases]);

  // Printing state
  const [printConfig, setPrintConfig] = useState<{
    type: 'berita_acara' | 'lembar_kasus' | 'laporan_bulanan';
    kasus?: KasusKekerasan;
    periode?: string;
  } | null>(null);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  const sheetConfigRef = React.useRef<GoogleSheetConfig>(sheetConfig);
  React.useEffect(() => {
    sheetConfigRef.current = sheetConfig;
  }, [sheetConfig]);

  const refreshLiveSheetData = useCallback(async (silent: boolean = false) => {
    setIsLoadingSheetData(true);
    try {
      const fetchedCfg = await fetchSheetConfig();
      const currentCfg = sheetConfigRef.current;
      const activeCfg =
        fetchedCfg.webhookUrl || fetchedCfg.sheetUrl
          ? fetchedCfg
          : currentCfg.webhookUrl || currentCfg.sheetUrl
          ? currentCfg
          : fetchedCfg;

      const liveData = await fetchLatestFromGoogleSheet(activeCfg);
      setSheetConfig(activeCfg);
      setCases(liveData.cases);
      setPegawaiList(liveData.pegawai);
      setSheetSyncNotice({
        configured: liveData.configured,
        message: liveData.message,
        needsScriptUpdate: liveData.needsScriptUpdate
      });
      if (!silent && liveData.configured && !liveData.message) {
        showToast(`Data terbaru dimuat dari Google Spreadsheet (${liveData.cases.length} kasus, ${liveData.pegawai.length} pegawai).`);
      }
    } catch (err) {
      console.error('Gagal memuat data terbaru dari Google Spreadsheet:', err);
      setCases([]);
      setPegawaiList([]);
      setSheetSyncNotice({
        configured: true,
        message: 'Gagal terhubung ke server untuk mengambil data Google Spreadsheet.'
      });
    } finally {
      setIsLoadingSheetData(false);
    }
  }, [showToast]);

  useEffect(() => {
    // Aktifkan Cyber Security & Data Protection Shield
    const cleanupSecurity = enableClientSecurityShield((alertMsg) => {
      showToast(alertMsg);
    });

    return () => {
      cleanupSecurity();
    };
  }, [showToast]);

  // Selalu ambil data terbaru langsung dari Google Spreadsheet saat aplikasi dibuka oleh siapa saja
  useEffect(() => {
    if (authSession.isAuthenticated && authSession.user) {
      refreshLiveSheetData(true);
    } else {
      setCases([]);
      setPegawaiList([]);
      void signOutGoogleAdmin().catch(() => {});
    }
  }, [authSession.isAuthenticated, authSession.user, refreshLiveSheetData]);

  const handleToggleAnonymized = () => {
    const nextVal = !isAnonymized;
    setIsAnonymized(nextVal);
    showToast(nextVal ? 'Mode Sensor Privasi Nama Diaktifkan' : 'Mode Nama Lengkap Diaktifkan');
  };

  const isPimpinan = authSession.user?.role === 'pimpinan';

  const handleSelectTab = (tab: AppTab) => {
    if (isPimpinan && (tab === 'input' || tab === 'integrasi' || tab === 'pegawai')) {
      setCurrentTab('dashboard');
      return;
    }
    if (tab === 'input' && !caseToEdit) {
      setCaseToEdit(null);
    }
    if (tab === 'register') {
      setOfficerFilterQuery('');
    }
    setCurrentTab(tab);
  };

  const handleOpenNewCase = () => {
    if (isPimpinan) {
      showToast('Mode Pimpinan bersifat hanya melihat. Penambahan kasus baru hanya dapat dilakukan oleh Administrator.');
      return;
    }
    setCaseToEdit(null);
    setCurrentTab('input');
  };

  const handleEditCase = (c: KasusKekerasan) => {
    if (isPimpinan) {
      showToast('Mode Pimpinan bersifat hanya melihat. Pengeditan kasus hanya dapat dilakukan oleh Administrator.');
      return;
    }
    setCaseToEdit(c);
    setSelectedCaseForDetail(null);
    setCurrentTab('input');
  };

  const handleSaveCase = async (savedCase: KasusKekerasan) => {
    const sanitizedCase = sanitizeObjectData(savedCase);
    const isExisting = cases.some((c) => c.id === sanitizedCase.id);
    const originalReg = caseToEdit?.nomorRegistrasi || sanitizedCase.nomorRegistrasi;

    if (!sheetConfig.webhookUrl) {
      showToast('URL Webhook Google Spreadsheet belum diatur. Buka menu Integrasi Sheet terlebih dahulu.');
      setCurrentTab('integrasi');
      return;
    }

    showToast(
      isExisting
        ? `Memperbarui ${sanitizedCase.nomorRegistrasi} di Google Spreadsheet...`
        : `Menyimpan ${sanitizedCase.nomorRegistrasi} langsung ke Google Spreadsheet...`
    );

    const res = await sendDataToGoogleSheetWebhook(
      {
        action: isExisting ? 'EDIT_CASE' : 'SAVE_CASE',
        timestamp: new Date().toISOString(),
        originalNomorRegistrasi: originalReg,
        ...sanitizedCase
      },
      sheetConfig
    );

    if (!res.success) {
      showToast(`Gagal menyimpan ke Google Spreadsheet: ${res.message}`);
      return;
    }

    setCases((prev) =>
      isExisting
        ? prev.map((c) => (c.id === sanitizedCase.id ? sanitizedCase : c))
        : [sanitizedCase, ...prev]
    );
    setCaseToEdit(null);
    setCurrentTab('register');
    showToast(
      isExisting
        ? `Berkas ${sanitizedCase.nomorRegistrasi} berhasil diperbarui di Google Spreadsheet.`
        : `Berkas ${sanitizedCase.nomorRegistrasi} berhasil disimpan ke Google Spreadsheet.`
    );
    await refreshLiveSheetData(true);
  };

  const handleDeleteCase = async (id: string) => {
    const targetCase = cases.find((c) => c.id === id);
    if (!targetCase) return;

    if (!sheetConfig.webhookUrl) {
      showToast('URL Webhook Google Spreadsheet belum diatur. Tidak dapat menghapus dari Spreadsheet.');
      return;
    }

    showToast(`Menghapus ${targetCase.nomorRegistrasi} dari Google Spreadsheet...`);
    const res = await sendDataToGoogleSheetWebhook(
      {
        action: 'DELETE_CASE',
        timestamp: new Date().toISOString(),
        id: targetCase.id,
        nomorRegistrasi: targetCase.nomorRegistrasi,
        namaKorban: targetCase.namaKorban
      },
      sheetConfig
    );

    if (!res.success) {
      showToast(`Gagal menghapus dari Google Spreadsheet: ${res.message}`);
      return;
    }

    setCases((prev) => prev.filter((c) => c.id !== id));
    if (selectedCaseForDetail?.id === id) {
      setSelectedCaseForDetail(null);
    }
    showToast(`Berkas ${targetCase.nomorRegistrasi} berhasil dihapus dari Google Spreadsheet.`);
    await refreshLiveSheetData(true);
  };

  const handleAddProgressNote = async (
    caseId: string,
    note: Omit<CatatanPenanganan, 'id'>,
    newStatus?: StatusPenanganan
  ) => {
    const target = cases.find((c) => c.id === caseId);
    if (!target) return;

    if (!sheetConfig.webhookUrl) {
      showToast('URL Webhook Google Spreadsheet belum diatur.');
      return;
    }

    const sanitizedNote = sanitizeObjectData(note);
    const newNote: CatatanPenanganan = {
      ...sanitizedNote,
      id: 'CAT-' + Date.now().toString()
    };

    const updatedCase: KasusKekerasan = {
      ...target,
      statusPenanganan: newStatus || target.statusPenanganan,
      riwayatPenanganan: [newNote, ...(target.riwayatPenanganan || [])]
    };

    const res = await sendDataToGoogleSheetWebhook(
      {
        action: 'EDIT_CASE',
        timestamp: new Date().toISOString(),
        originalNomorRegistrasi: target.nomorRegistrasi,
        ...updatedCase
      },
      sheetConfig
    );

    if (!res.success) {
      showToast(`Gagal menyimpan catatan ke Google Spreadsheet: ${res.message}`);
      return;
    }

    setCases((prev) => prev.map((c) => (c.id === caseId ? updatedCase : c)));
    setSelectedCaseForDetail(updatedCase);
    showToast('Catatan tindakan pendampingan berhasil disimpan ke Google Spreadsheet.');
    await refreshLiveSheetData(true);
  };

  // Pegawai Handlers (Langsung ke Google Spreadsheet)
  const handleSavePegawai = async (p: PegawaiSIPELKA) => {
    const sanitizedPegawai = sanitizeObjectData(p);
    const isExisting = pegawaiList.some((item) => item.id === sanitizedPegawai.id);

    if (!sheetConfig.webhookUrl) {
      showToast('URL Webhook Google Spreadsheet belum diatur. Buka menu Integrasi Sheet terlebih dahulu.');
      setCurrentTab('integrasi');
      return;
    }

    showToast(
      isExisting
        ? `Memperbarui data pegawai ${sanitizedPegawai.nama} di Google Spreadsheet...`
        : `Menyimpan data pegawai ${sanitizedPegawai.nama} ke Google Spreadsheet...`
    );

    const res = await sendDataToGoogleSheetWebhook(
      {
        action: isExisting ? 'EDIT_PEGAWAI' : 'SAVE_PEGAWAI',
        timestamp: new Date().toISOString(),
        ...sanitizedPegawai
      },
      sheetConfig
    );

    if (!res.success) {
      showToast(`Gagal menyimpan data pegawai ke Google Spreadsheet: ${res.message}`);
      return;
    }

    setPegawaiList((prev) =>
      isExisting
        ? prev.map((item) => (item.id === sanitizedPegawai.id ? sanitizedPegawai : item))
        : [sanitizedPegawai, ...prev]
    );
    showToast(
      isExisting
        ? `Data pegawai ${sanitizedPegawai.nama} berhasil diperbarui di Google Spreadsheet.`
        : `Data pegawai ${sanitizedPegawai.nama} berhasil disimpan ke Google Spreadsheet (Tab Data Pegawai).`
    );
    await refreshLiveSheetData(true);
  };

  const handleDeletePegawai = async (id: string) => {
    const targetPegawai = pegawaiList.find((p) => p.id === id);
    if (!targetPegawai) return;

    if (!sheetConfig.webhookUrl) {
      showToast('URL Webhook Google Spreadsheet belum diatur.');
      return;
    }

    showToast(`Menghapus ${targetPegawai.nama} dari Google Spreadsheet...`);
    const res = await sendDataToGoogleSheetWebhook(
      {
        action: 'DELETE_PEGAWAI',
        timestamp: new Date().toISOString(),
        id: targetPegawai.id,
        nama: targetPegawai.nama,
        nipOrIdentitas: targetPegawai.nipOrIdentitas
      },
      sheetConfig
    );

    if (!res.success) {
      showToast(`Gagal menghapus data pegawai dari Google Spreadsheet: ${res.message}`);
      return;
    }

    setPegawaiList((prev) => prev.filter((p) => p.id !== id));
    showToast(`Data pegawai ${targetPegawai.nama} berhasil dihapus dari Google Spreadsheet.`);
    await refreshLiveSheetData(true);
  };

  const handleViewOfficerCases = (officerName: string) => {
    setOfficerFilterQuery(officerName);
    setCurrentTab('register');
  };

  const handlePrintCase = (c: KasusKekerasan) => {
    setPrintConfig({
      type: 'berita_acara',
      kasus: c
    });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintOfficialReport = (periode: string) => {
    setPrintConfig({
      type: 'laporan_bulanan',
      periode
    });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setAuthSession({ isAuthenticated: true, user });
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    if (window.confirm('Keluar dari aplikasi SIPELKA? Sesi administrator Anda akan diakhiri.')) {
      logoutAdmin();
      void signOutGoogleAdmin().catch(() => {});
      setAuthSession({ isAuthenticated: false, user: null });
      setCases([]);
      setPegawaiList([]);
      setCurrentTab('dashboard');
      showToast('Anda telah berhasil keluar dari sistem SIPELKA.');
    }
  };

  // Gerbang Keamanan: Hanya Administrator / Pimpinan yang telah login yang dapat mengakses SIPELKA
  if (!authSession.isAuthenticated || !authSession.user) {
    return (
      <>
        <LoginView onLoginSuccess={handleLoginSuccess} showToast={showToast} />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-fade-in flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F5FA] flex font-sans relative z-0 text-slate-800">
      {/* Deep Navy Institutional Sidebar on the Left */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        caseCount={cases.length}
        pegawaiCount={pegawaiList.length}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentUser={authSession.user}
        onLogout={handleLogout}
      />

      {/* Main Content Area on the Right */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <Header
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          isAnonymized={isAnonymized}
          onToggleAnonymized={handleToggleAnonymized}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          selectedYear={selectedYear}
          onChangeYear={setSelectedYear}
          availableYears={availableYears}
          selectedQuarter={selectedQuarter}
          onChangeQuarter={setSelectedQuarter}
          currentUser={authSession.user}
          onLogout={handleLogout}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-fade-in flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-7 py-5 space-y-4">
        {/* Live Spreadsheet Loading / Configuration Notice */}
        {isLoadingSheetData && (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 print:hidden">
            <RefreshCw className="w-4 h-4 text-[#1A73E8] animate-spin shrink-0" />
            <span>Mengambil data terbaru langsung dari Google Spreadsheet...</span>
          </div>
        )}

        {!isLoadingSheetData && (!sheetSyncNotice.configured || sheetSyncNotice.message) && (
          <div className="bg-amber-50 border border-amber-300 text-amber-950 px-4 py-3 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="font-medium">
                {sheetSyncNotice.message || 'Google Spreadsheet belum terhubung.'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => refreshLiveSheetData(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg font-bold text-amber-950 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang</span>
              </button>
              {!isPimpinan && currentTab !== 'integrasi' && (
                <button
                  type="button"
                  onClick={() => handleSelectTab('integrasi')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#08244B] hover:bg-[#0B2D5C] text-white rounded-lg font-bold transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Atur Integrasi Sheet</span>
                </button>
              )}
            </div>
          </div>
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            cases={cases}
            isAnonymized={isAnonymized}
            selectedYear={selectedYear}
            selectedQuarter={selectedQuarter}
            onSelectCase={(c) => setSelectedCaseForDetail(c)}
            onNavigateToTab={(tab) => handleSelectTab(tab)}
            onRefreshData={() => refreshLiveSheetData(false)}
            isLoadingData={isLoadingSheetData}
          />
        )}

        {currentTab === 'register' && (
          <CaseListView
            cases={cases}
            isAnonymized={isAnonymized}
            initialSearchQuery={officerFilterQuery}
            onSelectCase={(c) => setSelectedCaseForDetail(c)}
            onEditCase={handleEditCase}
            onDeleteCase={handleDeleteCase}
            onPrintCase={handlePrintCase}
            onOpenNewCase={handleOpenNewCase}
            isReadOnly={isPimpinan}
          />
        )}

        {currentTab === 'input' && !isPimpinan && (
          <CaseFormView
            initialCase={caseToEdit}
            allCases={cases}
            pegawaiList={pegawaiList}
            onSaveCase={handleSaveCase}
            onCancel={() => {
              setCaseToEdit(null);
              setCurrentTab('register');
            }}
            onOpenGuide={() => setCurrentTab('panduan')}
            isReadOnly={isPimpinan}
          />
        )}

        {currentTab === 'pegawai' && (
          <PegawaiManagementView
            pegawaiList={pegawaiList}
            cases={cases}
            onSavePegawai={handleSavePegawai}
            onDeletePegawai={handleDeletePegawai}
            onViewOfficerCases={handleViewOfficerCases}
            onOpenIntegrasi={isPimpinan ? undefined : () => handleSelectTab('integrasi')}
            sheetConfig={sheetConfig}
            showToast={showToast}
            isReadOnly={isPimpinan}
          />
        )}

        {currentTab === 'laporan' && (
          <OfficialReportView
            cases={cases}
            isAnonymized={isAnonymized}
            pegawaiList={pegawaiList}
            onPrintOfficialReport={handlePrintOfficialReport}
          />
        )}

        {currentTab === 'sop' && <SopNetworkView />}

        {currentTab === 'integrasi' && !isPimpinan && (
          <GoogleSheetIntegrationView
            cases={cases}
            pegawaiList={pegawaiList}
            initialConfig={sheetConfig}
            showToast={showToast}
            onConfigSaved={async (cfg) => {
              setSheetConfig(cfg);
              setIsLoadingSheetData(true);
              try {
                const liveData = await fetchLatestFromGoogleSheet(cfg);
                setCases(liveData.cases);
                setPegawaiList(liveData.pegawai);
                setSheetSyncNotice({
                  configured: liveData.configured,
                  message: liveData.message,
                  needsScriptUpdate: liveData.needsScriptUpdate
                });
              } finally {
                setIsLoadingSheetData(false);
              }
            }}
            onRefreshFromSheet={() => refreshLiveSheetData(false)}
          />
        )}

        {currentTab === 'panduan' && (
          <GuideView
            onNavigateToTab={(tab) => handleSelectTab(tab)}
            onOpenNewCase={handleOpenNewCase}
            isReadOnly={isPimpinan}
          />
        )}
      </main>

      {/* Case Detail Modal */}
      {selectedCaseForDetail && (
        <CaseDetailModal
          kasus={selectedCaseForDetail}
          isAnonymized={isAnonymized}
          pegawaiList={pegawaiList}
          onClose={() => setSelectedCaseForDetail(null)}
          onEdit={handleEditCase}
          onPrint={handlePrintCase}
          onAddProgressNote={handleAddProgressNote}
          isReadOnly={authSession.user?.role === 'pimpinan'}
        />
      )}

      {/* Hidden Document for Browser Printing (window.print) */}
      {printConfig && (
        <PrintDocument
          type={printConfig.type}
          kasus={printConfig.kasus}
          daftarKasus={cases}
          periode={printConfig.periode}
          isAnonymized={isAnonymized}
          pegawaiList={pegawaiList}
        />
      )}

        {/* Quiet Government Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                SIPELKA Kabupaten Nagekeo
              </span>
              <span>·</span>
              <span className="font-medium text-blue-900">Dinas PMDP3A</span>
              <span>·</span>
              <span>Mbay, Flores - NTT</span>
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <span>Layanan Sahabat Perempuan & Anak (SAPA 129)</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
