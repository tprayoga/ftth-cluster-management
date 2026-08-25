'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { formatIDR, formatPercent } from '@/lib/calculations';
import {
  ShieldCheck,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Wallet,
  ShoppingBag,
  HardHat,
  FileCheck,
  Save,
  RotateCcw,
  Bell,
  Camera,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

export const ApprovalSettingsView: React.FC = () => {
  const { approvalRules, updateApprovalRules, currentUser } = useCluster();

  const [rules, setRules] = useState(approvalRules);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateApprovalRules(rules);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan semua aturan matriks persetujuan ke setelan standar PT Indotek?')) {
      const defaultRules = {
        spkMarginThreshold: 20,
        poTier1Limit: 15000000,
        maxKasbonPercent: 30,
        term1MinProgress: 20,
        term2MinProgress: 60,
        term3MinProgress: 100,
        requirePhotoOnDpr: true,
        autoNotifyWhatsApp: true,
        allowMandorOverdraft: false,
      };
      setRules(defaultRules);
      updateApprovalRules(defaultRules);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Pengaturan Matriks Persetujuan (Set Approval)
            </h2>
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Governance Rules
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Konfigurasi batas ambang persetujuan SPK Mandor, limit otorisasi PO Material, syarat fisik pencairan termin, dan proteksi kasbon.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefault}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Reset ke Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>

          <button
            onClick={handleSave}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 text-white shadow-sm transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Peraturan</span>
          </button>
        </div>
      </div>

      {/* Success Alert Banner */}
      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Matriks persetujuan berhasil diperbarui!</strong> Aturan baru langsung aktif untuk seluruh transaksi dan validasi sistem.
            </span>
          </div>
        </div>
      )}

      {/* Non-Admin Notice */}
      {!isSuperAdmin && (
        <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sky-800 dark:text-sky-300 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 text-sky-500 flex-shrink-0" />
          <span>
            Anda sedang melihat aturan aktif sebagai <strong>{currentUser.roleLabel}</strong>. Perubahan aturan akan tercatat dalam audit log sistem.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: SPK MANDOR & MARGIN APPROVAL RULES */}
        <div className="p-5 rounded-xl glass-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <HardHat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                1. Aturan & Ambang Batas Rilis SPK Mandor
              </h3>
              <p className="text-[11px] text-slate-500">
                Menentukan hak otorisasi penerbitan Surat Perintah Kerja kepada mandor lapangan berdasarkan kalkulasi profit margin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                Ambang Batas Minimum Gross Margin (%):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={rules.spkMarginThreshold}
                  onChange={(e) => setRules({ ...rules, spkMarginThreshold: Number(e.target.value) })}
                  className="flex-1 accent-slate-900 dark:accent-sky-500 cursor-pointer"
                />
                <span className="w-16 px-2.5 py-1 text-center font-bold font-mono text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  {rules.spkMarginThreshold}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Jika estimasi margin cluster <strong>&lt; {rules.spkMarginThreshold}%</strong>, rilis SPK Mandor <strong>wajib mendapatkan persetujuan Direktur Utama</strong> (override approval).
              </p>
            </div>

            <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <span className="block text-slate-700 dark:text-slate-300 font-semibold">
                Matriks Wewenang SPK:
              </span>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span>Margin &ge; {rules.spkMarginThreshold}% (Sehat)</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">Project Manager (PM)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span>Margin &lt; {rules.spkMarginThreshold}% (Kritis)</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">Direktur Utama (Super Admin)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PO MATERIAL AKSESORIS THRESHOLDS */}
        <div className="p-5 rounded-xl glass-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                2. Batas Otorisasi Belanja Material Aksesoris (PO)
              </h3>
              <p className="text-[11px] text-slate-500">
                Pemisahan batas wewenang belanja material ke supplier/toko offline & online.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                Batas Maksimum Approval Level 1 (PM):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                  Rp
                </span>
                <input
                  type="number"
                  step="1000000"
                  value={rules.poTier1Limit}
                  onChange={(e) => setRules({ ...rules, poTier1Limit: Number(e.target.value) })}
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Nilai aktif: <strong>{formatIDR(rules.poTier1Limit)}</strong>. PO di atas nominal ini mewajibkan persetujuan ganda (PM + Direktur).
              </p>
            </div>

            <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[11px]">
              <span className="block text-slate-700 dark:text-slate-300 font-semibold">
                Alur Pencairan Dana PO Material:
              </span>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">1</span>
                <span>Procurement membuat PO & input data rekening toko supplier</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">2</span>
                <span>PM menyetujui kuantitas dan alokasi site cluster</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">3</span>
                <span>Finance transfer ke rekening toko & mengunggah bukti bayar</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: MANDOR PAYMENT & KASBON POLICY */}
        <div className="p-5 rounded-xl glass-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                3. Kebijakan Pencairan Termin & Batas Kasbon Mandor
              </h3>
              <p className="text-[11px] text-slate-500">
                Aturan baku pembayaran borongan mandor untuk menjaga stabilitas cashflow dan kepatuhan progres lapangan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Kasbon Cap */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                Batas Maksimum Kasbon (% Nilai Jasa):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={rules.maxKasbonPercent}
                  onChange={(e) => setRules({ ...rules, maxKasbonPercent: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                />
                <span className="font-bold text-slate-500">%</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Mencegah mandor mengajukan pinjaman melebihi <strong>{rules.maxKasbonPercent}%</strong> dari total SPK.
              </p>
            </div>

            {/* Termin 1 Gate */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                Syarat Fisik Termin 1 (DP / Awal):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={rules.term1MinProgress}
                  onChange={(e) => setRules({ ...rules, term1MinProgress: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                />
                <span className="font-bold text-slate-500">% DPR</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Progres fisik minimal dari DPR harian: <strong>{rules.term1MinProgress}%</strong>.
              </p>
            </div>

            {/* Termin 2 Gate */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                Syarat Fisik Termin 2 (Progres):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="30"
                  max="80"
                  value={rules.term2MinProgress}
                  onChange={(e) => setRules({ ...rules, term2MinProgress: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                />
                <span className="font-bold text-slate-500">% DPR</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Progres fisik minimal dari DPR harian: <strong>{rules.term2MinProgress}%</strong>.
              </p>
            </div>

            {/* Termin 3 Gate */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                Syarat Pelunasan Termin 3 (BAST):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="90"
                  max="100"
                  value={rules.term3MinProgress}
                  onChange={(e) => setRules({ ...rules, term3MinProgress: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                />
                <span className="font-bold text-slate-500">% BAST</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Wajib <strong>{rules.term3MinProgress}% Selesai</strong> & lolos QC sebelum pelunasan.
              </p>
            </div>
          </div>

          {/* Additional Enforcement Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors">
              <input
                type="checkbox"
                checked={rules.requirePhotoOnDpr}
                onChange={(e) => setRules({ ...rules, requirePhotoOnDpr: e.target.checked })}
                className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
              />
              <div>
                <strong className="text-slate-900 dark:text-white block">
                  Wajibkan Lampiran Foto di Setiap Laporan DPR
                </strong>
                <span className="text-[11px] text-slate-500">
                  Mandor/supervisor tidak dapat mengirim DPR tanpa menyertakan bukti foto tiang/kabel/FAT.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors">
              <input
                type="checkbox"
                checked={rules.autoNotifyWhatsApp}
                onChange={(e) => setRules({ ...rules, autoNotifyWhatsApp: e.target.checked })}
                className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
              />
              <div>
                <strong className="text-slate-900 dark:text-white block">
                  Format Pesan WhatsApp Otomatis (DPR & Termin)
                </strong>
                <span className="text-[11px] text-slate-500">
                  Otomatis men-generate template teks WhatsApp rapi saat rilis SPK, approval termin, atau laporan harian.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* SECTION 4: APPROVER DELEGATION MATRIX */}
        <div className="p-5 rounded-xl glass-card space-y-3 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              4. Matriks Ringkasan Otoritas & Hak Persetujuan
            </h3>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3">Jenis Dokumen / Transaksi</th>
                  <th className="p-3">Approver Utama (Level 1)</th>
                  <th className="p-3">Approver Tingkat Lanjut (Level 2)</th>
                  <th className="p-3">Eksekutor Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    Draft Estimasi BOQ & SPK Mandor
                  </td>
                  <td className="p-3">Cost Estimator (Drafter)</td>
                  <td className="p-3">Project Manager (PM)</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">Mandor Lapangan</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    PO Material Aksesoris (&le; {formatIDR(rules.poTier1Limit)})
                  </td>
                  <td className="p-3">Procurement & Logistik</td>
                  <td className="p-3">Project Manager (PM)</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">Finance Transfer</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    PO Material Aksesoris (&gt; {formatIDR(rules.poTier1Limit)})
                  </td>
                  <td className="p-3">Project Manager (PM)</td>
                  <td className="p-3 text-purple-600 dark:text-purple-400 font-semibold">Direktur Utama (Super Admin)</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">Finance Transfer</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    Pengajuan Termin & Kasbon Mandor
                  </td>
                  <td className="p-3">Verifikasi Fisik PM (via DPR)</td>
                  <td className="p-3">Finance (Cek Limit Kasbon)</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">Transfer Bank Mandor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Batal / Reset
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 text-white shadow-sm transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Perubahan Matriks</span>
          </button>
        </div>
      </form>
    </div>
  );
};
