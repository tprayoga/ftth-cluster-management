'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { formatIDR, formatPercent } from '@/lib/calculations';
import { SpkMandorModal } from '@/components/SpkMandorModal';
import { FinanceRequestModal } from '@/components/FinanceRequestModal';
import { DailyProgressModal } from '@/components/DailyProgressModal';
import { MaterialPurchaseOrderModal } from '@/components/MaterialPurchaseOrderModal';
import { MaterialHandoverModal } from '@/components/MaterialHandoverModal';
import { ExcelImportModal } from '@/components/ExcelImportModal';
import { generateWhatsAppDailyReport } from '@/lib/dailyProgressHelper';
import { CalculatedSite, WorkflowStage, PaymentRequestType } from '@/types';
import {
  ArrowLeft,
  Download,
  Upload,
  Plus,
  Trash2,
  FileSpreadsheet,
  Package,
  History,
  Tag,
  ShieldCheck,
  Printer,
  HardHat,
  FileCheck2,
  Send,
  Wallet,
  Calendar,
  Copy,
  Check,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-react';

export const ClusterDetailView: React.FC = () => {
  const {
    activeSpk,
    mandors,
    paymentRequests,
    dailyReports,
    setActiveSpkId,
    addSite,
    deleteSite,
    assignMandor,
    updateWorkflowStage,
    updateServiceItem,
    addServiceItem,
    deleteServiceItem,
    updateMaterialItem,
    addMaterialItem,
    deleteMaterialItem,
    updatePermitItem,
    addPermitItem,
    deletePermitItem,
    addRevisionLog,
    priceCatalog,
    updatePriceCatalogItem,
    exportSPK,
    downloadExcelTemplate,
    downloadJasaTemplate,
    downloadMaterialTemplate,
    importJasaExcelToSite,
    importMaterialExcelToSite,
  } = useCluster();

  const [activeTab, setActiveTab] = useState<'summary' | 'jasa' | 'material' | 'permit' | 'dpr' | 'catalog' | 'audit'>('summary');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDprModalOpen, setIsDprModalOpen] = useState(false);
  const [copiedDprId, setCopiedDprId] = useState<string | null>(null);

  // Material Procurement & Handover Modals
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [selectedPoSiteId, setSelectedPoSiteId] = useState<string>('');
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [selectedHandoverSiteId, setSelectedHandoverSiteId] = useState<string>('');

  // SPK Mandor Modal
  const [spkMandorSite, setSpkMandorSite] = useState<CalculatedSite | null>(null);

  // Finance Request Modal
  const [financeReqSite, setFinanceReqSite] = useState<CalculatedSite | null>(null);
  const [financeReqType, setFinanceReqType] = useState<PaymentRequestType>('TERMIN');

  // Add Site Modal state
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [newSiteSpkNumber, setNewSiteSpkNumber] = useState('');
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteSowType, setNewSiteSowType] = useState<'Distribusi' | 'Subfeeder' | 'Feeder' | 'Drop' | 'Other'>('Distribusi');
  const [newSitePoAmount, setNewSitePoAmount] = useState<string | number>('');
  const [newSiteMandorId, setNewSiteMandorId] = useState<string>('m1');

  // New item modal states
  const [showAddServiceModal, setShowAddServiceModal] = useState<string | null>(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceQty, setNewServiceQty] = useState(1);
  const [newServiceUom, setNewServiceUom] = useState('Meter');
  const [newServicePrice, setNewServicePrice] = useState(2100);
  const [newServiceRemark, setNewServiceRemark] = useState('');

  const [showAddMaterialModal, setShowAddMaterialModal] = useState<string | null>(null);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialQty, setNewMaterialQty] = useState(10);
  const [newMaterialPrice, setNewMaterialPrice] = useState(10000);

  // New Permit item modal
  const [showAddPermitModal, setShowAddPermitModal] = useState<string | null>(null);
  const [newPermitName, setNewPermitName] = useState('');
  const [newPermitCat, setNewPermitCat] = useState<'Lingkungan / Warga' | 'Dinas / Pemda' | 'Sitac / Survey' | 'Lain-lain'>('Lingkungan / Warga');
  const [newPermitEst, setNewPermitEst] = useState(500000);
  const [newPermitPic, setNewPermitPic] = useState('');

  // New Revision log modal
  const [showAddRevisionModal, setShowAddRevisionModal] = useState(false);
  const [newRevVersion, setNewRevVersion] = useState(`v${(activeSpk?.revisionLogs.length || 0) + 1}`);
  const [newRevAuthor, setNewRevAuthor] = useState('');
  const [newRevStatus, setNewRevStatus] = useState('Penawaran');
  const [newRevNote, setNewRevNote] = useState('');

  if (!activeSpk) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Tidak ada cluster yang dipilih.</p>
        <button
          onClick={() => setActiveSpkId(null)}
          className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const sitesToDisplay =
    selectedSiteId === 'all'
      ? activeSpk.sites
      : activeSpk.sites.filter((s) => s.id === selectedSiteId);

  const handleCreateServiceItem = (siteId: string) => {
    if (!newServiceName) return;
    const isNegosiasi = newServiceName.toLowerCase().includes('negosiasi') || newServiceUom.toLowerCase() === 'lot';
    addServiceItem(activeSpk.id, siteId, {
      name: newServiceName,
      qty: Number(newServiceQty) || 1,
      uom: newServiceUom,
      unitPrice: Number(newServicePrice) || 0,
      remark: newServiceRemark,
      actualProgress: 0,
      isNegosiasi,
    });
    setNewServiceName('');
    setNewServiceQty(1);
    setNewServicePrice(2100);
    setNewServiceRemark('');
    setShowAddServiceModal(null);
  };

  const handleCreateMaterialItem = (siteId: string) => {
    if (!newMaterialName) return;
    addMaterialItem(activeSpk.id, siteId, {
      name: newMaterialName,
      qty: Number(newMaterialQty) || 1,
      unitPrice: Number(newMaterialPrice) || 0,
    });
    setNewMaterialName('');
    setNewMaterialQty(10);
    setNewMaterialPrice(10000);
    setShowAddMaterialModal(null);
  };

  const handleCreatePermitItem = (siteId: string) => {
    if (!newPermitName) return;
    addPermitItem(activeSpk.id, siteId, {
      name: newPermitName,
      category: newPermitCat,
      estimatedCost: Number(newPermitEst) || 0,
      actualCost: 0,
      status: 'Pending',
      pic: newPermitPic || 'Tim Sitac',
    });
    setNewPermitName('');
    setNewPermitEst(500000);
    setNewPermitPic('');
    setShowAddPermitModal(null);
  };

  const handleCreateRevision = () => {
    if (!newRevNote) return;
    addRevisionLog(activeSpk.id, {
      version: newRevVersion,
      date: new Date().toLocaleDateString('id-ID'),
      author: newRevAuthor || 'Team Estimator',
      status: newRevStatus,
      note: newRevNote,
    });
    setNewRevNote('');
    setShowAddRevisionModal(false);
  };

  const workflowStages: { key: WorkflowStage; label: string; color: string }[] = [
    { key: 'DRAFT_ESTIMASI', label: '1. Draft Estimator', color: 'bg-slate-200 text-slate-800' },
    { key: 'SPK_MANDOR_DIRILIS', label: '2. SPK Mandor Rilis', color: 'bg-sky-200 text-sky-800' },
    { key: 'PELAKSANAAN', label: '3. Pelaksanaan Lapangan', color: 'bg-indigo-200 text-indigo-800' },
    { key: 'QC_BAST', label: '4. QC & BAST Vendor', color: 'bg-amber-200 text-amber-800' },
    { key: 'SELESAI', label: '5. Selesai / Pelunasan', color: 'bg-emerald-200 text-emerald-800' },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Top Breadcrumb & Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => setActiveSpkId(null)}
            className="p-2 mt-0.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                Vendor: {activeSpk.vendorName}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg ${
                activeSpk.scopeType === 'END_TO_END'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              }`}>
                Scope: {activeSpk.scopeType === 'END_TO_END' ? 'End-to-End (Permit + Impl)' : 'Implementation Only'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Dibuat: {activeSpk.createdAt}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {activeSpk.clusterName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {activeSpk.spkNumber}
            </p>
          </div>
        </div>

        {/* Action Buttons & Workflow Stage Selector */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold px-2 text-slate-400">Workflow:</span>
            <select
              value={activeSpk.workflowStage}
              onChange={(e) => updateWorkflowStage(activeSpk.id, e.target.value as WorkflowStage)}
              className="text-xs font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-none shadow-sm focus:ring-2 focus:ring-sky-500"
            >
              {workflowStages.map((st) => (
                <option key={st.key} value={st.key}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Unduh Template Excel */}
          <button
            onClick={downloadExcelTemplate}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
            title="Unduh Template Excel 4-Sheet Standar FTTH"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Template Excel</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm transition-all active:scale-95"
            title="Import Data BOQ Cluster dari Excel"
          >
            <Upload className="w-3.5 h-3.5 text-sky-500" />
            <span>Import Excel</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={() => exportSPK(activeSpk.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            title="Export Rincian BOQ Cluster ke Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Cluster Quick Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl glass-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Nilai PO (Vendor)</span>
          <span className="text-base font-black text-slate-900 dark:text-white font-mono">
            {formatIDR(activeSpk.totalPO)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl glass-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Jasa Mandor (Cost)</span>
          <span className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono">
            {formatIDR(activeSpk.totalJasa)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl glass-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Material & Permit</span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono">
              {formatIDR(activeSpk.totalMaterial + activeSpk.totalPermit)}
            </span>
            {activeSpk.totalPermit > 0 && (
              <span className="text-[10px] text-purple-600 font-mono" title="Biaya Perizinan">
                Izin: {formatIDR(activeSpk.totalPermit)}
              </span>
            )}
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Eksternal</span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
              {formatIDR(activeSpk.totalEksternal)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {formatPercent(activeSpk.costRatio, 1)}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-card border-emerald-500/30">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Gross Margin</span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatPercent(activeSpk.marginPercent)}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {formatIDR(activeSpk.marginRp)}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Progres Mandor</span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {formatPercent(activeSpk.avgProgress)}
            </span>
            <span className="text-[10px] text-rose-500 font-semibold font-mono" title="Pending Payment">
              Sisa: {formatIDR(activeSpk.pendingPayment)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'summary'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Sheet SUMMARY</span>
          </button>

          <button
            onClick={() => setActiveTab('jasa')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'jasa'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>Sheet JASA MANDOR</span>
          </button>

          <button
            onClick={() => setActiveTab('material')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'material'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Sheet MATERIAL</span>
          </button>

          {activeSpk.scopeType === 'END_TO_END' && (
            <button
              onClick={() => setActiveTab('permit')}
              className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                activeTab === 'permit'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>PERIZINAN (PERMIT)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('dpr')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'dpr'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>LOG PROGRES HARIAN (DPR)</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'catalog'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Katalog Harga Acuan</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'audit'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Log Revisi & Approval</span>
          </button>
        </div>

        {/* Site filter dropdown */}
        {(activeTab === 'jasa' || activeTab === 'material' || activeTab === 'permit') && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 whitespace-nowrap hidden sm:inline">Filter Site:</span>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="all">Semua Site ({activeSpk.sites.length})</option>
              {activeSpk.sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: SUMMARY SHEET */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Rekapitulasi SPK / Site (Sesuai Format Sheet SUMMARY Excel)</span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold font-mono">
                    {activeSpk.sites.length} Site
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Perhitungan otomatis nilai PO Vendor, Jasa Mandor, Material, Perizinan, Progres Lapangan, dan Margin.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewSiteSpkNumber(activeSpk.spkNumber || '');
                  setNewSiteName('');
                  setNewSiteSowType('Distribusi');
                  setNewSitePoAmount('');
                  setNewSiteMandorId(mandors[0]?.id || 'm1');
                  setShowAddSiteModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 active:scale-95 transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Site Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[1450px]">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 text-center">
                    <th colSpan={4} className="p-2.5 border-r border-slate-200 dark:border-slate-800 text-left whitespace-nowrap">Informasi Dasar & Mandor</th>
                    <th className="p-2.5 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">PO Vendor</th>
                    <th colSpan={5} className="p-2.5 border-r border-slate-200 dark:border-slate-800 bg-sky-500/5 whitespace-nowrap">Biaya Eksternal (Jasa Mandor, Mat, Permit)</th>
                    <th className="p-2.5 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">Progress</th>
                    <th colSpan={4} className="p-2.5 border-r border-slate-200 dark:border-slate-800 bg-indigo-500/5 whitespace-nowrap">Payment Mandor</th>
                    <th colSpan={2} className="p-2.5 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 whitespace-nowrap">Margin</th>
                    <th className="p-2.5 border-l border-slate-200 dark:border-slate-800 text-center w-14 whitespace-nowrap">Aksi</th>
                  </tr>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 text-right">
                    <th className="p-3 text-left whitespace-nowrap min-w-[90px]">Vendor</th>
                    <th className="p-3 text-left whitespace-nowrap min-w-[160px]">Nomor SPK</th>
                    <th className="p-3 text-left whitespace-nowrap min-w-[240px]">Site Name</th>
                    <th className="p-3 text-left text-sky-600 dark:text-sky-400 whitespace-nowrap min-w-[180px]">Mandor Bertugas</th>
                    <th className="p-3 font-mono whitespace-nowrap min-w-[120px]">Nilai PO</th>
                    <th className="p-3 bg-sky-500/5 whitespace-nowrap min-w-[110px]">Jasa Mandor</th>
                    <th className="p-3 bg-sky-500/5 whitespace-nowrap min-w-[70px] text-center">% Jasa</th>
                    <th className="p-3 bg-sky-500/5 whitespace-nowrap min-w-[110px]">Material</th>
                    <th className="p-3 bg-sky-500/5 whitespace-nowrap min-w-[90px]">Permit</th>
                    <th className="p-3 bg-sky-500/10 font-black whitespace-nowrap min-w-[120px]">Total Cost</th>
                    <th className="p-3 text-center whitespace-nowrap min-w-[90px]">Progress %</th>
                    <th className="p-3 bg-indigo-500/5 whitespace-nowrap min-w-[110px]">Term 1 (30%)</th>
                    <th className="p-3 bg-indigo-500/5 whitespace-nowrap min-w-[100px]">Term 2</th>
                    <th className="p-3 bg-indigo-500/5 whitespace-nowrap min-w-[100px]">Term 3</th>
                    <th className="p-3 bg-indigo-500/10 text-rose-500 whitespace-nowrap min-w-[110px]">Pending</th>
                    <th className="p-3 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 whitespace-nowrap min-w-[120px]">Margin (Rp)</th>
                    <th className="p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black text-center whitespace-nowrap min-w-[90px]">Margin %</th>
                    <th className="p-3 text-center border-l border-slate-200 dark:border-slate-800 whitespace-nowrap w-14">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {activeSpk.sites.map((site) => (
                    <tr key={site.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                        {activeSpk.vendorName}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]" title={site.spkNumber || activeSpk.spkNumber}>
                        {(site.spkNumber || activeSpk.spkNumber).split('/')[0]}...
                      </td>
                      <td className="p-3 font-sans font-bold text-slate-900 dark:text-white max-w-xs">
                        {site.name}
                        <span className="block text-[10px] font-mono text-sky-600 dark:text-sky-400">
                          {site.sowType}
                        </span>
                      </td>
                      <td className="p-3 font-sans">
                        <select
                          value={site.mandorId || ''}
                          onChange={(e) => assignMandor(activeSpk.id, site.id, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-200 font-bold text-xs border border-sky-200 dark:border-sky-800 focus:outline-none"
                        >
                          {mandors.map((m) => (
                            <option key={m.id} value={m.id} className="dark:bg-slate-900">
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {formatIDR(site.poAmount)}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 bg-sky-500/5">
                        {formatIDR(site.totalJasa)}
                      </td>
                      <td className="p-3 text-slate-500 bg-sky-500/5">
                        {formatPercent(site.jasaRatio, 1)}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 bg-sky-500/5">
                        {formatIDR(site.totalMaterial)}
                      </td>
                      <td className="p-3 text-purple-600 dark:text-purple-400 bg-sky-500/5">
                        {site.totalPermit > 0 ? formatIDR(site.totalPermit) : '-'}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white bg-sky-500/10">
                        {formatIDR(site.totalEksternal)}
                      </td>
                      <td className="p-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                        {formatPercent(site.progressPercent)}
                      </td>
                      <td className="p-3 bg-indigo-500/5 text-slate-700 dark:text-slate-300">
                        {formatIDR(site.term1Amount)}
                      </td>
                      <td className="p-3 bg-indigo-500/5 text-slate-400">
                        {site.term2Amount > 0 ? formatIDR(site.term2Amount) : '-'}
                      </td>
                      <td className="p-3 bg-indigo-500/5 text-slate-400">
                        {site.term3Amount > 0 ? formatIDR(site.term3Amount) : '-'}
                      </td>
                      <td className="p-3 bg-indigo-500/10 font-bold text-rose-500">
                        {formatIDR(site.pendingPayment)}
                      </td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                        {formatIDR(site.marginRp)}
                      </td>
                      <td className="p-3 text-center bg-emerald-500/10 font-black text-emerald-700 dark:text-emerald-300">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          site.marginHealth === 'healthy'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : site.marginHealth === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {formatPercent(site.marginPercent)}
                        </span>
                      </td>
                      <td className="p-3 text-center border-l border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus site "${site.name}" beserta seluruh item pekerjaan dan materialnya?`)) {
                              deleteSite(activeSpk.id, site.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Hapus Site"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Summary Aggregate Row */}
                  <tr className="bg-slate-200/70 dark:bg-slate-800/80 font-black text-right text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                    <td colSpan={4} className="p-3 text-left font-sans">
                      Jumlah {activeSpk.sites.length} Site
                    </td>
                    <td className="p-3 font-bold">{formatIDR(activeSpk.totalPO)}</td>
                    <td className="p-3 bg-sky-500/10">{formatIDR(activeSpk.totalJasa)}</td>
                    <td className="p-3 bg-sky-500/10">{formatPercent((activeSpk.totalJasa / (activeSpk.totalPO || 1)) * 100, 1)}</td>
                    <td className="p-3 bg-sky-500/10">{formatIDR(activeSpk.totalMaterial)}</td>
                    <td className="p-3 bg-sky-500/10 text-purple-600">{activeSpk.totalPermit > 0 ? formatIDR(activeSpk.totalPermit) : '-'}</td>
                    <td className="p-3 bg-sky-500/20">{formatIDR(activeSpk.totalEksternal)}</td>
                    <td className="p-3 text-center text-indigo-600 dark:text-indigo-400">{formatPercent(activeSpk.avgProgress)}</td>
                    <td className="p-3 bg-indigo-500/10">{formatIDR(activeSpk.totalPaid)}</td>
                    <td className="p-3 bg-indigo-500/10">-</td>
                    <td className="p-3 bg-indigo-500/10">-</td>
                    <td className="p-3 bg-indigo-500/20 text-rose-500">{formatIDR(activeSpk.pendingPayment)}</td>
                    <td className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{formatIDR(activeSpk.marginRp)}</td>
                    <td className="p-3 text-center bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">{formatPercent(activeSpk.marginPercent)}</td>
                    <td className="p-3 border-l border-slate-200 dark:border-slate-800"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JASA SHEET (MANDOR) */}
      {activeTab === 'jasa' && (
        <div className="space-y-8">
          {sitesToDisplay.map((site) => (
            <div
              key={site.id}
              className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
            >
              {/* Site Header with Mandor Assignment and Print SPK Button */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      {site.sowType}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {site.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Total Jasa Mandor: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatIDR(site.totalJasa)}</strong> | Progres Aktual: <strong className="text-indigo-600 font-mono">{formatPercent(site.progressPercent)}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Mandor Assignment Dropdown */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
                    <HardHat className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold text-slate-500">Mandor:</span>
                    <select
                      value={site.mandorId || ''}
                      onChange={(e) => assignMandor(activeSpk.id, site.id, e.target.value)}
                      className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="">-- Pilih Mandor --</option>
                      {mandors.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.specialization})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cetak SPK Mandor Button */}
                  <button
                    onClick={() => setSpkMandorSite(site)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-sky-600 dark:hover:bg-sky-400 transition-all shadow-sm"
                    title="Cetak Work Order resmi untuk Mandor Lapangan"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak SPK Mandor</span>
                  </button>

                  {/* Request Pembayaran Termin ke Finance */}
                  <button
                    onClick={() => {
                      setFinanceReqSite(site);
                      setFinanceReqType('TERMIN');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                    title="Buat pengajuan pembayaran termin ke Finance"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Request Termin</span>
                  </button>

                  {/* Request Kasbon ke Finance */}
                  <button
                    onClick={() => {
                      setFinanceReqSite(site);
                      setFinanceReqType('KASBON');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
                    title="Buat pengajuan kasbon operasional mandor ke Finance"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Request Kasbon</span>
                  </button>

                  {/* Download Template Jasa */}
                  <button
                    type="button"
                    onClick={downloadJasaTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                    title="Download Template Excel Khusus Jasa Mandor (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-500" />
                    <span>Template Jasa</span>
                  </button>

                  {/* Import Jasa Excel */}
                  <label
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm transition-all cursor-pointer active:scale-95"
                    title="Import Item Jasa dari File Excel"
                  >
                    <Upload className="w-3.5 h-3.5 text-sky-500" />
                    <span>Import Jasa</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const res = await importJasaExcelToSite(activeSpk.id, site.id, e.target.files[0]);
                          alert(res.message);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>

                  <button
                    onClick={() => setShowAddServiceModal(site.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Item Jasa</span>
                  </button>
                </div>
              </div>

              {/* Jasa Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[1300px]">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3 w-12 text-center whitespace-nowrap">#</th>
                      <th className="p-3 min-w-[320px] whitespace-nowrap">Item Pekerjaan</th>
                      <th className="p-3 text-right min-w-[120px] whitespace-nowrap">Qty Target</th>
                      <th className="p-3 text-center min-w-[90px] whitespace-nowrap">Satuan</th>
                      <th className="p-3 text-right min-w-[140px] whitespace-nowrap">Tarif Mandor</th>
                      <th className="p-3 text-right min-w-[160px] whitespace-nowrap">Total Biaya Mandor</th>
                      <th className="p-3 min-w-[240px] whitespace-nowrap">Remark / Catatan Lapangan</th>
                      <th className="p-3 text-right min-w-[120px] bg-indigo-50/50 dark:bg-indigo-950/20 whitespace-nowrap">Actual Progres</th>
                      <th className="p-3 text-center min-w-[140px] bg-indigo-50/50 dark:bg-indigo-950/20 whitespace-nowrap">Progres %</th>
                      <th className="p-3 text-center min-w-[100px] whitespace-nowrap">Status</th>
                      <th className="p-3 text-center w-16 whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {site.services.map((srv, idx) => (
                      <tr key={srv.id} className="hover:bg-sky-50/30 dark:hover:bg-sky-950/10 group">
                        <td className="p-3 text-center text-slate-400 font-sans">{idx + 1}</td>
                        <td className="p-3 font-sans font-medium text-slate-900 dark:text-white">
                          <input
                            type="text"
                            value={srv.name}
                            onChange={(e) =>
                              updateServiceItem(activeSpk.id, site.id, srv.id, { name: e.target.value })
                            }
                            className="spreadsheet-cell-input text-slate-900 dark:text-white font-medium"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            value={srv.qty}
                            onChange={(e) =>
                              updateServiceItem(activeSpk.id, site.id, srv.id, { qty: Number(e.target.value) || 0 })
                            }
                            className="spreadsheet-cell-input text-right font-bold text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="p-3 text-center font-sans">
                          <input
                            type="text"
                            value={srv.uom}
                            onChange={(e) =>
                              updateServiceItem(activeSpk.id, site.id, srv.id, { uom: e.target.value })
                            }
                            className="spreadsheet-cell-input text-center text-slate-600 dark:text-slate-300"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            value={srv.unitPrice}
                            onChange={(e) =>
                              updateServiceItem(activeSpk.id, site.id, srv.id, { unitPrice: Number(e.target.value) || 0 })
                            }
                            className="spreadsheet-cell-input text-right text-slate-700 dark:text-slate-300"
                          />
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {formatIDR(srv.total)}
                        </td>
                        <td className="p-3 font-sans">
                          <input
                            type="text"
                            placeholder="Tambahkan remark..."
                            value={srv.remark || ''}
                            onChange={(e) =>
                              updateServiceItem(activeSpk.id, site.id, srv.id, { remark: e.target.value })
                            }
                            className="spreadsheet-cell-input text-slate-500 text-xs"
                          />
                        </td>
                        <td className="p-3 text-right bg-indigo-50/30 dark:bg-indigo-950/20">
                          <input
                            type="number"
                            value={srv.actualProgress}
                            onChange={(e) =>
                              updateServiceItem(activeSpk.id, site.id, srv.id, { actualProgress: Number(e.target.value) || 0 })
                            }
                            className="spreadsheet-cell-input text-right font-black text-indigo-600 dark:text-indigo-400 bg-white/60 dark:bg-slate-900/60 border border-indigo-200 dark:border-indigo-800"
                          />
                        </td>
                        <td className="p-3 text-center bg-indigo-50/30 dark:bg-indigo-950/20 font-bold whitespace-nowrap">
                          <div className="flex items-center gap-2 justify-center">
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                              {formatPercent(srv.progressPercent, 1)}
                            </span>
                            <div className="w-12 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  srv.isAddWork ? 'bg-amber-500' : srv.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${Math.min(100, srv.progressPercent)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center font-sans whitespace-nowrap">
                          {srv.isAddWork ? (
                            <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 animate-pulse">
                              Add Work
                            </span>
                          ) : srv.isNegosiasi ? (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                              Lump Sum
                            </span>
                          ) : srv.progressPercent >= 100 ? (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Selesai
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-sans whitespace-nowrap">
                          <button
                            onClick={() => deleteServiceItem(activeSpk.id, site.id, srv.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    <tr className="bg-slate-100 dark:bg-slate-900 font-bold border-t border-slate-200 dark:border-slate-800">
                      <td colSpan={5} className="p-3 text-right font-sans">
                        Total Jasa Mandor ({site.mandorName || 'Mandor'}):
                      </td>
                      <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                        {formatIDR(site.totalJasa)}
                      </td>
                      <td colSpan={2} className="p-3 text-right font-sans text-slate-500">
                        Rata-rata Progress Fisik:
                      </td>
                      <td className="p-3 text-center font-black text-indigo-600 dark:text-indigo-400">
                        {formatPercent(site.progressPercent)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: MATERIAL SHEET */}
      {activeTab === 'material' && (
        <div className="space-y-8">
          {sitesToDisplay.map((site) => (
            <div
              key={site.id}
              className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
            >
              <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      {site.sowType}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {site.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Total Kebutuhan Material: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatIDR(site.totalMaterial)}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedPoSiteId(site.id);
                      setIsPoModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>+ Buat PO Belanja Supplier</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedHandoverSiteId(site.id);
                      setIsHandoverModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    <Truck className="w-3.5 h-3.5 text-sky-500" />
                    <span>+ Surat Jalan Mandor</span>
                  </button>

                  {/* Download Template Material */}
                  <button
                    type="button"
                    onClick={downloadMaterialTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                    title="Download Template Excel Khusus Material Aksesoris (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-500" />
                    <span>Template Material</span>
                  </button>

                  {/* Import Material Excel */}
                  <label
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm transition-all cursor-pointer active:scale-95"
                    title="Import Daftar Material dari File Excel"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-500" />
                    <span>Import Material</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const res = await importMaterialExcelToSite(activeSpk.id, site.id, e.target.files[0]);
                          alert(res.message);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>

                  <button
                    onClick={() => setShowAddMaterialModal(site.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Item</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3 w-12 text-center whitespace-nowrap">#</th>
                      <th className="p-3 min-w-[320px] whitespace-nowrap">Nama Material</th>
                      <th className="p-3 text-right min-w-[100px] whitespace-nowrap">Qty</th>
                      <th className="p-3 text-right min-w-[150px] whitespace-nowrap">Harga Satuan (Aktual)</th>
                      <th className="p-3 text-right min-w-[150px] whitespace-nowrap">Total Biaya</th>
                      <th className="p-3 text-right min-w-[150px] text-slate-400 whitespace-nowrap">Harga Acuan Katalog</th>
                      <th className="p-3 text-center min-w-[140px] whitespace-nowrap">Variansi</th>
                      <th className="p-3 text-center w-16 whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {site.materials.map((mat, idx) => {
                      const catalogMatch = priceCatalog.find(
                        (c) => c.name.toLowerCase().trim() === mat.name.toLowerCase().trim()
                      );
                      const refPrice = catalogMatch?.referencePrice || 0;
                      const diff = refPrice > 0 ? mat.unitPrice - refPrice : 0;

                      return (
                        <tr key={mat.id} className="hover:bg-sky-50/30 dark:hover:bg-sky-950/10 group">
                          <td className="p-3 text-center text-slate-400 font-sans">{idx + 1}</td>
                          <td className="p-3 font-sans font-medium text-slate-900 dark:text-white">
                            <input
                              type="text"
                              value={mat.name}
                              onChange={(e) =>
                                updateMaterialItem(activeSpk.id, site.id, mat.id, { name: e.target.value })
                              }
                              className="spreadsheet-cell-input text-slate-900 dark:text-white font-medium"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              value={mat.qty}
                              onChange={(e) =>
                                updateMaterialItem(activeSpk.id, site.id, mat.id, { qty: Number(e.target.value) || 0 })
                              }
                              className="spreadsheet-cell-input text-right font-bold text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              value={mat.unitPrice}
                              onChange={(e) =>
                                updateMaterialItem(activeSpk.id, site.id, mat.id, { unitPrice: Number(e.target.value) || 0 })
                              }
                              className="spreadsheet-cell-input text-right font-semibold text-slate-800 dark:text-slate-200"
                            />
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {formatIDR(mat.total)}
                          </td>
                          <td className="p-3 text-right text-slate-400 whitespace-nowrap">
                            {refPrice > 0 ? formatIDR(refPrice) : '-'}
                          </td>
                          <td className="p-3 text-center font-sans whitespace-nowrap">
                            {refPrice > 0 ? (
                              diff < 0 ? (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  Hemat {formatIDR(Math.abs(diff))}
                                </span>
                              ) : diff > 0 ? (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                  +{formatIDR(diff)}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Sesuai Acuan</span>
                              )
                            ) : (
                              <span className="text-slate-400 text-[10px]">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-sans whitespace-nowrap">
                            <button
                              onClick={() => deleteMaterialItem(activeSpk.id, site.id, mat.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Hapus baris"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    <tr className="bg-slate-100 dark:bg-slate-900 font-bold border-t border-slate-200 dark:border-slate-800">
                      <td colSpan={4} className="p-3 text-right font-sans">
                        Total Harga Material {site.name}
                      </td>
                      <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                        {formatIDR(site.totalMaterial)}
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: PERIZINAN (PERMIT) - FOR END-TO-END PROJECTS */}
      {activeTab === 'permit' && activeSpk.scopeType === 'END_TO_END' && (
        <div className="space-y-8">
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <p className="font-bold">Modul Perizinan (Permit) & Koordinasi Lapangan</p>
                <p className="text-purple-700 dark:text-purple-300">
                  Project ini berstatus <strong>End-to-End</strong> dengan vendor {activeSpk.vendorName}. Seluruh biaya koordinasi lingkungan & retribusi perizinan tercatat otomatis di sini dan masuk dalam kalkulasi net margin.
                </p>
              </div>
            </div>
          </div>

          {sitesToDisplay.map((site) => (
            <div
              key={site.id}
              className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
            >
              <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {site.name} - Biaya Perizinan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Total Biaya Perizinan: <strong className="text-purple-600 font-mono">{formatIDR(site.totalPermit)}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setShowAddPermitModal(site.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Item Perizinan</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3 w-12 text-center whitespace-nowrap">#</th>
                      <th className="p-3 min-w-[280px] whitespace-nowrap">Keterangan Izin / Koordinasi</th>
                      <th className="p-3 min-w-[160px] whitespace-nowrap">Kategori</th>
                      <th className="p-3 text-right min-w-[140px] whitespace-nowrap">Estimasi Biaya</th>
                      <th className="p-3 text-right min-w-[140px] whitespace-nowrap">Biaya Aktual</th>
                      <th className="p-3 min-w-[140px] whitespace-nowrap">Status Izin</th>
                      <th className="p-3 min-w-[140px] whitespace-nowrap">PIC Sitac</th>
                      <th className="p-3 min-w-[200px] whitespace-nowrap">Catatan Lapangan</th>
                      <th className="p-3 text-center w-16 whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {site.permitItems?.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-purple-50/20 group">
                        <td className="p-3 text-center text-slate-400 font-sans">{idx + 1}</td>
                        <td className="p-3 font-sans font-medium text-slate-900 dark:text-white">
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => updatePermitItem(activeSpk.id, site.id, p.id, { name: e.target.value })}
                            className="spreadsheet-cell-input"
                          />
                        </td>
                        <td className="p-3 font-sans">
                          <select
                            value={p.category}
                            onChange={(e) => updatePermitItem(activeSpk.id, site.id, p.id, { category: e.target.value as any })}
                            className="spreadsheet-cell-input"
                          >
                            <option value="Lingkungan / Warga">Lingkungan / Warga</option>
                            <option value="Dinas / Pemda">Dinas / Pemda</option>
                            <option value="Sitac / Survey">Sitac / Survey</option>
                            <option value="Lain-lain">Lain-lain</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            value={p.estimatedCost}
                            onChange={(e) => updatePermitItem(activeSpk.id, site.id, p.id, { estimatedCost: Number(e.target.value) || 0 })}
                            className="spreadsheet-cell-input text-right text-slate-500"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            value={p.actualCost}
                            onChange={(e) => updatePermitItem(activeSpk.id, site.id, p.id, { actualCost: Number(e.target.value) || 0 })}
                            className="spreadsheet-cell-input text-right font-bold text-purple-600"
                          />
                        </td>
                        <td className="p-3 font-sans">
                          <select
                            value={p.status}
                            onChange={(e) => updatePermitItem(activeSpk.id, site.id, p.id, { status: e.target.value as any })}
                            className={`px-2 py-1 rounded-lg text-xs font-bold ${
                              p.status === 'Approved / Selesai'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Approved / Selesai">Approved / Selesai</option>
                          </select>
                        </td>
                        <td className="p-3 font-sans">
                          <input
                            type="text"
                            value={p.pic || ''}
                            onChange={(e) => updatePermitItem(activeSpk.id, site.id, p.id, { pic: e.target.value })}
                            className="spreadsheet-cell-input"
                          />
                        </td>
                        <td className="p-3 font-sans">
                          <input
                            type="text"
                            placeholder="Catatan..."
                            value={p.notes || ''}
                            onChange={(e) => updatePermitItem(activeSpk.id, site.id, p.id, { notes: e.target.value })}
                            className="spreadsheet-cell-input text-slate-500 text-xs"
                          />
                        </td>
                        <td className="p-3 text-center font-sans">
                          <button
                            onClick={() => deletePermitItem(activeSpk.id, site.id, p.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!site.permitItems || site.permitItems.length === 0) && (
                      <tr>
                        <td colSpan={9} className="p-4 text-center text-slate-400 font-sans">
                          Belum ada item perizinan untuk site ini. Klik tombol di atas untuk menambahkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: KATALOG HARGA ACUAN */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Master Katalog Harga Acuan Material
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daftar harga standar untuk perbandingan estimasi harga pasar vs realisasi pembelian di lapangan.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3 w-12 text-center whitespace-nowrap">#</th>
                    <th className="p-3 min-w-[320px] whitespace-nowrap">Nama Material</th>
                    <th className="p-3 text-right min-w-[140px] whitespace-nowrap">Estimasi Qty Base</th>
                    <th className="p-3 text-right min-w-[160px] whitespace-nowrap">Harga Acuan Satuan</th>
                    <th className="p-3 text-right min-w-[160px] whitespace-nowrap">Estimasi Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {priceCatalog.map((cat, idx) => (
                    <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 text-center text-slate-400 font-sans">{idx + 1}</td>
                      <td className="p-3 font-sans font-semibold text-slate-900 dark:text-white">
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => updatePriceCatalogItem(cat.id, { name: e.target.value })}
                          className="spreadsheet-cell-input"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={cat.estimatedQty}
                          onChange={(e) => updatePriceCatalogItem(cat.id, { estimatedQty: Number(e.target.value) || 0 })}
                          className="spreadsheet-cell-input text-right text-slate-700 dark:text-slate-300"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={cat.referencePrice}
                          onChange={(e) => updatePriceCatalogItem(cat.id, { referencePrice: Number(e.target.value) || 0 })}
                          className="spreadsheet-cell-input text-right font-bold text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-3 text-right font-bold text-sky-600 dark:text-sky-400">
                        {formatIDR(cat.estimatedQty * cat.referencePrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LOG REVISI & AUDIT */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Matriks Sign-Off & Approval Tim</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeSpk.signOffs.map((sign, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {sign.role}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      sign.status === 'Approved' || sign.status === 'Done'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {sign.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {sign.name}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    Tanggal: {sign.date}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Riwayat Revisi Versi & Audit Trail
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Melacak seluruh perubahan harga, penyesuaian tarif mandor, dan justifikasi margin.
                </p>
              </div>

              <button
                onClick={() => setShowAddRevisionModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 text-white hover:bg-sky-500"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Catatan Revisi</span>
              </button>
            </div>

            <div className="space-y-4">
              {activeSpk.revisionLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-bold flex items-center justify-center text-sm font-mono shrink-0">
                    {log.version}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {log.author}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {log.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{log.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {log.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: DAILY PROGRESS REPORT (DPR) */}
      {activeTab === 'dpr' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <span>Log Aktivitas & Progres Harian ({activeSpk.clusterName})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan volume real-time lapangan dengan format siap kirim ke WhatsApp Group.
              </p>
            </div>

            <button
              onClick={() => setIsDprModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Input DPR Hari Ini</span>
            </button>
          </div>

          {/* List of DPR for this active SPK */}
          <div className="space-y-4">
            {dailyReports.filter((d) => d.spkId === activeSpk.id).length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                Belum ada log progress harian untuk cluster ini. Klik <strong>&quot;+ Input DPR Hari Ini&quot;</strong> di atas.
              </div>
            ) : (
              dailyReports
                .filter((d) => d.spkId === activeSpk.id)
                .map((report) => {
                  const isCopied = copiedDprId === report.id;
                  return (
                    <div
                      key={report.id}
                      className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {report.dayName}, {report.date}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Mandor: <strong>{report.mandorName}</strong> ({report.teamSize} Org)
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            const text = generateWhatsAppDailyReport(report);
                            navigator.clipboard.writeText(text);
                            setCopiedDprId(report.id);
                            setTimeout(() => setCopiedDprId(null), 2500);
                          }}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Tersalin!' : 'Salin Format WA'}</span>
                        </button>
                      </div>

                      {/* Items */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                        {report.items.slice(0, 8).map((item) => (
                          <div
                            key={item.id}
                            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                          >
                            <span className="font-sans text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                              {item.itemName}
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {item.totalActualQty}/{item.planQty}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Today & Tomorrow */}
                      <div className="grid grid-cols-2 gap-3 pt-1 text-[11px]">
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300">Progres Hari Ini:</strong>
                          <p className="text-slate-500">{report.activitiesToday.join(', ')}</p>
                        </div>
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300">Rencana Besok:</strong>
                          <p className="text-slate-500">{report.planTomorrow.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* DPR MODAL IN CLUSTER VIEW */}
      {isDprModalOpen && (
        <DailyProgressModal
          isOpen={true}
          onClose={() => setIsDprModalOpen(false)}
          defaultSpkId={activeSpk.id}
        />
      )}

      {/* PO MATERIAL MODAL IN CLUSTER VIEW */}
      {isPoModalOpen && (
        <MaterialPurchaseOrderModal
          isOpen={true}
          onClose={() => setIsPoModalOpen(false)}
          defaultSpkId={activeSpk.id}
          defaultSiteId={selectedPoSiteId}
        />
      )}

      {/* HANDOVER MODAL IN CLUSTER VIEW */}
      {isHandoverModalOpen && (
        <MaterialHandoverModal
          isOpen={true}
          onClose={() => setIsHandoverModalOpen(false)}
          defaultSpkId={activeSpk.id}
          defaultSiteId={selectedHandoverSiteId}
        />
      )}

      {/* Add Permit Modal */}
      {showAddPermitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl glass-card p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tambah Item Perizinan / Koordinasi (Permit)
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama / Keterangan Izin</label>
                <input
                  type="text"
                  placeholder="mis. Izin Lingkungan RT/RW Dusun..."
                  value={newPermitName}
                  onChange={(e) => setNewPermitName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <select
                    value={newPermitCat}
                    onChange={(e) => setNewPermitCat(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="Lingkungan / Warga">Lingkungan / Warga</option>
                    <option value="Dinas / Pemda">Dinas / Pemda</option>
                    <option value="Sitac / Survey">Sitac / Survey</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimasi Biaya (Rp)</label>
                  <input
                    type="number"
                    value={newPermitEst}
                    onChange={(e) => setNewPermitEst(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">PIC Sitac Lapangan</label>
                <input
                  type="text"
                  placeholder="mis. Pak Usep Kurnia"
                  value={newPermitPic}
                  onChange={(e) => setNewPermitPic(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowAddPermitModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={() => handleCreatePermitItem(showAddPermitModal)}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white"
              >
                Simpan Item Perizinan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Item Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl glass-card p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tambah Item Jasa / Pekerjaan Mandor
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Item / Pekerjaan</label>
                <input
                  type="text"
                  placeholder="mis. Pemasangan Tiang 7 meter..."
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Qty Target</label>
                  <input
                    type="number"
                    value={newServiceQty}
                    onChange={(e) => setNewServiceQty(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Satuan (UOM)</label>
                  <select
                    value={newServiceUom}
                    onChange={(e) => setNewServiceUom(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="Meter">Meter</option>
                    <option value="Set">Set</option>
                    <option value="Unit">Unit</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Core">Core</option>
                    <option value="Lot">Lot (Lump Sum)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tarif Mandor (Rp)</label>
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Remark / Catatan Teknis</label>
                <input
                  type="text"
                  placeholder="mis. Include Pemasangan Label & Pole Clamp..."
                  value={newServiceRemark}
                  onChange={(e) => setNewServiceRemark(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowAddServiceModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={() => handleCreateServiceItem(showAddServiceModal)}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white"
              >
                Simpan Item Jasa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Material Item Modal */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl glass-card p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tambah Item Material
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Material</label>
                <input
                  type="text"
                  placeholder="mis. Strand Wire Messenger 6 mm..."
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Qty</label>
                  <input
                    type="number"
                    value={newMaterialQty}
                    onChange={(e) => setNewMaterialQty(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    value={newMaterialPrice}
                    onChange={(e) => setNewMaterialPrice(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowAddMaterialModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={() => handleCreateMaterialItem(showAddMaterialModal)}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white"
              >
                Simpan Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Revision Modal */}
      {showAddRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl glass-card p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tambah Catatan Revisi / Log Audit
            </h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Versi</label>
                  <input
                    type="text"
                    value={newRevVersion}
                    onChange={(e) => setNewRevVersion(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Author / PIC</label>
                  <input
                    type="text"
                    placeholder="Nama PIC..."
                    value={newRevAuthor}
                    onChange={(e) => setNewRevAuthor(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={newRevStatus}
                    onChange={(e) => setNewRevStatus(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="Penawaran">Penawaran</option>
                    <option value="Revisi">Revisi</option>
                    <option value="OK">OK / Approved</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Perubahan / Justifikasi Margin</label>
                <textarea
                  rows={4}
                  placeholder="mis. Standar harga untuk mandor sudah di-update..."
                  value={newRevNote}
                  onChange={(e) => setNewRevNote(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowAddRevisionModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleCreateRevision}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white"
              >
                Simpan Log Revisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPK MANDOR PRINT MODAL */}
      {spkMandorSite && (
        <SpkMandorModal
          isOpen={true}
          onClose={() => setSpkMandorSite(null)}
          site={spkMandorSite}
          spk={activeSpk}
        />
      )}

      {/* FINANCE PAYMENT & KASBON REQUEST MODAL */}
      {financeReqSite && (
        <FinanceRequestModal
          isOpen={true}
          onClose={() => setFinanceReqSite(null)}
          site={financeReqSite}
          spk={activeSpk}
          defaultType={financeReqType}
        />
      )}

      {/* EXCEL IMPORT MODAL */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* ADD SITE MODAL */}
      {showAddSiteModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddSiteModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg rounded-3xl glass-card p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Tambah Site / Ruas Baru
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cluster: <strong className="text-slate-800 dark:text-slate-200">{activeSpk.clusterName}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddSiteModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newSiteName.trim()) {
                  alert('Nama Site / Rute Pekerjaan wajib diisi!');
                  return;
                }
                const selectedMandor = mandors.find((m) => m.id === newSiteMandorId);
                addSite(activeSpk.id, {
                  spkNumber: newSiteSpkNumber.trim() || activeSpk.spkNumber,
                  name: newSiteName.trim(),
                  sowType: newSiteSowType,
                  poAmount: Number(newSitePoAmount) || 0,
                  mandorId: newSiteMandorId,
                  mandorName: selectedMandor?.name || 'Mandor Lapangan',
                });
                setShowAddSiteModal(false);
                setNewSiteSpkNumber('');
                setNewSiteName('');
                setNewSitePoAmount('');
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nomor SPK <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="mis. SPK/2026/08/TA-PEMALANG-001"
                    value={newSiteSpkNumber}
                    onChange={(e) => setNewSiteSpkNumber(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tipe Scope (SOW)
                  </label>
                  <select
                    value={newSiteSowType}
                    onChange={(e: any) => setNewSiteSowType(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Distribusi">Distribusi</option>
                    <option value="Subfeeder">Subfeeder</option>
                    <option value="Feeder">Feeder</option>
                    <option value="Drop">Drop Cable</option>
                    <option value="Other">Other / Khusus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Site / Ruas Pekerjaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="mis. PULLING SUBFEEDER RUAS JALAN PEMALANG"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nilai PO dari Vendor (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="mis. 25000000"
                    value={newSitePoAmount}
                    onChange={(e) => setNewSitePoAmount(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mandor Bertugas
                </label>
                <select
                  value={newSiteMandorId}
                  onChange={(e) => setNewSiteMandorId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {mandors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.specialization || m.area})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSiteModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 active:scale-95 transition-all"
                >
                  Simpan Site Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

