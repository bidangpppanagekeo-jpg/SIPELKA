import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Eye,
  EyeOff,
  Calendar,
  Layers,
  ChevronDown,
  BarChart2,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { AppTab } from './Sidebar';
import { AdminUser } from '../types';
import avatarPetugasImg from '../assets/images/avatar_petugas_nagekeo_1794886105373.jpg';

interface HeaderProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  isAnonymized: boolean;
  onToggleAnonymized: () => void;
  onToggleMobileSidebar: () => void;
  selectedYear: string;
  onChangeYear: (year: string) => void;
  availableYears: string[];
  selectedQuarter: string;
  onChangeQuarter: (quarter: string) => void;
  currentUser?: AdminUser | null;
  onLogout: () => void;
}

const TAB_META: Record<AppTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Selamat Datang di SIPELKA',
    subtitle: 'Dashboard Pemantauan Kasus Kekerasan Perempuan & Anak'
  },
  register: {
    title: 'Buku Register Kasus',
    subtitle: 'Daftar Perkara Kekerasan Terpadu dengan Aksi Edit, Cetak & Ekspor'
  },
  input: {
    title: 'Input & Registrasi Kasus Baru',
    subtitle: 'Formulir Terpadu 5 Bagian dengan Validasi Data & Tim Pendamping'
  },
  pegawai: {
    title: 'Data Pegawai & Tim PPPA',
    subtitle: 'Manajemen Tenaga Pendamping, Konselor, Penyidik Unit PPA & Medis Visum'
  },
  laporan: {
    title: 'Rekap & Laporan Resmi',
    subtitle: 'Cetak Berita Acara Pengaduan & Rekapitulasi Standar SIMFONI PPA'
  },
  sop: {
    title: 'SOP & Jejaring Rujukan',
    subtitle: 'Alur Penanganan 6 Tahapan & Direktori Layanan Darurat Kabupaten Nagekeo'
  },
  integrasi: {
    title: 'Integrasi Google Sheet',
    subtitle: 'Sinkronisasi Dua Arah Real-Time antara Aplikasi Web dan Spreadsheet'
  },
  panduan: {
    title: 'Panduan Penginputan & Pemakaian',
    subtitle: 'Tata Cara Pengisian Formulir, Sinkronisasi Pegawai & Pelaporan Resmi'
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isAnonymized,
  onToggleAnonymized,
  onToggleMobileSidebar,
  selectedYear,
  onChangeYear,
  availableYears,
  selectedQuarter,
  onChangeQuarter,
  currentUser,
  onLogout
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentMeta = TAB_META[currentTab] || {
    title: 'Selamat Datang di SIPELKA',
    subtitle: 'Dashboard Pemantauan Kasus Kekerasan Perempuan & Anak'
  };

  const displayRoleLabel =
    currentUser?.role === 'pimpinan'
      ? 'Pimpinan'
      : currentUser?.role === 'superadmin'
      ? 'Super Admin'
      : 'Admin PPPA';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-7 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left Section: Mobile Menu Toggle + Blue Brand Icon + Welcome Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors shrink-0"
            title="Buka Menu Samping"
            aria-label="Buka Menu Samping"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className="hidden sm:flex w-10 h-10 rounded-xl bg-blue-50 text-[#1A73E8] border border-blue-100 items-center justify-center shrink-0 hover:bg-blue-100/70 transition-colors"
            title="Dashboard SIPELKA"
          >
            <BarChart2 className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-extrabold text-[#0B254B] tracking-tight truncate leading-tight">
              {currentMeta.title}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium truncate leading-snug mt-0.5">
              {currentMeta.subtitle}
              <span className="hidden md:inline text-slate-400"> · </span>
              <span className="hidden md:inline text-slate-500">
                Dinas Pemberdayaan Masyarakat Desa, PPPA Kabupaten Nagekeo
              </span>
            </p>
          </div>
        </div>

        {/* Right Section: Year Selector, Period Selector, Privacy Toggle, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
          {currentTab === 'dashboard' && (
            <>
              {/* Tahun Data Selector */}
              <label className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] font-medium text-slate-400">Tahun</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => onChangeYear(e.target.value)}
                    aria-label="Pilih Tahun Kasus"
                    className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer pr-1 -ml-0.5 tabular-nums"
                  >
                    <option value="Semua">Semua</option>
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              {/* Periode Triwulan Selector */}
              <label className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] font-medium text-slate-400">Periode</span>
                  <select
                    value={selectedQuarter}
                    onChange={(e) => onChangeQuarter(e.target.value)}
                    aria-label="Pilih Periode Triwulan"
                    className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer pr-1 -ml-0.5"
                  >
                    <option value="Semua">Semua Triwulan</option>
                    <option value="TW1">Triwulan I</option>
                    <option value="TW2">Triwulan II</option>
                    <option value="TW3">Triwulan III</option>
                    <option value="TW4">Triwulan IV</option>
                  </select>
                </div>
              </label>
            </>
          )}

          {/* Privacy Sensor Toggle */}
          <button
            type="button"
            onClick={onToggleAnonymized}
            title={
              isAnonymized
                ? 'Mode Sensor Privasi Aktif (Nama Disamarkan)'
                : 'Mode Nama Terbuka Aktif'
            }
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap shrink-0 ${
              isAnonymized
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isAnonymized ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden md:inline">Sensor Nama</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-[#1A73E8]" />
                <span className="hidden md:inline">Nama Terbuka</span>
              </>
            )}
          </button>

          {/* User Profile Dropdown matching reference top-right avatar */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors whitespace-nowrap shrink-0"
            >
              <img
                src={avatarPetugasImg}
                alt={currentUser?.nama || 'Profil Petugas'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-sky-200 shrink-0"
              />
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                {displayRoleLabel}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser?.nama || 'Petugas SIPELKA'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {currentUser?.jabatan || 'Bidang PPPA Dinas PMDP3A'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-700 font-semibold mt-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sesi Terverifikasi</span>
                  </div>
                </div>
                <div className="px-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar dari Aplikasi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
