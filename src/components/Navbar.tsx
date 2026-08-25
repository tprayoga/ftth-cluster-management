'use client';

import React from 'react';
import { useCluster } from '@/context/ClusterContext';
import {
  Layers,
  Upload,
  Plus,
  Moon,
  Sun,
  RotateCcw,
  Search,
  ChevronRight,
  Wallet,
} from 'lucide-react';

interface NavbarProps {
  onOpenImport: () => void;
  onOpenNewCluster: () => void;
  activeNavView: 'clusters' | 'finance' | 'dpr' | 'materials';
  setActiveNavView: (v: 'clusters' | 'finance' | 'dpr' | 'materials') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenImport,
  onOpenNewCluster,
  activeNavView,
  setActiveNavView,
}) => {
  const {
    activeSpkId,
    activeSpk,
    calculatedSPKs,
    paymentRequests,
    dailyReports,
    materialPurchaseOrders,
    setActiveSpkId,
    searchTerm,
    setSearchTerm,
    isDarkMode,
    toggleDarkMode,
    resetToDefaultData,
  } = useCluster();

  const pendingCount = paymentRequests.filter(
    (r) => r.status === 'PENDING_FINANCE' || r.status === 'APPROVED'
  ).length;

  const pendingPoCount = materialPurchaseOrders.filter(
    (po) => po.status === 'PENDING_APPROVAL' || po.status === 'APPROVED'
  ).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Main View Switcher */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setActiveSpkId(null);
              setActiveNavView('clusters');
            }}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  FTTH Cluster Hub
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                PT Indotek Buana Karya
              </p>
            </div>
          </button>

          {/* Navigation Pill (Clusters vs Daily Progress vs Finance) */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setActiveNavView('clusters');
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeNavView === 'clusters'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cluster Control
            </button>

            <button
              onClick={() => {
                setActiveSpkId(null);
                setActiveNavView('dpr');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeNavView === 'dpr'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Daily Progress (DPR)</span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                WA Ready
              </span>
            </button>

            <button
              onClick={() => {
                setActiveSpkId(null);
                setActiveNavView('finance');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeNavView === 'finance'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Finance & Kasbon</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-amber-500 text-white animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveSpkId(null);
                setActiveNavView('materials');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeNavView === 'materials'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Material & Aksesoris</span>
              {pendingPoCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-amber-500 text-white">
                  {pendingPoCount}
                </span>
              )}
            </button>
          </div>

          {activeSpk && (
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800 text-sm">
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sky-600 dark:text-sky-400">
                  {activeSpk.clusterName}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({activeSpk.vendorName})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Search & Cluster Switcher */}
        <div className="flex-1 max-w-md hidden lg:flex items-center gap-2">
          {!activeSpkId ? (
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari cluster, SPK, vendor, site, atau mandor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          ) : (
            <select
              value={activeSpkId}
              onChange={(e) => setActiveSpkId(e.target.value ? e.target.value : null)}
              className="w-full px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              <option value="">-- Kembali ke Dashboard Portfolio --</option>
              {calculatedSPKs.map((spk) => (
                <option key={spk.id} value={spk.id}>
                  {spk.clusterName} - Margin: {spk.marginPercent.toFixed(1)}% ({spk.vendorName})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors shadow-sm"
            title="Import File Excel FTTH Cluster"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import Excel</span>
          </button>

          <button
            onClick={onOpenNewCluster}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition-colors shadow-sm shadow-sky-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SPK Vendor Baru</span>
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              if (confirm('Reset ulang data ke data template default?')) {
                resetToDefaultData();
              }
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset ke Data Awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
