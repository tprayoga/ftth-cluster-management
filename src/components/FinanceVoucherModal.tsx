'use client';

import React from 'react';
import { MandorPaymentRequest } from '@/types';
import { formatIDR } from '@/lib/calculations';
import { Printer, X, FileText, CheckCircle2, Building, DollarSign } from 'lucide-react';

interface FinanceVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: MandorPaymentRequest;
}

export const FinanceVoucherModal: React.FC<FinanceVoucherModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl my-8 rounded-2xl glass-card p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Voucher Pengajuan Pembayaran Mandor (Payment Voucher)
              </h3>
              <p className="text-xs text-slate-500">
                Formulir resmi verifikasi operasional & instruksi transfer finance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Voucher */}
        <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 print:border-none print:p-0 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase text-slate-900">
                PT INDOTEK BUANA KARYA
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Departemen Operasional & Keuangan FTTH
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Head Office: Jl. Pelaksana FTTH No. 88, Central Java | Telp: (0283) 356-7890
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded tracking-wider uppercase ${
                request.type === 'KASBON' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-white'
              }`}>
                {request.type === 'KASBON' ? 'FORM PENGAJUAN KASBON' : 'VOUCHER TERMIN MANDOR'}
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                {request.requestNo}
              </p>
            </div>
          </div>

          {/* Letter Title */}
          <div className="text-center space-y-1">
            <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
              FORMULIR PENGAJUAN & REALISASI PEMBAYARAN MANDOR
            </h3>
            <p className="text-xs text-slate-600">
              Cluster: <strong>{request.clusterName}</strong> | Site: {request.siteName}
            </p>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-2">
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Nama Penerima (Mandor):</span>
                <strong className="text-slate-900 text-sm font-bold">{request.mandorName}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Rekening Bank Tujuan:</span>
                <span className="text-slate-900 font-mono font-bold">
                  {request.bankName} - {request.accountNumber}
                </span>
                <span className="block text-slate-600">a.n. {request.accountHolder}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Jenis Pengajuan:</span>
                <span className="font-bold text-slate-900 uppercase">
                  {request.type === 'KASBON' ? 'Kasbon Operasional Lapangan' : `Termin ${request.termNumber || 1} Jasa Mandor`}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-right">
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Tanggal Pengajuan Ops:</span>
                <span className="text-slate-800 font-mono font-semibold">{request.submittedAt}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Progres QC Lapangan:</span>
                <span className="text-indigo-600 font-mono font-black text-sm">
                  {request.verifiedProgressPercent.toFixed(1)}% Terverifikasi
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Status Realisasi Finance:</span>
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  request.status === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : request.status === 'APPROVED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {request.status}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Breakdown Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-3">Rincian Pembayaran</th>
                  <th className="p-3 text-right">Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                <tr>
                  <td className="p-3 font-sans">
                    <strong>Nilai Pengajuan Bruto</strong>
                    <span className="block text-slate-500 text-[11px] font-sans mt-0.5">
                      {request.reason}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 text-sm">
                    {formatIDR(request.requestedAmount)}
                  </td>
                </tr>
                {request.deductedKasbon > 0 && (
                  <tr className="bg-rose-50 text-rose-800">
                    <td className="p-3 font-sans">
                      <strong>Potongan Kasbon Operasional Sebelumnya</strong>
                    </td>
                    <td className="p-3 text-right font-bold text-rose-600">
                      - {formatIDR(request.deductedKasbon)}
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400">
                  <td className="p-3 font-sans text-sm uppercase">
                    Total Dana Bersih yang Ditransfer (Net Transfer):
                  </td>
                  <td className="p-3 text-right font-black text-emerald-700 text-base">
                    {formatIDR(request.netTransferAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Rule Validation & Evidence Box */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Validasi Rule Progres DPR:
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                request.isDprRuleSatisfied !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {request.isDprRuleSatisfied !== false ? '✅ Syarat Progres Terpenuhi' : '⚠️ Catatan Khusus'}
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              {request.ruleRequirementNote || `Progres fisik terverifikasi: ${request.verifiedProgressPercent.toFixed(1)}%`}
            </p>

            {/* Attached Photos in Voucher */}
            {request.attachedPhotos && request.attachedPhotos.length > 0 && (
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 block">
                  Foto Bukti Lapangan Terlampir ({request.attachedPhotos.length} Foto):
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {request.attachedPhotos.slice(0, 4).map((url, i) => (
                    <img key={i} src={url} alt="Evidence" className="w-full h-14 object-cover rounded border border-slate-300" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Transfer Confirmation Box if Paid */}
          {request.status === 'PAID' && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Telah Ditransfer oleh Finance pada: {request.paidAt || request.submittedAt}</p>
                  <p className="text-[11px] text-emerald-700">No. Ref Bank: {request.transferRef || 'TRF-ONLINE'} | Catatan: {request.financeNotes || 'Sesuai pengajuan'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Signatures: 3 Parties */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-300 text-center text-xs">
            <div>
              <p className="font-semibold text-slate-600">1. Yang Mengajukan,</p>
              <p className="font-bold text-slate-900 mt-0.5">Project Control / Ops</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-slate-300 font-serif italic text-xs">[ Tanda Tangan ]</span>
              </div>
              <p className="font-bold text-slate-900 underline">{request.submittedBy || 'USEP KURNIA'}</p>
              <p className="text-slate-500 text-[10px]">Tanggal: {request.submittedAt}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-600">2. Menyetujui,</p>
              <p className="font-bold text-slate-900 mt-0.5">Project Manager / Estimator</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-slate-300 font-serif italic text-xs">[ Tanda Tangan ]</span>
              </div>
              <p className="font-bold text-slate-900 underline">{request.approvedBy || 'TEGUH PRAYOGA'}</p>
              <p className="text-slate-500 text-[10px]">Tanggal: {request.approvedAt || request.submittedAt}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-600">3. Membayarkan,</p>
              <p className="font-bold text-slate-900 mt-0.5">Finance & Accounting</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-slate-300 font-serif italic text-xs">[ Tanda Tangan & Cap ]</span>
              </div>
              <p className="font-bold text-slate-900 underline">FINANCE INDOTEK</p>
              <p className="text-slate-500 text-[10px]">Tanggal: {request.paidAt || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
