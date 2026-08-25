'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { formatIDR, formatPercent } from '@/lib/calculations';
import { ScopeType } from '@/types';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Activity,
  ArrowRight,
  Download,
  Trash2,
  Building2,
  HardHat,
  ShieldCheck,
  FileCheck2,
  Layers,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenImport: () => void;
  onOpenNewCluster: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenImport,
  onOpenNewCluster,
}) => {
  const {
    calculatedSPKs,
    portfolio,
    vendors,
    mandors,
    setActiveSpkId,
    searchTerm,
    marginFilter,
    vendorFilter,
    scopeFilter,
    setMarginFilter,
    setVendorFilter,
    setScopeFilter,
    exportSPK,
    deleteSPK,
  } = useCluster();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter SPKs based on search, margin, vendor, and scope
  const filteredSPKs = calculatedSPKs.filter((spk) => {
    const matchesSearch =
      spk.clusterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spk.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spk.spkNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spk.sites.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      spk.sites.some((s) => s.mandorName?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMargin =
      marginFilter === 'all' ? true : spk.marginHealth === marginFilter;

    const matchesVendor =
      vendorFilter === 'all' ? true : spk.vendorId === vendorFilter;

    const matchesScope =
      scopeFilter === 'all' ? true : spk.scopeType === scopeFilter;

    return matchesSearch && matchesMargin && matchesVendor && matchesScope;
  });

  const getWorkflowBadge = (stage: string) => {
    switch (stage) {
      case 'DRAFT_ESTIMASI':
        return { label: '1. Draft Estimasi', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
      case 'SPK_MANDOR_DIRILIS':
        return { label: '2. SPK Mandor Rilis', bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50' };
      case 'PELAKSANAAN':
        return { label: '3. Pelaksanaan', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' };
      case 'QC_BAST':
        return { label: '4. QC & BAST', bg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50' };
      case 'SELESAI':
        return { label: '5. Selesai', bg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50' };
      default:
        return { label: stage, bg: 'bg-slate-100 text-slate-700' };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Cluster Control Center
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Multi-Vendor Portfolio
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitoring kontrak vendor, kalkulasi gross margin, SPK mandor, dan progress fisik lapangan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 rotate-180" />
            <span>Upload Excel</span>
          </button>

          <button
            onClick={onOpenNewCluster}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 text-white shadow-sm transition-all active:scale-95"
          >
            <span>+ SPK Cluster Baru</span>
          </button>
        </div>
      </div>

      {/* 3 Vendor Status Strip - Clean & Subtle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {vendors.map((v) => {
          const vendorSpks = calculatedSPKs.filter((s) => s.vendorId === v.id);
          const vendorPO = vendorSpks.reduce((sum, s) => sum + s.totalPO, 0);
          const vendorMargin = vendorSpks.reduce((sum, s) => sum + s.marginRp, 0);
          const vendorMarginPct = vendorPO > 0 ? (vendorMargin / vendorPO) * 100 : 0;
          const isSelected = vendorFilter === v.id;

          return (
            <div
              key={v.id}
              onClick={() => setVendorFilter(isSelected ? 'all' : v.id)}
              className={`p-3.5 rounded-xl glass-card cursor-pointer transition-all ${
                isSelected
                  ? 'ring-1.5 ring-slate-900 dark:ring-sky-500 border-slate-900 dark:border-sky-500 bg-slate-50/50 dark:bg-slate-850/50'
                  : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                      {v.name}
                    </h3>
                  </div>
                  <span className="inline-block px-1.5 py-0.2 text-[9px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-1">
                    {v.scopeType === 'END_TO_END' ? 'End-to-End (Permit+Impl)' : 'Implementation Only'}
                  </span>
                </div>

                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {vendorSpks.length} Cluster
                </span>
              </div>

              <div className="flex items-center justify-between text-xs mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 text-[11px]">PO: <strong className="text-slate-800 dark:text-slate-200 font-mono font-semibold">{formatIDR(vendorPO)}</strong></span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                  Margin {formatPercent(vendorMarginPct, 1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top KPI Metrics Strip - Professional & Clean */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Revenue Card */}
        <div className="p-4 rounded-xl glass-card space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Revenue (PO Vendor)
            </span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
            {formatIDR(portfolio.totalPO)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>{portfolio.totalClusters} Cluster SPK</span>
            <span>•</span>
            <span>{portfolio.totalSites} Sites</span>
          </div>
        </div>

        {/* Cost Card */}
        <div className="p-4 rounded-xl glass-card space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Biaya (Jasa + Mat)
            </span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
            {formatIDR(portfolio.totalCost)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Jasa: <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatIDR(portfolio.totalJasa)}</strong></span>
            <span>Mat: <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatIDR(portfolio.totalMaterial)}</strong></span>
          </div>
        </div>

        {/* Margin Card */}
        <div className="p-4 rounded-xl glass-card space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Gross Profit Margin
            </span>
            <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
              portfolio.overallMarginPercent >= 25
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
            }`}>
              {formatPercent(portfolio.overallMarginPercent)}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            {formatIDR(portfolio.overallMarginRp)}
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(0, portfolio.overallMarginPercent))}%` }}
            />
          </div>
        </div>

        {/* Progress Card */}
        <div className="p-4 rounded-xl glass-card space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Rata-rata Progres Fisik
            </span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
            {formatPercent(portfolio.avgProgress)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Sisa Termin:</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {formatIDR(portfolio.pendingPayment)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Strip: Margin, Scope & View Mode */}
      <div className="p-3.5 rounded-xl glass-card flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Filter:
          </span>

          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">Semua Vendor ({calculatedSPKs.length})</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">Semua Scope</option>
            <option value="IMPLEMENTATION_ONLY">Implementation Only</option>
            <option value="END_TO_END">End-to-End (Permit+Impl)</option>
          </select>

          <div className="h-4 w-px bg-slate-200 dark:border-slate-800 mx-1 hidden sm:block" />

          <button
            onClick={() => setMarginFilter('all')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              marginFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Semua Margin
          </button>

          <button
            onClick={() => setMarginFilter('healthy')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              marginFilter === 'healthy'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Sehat (&ge;25%)
          </button>

          <button
            onClick={() => setMarginFilter('warning')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              marginFilter === 'warning'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Waspada (15-25%)
          </button>

          <button
            onClick={() => setMarginFilter('danger')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              marginFilter === 'danger'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Kritis (&lt;15%)
          </button>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Tampilan Kartu Grid"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Tampilan Tabel Rinci"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CLUSTER LIST: GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSPKs.map((spk) => {
            const workflowBadge = getWorkflowBadge(spk.workflowStage);

            return (
              <div
                key={spk.id}
                className="rounded-xl glass-card flex flex-col justify-between hover:shadow-md transition-all duration-150 border border-slate-200 dark:border-slate-800 overflow-hidden group"
              >
                {/* Card Top */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {spk.vendorName}
                        </span>
                        <span className={`px-1.5 py-0.2 text-[10px] font-semibold rounded ${workflowBadge.bg}`}>
                          {workflowBadge.label}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {spk.clusterName}
                      </h3>
                    </div>

                    {/* Margin Badge */}
                    <div className={`text-right px-2 py-0.5 rounded-lg border flex-shrink-0 ${
                      spk.marginHealth === 'healthy'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                        : spk.marginHealth === 'warning'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
                    }`}>
                      <span className="text-[9px] uppercase font-semibold block leading-none">Margin</span>
                      <span className="text-xs font-bold font-mono">
                        {formatPercent(spk.marginPercent)}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono truncate" title={spk.spkNumber}>
                    {spk.spkNumber}
                  </p>

                  {/* Financial Breakdown Grid */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Nilai PO Vendor</span>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono text-[11px]">
                        {formatIDR(spk.totalPO)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Gross Margin</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                        {formatIDR(spk.marginRp)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Jasa Mandor</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                        {formatIDR(spk.totalJasa)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Material Aksesoris</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                        {formatIDR(spk.totalMaterial)}
                      </span>
                    </div>
                  </div>

                  {/* Mandor Assigned Tag */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <HardHat className="w-3 h-3 text-slate-400" />
                      <span>Mandor Bertugas:</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {spk.sites.map((site) => (
                        <span
                          key={site.id}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px]"
                          title={`${site.name} -> ${site.mandorName || 'Belum di-assign'}`}
                        >
                          {site.mandorName || 'Mandor External'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Progres Fisik</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {formatPercent(spk.avgProgress)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-slate-900 dark:bg-sky-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, spk.avgProgress))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => exportSPK(spk.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                      title="Export ke file Excel (.xlsx)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus data SPK "${spk.clusterName}"?`)) {
                          deleteSPK(spk.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Hapus Cluster"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveSpkId(spk.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-all shadow-sm"
                  >
                    <span>Buka Worksheet</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CLUSTER LIST: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl glass-card">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">Nama Cluster & Vendor</th>
                <th className="p-3">Tahap Workflow</th>
                <th className="p-3 text-right">Nilai PO Vendor</th>
                <th className="p-3 text-right">Total Biaya</th>
                <th className="p-3 text-right">Gross Margin</th>
                <th className="p-3 text-right">Margin %</th>
                <th className="p-3 text-center">Progres Fisik</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredSPKs.map((spk) => {
                const workflowBadge = getWorkflowBadge(spk.workflowStage);
                return (
                  <tr key={spk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-sans">
                      <strong className="text-slate-900 dark:text-white block text-xs">
                        {spk.clusterName}
                      </strong>
                      <span className="text-[11px] text-slate-400">
                        {spk.vendorName} • {spk.spkNumber}
                      </span>
                    </td>
                    <td className="p-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${workflowBadge.bg}`}>
                        {workflowBadge.label}
                      </span>
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">
                      {formatIDR(spk.totalPO)}
                    </td>
                    <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                      {formatIDR(spk.totalEksternal)}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatIDR(spk.marginRp)}
                    </td>
                    <td className="p-3 text-right font-bold">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                        spk.marginHealth === 'healthy'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : spk.marginHealth === 'warning'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {formatPercent(spk.marginPercent)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatPercent(spk.avgProgress)}
                      </span>
                    </td>
                    <td className="p-3 text-center font-sans">
                      <button
                        onClick={() => setActiveSpkId(spk.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 transition-colors"
                      >
                        Buka
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
