'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { CalculatedSite, CalculatedSPK, PaymentRequestType } from '@/types';
import { formatIDR } from '@/lib/calculations';
import { checkPaymentRuleEligibility } from '@/lib/dailyProgressHelper';
import {
  X,
  Send,
  CreditCard,
  AlertCircle,
  DollarSign,
  Wallet,
  CheckSquare,
  Camera,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface FinanceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: CalculatedSite;
  spk: CalculatedSPK;
  defaultType?: PaymentRequestType;
}

export const FinanceRequestModal: React.FC<FinanceRequestModalProps> = ({
  isOpen,
  onClose,
  site,
  spk,
  defaultType = 'TERMIN',
}) => {
  const { mandors, dailyReports, createPaymentRequest } = useCluster();

  const currentMandor = mandors.find((m) => m.id === site.mandorId) || mandors[0];

  // Find latest DPR for this site / cluster
  const latestDpr = dailyReports.find(
    (d) => d.siteId === site.id || d.spkId === spk.id
  );

  const verifiedDprProgress = latestDpr
    ? latestDpr.overallProgressPercent
    : site.progressPercent;

  const attachedDprPhotos = latestDpr?.photos || [];

  const [type, setType] = useState<PaymentRequestType>(defaultType);
  const [termNumber, setTermNumber] = useState<number>(1);
  const [requestedAmount, setRequestedAmount] = useState<number>(
    defaultType === 'TERMIN' ? Math.round(site.totalJasa * 0.3) : 1000000
  );
  const [deductedKasbon, setDeductedKasbon] = useState<number>(0);
  const [submittedBy, setSubmittedBy] = useState('Usep Kurnia (Project Control / Ops)');
  const [reason, setReason] = useState(
    defaultType === 'TERMIN'
      ? `Pengajuan Termin ${termNumber} Jasa Mandor (Progres Fisik DPR: ${verifiedDprProgress.toFixed(1)}%)`
      : 'Kasbon operasional mandor lapangan'
  );

  const [bankName, setBankName] = useState(currentMandor?.bankName || 'BCA');
  const [accountNumber, setAccountNumber] = useState(currentMandor?.accountNumber || '');
  const [accountHolder, setAccountHolder] = useState(currentMandor?.accountHolder || currentMandor?.name || '');

  if (!isOpen) return null;

  const handleTypeChange = (newType: PaymentRequestType) => {
    setType(newType);
    if (newType === 'TERMIN') {
      const amount = termNumber === 1 ? site.totalJasa * 0.3 : termNumber === 2 ? site.totalJasa * 0.4 : site.totalJasa * 0.3;
      setRequestedAmount(Math.round(amount));
      setReason(`Pengajuan Termin ${termNumber} Jasa Mandor (Progres Fisik DPR: ${verifiedDprProgress.toFixed(1)}%)`);
    } else {
      setRequestedAmount(1000000);
      setDeductedKasbon(0);
      setReason('Kasbon operasional mandor lapangan');
    }
  };

  const handleTermChange = (term: number) => {
    setTermNumber(term);
    const amount = term === 1 ? site.totalJasa * 0.3 : term === 2 ? site.totalJasa * 0.4 : site.totalJasa * 0.3;
    setRequestedAmount(Math.round(amount));
    setReason(`Pengajuan Termin ${term} Jasa Mandor (Progres Fisik DPR: ${verifiedDprProgress.toFixed(1)}%)`);
  };

  const netTransferAmount = Math.max(0, requestedAmount - deductedKasbon);

  // Check DPR Rule Eligibility
  const ruleCheck = checkPaymentRuleEligibility(
    type,
    termNumber,
    verifiedDprProgress,
    site.totalJasa,
    requestedAmount,
    currentMandor?.outstandingKasbon || 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedAmount || requestedAmount <= 0) return;

    createPaymentRequest({
      spkId: spk.id,
      clusterName: spk.clusterName,
      siteId: site.id,
      siteName: site.name,
      mandorId: currentMandor?.id || 'mandor-1',
      mandorName: currentMandor?.name || 'Mandor External',
      bankName,
      accountNumber,
      accountHolder,
      type,
      termNumber: type === 'TERMIN' ? termNumber : undefined,
      requestedAmount: Number(requestedAmount),
      deductedKasbon: Number(deductedKasbon) || 0,
      netTransferAmount,
      verifiedProgressPercent: verifiedDprProgress,
      isDprRuleSatisfied: ruleCheck.isEligible,
      ruleRequirementNote: ruleCheck.ruleNote,
      attachedPhotos: attachedDprPhotos.map((p) => p.url),
      reason,
      submittedBy,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-2xl glass-card p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 py-1 border-b border-slate-200 dark:border-slate-800 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Request Pembayaran ke Finance (DPR Rule Validated)
              </h3>
              <p className="text-xs text-slate-500">
                Pengajuan termin atau kasbon divalidasi langsung oleh persentase progres harian & foto lapangan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Site & Mandor Info Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
              <span>{spk.clusterName}</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                Progres Fisik DPR: {verifiedDprProgress.toFixed(1)}% Terverifikasi
              </span>
            </div>
            <p className="text-slate-500 text-[11px] truncate">{site.name}</p>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>Mandor: <strong className="text-slate-900 dark:text-white">{currentMandor?.name}</strong></span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                Kasbon Aktif: {formatIDR(currentMandor?.outstandingKasbon || 0)}
              </span>
            </div>
          </div>

          {/* DPR Rule Eligibility Banner */}
          <div className={`p-3.5 rounded-xl border ${
            ruleCheck.isEligible
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300'
          }`}>
            <div className="flex items-start gap-2">
              {ruleCheck.isEligible ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-[11px]">
                    Validasi Rule Progres DPR:
                  </span>
                  <span className="font-extrabold text-[11px] px-2 py-0.2 rounded bg-white dark:bg-slate-900 shadow-xs">
                    {ruleCheck.badgeText}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {ruleCheck.ruleNote}
                </p>
              </div>
            </div>
          </div>

          {/* Request Type Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('TERMIN')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                type === 'TERMIN'
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Pembayaran Termin Progres</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('KASBON')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                type === 'KASBON'
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Kasbon Operasional</span>
            </button>
          </div>

          {/* If Termin, choose term number */}
          {type === 'TERMIN' && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Pilih Termin Pembayaran</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTermChange(t)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      termNumber === t
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Termin {t} ({t === 1 ? '30% (DP/20%)' : t === 2 ? '40% (Min 60%)' : '30% (BAST 100%)'})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount Calculation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {type === 'TERMIN' ? 'Nilai Termin Diajukan (Rp)' : 'Nominal Kasbon (Rp)'} *
              </label>
              <input
                type="number"
                required
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Potong Kasbon Lama (Rp)
              </label>
              <input
                type="number"
                disabled={type === 'KASBON'}
                value={deductedKasbon}
                onChange={(e) => setDeductedKasbon(Number(e.target.value))}
                placeholder="0"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-rose-600 dark:text-rose-400 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Net Transfer Highlight */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                Total Bersih Transfer ke Mandor (Net Amount)
              </span>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">
                {formatIDR(netTransferAmount)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-500/40" />
          </div>

          {/* Attached Field Documentation Photos */}
          {attachedDprPhotos.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                  <Camera className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Foto Dokumentasi Lapangan Terlampir dari DPR ({attachedDprPhotos.length} Foto)</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Tersinkron Otomatis</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {attachedDprPhotos.slice(0, 4).map((p) => (
                  <div key={p.id} className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <img src={p.url} alt={p.caption} className="w-full h-16 object-cover" />
                    <p className="p-1 text-[10px] text-slate-600 dark:text-slate-400 truncate">{p.caption}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mandor Bank Account Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-sky-500" />
              <span>Rekening Tujuan Transfer Mandor</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Bank</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Atas Nama</label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Reason & Submitted By */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan / Justifikasi Pengajuan *
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Diajukan Oleh (Tim Operasional / Project Control)
            </label>
            <input
              type="text"
              required
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Pengajuan ke Finance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
