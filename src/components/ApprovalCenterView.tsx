'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import {
  SPK,
  MaterialPurchaseOrder,
  MandorPaymentRequest,
  DailyProgressReport,
  ApprovalLog,
  UserRole,
} from '@/types';
import { formatIDR, formatPercent } from '@/lib/calculations';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck2,
  ShoppingBag,
  Wallet,
  Calendar,
  Layers,
  Search,
  Filter,
  UserCheck,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ChevronRight,
  History,
  X,
} from 'lucide-react';

export const ApprovalCenterView: React.FC = () => {
  const {
    spks,
    materialPurchaseOrders,
    paymentRequests,
    dailyReports,
    approvalLogs,
    currentUser,
    updateWorkflowStage,
    updateMaterialPOStatus,
    updatePaymentRequestStatus,
    addApprovalLog,
  } = useCluster();

  const [activeTab, setActiveTab] = useState<
    'all' | 'spk' | 'materials' | 'finance' | 'dpr' | 'history'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Action Modal State
  const [modalAction, setModalAction] = useState<{
    type: 'SPK_MANDOR' | 'MATERIAL_PO' | 'PAYMENT_REQUEST' | 'DPR';
    id: string;
    title: string;
    action: 'APPROVE' | 'REJECT';
    spkId?: string;
  } | null>(null);

  const [actionNotes, setActionNotes] = useState('');

  // Pending Items Collection
  // 1. Pending SPK Mandor (Draft Stage)
  const pendingSpks = spks.filter((s) => s.workflowStage === 'DRAFT_ESTIMASI');

  // 2. Pending Material POs (Pending Approval or Approved waiting for Finance payment)
  const pendingMaterialPos = materialPurchaseOrders.filter(
    (po) => po.status === 'PENDING_APPROVAL' || po.status === 'APPROVED'
  );

  // 3. Pending Payment Requests (Termin & Kasbon pending Finance)
  const pendingPaymentRequests = paymentRequests.filter(
    (req) => req.status === 'PENDING_FINANCE' || req.status === 'APPROVED'
  );

  // Total Pending Count
  const totalPendingCount =
    pendingSpks.length +
    pendingMaterialPos.length +
    pendingPaymentRequests.length;

  // Permission Checker
  const canApproveSpk =
    currentUser.role === 'PROJECT_MANAGER' || currentUser.role === 'SUPER_ADMIN';

  const canApproveMaterialPO = (status: string) => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (status === 'PENDING_APPROVAL') {
      return currentUser.role === 'PROJECT_MANAGER';
    }
    if (status === 'APPROVED') {
      return currentUser.role === 'FINANCE';
    }
    return false;
  };

  const canApprovePaymentRequest = (status: string) => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (status === 'PENDING_FINANCE') {
      return currentUser.role === 'PROJECT_MANAGER' || currentUser.role === 'FINANCE';
    }
    return currentUser.role === 'FINANCE';
  };

  // Execution Handlers
  const handleOpenActionModal = (
    type: 'SPK_MANDOR' | 'MATERIAL_PO' | 'PAYMENT_REQUEST' | 'DPR',
    id: string,
    title: string,
    action: 'APPROVE' | 'REJECT',
    spkId?: string
  ) => {
    setModalAction({ type, id, title, action, spkId });
    setActionNotes(
      action === 'APPROVE'
        ? `Disetujui oleh ${currentUser.name} (${currentUser.roleLabel})`
        : `Ditolak oleh ${currentUser.name} (${currentUser.roleLabel}): Perlu penyesuaian kembali.`
    );
  };

  const handleConfirmAction = () => {
    if (!modalAction) return;

    const { type, id, title, action, spkId } = modalAction;

    if (type === 'SPK_MANDOR') {
      if (action === 'APPROVE') {
        updateWorkflowStage(id, 'SPK_MANDOR_DIRILIS');
      }
    } else if (type === 'MATERIAL_PO') {
      const po = materialPurchaseOrders.find((p) => p.id === id);
      if (po) {
        if (action === 'APPROVE') {
          if (po.status === 'PENDING_APPROVAL') {
            updateMaterialPOStatus(id, 'APPROVED');
          } else if (po.status === 'APPROVED') {
            updateMaterialPOStatus(id, 'PAID', 'TRF-SUPPLIER-OK', new Date().toISOString().slice(0, 10));
          }
        } else {
          updateMaterialPOStatus(id, 'REJECTED');
        }
      }
    } else if (type === 'PAYMENT_REQUEST') {
      if (action === 'APPROVE') {
        const req = paymentRequests.find((r) => r.id === id);
        if (req?.status === 'PENDING_FINANCE') {
          updatePaymentRequestStatus(id, 'APPROVED', actionNotes);
        } else {
          updatePaymentRequestStatus(
            id,
            'PAID',
            actionNotes,
            'TRF-MANDOR-OK',
            new Date().toISOString().slice(0, 10)
          );
        }
      } else {
        updatePaymentRequestStatus(id, 'REJECTED', actionNotes);
      }
    }

    // Add Audit Log
    addApprovalLog({
      entityType: type,
      entityId: id,
      entityTitle: title,
      action: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      actedByRole: currentUser.role,
      actedByName: currentUser.name,
      notes: actionNotes,
    });

    setModalAction(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Pusat Persetujuan (Approval Center)
            </h2>
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Multi-Level Workflow
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Antrean persetujuan resmi: Rilis SPK Mandor, PO Belanja Material, Pengajuan Termin & Kasbon, serta validasi DPR.
          </p>
        </div>

        {/* Current Active User Banner */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl glass-card text-xs">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-300 dark:ring-slate-700"
          />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">
              Approver Login:
            </span>
            <strong className="text-slate-900 dark:text-white font-bold text-xs block">
              {currentUser.name}
            </strong>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">
              {currentUser.roleLabel.split('(')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl glass-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Antrean Pending
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
            {totalPendingCount} Dokumen
          </p>
          <span className="text-[11px] text-slate-500">Memerlukan tinjauan & persetujuan</span>
        </div>

        <div className="p-4 rounded-xl glass-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Wewenang Role Anda
            </span>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-1 truncate">
            {currentUser.role === 'PROJECT_MANAGER'
              ? 'Validasi Teknis & PM Approval'
              : currentUser.role === 'FINANCE'
              ? 'Validasi Kas & Eksekusi Bayar'
              : currentUser.role === 'SUPER_ADMIN'
              ? 'Otoritas Penuh (Direksi)'
              : 'Viewer / Drafter'}
          </p>
          <span className="text-[11px] text-slate-500">{currentUser.department}</span>
        </div>

        <div className="p-4 rounded-xl glass-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Riwayat Persetujuan
            </span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
            {approvalLogs.length} Aksi
          </p>
          <span className="text-[11px] text-slate-500">Audit trail tercatat dalam sistem</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            Semua Antrean ({totalPendingCount})
          </button>

          <button
            onClick={() => setActiveTab('spk')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'spk'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>SPK Mandor</span>
            {pendingSpks.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                {pendingSpks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'materials'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>PO Material Aksesoris</span>
            {pendingMaterialPos.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                {pendingMaterialPos.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'finance'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>Termin & Kasbon Mandor</span>
            {pendingPaymentRequests.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                {pendingPaymentRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail ({approvalLogs.length})</span>
          </button>
        </div>
      </div>

      {/* PENDING APPROVAL LIST */}
      {activeTab !== 'history' && (
        <div className="space-y-4">
          {totalPendingCount === 0 && (
            <div className="p-12 text-center rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Semua Dokumen Telah Diproses!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tidak ada dokumen yang sedang menunggu persetujuan. Anda dapat melihat riwayat pada tab Audit Trail.
              </p>
            </div>
          )}

          {/* 1. SPK MANDOR SECTION */}
          {(activeTab === 'all' || activeTab === 'spk') && pendingSpks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-sky-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Persetujuan Rilis SPK Mandor ({pendingSpks.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSpks.map((spk) => {
                  const allowed = canApproveSpk;
                  return (
                    <div
                      key={spk.id}
                      className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="font-mono text-[10px] font-bold text-sky-600 uppercase">
                            Draft SPK Mandor
                          </span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {spk.clusterName}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Vendor: <strong>{spk.vendorName}</strong> ({spk.sites.length} Site)
                          </p>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Menunggu Approval PM
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                        <div>
                          <span className="text-[10px] text-slate-400 font-sans block">Total SOW Jasa:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatIDR(
                              spk.sites.reduce(
                                (acc, s) =>
                                  acc +
                                  s.services.reduce((sAcc, srv) => sAcc + srv.qty * srv.unitPrice, 0),
                                0
                              )
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-sans block">Mandor Ditunjuk:</span>
                          <span className="font-sans font-bold text-sky-600 dark:text-sky-400">
                            {spk.sites[0]?.mandorName || 'Mandor Lapangan'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-slate-500">
                          {allowed ? '✅ Anda berwenang merilis SPK ini' : '⚠️ Hanya PM/Direktur yang berwenang'}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            disabled={!allowed}
                            onClick={() =>
                              handleOpenActionModal(
                                'SPK_MANDOR',
                                spk.id,
                                `Rilis SPK Mandor: ${spk.clusterName}`,
                                'APPROVE'
                              )
                            }
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Rilis</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. MATERIAL PO SECTION */}
          {(activeTab === 'all' || activeTab === 'materials') && pendingMaterialPos.length > 0 && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Persetujuan PO Belanja Material Aksesoris ({pendingMaterialPos.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingMaterialPos.map((po) => {
                  const allowed = canApproveMaterialPO(po.status);
                  return (
                    <div
                      key={po.id}
                      className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="font-mono text-amber-600 font-bold block text-xs">
                            {po.poNumber}
                          </span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                            Supplier: {po.supplierName}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Cluster: <strong>{po.clusterName}</strong> ({po.purchaseDate})
                          </p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            po.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {po.status === 'PENDING_APPROVAL'
                            ? 'Menunggu Approval PM'
                            : 'Approved (Menunggu Finance Transfer)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                        <div>
                          <span className="text-[10px] text-slate-400 font-sans block">Total Belanja Material:</span>
                          <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                            {formatIDR(po.totalAmount)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-sans block">Rekening Toko:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {po.supplierBankName || 'BCA'} - {po.supplierBankAccount || '-'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-slate-500">
                          {allowed
                            ? `✅ Wewenang ${currentUser.roleLabel}`
                            : po.status === 'PENDING_APPROVAL'
                            ? '⚠️ Menunggu approval PM'
                            : '⚠️ Menunggu eksekusi Finance'}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            disabled={!allowed}
                            onClick={() =>
                              handleOpenActionModal(
                                'MATERIAL_PO',
                                po.id,
                                `PO ${po.poNumber} (${po.supplierName})`,
                                'REJECT'
                              )
                            }
                            className="px-2.5 py-1.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40 font-bold"
                          >
                            Tolak
                          </button>

                          <button
                            disabled={!allowed}
                            onClick={() =>
                              handleOpenActionModal(
                                'MATERIAL_PO',
                                po.id,
                                `PO ${po.poNumber} (${po.supplierName})`,
                                'APPROVE'
                              )
                            }
                            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {po.status === 'PENDING_APPROVAL' ? 'Approve PO' : 'Konfirmasi Transfer'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. FINANCE TERMIN & KASBON SECTION */}
          {(activeTab === 'all' || activeTab === 'finance') && pendingPaymentRequests.length > 0 && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Persetujuan Pencairan Dana Mandor (Termin / Kasbon) ({pendingPaymentRequests.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingPaymentRequests.map((req) => {
                  const allowed = canApprovePaymentRequest(req.status);
                  return (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="font-mono text-indigo-600 font-bold block text-xs">
                            {req.requestNo}
                          </span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                            Mandor: {req.mandorName}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Cluster: <strong>{req.clusterName}</strong> ({req.siteName})
                          </p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            req.status === 'PENDING_FINANCE'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {req.type} - {req.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Amount Details */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 font-mono text-[11px]">
                        <div>
                          <span className="text-[10px] text-slate-400 font-sans block">Nominal Diajukan:</span>
                          <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                            {formatIDR(req.requestedAmount)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-sans block">Potongan Kasbon:</span>
                          <span className="font-bold text-amber-600">
                            -{formatIDR(req.deductedKasbon || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Rule Verification */}
                      {req.verifiedProgressPercent > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Progres Fisik DPR Terverifikasi: {req.verifiedProgressPercent}%</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-slate-500">
                          {allowed ? `✅ Hak akses ${currentUser.roleLabel}` : '⚠️ Perlu wewenang PM / Finance'}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            disabled={!allowed}
                            onClick={() =>
                              handleOpenActionModal(
                                'PAYMENT_REQUEST',
                                req.id,
                                `${req.type} ${req.mandorName} (${req.requestNo})`,
                                'REJECT'
                              )
                            }
                            className="px-2.5 py-1.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40 font-bold"
                          >
                            Tolak
                          </button>

                          <button
                            disabled={!allowed}
                            onClick={() =>
                              handleOpenActionModal(
                                'PAYMENT_REQUEST',
                                req.id,
                                `${req.type} ${req.mandorName} (${req.requestNo})`,
                                'APPROVE'
                              )
                            }
                            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {req.status === 'PENDING_FINANCE' ? 'Approve Pembayaran' : 'Konfirmasi Transfer'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL LOGS */}
      {activeTab === 'history' && (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl glass-card">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">Waktu & Tanggal</th>
                <th className="p-3">Tipe Entitas</th>
                <th className="p-3">Keterangan Dokumen</th>
                <th className="p-3">Tindakan</th>
                <th className="p-3">Approver</th>
                <th className="p-3">Catatan Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {approvalLogs.map((log, idx) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 text-center font-sans text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                    {log.timestamp}
                  </td>
                  <td className="p-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {log.entityType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">
                    {log.entityTitle}
                  </td>
                  <td className="p-3 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-sans">
                    <strong className="text-slate-800 dark:text-slate-200 block">{log.actedByName}</strong>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400">{log.actedByRole}</span>
                  </td>
                  <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                    {log.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CONFIRMATION / NOTES MODAL */}
      {modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl glass-card p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {modalAction.action === 'APPROVE' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500" />
                )}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Konfirmasi {modalAction.action === 'APPROVE' ? 'Persetujuan' : 'Penolakan'}
                </h3>
              </div>
              <button onClick={() => setModalAction(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Dokumen:</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{modalAction.title}</p>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 block">
                  Approver: {currentUser.name} ({currentUser.roleLabel})
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Persetujuan / Alasan:
                </label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className={`px-4 py-2 rounded-xl text-white font-bold ${
                    modalAction.action === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20'
                  }`}
                >
                  Konfirmasi {modalAction.action === 'APPROVE' ? 'Setujui' : 'Tolak'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
