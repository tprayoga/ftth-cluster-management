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
  HardHat,
  ShoppingBag,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose }) => {
  const {
    importExcelFile,
    downloadExcelTemplate,
    downloadJasaTemplate,
    downloadMaterialTemplate,
  } = useCluster();

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
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl my-8 rounded-3xl glass-card p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
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
                Pilih template spesifik sesuai kebutuhan (Jasa, Material, atau Full BOQ)
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

        {/* 3 DEDICATED TEMPLATE DOWNLOAD BUTTONS */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Pilih & Download Template Excel Sesuai Kategori:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* 1. Template Jasa */}
            <button
              type="button"
              onClick={downloadJasaTemplate}
              className="p-2.5 rounded-xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/60 dark:bg-sky-950/30 hover:border-sky-400 dark:hover:border-sky-600 text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <strong className="text-slate-900 dark:text-white text-xs font-bold">
                  Template Jasa
                </strong>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                SOW tarif jasa mandor borongan
              </span>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400">
                <Download className="w-3 h-3" />
                <span>Unduh (.xlsx)</span>
              </div>
            </button>

            {/* 2. Template Material */}
            <button
              type="button"
              onClick={downloadMaterialTemplate}
              className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/30 hover:border-amber-400 dark:hover:border-amber-600 text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <strong className="text-slate-900 dark:text-white text-xs font-bold">
                  Template Material
                </strong>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Daftar aksesoris & estimasi harga
              </span>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <Download className="w-3 h-3" />
                <span>Unduh (.xlsx)</span>
              </div>
            </button>

            {/* 3. Template Full Cluster */}
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 hover:border-emerald-400 dark:hover:border-emerald-600 text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <strong className="text-slate-900 dark:text-white text-xs font-bold">
                  Template Full BOQ
                </strong>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                4-Sheet (Summary + Jasa + Mat)
              </span>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <Download className="w-3 h-3" />
                <span>Unduh (.xlsx)</span>
              </div>
            </button>
          </div>
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
                Format yang didukung: <strong>.xlsx</strong> atau <strong>.xls</strong>
              </p>
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
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Tutup
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
  );
};
