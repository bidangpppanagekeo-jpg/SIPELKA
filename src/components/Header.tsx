import React from 'react';
import { ShieldCheck, PlusCircle, Eye, EyeOff } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'register' | 'input' | 'laporan' | 'sop';
  onSelectTab: (tab: 'dashboard' | 'register' | 'input' | 'laporan' | 'sop') => void;
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element wordmark in display face) */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-900 text-amber-400 flex items-center justify-center font-bold text-base shadow-sm">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            SIPELKA Nagekeo
          </span>
        </button>

        {/* Zone 2: 4–5 single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'dashboard'
                ? 'border-indigo-900 text-indigo-950 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => onSelectTab('register')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'register'
                ? 'border-indigo-900 text-indigo-950 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Buku Register
          </button>
          <button
            onClick={() => onSelectTab('input')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'input'
                ? 'border-indigo-900 text-indigo-950 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Input Kasus
          </button>
          <button
            onClick={() => onSelectTab('laporan')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'laporan'
                ? 'border-indigo-900 text-indigo-950 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Rekap & Laporan
          </button>
          <button
            onClick={() => onSelectTab('sop')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'sop'
                ? 'border-indigo-900 text-indigo-950 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            SOP & Jejaring
          </button>
        </nav>

        {/* Zone 3: 1 primary action & subtle privacy toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleAnonymized}
            title={isAnonymized ? 'Mode Samaran Aktif (Nama Disamarkan)' : 'Mode Lengkap Aktif'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              isAnonymized
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isAnonymized ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Sensor Nama</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Nama Terbuka</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenNewCase}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-900 rounded-lg hover:bg-indigo-950 shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>Catat Kasus Baru</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-slate-100 gap-4 text-xs font-medium text-slate-600 scrollbar-none">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`whitespace-nowrap pb-1 ${currentTab === 'dashboard' ? 'text-indigo-900 font-bold border-b-2 border-indigo-900' : ''}`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => onSelectTab('register')}
          className={`whitespace-nowrap pb-1 ${currentTab === 'register' ? 'text-indigo-900 font-bold border-b-2 border-indigo-900' : ''}`}
        >
          Register Kasus
        </button>
        <button
          onClick={() => onSelectTab('input')}
          className={`whitespace-nowrap pb-1 ${currentTab === 'input' ? 'text-indigo-900 font-bold border-b-2 border-indigo-900' : ''}`}
        >
          Input Kasus
        </button>
        <button
          onClick={() => onSelectTab('laporan')}
          className={`whitespace-nowrap pb-1 ${currentTab === 'laporan' ? 'text-indigo-900 font-bold border-b-2 border-indigo-900' : ''}`}
        >
          Rekap & Laporan
        </button>
        <button
          onClick={() => onSelectTab('sop')}
          className={`whitespace-nowrap pb-1 ${currentTab === 'sop' ? 'text-indigo-900 font-bold border-b-2 border-indigo-900' : ''}`}
        >
          SOP & Jejaring
        </button>
      </div>
    </header>
  );
};
