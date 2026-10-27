import React from 'react';
import { PlusCircle, Eye, EyeOff, Users, FileSpreadsheet } from 'lucide-react';
import sealImg from '../assets/images/kabupaten_nagekeo_logo_1792733971363.jpg';

interface HeaderProps {
  currentTab: 'dashboard' | 'register' | 'input' | 'laporan' | 'sop' | 'pegawai' | 'integrasi';
  onSelectTab: (tab: 'dashboard' | 'register' | 'input' | 'laporan' | 'sop' | 'pegawai' | 'integrasi') => void;
  isAnonymized: boolean;
  onToggleAnonymized: () => void;
  onOpenNewCase: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isAnonymized,
  onToggleAnonymized,
  onOpenNewCase
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
        >
          <img
            src={sealImg}
            alt="Emblem Dinas PMDP3A Nagekeo"
            className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-xs shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-blue-950 whitespace-nowrap shrink-0 group-hover:text-blue-700 transition-colors">
              SIPELKA Nagekeo
            </span>
            <span className="text-[10px] font-bold text-sky-700 tracking-wider uppercase -mt-0.5 hidden sm:inline">
              Dinas PMDP3A
            </span>
          </div>
        </button>

        {/* Zone 2: Nav links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-slate-600">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 border-b-2 ${
              currentTab === 'dashboard'
                ? 'border-blue-600 text-blue-900 font-bold'
                : 'border-transparent hover:text-blue-700'
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => onSelectTab('register')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 border-b-2 ${
              currentTab === 'register'
                ? 'border-blue-600 text-blue-900 font-bold'
                : 'border-transparent hover:text-blue-700'
            }`}
          >
            Buku Register
          </button>
          <button
            onClick={() => onSelectTab('input')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 border-b-2 ${
              currentTab === 'input'
                ? 'border-blue-600 text-blue-900 font-bold'
                : 'border-transparent hover:text-blue-700'
            }`}
          >
            Input Kasus
          </button>
          <button
            onClick={() => onSelectTab('pegawai')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'pegawai'
                ? 'border-blue-600 text-blue-900 font-bold'
                : 'border-transparent hover:text-blue-700'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-700" />
            <span>Data Pegawai</span>
          </button>
          <button
            onClick={() => onSelectTab('laporan')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 border-b-2 ${
              currentTab === 'laporan'
                ? 'border-blue-600 text-blue-900 font-bold'
                : 'border-transparent hover:text-blue-700'
            }`}
          >
            Rekap & Laporan
          </button>
          <button
            onClick={() => onSelectTab('sop')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 border-b-2 ${
              currentTab === 'sop'
                ? 'border-blue-600 text-blue-900 font-bold'
                : 'border-transparent hover:text-blue-700'
            }`}
          >
            SOP & Jejaring
          </button>
          <button
            onClick={() => onSelectTab('integrasi')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'integrasi'
                ? 'border-blue-600 text-blue-900 font-bold'
                : 'border-transparent hover:text-blue-700'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Integrasi Sheet</span>
          </button>
        </nav>

        {/* Zone 3: Privacy toggle & CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleAnonymized}
            title={isAnonymized ? 'Mode Samaran Aktif (Nama Disamarkan)' : 'Mode Lengkap Aktif'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap shrink-0 ${
              isAnonymized
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-white text-slate-600 border-blue-200 hover:bg-blue-50/60'
            }`}
          >
            {isAnonymized ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Sensor Nama</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">Nama Terbuka</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenNewCase}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-700 via-sky-600 to-blue-800 hover:from-blue-800 hover:to-sky-700 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap shrink-0 ring-1 ring-amber-400/30"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>Catat Kasus Baru</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-100 gap-4 text-xs font-medium text-slate-600 scrollbar-none">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`whitespace-nowrap pb-1 ${currentTab === 'dashboard' ? 'text-blue-900 font-bold border-b-2 border-blue-900' : ''}`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => onSelectTab('register')}
          className={`whitespace-nowrap pb-1 ${currentTab === 'register' ? 'text-blue-900 font-bold border-b-2 border-blue-900' : ''}`}
        >
          Register Kasus
        </button>
        <button
          onClick={() => onSelectTab('input')}
          className={`whitespace-nowrap pb-1 ${currentTab === 'input' ? 'text-blue-900 font-bold border-b-2 border-blue-900' : ''}`}
        >
          Input Kasus
        </button>
        <button
          onClick={() => onSelectTab('pegawai')}
          className={`whitespace-nowrap pb-1 ${currentTab === 'pegawai' ? 'text-blue-900 font-bold border-b-2 border-blue-900' : ''}`}
        >
          Data Pegawai
        </button>
        <button
          onClick={() => onSelectTab('laporan')}
          className={`whitespace-nowrap pb-1 ${currentTab === 'laporan' ? 'text-blue-900 font-bold border-b-2 border-blue-900' : ''}`}
        >
          Rekap & Laporan
        </button>
        <button
          onClick={() => onSelectTab('sop')}
          className={`whitespace-nowrap pb-1 ${currentTab === 'sop' ? 'text-blue-900 font-bold border-b-2 border-blue-900' : ''}`}
        >
          SOP & Jejaring
        </button>
        <button
          onClick={() => onSelectTab('integrasi')}
          className={`whitespace-nowrap pb-1 ${currentTab === 'integrasi' ? 'text-blue-900 font-bold border-b-2 border-blue-900' : ''}`}
        >
          Integrasi Sheet
        </button>
      </div>
    </header>
  );
};
