'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { UserRole, UserProfile } from '@/types';
import {
  Layers,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, availableUsers } = useCluster();

  const [email, setEmail] = useState('pm@indotek.co.id');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Login gagal. Periksa kembali email dan password.');
      }
    }, 300);
  };

  const handleQuickLogin = (user: UserProfile) => {
    setEmail(user.email);
    setPassword('password123');
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      login(user.email, 'password123', user.role);
      setIsLoading(false);
    }, 250);
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
      case 'PROJECT_MANAGER':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/60';
      case 'ESTIMATOR':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'FINANCE':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      case 'PROCUREMENT':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
      {/* LEFT COLUMN: BRAND HERO & OVERVIEW */}
      <div className="lg:w-5/12 bg-[#0c1220] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Top Header */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">
                PT INDOTEK BUANA KARYA
              </h1>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase block">
                FTTH Enterprise Hub
              </span>
            </div>
          </div>

          <div className="space-y-4 my-8 lg:my-12">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Multi-Role Governance & Approval Matrix</span>
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug text-white">
              Sistem Manajemen Proyek FTTH Multi-Vendor
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              Solusi terintegrasi untuk pengolahan BOQ SPK Vendor, estimasi jasa mandor borongan, pengadaan material aksesoris, serta verifikasi laporan progress harian (DPR).
            </p>
          </div>
        </div>

        {/* Key Pillars */}
        <div className="space-y-2.5 pt-6 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>Multi-Level Approval</strong>: SPK Mandor, PO Material, & Termin</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>Audit Trail Lengkap</strong>: Riwayat waktu, approver, & catatan verifikasi</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>Role-Based Access Control</strong>: Hak akses ketat sesuai divisi kerja</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-4 flex items-center justify-between text-[11px] text-slate-500">
          <span>PT Indotek Buana Karya &copy; 2026</span>
          <span>v4.2 Enterprise</span>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM & 1-CLICK DEMO ACCOUNTS */}
      <div className="lg:w-7/12 p-6 sm:p-10 lg:p-14 flex flex-col justify-center max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Portal Keamanan & Akses
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Masuk ke Akun Anda
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Gunakan kredensial perusahaan atau pilih salah satu akun role di bawah.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email / Akun Kerja
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pm@indotek.co.id"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-sky-500/20 focus:border-slate-900 dark:focus:border-sky-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-10 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-sky-500/20 focus:border-slate-900 dark:focus:border-sky-500 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                <span>Ingat sesi saya</span>
              </label>

              <span className="text-slate-400 text-[11px]">
                Default Password: <code className="font-semibold text-slate-700 dark:text-slate-300">password123</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* QUICK 1-CLICK DEMO ACCESS CARDS */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pilih Akun Demo (1-Click Instant Login)
              </span>
              <span className="text-[10px] text-slate-400">Klik untuk langsung masuk</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableUsers.map((user) => {
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickLogin(user)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 text-left transition-all group flex items-start gap-2.5 shadow-sm"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <strong className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                        {user.name}
                      </strong>

                      <span
                        className={`inline-block px-1.5 py-0.2 text-[9px] font-semibold rounded border mt-0.5 ${getRoleBadgeStyle(
                          user.role
                        )}`}
                      >
                        {user.roleLabel.split('(')[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
