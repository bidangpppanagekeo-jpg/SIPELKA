import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Users,
  FileSpreadsheet,
  Workflow,
  Cloud,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut
} from 'lucide-react';
import { AdminUser } from '../types';
import nagekeoCoastalVista from '../assets/images/nagekeo_coastal_vista_1794886105223.jpg';

const LOGO_NAGEKEO = '/assets/aistudio/Logo-Kabupaten-Nagekeo11-removebg-preview_44ae2cef.png';

export type AppTab =
  | 'dashboard'
  | 'register'
  | 'input'
  | 'laporan'
  | 'sop'
  | 'pegawai'
  | 'integrasi'
  | 'panduan';

interface SidebarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  caseCount: number;
  pegawaiCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  isSheetSynced?: boolean;
  currentUser?: AdminUser | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  caseCount,
  pegawaiCount,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapsed,
  currentUser,
  onLogout
}) => {
  const handleNav = (tab: AppTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const isPimpinan = currentUser?.role === 'pimpinan';

  const navItems: {
    id: AppTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number | null;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'register',
      label: 'Register Kasus',
      icon: FolderKanban,
      count: caseCount > 0 ? caseCount : null
    },
    {
      id: 'input',
      label: 'Input Kasus Baru',
      icon: PlusCircle
    },
    {
      id: 'pegawai',
      label: 'Data Pegawai',
      icon: Users,
      count: pegawaiCount > 0 ? pegawaiCount : null
    },
    {
      id: 'laporan',
      label: 'Laporan Resmi',
      icon: FileSpreadsheet
    },
    {
      id: 'sop',
      label: 'SOP & Rujukan',
      icon: Workflow
    },
    {
      id: 'integrasi',
      label: 'Integrasi Sheet',
      icon: Cloud
    },
    {
      id: 'panduan',
      label: 'Panduan Aplikasi',
      icon: BookOpen
    }
  ];

  const visibleNavItems = isPimpinan
    ? navItems.filter((item) => item.id !== 'input' && item.id !== 'integrasi' && item.id !== 'pegawai')
    : navItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Deep Navy Institutional Sidebar matching reference layout */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#08244B] text-white shadow-xl transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:z-30 shrink-0 overflow-hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[72px]' : 'w-60'}`}
      >
        {/* Top Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden absolute top-3 right-3 z-20 p-1.5 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
          title="Tutup Menu"
          aria-label="Tutup Menu"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Centered Emblem & Brand Header */}
        <div
          className={`relative z-10 shrink-0 ${
            isCollapsed ? 'px-2 pt-5 pb-4' : 'px-4 pt-5 pb-3'
          }`}
        >
          <button
            type="button"
            onClick={() => handleNav('dashboard')}
            className="w-full flex flex-col items-center text-center group focus:outline-none"
            title="SIPELKA Kabupaten Nagekeo - Dinas PMDP3A"
          >
            <img
              src={LOGO_NAGEKEO}
              alt="Logo Kabupaten Nagekeo"
              className={`${
                isCollapsed ? 'w-9 h-9' : 'w-14 h-14'
              } object-contain drop-shadow-md group-hover:scale-105 transition-transform`}
              referrerPolicy="no-referrer"
            />
            {!isCollapsed && (
              <>
                <span className="mt-2 text-xl font-extrabold tracking-wide text-white leading-none">
                  SIPELKA
                </span>
                <span className="mt-1.5 text-[11px] font-medium text-sky-100/85 leading-snug max-w-[190px]">
                  Sistem Informasi Pencatatan & Pelaporan Kasus Kekerasan
                </span>
                <div className="w-full border-t border-white/15 my-3" />
                <div className="leading-tight">
                  <div className="text-[11px] font-bold tracking-wide text-white">
                    DINAS PMDP3A
                  </div>
                  <div className="text-[10.5px] font-medium text-sky-200/85">
                    Kabupaten Nagekeo
                  </div>
                </div>
                <div className="w-full border-t border-white/15 mt-3" />
              </>
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="relative z-10 flex-1 overflow-y-auto px-2.5 py-1 space-y-1 scrollbar-none">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all whitespace-nowrap ${
                  isCollapsed ? 'justify-center px-2' : 'justify-between'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-[#1A73E8] to-[#2B86F8] text-white font-semibold shadow-md shadow-blue-950/40'
                    : 'text-sky-100/85 font-medium hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-sky-200/85'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && typeof item.count === 'number' && (
                  <span
                    className={`text-[11px] font-mono tabular-nums shrink-0 ${
                      isActive ? 'text-sky-100 font-semibold' : 'text-sky-300/80'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Scenic Nagekeo Vista with "Nagekeo Maju Bersama" & Compact Controls */}
        <div className="relative shrink-0 mt-auto">
          {!isCollapsed && (
            <div className="relative h-40 w-full overflow-hidden select-none">
              <img
                src={nagekeoCoastalVista}
                alt="Pemandangan Pesisir dan Gunung Nagekeo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              {/* Seamless Navy Top-to-Bottom Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#08244B] via-[#08244B]/30 to-slate-950/65" />
              <div className="absolute inset-x-0 bottom-3 px-4 text-center">
                <p
                  className="text-white text-lg font-semibold italic tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)] leading-tight"
                  style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}
                >
                  Nagekeo
                  <br />
                  Maju Bersama
                </p>
              </div>
            </div>
          )}

          {/* Subtle Action Bar (Logout & Collapse) */}
          <div className="relative z-10 bg-[#051936] border-t border-white/10 px-2.5 py-2 flex items-center justify-between gap-1.5">
            {!isCollapsed ? (
              <>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-rose-200 hover:text-white hover:bg-rose-600/30 transition-colors whitespace-nowrap"
                  title="Keluar dari sesi SIPELKA"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>

                <button
                  type="button"
                  onClick={onToggleCollapsed}
                  className="hidden lg:inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium text-sky-200/80 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                  title="Ciutkan Menu Samping"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Ciutkan</span>
                </button>
              </>
            ) : (
              <div className="w-full flex flex-col items-center gap-1.5 py-1">
                <button
                  type="button"
                  onClick={onToggleCollapsed}
                  className="hidden lg:flex p-1.5 rounded-md text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
                  title="Perlebar Menu Samping"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 rounded-md text-rose-300 hover:text-white hover:bg-rose-600/30 transition-colors"
                  title="Keluar Aplikasi"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
