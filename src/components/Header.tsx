import React from 'react';
import {
  Menu,
  PlusCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  LogOut,
  Share2,
  Check
} from 'lucide-react';
import { AppTab } from './Sidebar';

interface HeaderProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  isAnonymized: boolean;
  onToggleAnonymized: () => void;
  onOpenNewCase: () => void;
  onToggleMobileSidebar: () => void;
  onLogout?: () => void;
}

const TAB_META: Record<AppTab, { title: string; subtitle: string; category: string }> = {
  dashboard: {
    title: 'Dashboard Ringkasan',
    subtitle: 'Statistik, pemetaan wilayah 7 kecamatan, dan pemantauan kasus aktif',
    category: 'Menu Utama'
  },
  register: {
    title: 'Buku Register Kasus',
    subtitle: 'Daftar rekam medis & hukum perkara kekerasan dengan aksi edit, hapus & cetak',
    category: 'Menu Utama'
  },
  input: {
    title: 'Input & Registrasi Kasus',
    subtitle: 'Formulir terpadu 5 bagian dengan validasi keamanan dan koneksi data pegawai',
    category: 'Menu Utama'
  },
  pegawai: {
    title: 'Data Pegawai & Tim PPPA',
    subtitle: 'Manajemen tenaga pendamping utama, psikolog, konselor, penyidik kepolisian & medis',
    category: 'Manajemen & Tim'
  },
  laporan: {
    title: 'Rekap & Laporan Resmi',
    subtitle: 'Cetak berita acara penerimaan pengaduan dan rekapitulasi data SIMFONI PPA',
    category: 'Manajemen & Tim'
  },
  sop: {
    title: 'SOP & Jejaring Rujukan',
    subtitle: 'Alur penanganan 6 tahapan terpadu dan direktori kontak darurat Kabupaten Nagekeo',
    category: 'Layanan & Sistem'
  },
  integrasi: {
    title: 'Integrasi Google Sheet',
    subtitle: 'Sinkronisasi dua arah real-time antara aplikasi web dan spreadsheet resmi',
    category: 'Layanan & Sistem'
  },
  panduan: {
    title: 'Panduan Penginputan & Pemakaian',
    subtitle: 'Tata cara pengisian 5 bagian formulir, sinkronisasi pegawai, dan panduan teknis',
    category: 'Bantuan'
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isAnonymized,
  onToggleAnonymized,
  onOpenNewCase,
  onToggleMobileSidebar,
  onLogout
}) => {
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleShareLink = () => {
    const url = window.location.href.includes('localhost')
      ? 'https://ais-pre-r5uv2pp4ysaj6ryuz5mmih-368993699692.asia-northeast1.run.app'
      : window.location.href.split('?')[0];

    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {
      setCopiedLink(true);
    });
  };

  const currentMeta = TAB_META[currentTab] || {
    title: 'SIPELKA Nagekeo',
    subtitle: 'Dinas PMDP3A Kabupaten Nagekeo',
    category: 'Sistem'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Mobile Hamburger Button */}
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-slate-100 transition-colors shrink-0"
            title="Buka Menu Samping"
            aria-label="Buka Menu Samping"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb & Section Title */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <span className="hover:text-blue-800 cursor-pointer hidden sm:inline" onClick={() => onSelectTab('dashboard')}>
                SIPELKA Nagekeo
              </span>
              <ChevronRight className="w-3 h-3 text-slate-300 hidden sm:inline" />
              <span className="text-blue-900 font-bold uppercase tracking-wider text-[10px] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {currentMeta.category}
              </span>
            </div>
            <div className="flex items-baseline gap-2 truncate">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
                {currentMeta.title}
              </h1>
              <span className="text-xs text-slate-500 font-medium hidden xl:inline truncate">
                — {currentMeta.subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Privacy Toggle, Cyber Shield, and Quick Action */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Privacy Toggle Button */}
          <button
            type="button"
            onClick={onToggleAnonymized}
            title={isAnonymized ? 'Mode Sensor Privasi Aktif (Nama Disamarkan)' : 'Mode Nama Terbuka Aktif'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap shrink-0 shadow-2xs ${
              isAnonymized
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-amber-100'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
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

          {/* Cyber Security Status Badge */}
          <div
            title="Keamanan Siber Aktif: Sanitasi Anti-SQL Injection, Proteksi Inspeksi & Keamanan Data Korban"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/90 shadow-2xs cursor-default select-none"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline text-[11px] font-bold text-emerald-800">
              Keamanan Aktif
            </span>
          </div>

          {/* Share Link Button */}
          <button
            type="button"
            onClick={handleShareLink}
            title="Salin tautan aplikasi SIPELKA untuk dibagikan ke email / rekan kerja lain"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all shadow-2xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Link Disalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden md:inline">Bagikan Link</span>
              </>
            )}
          </button>

          {/* Guide Quick Button */}
          {currentTab !== 'panduan' && (
            <button
              onClick={() => onSelectTab('panduan')}
              title="Buka Panduan Aplikasi"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Panduan</span>
            </button>
          )}

          {/* Primary Action Button: Catat Kasus Baru */}
          <button
            type="button"
            onClick={onOpenNewCase}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-700 via-sky-600 to-blue-800 hover:from-blue-800 hover:to-sky-700 rounded-xl shadow-xs hover:shadow-md transition-all whitespace-nowrap shrink-0 ring-1 ring-amber-400/40"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span className="hidden xs:inline">+ Catat Kasus Baru</span>
            <span className="xs:hidden">Catat Kasus</span>
          </button>

          {/* Quick Logout Button */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Keluar dari Aplikasi (Logout)"
              className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all shadow-2xs shrink-0"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
