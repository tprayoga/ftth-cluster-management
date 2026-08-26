'use client';

import React from 'react';
import { useCluster } from '@/context/ClusterContext';
import {
  Layers,
  Calendar,
  ShoppingBag,
  Wallet,
  Database,
  ShieldCheck,
  Plus,
  Upload,
  Download,
  Moon,
  Sun,
  RotateCcw,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  HardHat,
  Users,
  Sliders,
} from 'lucide-react';

interface SidebarProps {
  activeNavView: 'clusters' | 'finance' | 'dpr' | 'materials' | 'master' | 'approval' | 'users' | 'approval-settings';
  setActiveNavView: (v: 'clusters' | 'finance' | 'dpr' | 'materials' | 'master' | 'approval' | 'users' | 'approval-settings') => void;
  onOpenImport: () => void;
  onOpenNewCluster: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNavView,
  setActiveNavView,
  onOpenImport,
  onOpenNewCluster,
  isCollapsed,
  setIsCollapsed,
}) => {
  const {
    spks,
    paymentRequests,
    materialPurchaseOrders,
    users,
    isDarkMode,
    toggleDarkMode,
    resetToDefaultData,
    downloadExcelTemplate,
    setActiveSpkId,
    isDbConnected,
    refreshData,
  } = useCluster();

  const pendingFinanceCount = paymentRequests.filter(
    (r) => r.status === 'PENDING_FINANCE' || r.status === 'APPROVED'
  ).length;

  const pendingPoCount = materialPurchaseOrders.filter(
    (po) => po.status === 'PENDING_APPROVAL' || po.status === 'APPROVED'
  ).length;

  const pendingSpkCount = spks.filter(
    (s) => s.workflowStage === 'DRAFT_ESTIMASI'
  ).length;

  const totalPendingApprovals = pendingSpkCount + pendingPoCount + pendingFinanceCount;

  const handleNavigate = (view: 'clusters' | 'finance' | 'dpr' | 'materials' | 'master' | 'approval' | 'users' | 'approval-settings') => {
    setActiveSpkId(null);
    setActiveNavView(view);
  };

  const getNavItemClass = (isActive: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-sm'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
    }`;

  const getIconClass = (isActive: boolean) =>
    `w-4 h-4 flex-shrink-0 ${
      isActive ? 'text-sky-400' : 'text-slate-400 dark:text-slate-500'
    }`;

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col transition-all duration-300 ease-in-out border-r ${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-[#0c1220] border-slate-200 dark:border-slate-800/80 shadow-sm`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
        {!isCollapsed && (
          <button
            onClick={() => handleNavigate('clusters')}
            className="flex items-center gap-3 text-left group overflow-hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-white">
                  INDOTEK
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  FTTH
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-medium">
                Cluster Management Hub
              </p>
            </div>
          </button>
        )}

        {isCollapsed && (
          <button
            onClick={() => handleNavigate('clusters')}
            className="w-8 h-8 mx-auto rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 flex items-center justify-center shadow-sm"
            title="FTTH Cluster Hub"
          >
            <Layers className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {/* GROUP 1: OPERASIONAL & CLUSTER */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Operasional Proyek
            </span>
          )}

          {/* 1. Cluster Control */}
          <button
            onClick={() => handleNavigate('clusters')}
            className={getNavItemClass(activeNavView === 'clusters')}
            title="Dashboard & Cluster Control"
          >
            <Layers className={getIconClass(activeNavView === 'clusters')} />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>Cluster Control</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {spks.length}
                </span>
              </div>
            )}
          </button>

          {/* 2. Daily Progress (DPR) */}
          <button
            onClick={() => handleNavigate('dpr')}
            className={getNavItemClass(activeNavView === 'dpr')}
            title="Daily Progress Report (DPR)"
          >
            <Calendar className={getIconClass(activeNavView === 'dpr')} />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>Daily Progress (DPR)</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  WA Ready
                </span>
              </div>
            )}
          </button>
        </div>

        {/* GROUP 2: PENGADAAN & KEUANGAN */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Pengadaan & Kas
            </span>
          )}

          {/* 3. Material & Aksesoris */}
          <button
            onClick={() => handleNavigate('materials')}
            className={getNavItemClass(activeNavView === 'materials')}
            title="Material, PO Supplier & Gudang"
          >
            <ShoppingBag className={getIconClass(activeNavView === 'materials')} />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>Material Aksesoris</span>
                {pendingPoCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    {pendingPoCount} PO
                  </span>
                )}
              </div>
            )}
          </button>

          {/* 4. Finance & Kasbon */}
          <button
            onClick={() => handleNavigate('finance')}
            className={getNavItemClass(activeNavView === 'finance')}
            title="Finance, Termin & Kasbon"
          >
            <Wallet className={getIconClass(activeNavView === 'finance')} />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>Finance & Kasbon</span>
                {pendingFinanceCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    {pendingFinanceCount}
                  </span>
                )}
              </div>
            )}
          </button>
        </div>

        {/* GROUP 3: WORKFLOW & MASTER DATA */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Tata Kelola & Data
            </span>
          )}

          {/* 5. Approval Center */}
          <button
            onClick={() => handleNavigate('approval')}
            className={getNavItemClass(activeNavView === 'approval')}
            title="Pusat Persetujuan (Approval Center)"
          >
            <ShieldCheck className={getIconClass(activeNavView === 'approval')} />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>Pusat Approval</span>
                {totalPendingApprovals > 0 ? (
                  <span className="px-1.5 py-0.2 text-[9px] rounded-full font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400">
                    {totalPendingApprovals}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">0</span>
                )}
              </div>
            )}
          </button>

          {/* 6. Set Approval (Matriks & Rules) */}
          <button
            onClick={() => handleNavigate('approval-settings')}
            className={getNavItemClass(activeNavView === 'approval-settings')}
            title="Pengaturan Matriks Persetujuan (Set Approval)"
          >
            <Sliders className={getIconClass(activeNavView === 'approval-settings')} />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>Set Approval</span>
                <span className="text-[10px] text-slate-400">Rules</span>
              </div>
            )}
          </button>

          {/* 7. User Management */}
          <button
            onClick={() => handleNavigate('users')}
            className={getNavItemClass(activeNavView === 'users')}
            title="Manajemen Pengguna (User Management)"
          >
            <Users className={getIconClass(activeNavView === 'users')} />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>User Management</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {users.length}
                </span>
              </div>
            )}
          </button>

          {/* 8. Master Data Hub */}
          <button
            onClick={() => handleNavigate('master')}
            className={getNavItemClass(activeNavView === 'master')}
            title="Master Data Hub"
          >
            <Database className={getIconClass(activeNavView === 'master')} />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>Master Data Hub</span>
                <span className="text-[10px] text-slate-400">Mandor/Vendor</span>
              </div>
            )}
          </button>
        </div>

        {/* QUICK ACTIONS */}
        {!isCollapsed && (
          <div className="pt-3 space-y-1.5 border-t border-slate-200 dark:border-slate-800/80">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Aksi Cepat
            </span>
            <button
              onClick={onOpenNewCluster}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs border border-slate-200 dark:border-slate-700/60 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Cluster Baru</span>
            </button>

            <button
              onClick={onOpenImport}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs border border-slate-200 dark:border-slate-700/60 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import Excel BOQ</span>
            </button>

            <button
              onClick={downloadExcelTemplate}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs border border-slate-200 dark:border-slate-700/60 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Template</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Profile & Preferences */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-slate-300" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          <button
            onClick={() => {
              if (confirm('Kembalikan semua data ke sampel default?')) {
                resetToDefaultData();
              }
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            title="Reset Data Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {!isCollapsed && (
            <button
              onClick={() => refreshData()}
              className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md transition-colors ${
                isDbConnected
                  ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
              title={`Database: ${isDbConnected ? 'PostgreSQL Terhubung (Sinkronisasi Aktif)' : 'Offline Cache'}. Klik untuk refresh data.`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isDbConnected ? 'PostgreSQL Live' : 'Offline'}</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
