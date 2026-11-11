import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  LogIn,
  AlertCircle,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { loginAdmin } from '../services/authService';
import { AdminUser } from '../types';

const LOGO_NAGEKEO = '/assets/aistudio/Logo-Kabupaten-Nagekeo11-removebg-preview_44ae2cef.png';

interface LoginViewProps {
  onLoginSuccess: (user: AdminUser) => void;
  showToast: (msg: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  showToast
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('admin');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = loginAdmin(usernameOrEmail, password, rememberMe);
      setIsLoading(false);

      if (result.success && result.user) {
        showToast(result.message);
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.message);
      }
    }, 250);
  };

  const handleFillAdminCredentials = () => {
    setUsernameOrEmail('admin');
    setPassword('sipelka2026');
    setErrorMessage(null);
    showToast('Kredensial administrator telah terisi.');
  };

  const handleFillEmailDinas = () => {
    setUsernameOrEmail('bidangpppanagekeo@gmail.com');
    setPassword('sipelka2026');
    setErrorMessage(null);
    showToast('Kredensial email dinas telah terisi.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-3 relative z-10 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_NAGEKEO}
            alt="Logo Kabupaten Nagekeo"
            className="w-10 h-10 object-contain drop-shadow-md shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
              Pemerintah Kabupaten Nagekeo
            </div>
            <div className="text-[11px] text-sky-200 font-medium">
              Dinas Pemberdayaan Masyarakat & Desa, PPPA
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-sky-200 text-xs font-semibold backdrop-blur-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Portal Resmi SIPELKA</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto py-6 relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 text-slate-800">
          {/* Logo & Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-900 to-sky-900 shadow-md mb-3 ring-4 ring-amber-400/20">
              <img
                src={LOGO_NAGEKEO}
                alt="Logo Kabupaten Nagekeo"
                className="w-16 h-16 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              SIPELKA Nagekeo
            </h1>
            <p className="text-xs text-blue-900 font-bold uppercase tracking-wider mt-0.5">
              Sistem Informasi Pelayanan Kasus PPPA
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-[11px] font-semibold">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Akses Khusus Administrator Dinas PMDP3A</span>
            </div>
          </div>

          {/* Error Notification */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username / Email Dinas <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={isLoading}
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="admin atau email dinas"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Gunakan username <span className="font-semibold text-slate-700">admin</span> atau email dinas <span className="font-semibold text-slate-700">bidangpppanagekeo@gmail.com</span>
              </p>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Kata Sandi Administrator <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi (sipelka2026)"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400 font-mono"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                  title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-slate-600 font-medium">
                  Ingat sesi pada peramban ini
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ring-1 ring-amber-400/40 bg-gradient-to-r from-blue-900 via-sky-700 to-blue-800 hover:from-blue-950 hover:to-sky-800 hover:shadow-lg active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akses Administrator...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>Masuk sebagai Administrator</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Admin Credentials Helper */}
          <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Kredensial Akses Dinas</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFillAdminCredentials}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline"
                  title="Isi otomatis user: admin & password: sipelka2026"
                >
                  Isi Otomatis
                </button>
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Username:</span>
                <span className="font-bold text-blue-900">admin</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Email Dinas:</span>
                <span className="font-bold text-slate-800">bidangpppanagekeo@gmail.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Password:</span>
                <span className="font-bold text-amber-700">sipelka2026</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Demi keamanan data identitas korban dan dokumen hukum perkara, hanya Administrator resmi Bidang PPPA Dinas PMDP3A Kabupaten Nagekeo yang memiliki hak akses ke sistem ini.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Credentials & Confidentiality Guarantee */}
      <footer className="max-w-4xl w-full mx-auto py-3 text-center text-xs text-slate-400 relative z-10 border-t border-white/10 space-y-1">
        <div className="flex flex-wrap items-center justify-center gap-3 text-slate-300 font-medium text-[11px]">
          <span>UPTD PPA: 0812-3789-9821</span>
          <span>·</span>
          <span>Unit PPA Polres Nagekeo: 0821-4567-8910</span>
          <span>·</span>
          <span>Layanan SAPA 129</span>
        </div>
        <p className="text-[10px] text-slate-400">
          © 2026 Bidang Pemberdayaan Perempuan & Perlindungan Anak - Dinas PMDP3A Kabupaten Nagekeo, Nusa Tenggara Timur.
        </p>
      </footer>
    </div>
  );
};

