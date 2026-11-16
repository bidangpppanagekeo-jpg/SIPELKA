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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut
} from 'lucide-react';
import { AdminUser } from '../types';
import latarIbuAnakImg from '../assets/images/latar_ibu_anak_nagekeo_1794803688210.jpg';

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
  isSheetSynced = true,
  currentUser,
  onLogout
}) => {
  const handleNav = (tab: AppTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const navGroups = [
    {
      groupLabel: 'Menu Utama',
      items: [
        {
          id: 'dashboard' as AppTab,
          label: 'Dashboard Ringkasan',
          shortLabel: 'Dashboard',
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: 'register' as AppTab,
          label: 'Buku Register Kasus',
          shortLabel: 'Register',
          icon: FolderKanban,
          badge: caseCount > 0 ? `${caseCount}` : null,
          badgeColor: 'bg-blue-100 text-blue-800'
        },
        {
          id: 'input' as AppTab,
          label: 'Input Kasus Baru',
          shortLabel: 'Input Kasus',
          icon: PlusCircle,
          badge: 'Baru',
          badgeColor: 'bg-amber-100 text-amber-900 font-bold'
        }
      ]
    },
    {
      groupLabel: 'Manajemen & Tim',
      items: [
        {
          id: 'pegawai' as AppTab,
          label: 'Data Pegawai & Tim PPPA',
          shortLabel: 'Pegawai',
          icon: Users,
          badge: pegawaiCount > 0 ? `${pegawaiCount}` : null,
          badgeColor: 'bg-sky-100 text-sky-800'
        },
        {
          id: 'laporan' as AppTab,
          label: 'Rekap & Laporan Resmi',
          shortLabel: 'Laporan',
          icon: FileSpreadsheet,
          badge: null
        }
      ]
    },
    {
      groupLabel: 'Layanan & Sistem',
      items: [
        {
          id: 'sop' as AppTab,
          label: 'SOP & Jejaring Rujukan',
          shortLabel: 'SOP & Rujukan',
          icon: Workflow,
          badge: null
        },
        {
          id: 'integrasi' as AppTab,
          label: 'Integrasi Google Sheet',
          shortLabel: 'Google Sheet',
          icon: Cloud,
          badge: '2-Arah',
          badgeColor: 'bg-emerald-100 text-emerald-800'
        }
      ]
    },
    {
      groupLabel: 'Bantuan',
      items: [
        {
          id: 'panduan' as AppTab,
          label: 'Panduan Aplikasi',
          shortLabel: 'Panduan',
          icon: BookOpen,
          badge: '5 Langkah',
          badgeColor: 'bg-amber-100 text-amber-800'
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/90 shadow-sm transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:z-30 shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-16' : 'w-64'}`}
      >
        {/* Sidebar Brand Header (Biru Muda) */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-sky-300 bg-gradient-to-r from-sky-200 via-sky-100 to-blue-200 text-sky-950 relative shrink-0">
          <button
            onClick={() => handleNav('dashboard')}
            className={`flex items-center gap-2.5 text-left group overflow-hidden focus:outline-none ${
              isCollapsed ? 'justify-center w-full' : ''
            }`}
            title="SIPELKA Kabupaten Nagekeo - Dinas PMDP3A"
          >
            <img
              src={LOGO_NAGEKEO}
              alt="Logo Kabupaten Nagekeo"
              className="w-8 h-8 object-contain shrink-0 drop-shadow-sm group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold tracking-tight text-sky-950 truncate">
                    SIPELKA
                  </span>
                  <span className="text-[9px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                    PPPA
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-sky-800 truncate -mt-0.5">
                  Kab. Nagekeo · Dinas PMDP3A
                </span>
              </div>
            )}
          </button>

          {/* Close button for Mobile Drawer */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded-lg text-sky-800 hover:text-sky-950 hover:bg-white/60 transition-colors"
            title="Tutup Menu"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Subtle bottom sky-gold accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500 via-cyan-400 to-amber-400" />
        </div>

        {/* Navigation Menus List with Decorative Mother & Child + Nagekeo Rice Fields Backdrop */}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          {!isCollapsed && (
            <div
              className="absolute inset-x-0 bottom-0 h-72 pointer-events-none select-none z-0 overflow-hidden"
              aria-hidden="true"
            >
              <img
                src={latarIbuAnakImg}
                alt="Latar Ibu dan Anak dengan Pemandangan Sawah Nagekeo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center opacity-85 brightness-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white via-white/35 to-transparent" />
            </div>
          )}

          <div className="relative z-10 flex-1 overflow-y-auto px-2.5 py-2.5 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-200">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-0.5">
                {/* Group Section Header */}
                {!isCollapsed ? (
                  <div className="px-2.5 pb-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500">
                    {group.groupLabel}
                  </div>
                ) : (
                  <div className="w-6 mx-auto my-1.5 border-b border-slate-200" />
                )}

                {/* Group Nav Items */}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group relative ${
                        isCollapsed ? 'justify-center' : 'justify-between'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold shadow-xs'
                          : 'text-slate-700 hover:bg-white/85 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-amber-200'
                              : 'text-slate-500 group-hover:text-sky-600'
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {/* Badge when expanded */}
                      {!isCollapsed && item.badge && (
                        <span
                          className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 leading-none ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeColor || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Active Indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1 bottom-1 w-1 bg-amber-400 rounded-r-md" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer: Compact Officer Profile, Logout & Collapse Toggle */}
        <div className="p-2.5 border-t border-slate-200 bg-slate-50/90 shrink-0">
          {!isCollapsed ? (
            <div className="space-y-2">
              {/* Officer Account Card */}
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-[11px] shrink-0 border border-blue-200 uppercase">
                  {currentUser?.nama
                    ? currentUser.nama
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                    : 'OP'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-800 truncate leading-tight">
                    {currentUser?.nama || 'Petugas SIPELKA'}
                  </div>
                  <div className="text-[9.5px] text-slate-500 truncate font-mono leading-tight">
                    {currentUser?.email || 'bidangpppanagekeo@gmail.com'}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-lg transition-all shadow-2xs group"
                title="Keluar dari sesi administrator"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                <span>Keluar Aplikasi (Logout)</span>
              </button>

              {/* Status & Desktop Collapse Toggle in One Clean Row */}
              <div className="flex items-center justify-between px-1 pt-0.5 text-[10px] text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Aman</span>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Sheet</span>
                  </span>
                </div>

                <button
                  onClick={onToggleCollapsed}
                  className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded transition-colors"
                  title="Persempit Menu Samping"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Ciutkan</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={onLogout}
                className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200 transition-colors"
                title="Keluar Aplikasi (Logout)"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
              </button>
              <button
                onClick={onToggleCollapsed}
                className="hidden lg:flex p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                title="Perlebar Menu Samping"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div
                className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200"
                title="Keamanan Siber Aktif & Sheet Terhubung"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
