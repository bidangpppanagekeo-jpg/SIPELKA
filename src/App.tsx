/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { KasusKekerasan, StatusPenanganan, CatatanPenanganan } from './types';
import {
  getStoredCases,
  saveCase,
  deleteCase,
  addProgressNote,
  getAnonymizedPreference,
  setAnonymizedPreference,
  resetDefaultCases
} from './services/storageService';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CaseListView } from './components/CaseListView';
import { CaseFormView } from './components/CaseFormView';
import { OfficialReportView } from './components/OfficialReportView';
import { SopNetworkView } from './components/SopNetworkView';
import { CaseDetailModal } from './components/CaseDetailModal';
import { PrintDocument } from './components/PrintDocument';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'register' | 'input' | 'laporan' | 'sop'>('dashboard');
  const [cases, setCases] = useState<KasusKekerasan[]>([]);
  const [isAnonymized, setIsAnonymized] = useState<boolean>(false);
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<KasusKekerasan | null>(null);
  const [caseToEdit, setCaseToEdit] = useState<KasusKekerasan | null>(null);

  // Printing state
  const [printConfig, setPrintConfig] = useState<{
    type: 'berita_acara' | 'lembar_kasus' | 'laporan_bulanan';
    kasus?: KasusKekerasan;
    periode?: string;
  } | null>(null);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadedCases = getStoredCases();
    setCases(loadedCases);
    setIsAnonymized(getAnonymizedPreference());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggleAnonymized = () => {
    const nextVal = !isAnonymized;
    setIsAnonymized(nextVal);
    setAnonymizedPreference(nextVal);
    showToast(nextVal ? 'Mode Sensor Privasi Nama Diaktifkan' : 'Mode Nama Lengkap Diaktifkan');
  };

  const handleOpenNewCase = () => {
    setCaseToEdit(null);
    setCurrentTab('input');
  };

  const handleEditCase = (c: KasusKekerasan) => {
    setCaseToEdit(c);
    setSelectedCaseForDetail(null);
    setCurrentTab('input');
  };

  const handleSaveCase = (savedCase: KasusKekerasan) => {
    const updatedList = saveCase(savedCase);
    setCases(updatedList);
    setCaseToEdit(null);
    setCurrentTab('register');
    showToast(`Berkas perkara ${savedCase.nomorRegistrasi} berhasil disimpan.`);
  };

  const handleDeleteCase = (id: string) => {
    const updatedList = deleteCase(id);
    setCases(updatedList);
    if (selectedCaseForDetail?.id === id) {
      setSelectedCaseForDetail(null);
    }
    showToast('Data berkas perkara berhasil dihapus dari register.');
  };

  const handleAddProgressNote = (
    caseId: string,
    note: Omit<CatatanPenanganan, 'id'>,
    newStatus?: StatusPenanganan
  ) => {
    const updatedList = addProgressNote(caseId, note, newStatus);
    setCases(updatedList);
    const updatedCase = updatedList.find((c) => c.id === caseId) || null;
    setSelectedCaseForDetail(updatedCase);
    showToast('Catatan tindakan pendampingan berhasil ditambahkan.');
  };

  const handleResetData = () => {
    if (window.confirm('Muat ulang data sampel kasus di Kabupaten Nagekeo?')) {
      const def = resetDefaultCases();
      setCases(def);
      showToast('Data telah direset ke daftar sampel kasus Kabupaten Nagekeo.');
    }
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'input' && !caseToEdit) {
            setCaseToEdit(null);
          }
          setCurrentTab(tab);
        }}
        isAnonymized={isAnonymized}
        onToggleAnonymized={handleToggleAnonymized}
        onOpenNewCase={handleOpenNewCase}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            cases={cases}
            isAnonymized={isAnonymized}
            onSelectCase={(c) => setSelectedCaseForDetail(c)}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'register' && (
          <CaseListView
            cases={cases}
            isAnonymized={isAnonymized}
            onSelectCase={(c) => setSelectedCaseForDetail(c)}
            onEditCase={handleEditCase}
            onDeleteCase={handleDeleteCase}
            onPrintCase={handlePrintCase}
            onOpenNewCase={handleOpenNewCase}
            onResetData={handleResetData}
          />
        )}

        {currentTab === 'input' && (
          <CaseFormView
            initialCase={caseToEdit}
            allCases={cases}
            onSaveCase={handleSaveCase}
            onCancel={() => {
              setCaseToEdit(null);
              setCurrentTab('register');
            }}
          />
        )}

        {currentTab === 'laporan' && (
          <OfficialReportView
            cases={cases}
            isAnonymized={isAnonymized}
            onPrintOfficialReport={handlePrintOfficialReport}
          />
        )}

        {currentTab === 'sop' && <SopNetworkView />}
      </main>

      {/* Case Detail Modal */}
      {selectedCaseForDetail && (
        <CaseDetailModal
          kasus={selectedCaseForDetail}
          isAnonymized={isAnonymized}
          onClose={() => setSelectedCaseForDetail(null)}
          onEdit={handleEditCase}
          onPrint={handlePrintCase}
          onAddProgressNote={handleAddProgressNote}
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
            <span className="font-medium text-purple-900">Dinas PMDP3A</span>
            <span>·</span>
            <span>Mbay, Flores - NTT</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>UPTD PPA: 0812-3789-9821</span>
            <span>·</span>
            <span>Unit PPA Polres: 0821-4567-8910</span>
            <span>·</span>
            <span>SAPA 129</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
