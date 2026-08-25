'use client';

import React, { useState } from 'react';
import { ClusterProvider, useCluster } from '@/context/ClusterContext';
import { Sidebar } from '@/components/Sidebar';
import { DashboardView } from '@/components/DashboardView';
import { ClusterDetailView } from '@/components/ClusterDetailView';
import { FinancePaymentHub } from '@/components/FinancePaymentHub';
import { DailyProgressView } from '@/components/DailyProgressView';
import { MaterialProcurementView } from '@/components/MaterialProcurementView';
import { MasterDataView } from '@/components/MasterDataView';
import { ApprovalCenterView } from '@/components/ApprovalCenterView';
import { ApprovalSettingsView } from '@/components/ApprovalSettingsView';
import { UserManagementView } from '@/components/UserManagementView';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { LoginView } from '@/components/LoginView';
import { ExcelImportModal } from '@/components/ExcelImportModal';
import { NewClusterModal } from '@/components/NewClusterModal';
import {
  Search,
  Plus,
  Upload,
  ChevronRight,
  Menu,
  HardHat,
  Database,
  Layers,
} from 'lucide-react';

function MainApp() {
  const {
    isAuthenticated,
    activeSpkId,
    activeSpk,
    setActiveSpkId,
    searchTerm,
    setSearchTerm,
  } = useCluster();

  const [activeNavView, setActiveNavView] = useState<
    'clusters' | 'finance' | 'dpr' | 'materials' | 'master' | 'approval' | 'users' | 'approval-settings'
  >('clusters');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isNewClusterOpen, setIsNewClusterOpen] = useState(false);

  // If not authenticated, render the Enterprise Login Portal
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar
          activeNavView={activeNavView}
          setActiveNavView={(v) => {
            setActiveNavView(v);
            setIsMobileSidebarOpen(false);
          }}
          onOpenImport={() => setIsImportOpen(true)}
          onOpenNewCluster={() => setIsNewClusterOpen(true)}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 glass-panel px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs truncate font-medium">
              <button
                onClick={() => {
                  setActiveSpkId(null);
                  setActiveNavView('clusters');
                }}
                className="flex items-center gap-1.5 font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-sky-500" />
                <span>FTTH Hub</span>
              </button>

              <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />

              <span className="font-bold text-slate-800 dark:text-slate-200">
                {activeNavView === 'clusters'
                  ? 'Cluster Control Center'
                  : activeNavView === 'dpr'
                  ? 'Daily Progress Report (DPR)'
                  : activeNavView === 'materials'
                  ? 'Pengadaan & Material Aksesoris'
                  : activeNavView === 'finance'
                  ? 'Keuangan, Termin & Kasbon'
                  : activeNavView === 'approval'
                  ? 'Pusat Persetujuan (Approval Center)'
                  : activeNavView === 'approval-settings'
                  ? 'Pengaturan Matriks Persetujuan (Set Approval)'
                  : activeNavView === 'users'
                  ? 'Manajemen Pengguna (User Management)'
                  : 'Master Database Hub'}
              </span>

              {activeSpk && activeNavView === 'clusters' && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                  <span className="font-extrabold text-sky-600 dark:text-sky-400 truncate bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800/60">
                    {activeSpk.clusterName}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Search Input (On Cluster View) */}
            {activeNavView === 'clusters' && !activeSpkId && (
              <div className="relative hidden md:block w-56 lg:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari cluster, vendor, mandor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                />
              </div>
            )}

            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Import Excel</span>
            </button>

            <button
              onClick={() => setIsNewClusterOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Cluster Baru</span>
            </button>

            {/* User Profile & Role Switcher */}
            <RoleSwitcher />
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {activeNavView === 'approval' ? (
            <ApprovalCenterView />
          ) : activeNavView === 'approval-settings' ? (
            <ApprovalSettingsView />
          ) : activeNavView === 'users' ? (
            <UserManagementView />
          ) : activeNavView === 'master' ? (
            <MasterDataView />
          ) : activeNavView === 'materials' ? (
            <MaterialProcurementView />
          ) : activeNavView === 'dpr' ? (
            <DailyProgressView />
          ) : activeNavView === 'finance' ? (
            <FinancePaymentHub />
          ) : !activeSpkId ? (
            <DashboardView
              onOpenImport={() => setIsImportOpen(true)}
              onOpenNewCluster={() => setIsNewClusterOpen(true)}
            />
          ) : (
            <ClusterDetailView />
          )}
        </main>
      </div>

      {/* Modals */}
      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      <NewClusterModal
        isOpen={isNewClusterOpen}
        onClose={() => setIsNewClusterOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ClusterProvider>
      <MainApp />
    </ClusterProvider>
  );
}
