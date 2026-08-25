'use client';

import React, { useState, useRef } from 'react';
import { useCluster } from '@/context/ClusterContext';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Download,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose }) => {
  const { importExcelFile, downloadExcelTemplate } = useCluster();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFeedback(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setFeedback(null);
      } else {
        setFeedback({ success: false, message: 'Harap unggah file Excel (.xlsx atau .xls)' });
      }
    }
  };

  const handleProcessImport = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    const result = await importExcelFile(selectedFile);
    setIsProcessing(false);
    setFeedback(result);
    if (result.success) {
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
        setFeedback(null);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl glass-card p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Import & Download Template Excel FTTH
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ekstraksi otomatis sheet SUMMARY, JASA, MATERIAL & ESTIMASI HARGA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DOWNLOAD TEMPLATE PROMINENT BANNER */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Belum memiliki format file? Download template resmi kami</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Template Excel 4 sheet standar (Summary, Jasa Mandor, Material Aksesoris, Katalog Harga Acuan).
            </p>
          </div>

          <button
            type="button"
            onClick={downloadExcelTemplate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Template (.xlsx)</span>
          </button>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-850'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="hidden"
          />

          <div className="flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {selectedFile ? selectedFile.name : 'Klik untuk memilih file atau Drag & Drop file ke sini'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Format yang didukung: <strong>.xlsx</strong> atau <strong>.xls</strong> (Workbook FTTH)
              </p>
            </div>
          </div>
        </div>

        {/* Template Structure Info */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5">
          <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] block">
            Struktur 4 Sheet pada Template Excel:
          </span>
          <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span><strong>1. SUMMARY</strong>: Site, Nilai PO & Margin</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span><strong>2. JASA</strong>: SOW & Harga Jasa Mandor</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span><strong>3. MATERIAL</strong>: Kebutuhan Aksesoris FO</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span><strong>4. ESTIMASI HARGA</strong>: Katalog Acuan</span>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
              feedback.success
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300'
            }`}
          >
            {feedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={downloadExcelTemplate}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Template</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Batal
            </button>

            <button
              onClick={handleProcessImport}
              disabled={!selectedFile || isProcessing}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl text-white shadow-md transition-all ${
                !selectedFile || isProcessing
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 active:scale-95'
              }`}
            >
              {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isProcessing ? 'Memproses...' : 'Mulai Import'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
