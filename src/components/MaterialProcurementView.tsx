'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { MaterialPurchaseOrder, MaterialHandover } from '@/types';
import { formatIDR, formatPercent } from '@/lib/calculations';
import { MaterialPurchaseOrderModal } from '@/components/MaterialPurchaseOrderModal';
import { MaterialHandoverModal } from '@/components/MaterialHandoverModal';
import { MaterialPurchaseVoucherModal } from '@/components/MaterialPurchaseVoucherModal';
import {
  Package,
  ShoppingBag,
  Truck,
  Plus,
  Search,
  Filter,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  Printer,
  Trash2,
  Edit2,
  DollarSign,
  TrendingDown,
  ArrowRight,
  Sparkles,
  FileCheck2,
  HardHat,
} from 'lucide-react';

export const MaterialProcurementView: React.FC = () => {
  const {
    spks,
    materialPurchaseOrders,
    materialHandovers,
    dailyReports,
    updateMaterialPOStatus,
    deleteMaterialPO,
    deleteMaterialHandover,
  } = useCluster();

  const [activeTab, setActiveTab] = useState<'inventory' | 'pos' | 'handovers'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState('ALL');

  // Modals
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [selectedPoForVoucher, setSelectedPoForVoucher] = useState<MaterialPurchaseOrder | null>(null);

  // Filtered dataset for KPIs according to selected cluster
  const filteredSpksForKPI = selectedClusterFilter === 'ALL'
    ? spks
    : spks.filter((s) => s.id === selectedClusterFilter);

  const filteredPOsForKPI = selectedClusterFilter === 'ALL'
    ? materialPurchaseOrders
    : materialPurchaseOrders.filter((po) => po.spkId === selectedClusterFilter);

  // Financial KPIs
  const totalBudgetMaterial = filteredSpksForKPI.reduce((acc, spk) => {
    return (
      acc +
      (spk.sites || []).reduce((sAcc, site) => {
        return (
          sAcc +
          (site.materials || []).reduce((mAcc, mat) => mAcc + (mat.qty * mat.unitPrice), 0)
        );
      }, 0)
    );
  }, 0);

  const totalActualPoAmount = filteredPOsForKPI
    .filter((po) => po.status !== 'REJECTED')
    .reduce((acc, po) => acc + po.totalAmount, 0);

  const totalPaidPoAmount = filteredPOsForKPI
    .filter((po) => po.status === 'PAID' || po.status === 'RECEIVED_GUDANG')
    .reduce((acc, po) => acc + po.totalAmount, 0);

  const costSavings = totalBudgetMaterial - totalActualPoAmount;
  const savingsPercent = totalBudgetMaterial > 0 ? (costSavings / totalBudgetMaterial) * 100 : 0;

  // Flattened materials across all sites/clusters for Inventory Matrix (strictly dynamic from cluster data)
  const allClusterMaterials = spks.flatMap((spk) =>
    (spk.sites || []).flatMap((site) =>
      (site.materials || []).map((mat) => {
        // Calculate total purchased for this material name across POs
        const totalPurchased = materialPurchaseOrders
          .filter((po) => po.siteId === site.id && po.status !== 'REJECTED')
          .flatMap((po) => po.items || [])
          .filter((item) => item.materialName.toLowerCase().trim() === mat.name.toLowerCase().trim())
          .reduce((sum, item) => sum + item.qty, 0);

        // Calculate total handed over to mandor
        const totalHandedOver = materialHandovers
          .filter((h) => h.siteId === site.id)
          .flatMap((h) => h.items || [])
          .filter((item) => item.materialName.toLowerCase().trim() === mat.name.toLowerCase().trim())
          .reduce((sum, item) => sum + item.qty, 0);

        // Calculate installed quantity from DPR
        const installedDprQty = dailyReports
          .filter((d) => d.siteId === site.id)
          .flatMap((d) => d.items || [])
          .filter((item) => item.itemName.toLowerCase().trim() === mat.name.toLowerCase().trim())
          .reduce((sum, item) => sum + (item.totalActualQty || 0), 0);

        const stockGudang = Math.max(0, totalPurchased - totalHandedOver);

        return {
          ...mat,
          spkId: spk.id,
          clusterName: spk.clusterName,
          siteId: site.id,
          siteName: site.name,
          vendorName: spk.vendorName,
          mandorName: site.mandorName || 'Mandor Lapangan',
          totalPurchased,
          totalHandedOver,
          installedDprQty,
          stockGudang,
        };
      })
    )
  );

  const filteredMaterials = allClusterMaterials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.clusterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.siteName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCluster =
      selectedClusterFilter === 'ALL' || m.spkId === selectedClusterFilter;
    return matchesSearch && matchesCluster;
  });

  const filteredPos = materialPurchaseOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.clusterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCluster =
      selectedClusterFilter === 'ALL' || po.spkId === selectedClusterFilter;
    return matchesSearch && matchesCluster;
  });

  const filteredHandovers = materialHandovers.filter((h) => {
    const matchesSearch =
      h.suratJalanNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.mandorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.clusterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCluster =
      selectedClusterFilter === 'ALL' || h.spkId === selectedClusterFilter;
    return matchesSearch && matchesCluster;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Material & Aksesoris Procurement Hub
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Aksesoris & Fasteners Control
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pengadaan aksesoris instalasi FTTH, PO ke supplier, pencairan dana Finance, dan serah terima material ke mandor.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsHandoverModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700"
          >
            <Truck className="w-3.5 h-3.5 text-sky-500" />
            <span>+ Surat Jalan Mandor</span>
          </button>

          <button
            onClick={() => setIsPoModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat PO Belanja Material</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Budget BOQ Material
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatIDR(totalBudgetMaterial)}
          </p>
          <span className="text-xs text-slate-500">Estimasi acuan seluruh cluster</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">
            Total Realisasi Belanja PO
          </span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {formatIDR(totalActualPoAmount)}
          </p>
          <span className="text-xs text-slate-500">
            {materialPurchaseOrders.length} PO Belanja Supplier Diajukan
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">
            Penghematan Belanja (Cost Variance)
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatIDR(costSavings)}
          </p>
          <span className="text-xs text-emerald-600 font-semibold">
            Efisiensi: +{savingsPercent.toFixed(1)}% dari Budget
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-sky-500 uppercase tracking-wider block">
            Realisasi Kas Keluar Finance
          </span>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
            {formatIDR(totalPaidPoAmount)}
          </p>
          <span className="text-xs text-slate-500">Dana ditransfer ke Supplier</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'inventory'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Matriks Monitoring & Stok Material Aksesoris</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'pos'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Daftar PO Belanja Supplier ({materialPurchaseOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('handovers')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'handovers'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Surat Jalan Serah Terima ke Mandor ({materialHandovers.length})</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 pb-2">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari material, supplier, nomor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            />
          </div>

          <select
            value={selectedClusterFilter}
            onChange={(e) => setSelectedClusterFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold"
          >
            <option value="ALL">Semua Cluster</option>
            {spks.map((s) => (
              <option key={s.id} value={s.id}>
                {s.clusterName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB 1: INVENTORY & MATRIKS STOK AKSESORIS */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs flex items-center justify-between">
            <p className="text-amber-800 dark:text-amber-300 font-medium">
              💡 <strong>Matriks Alur Material:</strong> Target BOQ → Dibeli dari Supplier (PO) → Diserahkan ke Mandor (Surat Jalan) → Terpasang di Lapangan (DPR) → Sisa Stok Gudang.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl glass-card">
            <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3 whitespace-nowrap">Cluster & Site</th>
                  <th className="p-3 whitespace-nowrap">Nama Material / Aksesoris</th>
                  <th className="p-3 text-right whitespace-nowrap">Target BOQ</th>
                  <th className="p-3 text-right text-amber-600 whitespace-nowrap">Total Dibeli (PO)</th>
                  <th className="p-3 text-right text-sky-600 whitespace-nowrap">Diserahkan Mandor</th>
                  <th className="p-3 text-right font-black text-emerald-600 whitespace-nowrap">Terpasang (DPR)</th>
                  <th className="p-3 text-right font-bold text-indigo-600 whitespace-nowrap">Stok Gudang</th>
                  <th className="p-3 text-right whitespace-nowrap">Budget Estimasi</th>
                  <th className="p-3 text-center whitespace-nowrap">Status Pemenuhan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {filteredMaterials.map((mat, idx) => {
                  return (
                    <tr key={`${mat.siteId}-${mat.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-sans">
                        <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[180px]">
                          {mat.clusterName}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[180px] block">
                          {mat.siteName}
                        </span>
                      </td>

                      <td className="p-3 font-sans">
                        <strong className="text-slate-800 dark:text-slate-200 block">
                          {mat.name}
                        </strong>
                        <span className="text-[10px] text-slate-400">Mandor: {mat.mandorName}</span>
                      </td>

                      <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {mat.qty} {mat.uom || 'Pcs'}
                      </td>

                      <td className="p-3 text-right font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        {mat.totalPurchased}
                      </td>

                      <td className="p-3 text-right font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                        {mat.totalHandedOver}
                      </td>

                      <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {mat.installedDprQty}
                      </td>

                      <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {mat.stockGudang}
                      </td>

                      <td className="p-3 text-right text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {formatIDR(mat.qty * mat.unitPrice)}
                      </td>

                      <td className="p-3 text-center font-sans whitespace-nowrap">
                        {mat.totalPurchased === 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Belum Belanja (0%)
                          </span>
                        ) : mat.totalPurchased < mat.qty ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Sebagian ({Math.round((mat.totalPurchased / mat.qty) * 100)}%)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Stok Terpenuhi ✓
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PURCHASE ORDERS (PO) BELANJA SUPPLIER */}
      {activeTab === 'pos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPos.map((po) => (
              <div
                key={po.id}
                className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition-all text-xs"
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm block">
                      {po.poNumber}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {po.supplierName}
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Cluster: <strong>{po.clusterName}</strong> ({po.purchaseDate})
                    </p>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    po.status === 'PAID' || po.status === 'RECEIVED_GUDANG'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : po.status === 'APPROVED'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {po.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Items Summary */}
                <div className="space-y-1.5 font-mono text-[11px]">
                  {po.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="font-sans truncate max-w-[200px]">
                        • {item.materialName} ({item.qty} {item.uom})
                      </span>
                      <span>{formatIDR(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                {/* Total & Finance Confirmation */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Nilai PO</span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                      {formatIDR(po.totalAmount)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Metode:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {po.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    {po.status === 'PENDING_APPROVAL' && (
                      <button
                        onClick={() => updateMaterialPOStatus(po.id, 'APPROVED')}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]"
                      >
                        Approve PO
                      </button>
                    )}
                    {po.status === 'APPROVED' && (
                      <button
                        onClick={() => updateMaterialPOStatus(po.id, 'PAID', 'TRF-SUPPLIER-OK')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                      >
                        Konfirmasi Transfer Finance
                      </button>
                    )}
                    {po.status === 'PAID' && (
                      <button
                        onClick={() => updateMaterialPOStatus(po.id, 'RECEIVED_GUDANG', undefined, undefined, 'SJ-GUDANG-OK')}
                        className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px]"
                      >
                        Konfirmasi Diterima di Gudang
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPoForVoucher(po)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-500" />
                      <span>Cetak PO</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus PO ${po.poNumber}?`)) {
                          deleteMaterialPO(po.id);
                        }
                      }}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SURAT JALAN SERAH TERIMA KE MANDOR */}
      {activeTab === 'handovers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHandovers.map((h) => (
              <div
                key={h.id}
                className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition-all text-xs"
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm block">
                      {h.suratJalanNo}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white mt-0.5">
                      Penerima: {h.mandorName}
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Cluster: <strong>{h.clusterName}</strong> ({h.handoverDate})
                    </p>
                  </div>

                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {h.status}
                  </span>
                </div>

                {/* Handover Details */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Penerima Lapangan:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{h.receiverName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Diserahkan Oleh:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{h.deliveredBy}</strong>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-1 font-mono text-[11px]">
                  <span className="font-sans font-bold text-slate-500 uppercase text-[10px] block">
                    Barang yang Diserahkan ({h.items.length} Item):
                  </span>
                  {h.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="font-sans">• {item.materialName}</span>
                      <span className="font-bold text-sky-600 dark:text-sky-400">{item.qty} {item.uom}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px]">BAST Material Valid</span>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus Surat Jalan ${h.suratJalanNo}?`)) {
                        deleteMaterialHandover(h.id);
                      }
                    }}
                    className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PO MODAL */}
      {isPoModalOpen && (
        <MaterialPurchaseOrderModal
          isOpen={true}
          onClose={() => setIsPoModalOpen(false)}
        />
      )}

      {/* HANDOVER MODAL */}
      {isHandoverModalOpen && (
        <MaterialHandoverModal
          isOpen={true}
          onClose={() => setIsHandoverModalOpen(false)}
        />
      )}

      {/* PRINT VOUCHER MODAL */}
      {selectedPoForVoucher && (
        <MaterialPurchaseVoucherModal
          isOpen={true}
          onClose={() => setSelectedPoForVoucher(null)}
          po={selectedPoForVoucher}
        />
      )}
    </div>
  );
};
