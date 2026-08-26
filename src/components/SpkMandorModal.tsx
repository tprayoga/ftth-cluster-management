'use client';

import React from 'react';
import { CalculatedSite, CalculatedSPK } from '@/types';
import { formatIDR } from '@/lib/calculations';
import { downloadSPKMandorFile } from '@/lib/excelParser';
import { Download, Printer, X, Shield, FileCheck2, User, MapPin, Calendar, HardHat } from 'lucide-react';

interface SpkMandorModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: CalculatedSite;
  spk: CalculatedSPK;
}

export const SpkMandorModal: React.FC<SpkMandorModalProps> = ({
  isOpen,
  onClose,
  site,
  spk,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    downloadSPKMandorFile(spk, site);
  };

  const spkMandorNo = `SPK-MANDOR/${spk.clusterName.replace(/[^A-Z0-9]/gi, '')}/${site.id.slice(-4).toUpperCase()}/${new Date().getFullYear()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl my-8 rounded-2xl glass-card p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <HardHat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Dokumen Resmi: SPK Mandor External (Work Order)
              </h3>
              <p className="text-xs text-slate-500">
                Data nilai PO & margin otomatis disembunyikan untuk kerahasiaan operasional.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              title="Download Dokumen SPK Mandor dalam format Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel (.xlsx)</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 active:scale-95 transition-all"
              title="Cetak atau Simpan sebagai PDF"
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

        {/* PRINTABLE OFFICIAL LETTER SECTION */}
        <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 print:border-none print:p-0 space-y-6">
          {/* Company Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase text-slate-900">
                PT INDOTEK BUANA KARYA
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Telecommunication Infrastructure & Fiber Optic Solutions
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Head Office: Jl. Pelaksana FTTH No. 88, Central Java | Telp: (0283) 356-7890
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded tracking-wider uppercase">
                SPK MANDOR
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                {spkMandorNo}
              </p>
            </div>
          </div>

          {/* Letter Title */}
          <div className="text-center space-y-1">
            <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
              SURAT PERINTAH KERJA (SPK) PELAKSANA LAPANGAN
            </h3>
            <p className="text-xs text-slate-600">
              Pekerjaan Implementasi FTTH Cluster: <strong>{spk.clusterName}</strong>
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 text-xs border border-slate-200">
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Diberikan Kepada (Mandor):</span>
                <strong className="text-slate-900 text-sm font-bold">{site.mandorName || 'Mandor External'}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Area / Site Penugasan:</span>
                <span className="text-slate-800 font-medium">{site.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Tipe Pekerjaan (SOW):</span>
                <span className="text-slate-800 font-bold uppercase">{site.sowType} ({spk.scopeType === 'END_TO_END' ? 'End-to-End' : 'Implementasi'})</span>
              </div>
            </div>

            <div className="space-y-1.5 text-right">
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Tanggal Terbit SPK:</span>
                <span className="text-slate-800 font-mono font-semibold">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Target Selesai:</span>
                <span className="text-slate-800 font-mono font-semibold">{spk.targetCompletionDate || '30 Hari Kalender'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Status SPK:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                  Diterbitkan & Sah
                </span>
              </div>
            </div>
          </div>

          {/* SOW & BOQ Items Table for Mandor */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Rincian Item Pekerjaan & Tarif Jasa Mandor
            </h4>
            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2.5 w-10 text-center">No</th>
                    <th className="p-2.5">Item Pekerjaan</th>
                    <th className="p-2.5 text-right w-24">Target Volume</th>
                    <th className="p-2.5 text-center w-20">Satuan</th>
                    <th className="p-2.5 text-right w-32">Tarif Mandor</th>
                    <th className="p-2.5 text-right w-36">Total Biaya</th>
                    <th className="p-2.5">Instruksi / Catatan Teknis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {site.services.map((srv, idx) => (
                    <tr key={srv.id} className="hover:bg-slate-50">
                      <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-semibold text-slate-900">{srv.name}</td>
                      <td className="p-2 text-right font-mono font-bold text-slate-800">{srv.qty}</td>
                      <td className="p-2 text-center text-slate-600">{srv.uom}</td>
                      <td className="p-2 text-right font-mono">{formatIDR(srv.unitPrice)}</td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900">{formatIDR(srv.total)}</td>
                      <td className="p-2 text-slate-600 text-[11px]">{srv.remark || '-'}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={5} className="p-2.5 text-right uppercase">
                      Total Nilai Kontrak Jasa Mandor:
                    </td>
                    <td className="p-2.5 text-right font-mono text-sm">
                      {formatIDR(site.totalJasa)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1.5 leading-relaxed">
            <h5 className="font-bold text-slate-900 uppercase text-xs">Ketentuan & Standar Teknis Pekerjaan:</h5>
            <ol className="list-decimal list-inside space-y-1">
              <li>Pekerjaan penarikan kabel, penanaman tiang, dan splicing wajib mengikuti SOP K3 & standard teknis Indotek.</li>
              <li>Hasil uji redaman (OPM & OTDR) FAT/FDT wajib memenuhi standar maksimal &le; -24 dBm sebelum serah terima.</li>
              <li>Pekerjaan tambahan (Add Work) di luar volume di atas wajib mendapat persetujuan tertulis Estimator / PM Indotek.</li>
              <li>Pembayaran termin jasa dilakukan sesuai progres fisik yang telah diverifikasi QC Lapangan (Term 1: DP 30%, Term 2: Progres 70%, Term 3: Pelunasan 100% BAST).</li>
            </ol>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-center text-xs">
            <div>
              <p className="font-semibold text-slate-600">Diberikan Oleh,</p>
              <p className="font-bold text-slate-900 mt-0.5">PT INDOTEK BUANA KARYA</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-slate-300 font-serif italic text-sm">[ Tanda Tangan & Cap ]</span>
              </div>
              <p className="font-bold text-slate-900 underline">FATRAH SUBARKAH / TEGUH P.</p>
              <p className="text-slate-500 text-[11px]">Tim Estimator & Project Manager</p>
            </div>

            <div>
              <p className="font-semibold text-slate-600">Diterima & Disanggupi Oleh,</p>
              <p className="font-bold text-slate-900 mt-0.5">Mandor Pelaksana Lapangan</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-slate-300 font-serif italic text-sm">[ Tanda Tangan Mandor ]</span>
              </div>
              <p className="font-bold text-slate-900 underline">{site.mandorName || 'MANDOR LAPANGAN'}</p>
              <p className="text-slate-500 text-[11px]">Penanggung Jawab Tim Lapangan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
