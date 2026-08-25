'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { formatIDR, formatPercent } from '@/lib/calculations';
import { MandorPaymentRequest, PaymentRequestStatus } from '@/types';
import { FinanceVoucherModal } from '@/components/FinanceVoucherModal';
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  CreditCard,
  Building,
  UserCheck,
  Send,
  XCircle,
  Check,
  Search,
} from 'lucide-react';

export const FinancePaymentHub: React.FC = () => {
  const {
    paymentRequests,
    mandors,
    updatePaymentRequestStatus,
    deletePaymentRequest,
  } = useCluster();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'KASBON'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoucherReq, setSelectedVoucherReq] = useState<MandorPaymentRequest | null>(null);

  // Transfer modal
  const [transferringReq, setTransferringReq] = useState<MandorPaymentRequest | null>(null);
  const [transferRef, setTransferRef] = useState(`TRF-${Math.floor(Math.random() * 90000000 + 10000000)}`);
  const [financeNote, setFinanceNote] = useState('Telah ditransfer via Internet Banking ke rekening Mandor');

  // KPIs
  const totalPendingFinance = paymentRequests
    .filter((r) => r.status === 'PENDING_FINANCE' || r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.netTransferAmount, 0);

  const totalPaidFinance = paymentRequests
    .filter((r) => r.status === 'PAID')
    .reduce((sum, r) => sum + r.netTransferAmount, 0);

  const totalOutstandingKasbon = mandors.reduce((sum, m) => sum + m.outstandingKasbon, 0);

  const pendingRequestsCount = paymentRequests.filter(
    (r) => r.status === 'PENDING_FINANCE' || r.status === 'APPROVED'
  ).length;

  const filteredRequests = paymentRequests.filter((r) => {
    const matchesSearch =
      r.requestNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mandorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.clusterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.accountNumber.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PENDING'
        ? r.status === 'PENDING_FINANCE' || r.status === 'APPROVED'
        : statusFilter === 'PAID'
        ? r.status === 'PAID'
        : r.type === 'KASBON';

    return matchesSearch && matchesStatus;
  });

  const handleConfirmTransfer = () => {
    if (!transferringReq) return;
    updatePaymentRequestStatus(
      transferringReq.id,
      'PAID',
      financeNote,
      transferRef,
      new Date().toISOString().split('T')[0]
    );
    setTransferringReq(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Finance & Ops Mandor Payment Hub
          </h2>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            Request to Finance
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Alur pengajuan termin & kasbon mandor dari Tim Operasi untuk verifikasi, approval, dan transfer dana oleh Finance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Transfer to Mandor */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden group border-amber-500/30">
          <div className="absolute top-0 right-0 p-4 text-amber-500/10 group-hover:scale-110 transition-transform">
            <Clock className="w-14 h-14" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Antrean Butuh Transfer (Pending)
            </p>
            {pendingRequestsCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
                {pendingRequestsCount} Request
              </span>
            )}
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2 font-mono">
            {formatIDR(totalPendingFinance)}
          </p>
          <p className="text-xs text-slate-400 mt-2">Menunggu eksekusi pembayaran oleh Finance</p>
        </div>

        {/* Total Kasbon Aktif */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden group border-purple-500/30">
          <div className="absolute top-0 right-0 p-4 text-purple-500/10 group-hover:scale-110 transition-transform">
            <Wallet className="w-14 h-14" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Kasbon Aktif Mandor
          </p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2 font-mono">
            {formatIDR(totalOutstandingKasbon)}
          </p>
          <p className="text-xs text-slate-400 mt-2">Akan dipotong otomatis pada termin termin berikutnya</p>
        </div>

        {/* Total Realisasi Terbayar */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden group border-emerald-500/30">
          <div className="absolute top-0 right-0 p-4 text-emerald-500/10 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-14 h-14" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Realisasi Terbayar
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            {formatIDR(totalPaidFinance)}
          </p>
          <p className="text-xs text-slate-400 mt-2">Seluruh termin & kasbon yang telah ditransfer</p>
        </div>
      </div>

      {/* Mandor Kasbon Ledger Grid */}
      <div className="p-5 rounded-2xl glass-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-sky-500" />
            <span>Buku Besar Kasbon & Data Rekening Mandor</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {mandors.length} Mandor Terdaftar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {mandors.map((m) => (
            <div
              key={m.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{m.name}</h4>
                  <span className="text-[10px] text-slate-400 block">{m.specialization} ({m.area})</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {m.teamSize} Orang
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
                <p className="text-slate-500">
                  Bank: <strong className="text-slate-800 dark:text-slate-200">{m.bankName} - {m.accountNumber}</strong>
                </p>
                <p className="text-slate-500 truncate">a.n. {m.accountHolder}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Kasbon Aktif:</span>
                  <span className={`font-mono font-black ${m.outstandingKasbon > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                    {formatIDR(m.outstandingKasbon)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Requests Table Section */}
      <div className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Daftar Pengajuan Pembayaran Mandor (Payment Requests)
            </h3>
            <p className="text-xs text-slate-500">
              Verifikasi kelayakan pembayaran berdasarkan progres QC dan eksekusi transfer dana.
            </p>
          </div>

          {/* Search & Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari no request, mandor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 font-bold rounded-md transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Semua ({paymentRequests.length})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-2.5 py-1 font-bold rounded-md transition-all ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                Pending ({pendingRequestsCount})
              </button>
              <button
                onClick={() => setStatusFilter('PAID')}
                className={`px-2.5 py-1 font-bold rounded-md transition-all ${
                  statusFilter === 'PAID'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Terbayar
              </button>
              <button
                onClick={() => setStatusFilter('KASBON')}
                className={`px-2.5 py-1 font-bold rounded-md transition-all ${
                  statusFilter === 'KASBON'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Kasbon Saja
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">No. Request & Tgl</th>
                <th className="p-3">Cluster & Site</th>
                <th className="p-3">Penerima (Mandor)</th>
                <th className="p-3">Jenis Pengajuan</th>
                <th className="p-3 text-right">Nilai Bruto</th>
                <th className="p-3 text-right text-rose-500">Pot. Kasbon</th>
                <th className="p-3 text-right font-black text-emerald-600">Net Transfer</th>
                <th className="p-3 text-center">QC Progres</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                >
                  <td className="p-3 font-sans">
                    <strong className="text-slate-900 dark:text-white font-mono block text-[11px]">
                      {req.requestNo}
                    </strong>
                    <span className="text-[10px] text-slate-400">{req.submittedAt}</span>
                  </td>

                  <td className="p-3 font-sans">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[180px]">
                      {req.clusterName}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                      {req.siteName}
                    </span>
                  </td>

                  <td className="p-3 font-sans">
                    <strong className="text-slate-900 dark:text-white block">
                      {req.mandorName}
                    </strong>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {req.bankName} - {req.accountNumber}
                    </span>
                  </td>

                  <td className="p-3 font-sans">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      req.type === 'KASBON'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                    }`}>
                      {req.type === 'KASBON' ? 'Kasbon Ops' : `Termin ${req.termNumber || 1}`}
                    </span>
                  </td>

                  <td className="p-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                    {formatIDR(req.requestedAmount)}
                  </td>

                  <td className="p-3 text-right text-rose-500">
                    {req.deductedKasbon > 0 ? `- ${formatIDR(req.deductedKasbon)}` : '-'}
                  </td>

                  <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatIDR(req.netTransferAmount)}
                  </td>

                  <td className="p-3 text-center font-bold text-indigo-600">
                    {formatPercent(req.verifiedProgressPercent, 1)}
                  </td>

                  <td className="p-3 text-center font-sans">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                      req.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : req.status === 'APPROVED'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {req.status}
                    </span>
                  </td>

                  <td className="p-3 text-center font-sans">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Cetak Voucher Button */}
                      <button
                        onClick={() => setSelectedVoucherReq(req)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        title="Lihat & Cetak Voucher Pengajuan"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {/* Eksekusi Transfer (Finance Action) */}
                      {req.status !== 'PAID' && (
                        <button
                          onClick={() => {
                            setTransferringReq(req);
                            setTransferRef(`TRF-${Math.floor(Math.random() * 90000000 + 10000000)}`);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm"
                          title="Tandai telah ditransfer oleh Finance"
                        >
                          <Check className="w-3 h-3" />
                          <span>Transfer</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FINANCE TRANSFER CONFIRMATION MODAL */}
      {transferringReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl glass-card p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Konfirmasi Transfer Finance</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Penerima: <strong className="text-slate-900 dark:text-white">{transferringReq.mandorName}</strong></p>
              <p className="text-slate-500 font-mono">Bank: {transferringReq.bankName} - {transferringReq.accountNumber}</p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Total Transfer:</span>
                <span className="text-base font-black text-emerald-600 font-mono">{formatIDR(transferringReq.netTransferAmount)}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Referensi Bank / Bukti Transfer</label>
                <input
                  type="text"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Finance</label>
                <input
                  type="text"
                  value={financeNote}
                  onChange={(e) => setFinanceNote(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setTransferringReq(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmTransfer}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
              >
                Simpan & Tandai Terbayar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT VOUCHER MODAL */}
      {selectedVoucherReq && (
        <FinanceVoucherModal
          isOpen={true}
          onClose={() => setSelectedVoucherReq(null)}
          request={selectedVoucherReq}
        />
      )}
    </div>
  );
};
