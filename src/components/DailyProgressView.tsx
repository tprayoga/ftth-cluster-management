'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { DailyProgressReport, DailyProgressPhoto } from '@/types';
import { generateWhatsAppDailyReport, calculateDprOverallProgress } from '@/lib/dailyProgressHelper';
import { DailyProgressModal } from '@/components/DailyProgressModal';
import {
  Calendar,
  MessageSquare,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  HardHat,
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  Camera,
  X,
  ExternalLink,
} from 'lucide-react';

export const DailyProgressView: React.FC = () => {
  const { dailyReports, spks, deleteDailyReport } = useCluster();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyProgressReport | null>(null);
  const [previewWaReport, setPreviewWaReport] = useState<DailyProgressReport | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<DailyProgressPhoto | null>(null);

  const filteredReports = dailyReports.filter((rep) => {
    const matchesSearch =
      rep.clusterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.mandorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.date.includes(searchTerm);

    const matchesCluster =
      selectedClusterFilter === 'ALL' || rep.spkId === selectedClusterFilter;

    return matchesSearch && matchesCluster;
  });

  const handleCopyWhatsApp = (report: DailyProgressReport) => {
    const text = generateWhatsAppDailyReport(report);
    navigator.clipboard.writeText(text);
    setCopiedId(report.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Daily Activity & Progress (DPR)
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Rule Termin & Kasbon Validated
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Persentase progres fisik harian wajib & foto dokumentasi lapangan sebagai acuan approval pembayaran termin/kasbon.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingReport(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Input Daily Progress Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari cluster, site, mandor, tanggal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 hidden sm:inline">Filter Cluster:</span>
          <select
            value={selectedClusterFilter}
            onChange={(e) => setSelectedClusterFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200 w-full sm:w-auto"
          >
            <option value="ALL">Semua Cluster ({dailyReports.length} Laporan)</option>
            {spks.map((s) => (
              <option key={s.id} value={s.id}>
                {s.clusterName} ({s.vendorName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Daily Progress Reports Feed */}
      <div className="space-y-6">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Calendar className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Belum ada laporan harian untuk filter ini
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Klik &quot;Input Daily Progress Baru&quot; untuk mencatat aktivitas dan progres lapangan hari ini.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const completedCount = report.items.filter((i) => i.status === 'DONE').length;
            const isCopyActive = copiedId === report.id;
            const progress = report.overallProgressPercent || calculateDprOverallProgress(report.items);

            return (
              <div
                key={report.id}
                className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all space-y-4 p-5 sm:p-6"
              >
                {/* Top Info Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex flex-col items-center justify-center font-bold shrink-0 border border-sky-200 dark:border-sky-800">
                      <span className="text-[10px] uppercase">{report.dayName.slice(0, 3)}</span>
                      <span className="text-sm font-mono leading-none">
                        {report.date.split('-')[2] || '24'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {report.dayName}, {report.date}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {report.vendorName}
                        </span>
                        {/* Overall Progress Badge */}
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                          {progress}% Progres Fisik
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                        {report.clusterName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {report.siteName}
                      </p>
                    </div>
                  </div>

                  {/* Team & Mandor Badge + Actions */}
                  <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <HardHat className="w-3.5 h-3.5 text-amber-500" />
                      <span>{report.mandorName}</span>
                      <span className="font-bold text-slate-400">({report.teamSize} Org)</span>
                    </div>

                    {/* Copy WhatsApp Format */}
                    <button
                      onClick={() => handleCopyWhatsApp(report)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                        isCopyActive
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isCopyActive ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopyActive ? 'Tersalin!' : 'Salin Format WA'}</span>
                    </button>

                    {/* Preview WA Format */}
                    <button
                      onClick={() => setPreviewWaReport(report)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      title="Lihat teks format WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditingReport(report);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      title="Edit Laporan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm('Hapus laporan progress harian ini?')) {
                          deleteDailyReport(report.id);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600"
                      title="Hapus Laporan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* SOW & Progress Breakdown Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                      *PLAN / PROGRES HARI INI / TOTAL AKTUAL*
                    </span>
                    <span className="text-slate-400 font-mono">
                      {completedCount} dari {report.items.length} Item Selesai
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                          <th className="p-2.5">Item Pengerjaan</th>
                          <th className="p-2.5 text-center">Satuan</th>
                          <th className="p-2.5 text-right">Target Plan</th>
                          <th className="p-2.5 text-right text-sky-600">Hari Ini</th>
                          <th className="p-2.5 text-right font-black text-emerald-600">Total Progres</th>
                          <th className="p-2.5 text-right text-rose-500">Sisa</th>
                          <th className="p-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                        {report.items.map((item) => {
                          const remaining = Math.max(0, item.planQty - item.totalActualQty);
                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-900/40"
                            >
                              <td className="p-2.5 font-sans font-medium text-slate-900 dark:text-white">
                                {item.itemName}
                              </td>
                              <td className="p-2.5 text-center font-sans text-slate-400">
                                {item.unit}
                              </td>
                              <td className="p-2.5 text-right font-bold text-slate-700 dark:text-slate-300">
                                {item.planQty.toLocaleString('id-ID')}
                              </td>
                              <td className="p-2.5 text-right font-bold text-sky-600 dark:text-sky-400">
                                {item.todayQty > 0 ? `+${item.todayQty.toLocaleString('id-ID')}` : '0'}
                              </td>
                              <td className="p-2.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                                {item.totalActualQty.toLocaleString('id-ID')}
                              </td>
                              <td className="p-2.5 text-right font-bold text-rose-500">
                                {remaining.toLocaleString('id-ID')}
                              </td>
                              <td className="p-2.5 text-center font-sans">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.status === 'DONE'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : item.status === 'IN_PROGRESS'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                  {item.status === 'DONE' ? 'Done ✅' : item.status === 'IN_PROGRESS' ? 'Progres ⏳' : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Field Documentation Photos Grid */}
                {report.photos && report.photos.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Dokumentasi Foto Lapangan ({report.photos.length} Foto)</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {report.photos.map((ph) => (
                        <div
                          key={ph.id}
                          onClick={() => setPreviewPhoto(ph)}
                          className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-pointer"
                        >
                          <img
                            src={ph.url}
                            alt={ph.caption}
                            className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="p-2 space-y-0.5">
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                              {ph.category}
                            </span>
                            <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {ph.caption}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Today Activities, Tomorrow Plan, Issues */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Progres Today (Hari Ini)</span>
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 pt-1 text-[11px]">
                      {report.activitiesToday.map((act, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      <span>Plan Tomorrow (Rencana Besok)</span>
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 pt-1 text-[11px]">
                      {report.planTomorrow.map((plan, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-sky-500 font-bold">•</span>
                          <span>{plan}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Issue / Kendala Lapangan</span>
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 pt-1 text-[11px]">
                      {report.issues.map((iss, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{iss}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* WHATSAPP TEXT PREVIEW MODAL */}
      {previewWaReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl glass-card p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                <span>Format Teks WhatsApp ({previewWaReport.clusterName})</span>
              </h3>
              <button
                onClick={() => setPreviewWaReport(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Format teks berikut siap disalin dan dikirim langsung ke grup koordinasi WhatsApp:
            </p>

            <div className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs max-h-80 overflow-y-auto whitespace-pre-wrap select-all border border-slate-800">
              {generateWhatsAppDailyReport(previewWaReport)}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setPreviewWaReport(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleCopyWhatsApp(previewWaReport);
                  setPreviewWaReport(null);
                }}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Teks ke Clipboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl glass-card overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="relative">
              <img src={previewPhoto.url} alt={previewPhoto.caption} className="w-full max-h-[65vh] object-contain bg-black" />
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/70 text-white hover:bg-rose-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  {previewPhoto.category}
                </span>
                <span className="text-slate-400 font-mono">{previewPhoto.timestamp}</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {previewPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* INPUT / EDIT MODAL */}
      {isModalOpen && (
        <DailyProgressModal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          initialReport={editingReport}
        />
      )}
    </div>
  );
};
