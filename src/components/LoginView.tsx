'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import {
  Layers,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useCluster();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        setErrorMessage(res.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
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

      {/* RIGHT COLUMN: CLEAN ENTERPRISE LOGIN FORM */}
      <div className="lg:w-7/12 p-6 sm:p-10 lg:p-16 flex flex-col justify-center max-w-lg mx-auto w-full">
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
              Silakan masukkan alamat email dan kata sandi resmi perusahaan Anda.
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Email Perusahaan
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@indotek.co.id"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-sky-500/20 focus:border-slate-900 dark:focus:border-sky-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-sky-500/20 focus:border-slate-900 dark:focus:border-sky-500 transition-all shadow-sm"
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
                Lupa sandi? Hubungi Super Admin
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 active:scale-98"
            >
              {isLoading ? (
                <span>Memverifikasi akun...</span>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
