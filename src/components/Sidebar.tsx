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
        } ${isCollapsed ? 'lg:w-20' : 'w-72'}`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-100 bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 text-white relative">
          <button
            onClick={() => handleNav('dashboard')}
            className={`flex items-center gap-3 text-left group overflow-hidden focus:outline-none ${
              isCollapsed ? 'justify-center w-full' : ''
            }`}
            title="SIPELKA Kabupaten Nagekeo - Dinas PMDP3A"
          >
            <img
              src={LOGO_NAGEKEO}
              alt="Logo Kabupaten Nagekeo"
              className="w-11 h-11 object-contain shrink-0 drop-shadow-md group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-white truncate">
                    SIPELKA
                  </span>
                  <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                    PPPA
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-sky-200 truncate -mt-0.5">
                  Kabupaten Nagekeo
                </span>
                <span className="text-[9px] text-slate-300 uppercase tracking-wider truncate">
                  Dinas PMDP3A
                </span>
              </div>
            )}
          </button>

          {/* Close button for Mobile Drawer */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Tutup Menu"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Subtle bottom golden accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-sky-300 to-amber-400" />
        </div>

        {/* Quick Action in Expanded Sidebar */}
        {!isCollapsed && (
          <div className="p-3 border-b border-slate-100 bg-slate-50/70">
            <button
              onClick={() => handleNav('input')}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-700 via-sky-600 to-blue-800 hover:from-blue-800 hover:to-sky-700 rounded-xl shadow-xs hover:shadow-md transition-all ring-1 ring-amber-400/30 group"
            >
              <PlusCircle className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>+ Catat Kasus Baru</span>
            </button>
          </div>
        )}

        {/* Navigation Menus List (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {/* Group Section Header */}
              {!isCollapsed ? (
                <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {group.groupLabel}
                </div>
              ) : (
                <div className="w-6 mx-auto my-2 border-b border-slate-200" />
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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                      isCollapsed ? 'justify-center' : 'justify-between'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-900 to-sky-900 text-white font-bold shadow-sm shadow-blue-950/15'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-amber-300'
                            : 'text-slate-500 group-hover:text-blue-700'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {/* Badge when expanded */}
                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
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
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-md" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Officer Profile & Desktop Collapse Toggle */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80">
          {!isCollapsed ? (
            <div className="space-y-3">
              {/* Officer Account Card */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-200">
                  ADM
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-800 truncate">
                    {currentUser?.nama || 'Administrator Bidang PPPA'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate font-mono">
                    {currentUser?.email || 'bidangpppanagekeo@gmail.com'}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-xl transition-all shadow-2xs group"
                title="Keluar dari sesi administrator"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                <span>Keluar Aplikasi (Logout)</span>
              </button>

              {/* Security & Sync Mini Status */}
              <div className="flex items-center justify-between px-1 text-[10px] text-slate-500 font-medium">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sistem Aman</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sheet Terhubung</span>
                </div>
              </div>

              {/* Desktop Collapse Button */}
              <button
                onClick={onToggleCollapsed}
                className="hidden lg:flex w-full items-center justify-center gap-2 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                title="Persempit Menu Samping"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Ciutkan Menu</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5">
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
                className="hidden lg:flex p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
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
