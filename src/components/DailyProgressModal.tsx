'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { DailyProgressReport, DailyProgressItem, DailyProgressPhoto, Site } from '@/types';
import { calculateDprOverallProgress } from '@/lib/dailyProgressHelper';
import {
  X,
  Calendar,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  Save,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  FileImage,
  RefreshCw,
  Layers,
  MapPin,
  HardHat,
  Info,
} from 'lucide-react';

interface DailyProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReport?: DailyProgressReport | null;
  defaultSpkId?: string;
  defaultSiteId?: string;
}

export const DailyProgressModal: React.FC<DailyProgressModalProps> = ({
  isOpen,
  onClose,
  initialReport,
  defaultSpkId,
  defaultSiteId,
}) => {
  const { spks, mandors, addDailyReport, updateDailyReport } = useCluster();

  const [selectedSpkId, setSelectedSpkId] = useState<string>(
    initialReport?.spkId || defaultSpkId || spks[0]?.id || ''
  );

  const selectedSpk = spks.find((s) => s.id === selectedSpkId) || spks[0];

  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    initialReport?.siteId || defaultSiteId || selectedSpk?.sites[0]?.id || ''
  );

  const selectedSite =
    selectedSpk?.sites.find((s) => s.id === selectedSiteId) || selectedSpk?.sites[0];

  const currentMandor =
    mandors.find((m) => m.id === selectedSite?.mandorId) ||
    mandors.find((m) => m.name === selectedSite?.mandorName) ||
    mandors[0];

  const [date, setDate] = useState(
    initialReport?.date || new Date().toISOString().split('T')[0]
  );

  const getDayName = (dStr: string) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const d = new Date(dStr);
    return days[d.getDay()] || 'Senin';
  };

  const [dayName, setDayName] = useState(initialReport?.dayName || getDayName(date));
  const [startImDate, setStartImDate] = useState(
    initialReport?.startImDate || selectedSpk?.createdAt || new Date().toISOString().split('T')[0]
  );
  const [mitraName, setMitraName] = useState(
    initialReport?.mitraName || 'PT Indotek Buana Karya'
  );
  const [mandorName, setMandorName] = useState(
    initialReport?.mandorName || selectedSite?.mandorName || currentMandor?.name || 'Mandor Lapangan'
  );
  const [teamSize, setTeamSize] = useState<number>(
    initialReport?.teamSize || currentMandor?.teamSize || 6
  );
  const [jointerName, setJointerName] = useState(initialReport?.jointerName || '');
  const [weather, setWeather] = useState(initialReport?.weather || 'Cerah');
  const [submittedBy] = useState(initialReport?.submittedBy || 'Field Supervisor / QC');

  // Helper to build DPR items directly from Site Services & Materials (Accessories)
  const buildItemsFromSite = (site?: Site): DailyProgressItem[] => {
    if (!site) return [];

    const serviceItems: DailyProgressItem[] = site.services.map((srv, idx) => {
      const lower = srv.name.toLowerCase();
      let category: DailyProgressItem['category'] = 'OTHER';

      if (lower.includes('tiang') || lower.includes('pole') || lower.includes('tanam')) {
        category = 'POLE';
      } else if (lower.includes('kabel') || lower.includes('cable') || lower.includes('tarik') || lower.includes('pulling') || lower.includes('feeder') || lower.includes('distribusi')) {
        category = 'CABLE';
      } else if (lower.includes('gali') || lower.includes('digging') || lower.includes('lubang') || lower.includes('crossing')) {
        category = 'CIVIL_DIGGING';
      } else if (lower.includes('fat') || lower.includes('fdt') || lower.includes('closure') || lower.includes('otb')) {
        category = 'FAT_FDT';
      }

      const prevActual = srv.actualProgress || 0;
      const isDone = prevActual >= srv.qty && srv.qty > 0;

      return {
        id: `srv-${site.id}-${idx}`,
        category,
        itemName: srv.name,
        unit: srv.uom || 'Unit',
        planQty: srv.qty,
        todayQty: 0,
        totalActualQty: prevActual,
        status: isDone ? 'DONE' : prevActual > 0 ? 'IN_PROGRESS' : 'PENDING',
      };
    });

    // Optionally include major accessories from site.materials
    const materialItems: DailyProgressItem[] = (site.materials || [])
      .filter((mat) => {
        const lower = mat.name.toLowerCase();
        return (
          lower.includes('dead end') ||
          lower.includes('suspension') ||
          lower.includes('clamp') ||
          lower.includes('slack') ||
          lower.includes('belt') ||
          lower.includes('stopping') ||
          lower.includes('guy grip') ||
          lower.includes('bulldog')
        );
      })
      .map((mat, idx) => ({
        id: `mat-${site.id}-${idx}`,
        category: 'ACCESSORIES',
        itemName: mat.name,
        unit: mat.uom || 'Pcs',
        planQty: mat.qty,
        todayQty: 0,
        totalActualQty: mat.installedQty || 0,
        status: (mat.installedQty || 0) >= mat.qty ? 'DONE' : (mat.installedQty || 0) > 0 ? 'IN_PROGRESS' : 'PENDING',
      }));

    return [...serviceItems, ...materialItems];
  };

  const [items, setItems] = useState<DailyProgressItem[]>(() => {
    if (initialReport?.items && initialReport.items.length > 0) {
      return initialReport.items;
    }
    return buildItemsFromSite(selectedSite);
  });

  // Automatically sync when SPK or Site changes (only if not editing initialReport)
  const handleSpkChange = (newSpkId: string) => {
    setSelectedSpkId(newSpkId);
    const targetSpk = spks.find((s) => s.id === newSpkId);
    if (targetSpk && targetSpk.sites[0]) {
      const firstSite = targetSpk.sites[0];
      setSelectedSiteId(firstSite.id);
      setMandorName(firstSite.mandorName || currentMandor?.name || 'Mandor Lapangan');
      setStartImDate(targetSpk.createdAt || new Date().toISOString().split('T')[0]);
      if (!initialReport) {
        setItems(buildItemsFromSite(firstSite));
      }
    }
  };

  const handleSiteChange = (newSiteId: string) => {
    setSelectedSiteId(newSiteId);
    const targetSite = selectedSpk?.sites.find((s) => s.id === newSiteId);
    if (targetSite) {
      setMandorName(targetSite.mandorName || currentMandor?.name || 'Mandor Lapangan');
      if (!initialReport) {
        setItems(buildItemsFromSite(targetSite));
      }
    }
  };

  // Manual Reload from Cluster BOQ Button
  const handleReloadFromCluster = () => {
    if (selectedSite) {
      setItems(buildItemsFromSite(selectedSite));
      setMandorName(selectedSite.mandorName || currentMandor?.name || 'Mandor Lapangan');
    }
  };

  // Photos (Mandatory)
  const [photos, setPhotos] = useState<DailyProgressPhoto[]>(initialReport?.photos || []);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoCategory, setPhotoCategory] = useState<DailyProgressPhoto['category']>('TIANG');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Activities & Plans
  const [activitiesToday, setActivitiesToday] = useState<string>(
    initialReport?.activitiesToday.join('\n') || 'Tanam tiang & gali lubang\nInstalasi aksesoris clamp pole'
  );
  const [planTomorrow, setPlanTomorrow] = useState<string>(
    initialReport?.planTomorrow.join('\n') || 'Lanjutan penanaman tiang\nPenarikan kabel FO'
  );
  const [issues, setIssues] = useState<string>(
    initialReport?.issues.join('\n') || 'Nihil / Kondisi lapangan kondusif'
  );

  const [syncToSite, setSyncToSite] = useState<boolean>(true);

  // Clipboard Paste Support for Images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const newPhoto: DailyProgressPhoto = {
                id: `ph-paste-${Date.now()}`,
                url: event.target?.result as string,
                caption:
                  photoCaption ||
                  `Foto Tangkapan Layar Lapangan (${new Date().toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })})`,
                category: photoCategory,
                timestamp: `${new Date().toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })} WIB`,
              };
              setPhotos((prev) => [...prev, newPhoto]);
              setPhotoError(null);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [photoCaption, photoCategory]);

  if (!isOpen) return null;

  const currentOverallProgress = calculateDprOverallProgress(items);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setDayName(getDayName(newDate));
  };

  const handleItemChange = (idx: number, field: keyof DailyProgressItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[idx] };

      if (field === 'todayQty') {
        const todayVal = Number(value) || 0;
        current.todayQty = todayVal;

        // Calculate total actual by adding today's volume to baseline
        const baseline = current.totalActualQty - (updated[idx].todayQty || 0);
        current.totalActualQty = Math.max(0, baseline + todayVal);
      } else if (field === 'totalActualQty') {
        current.totalActualQty = Number(value) || 0;
      } else if (field === 'planQty') {
        current.planQty = Number(value) || 0;
      } else {
        (current as any)[field] = value;
      }

      // Update status
      if (current.totalActualQty >= current.planQty && current.planQty > 0) {
        current.status = 'DONE';
      } else if (current.totalActualQty > 0) {
        current.status = 'IN_PROGRESS';
      } else {
        current.status = 'PENDING';
      }

      updated[idx] = current;
      return updated;
    });
  };

  const handleAddItem = () => {
    const newItem: DailyProgressItem = {
      id: `item-${Date.now()}`,
      category: 'OTHER',
      itemName: 'Item SOW Tambahan',
      unit: 'Unit',
      planQty: 10,
      todayQty: 0,
      totalActualQty: 0,
      status: 'PENDING',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleDeleteItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Photo Upload Handler (Files / Drag and Drop)
  const processFiles = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto: DailyProgressPhoto = {
          id: `ph-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          url: e.target?.result as string,
          caption:
            photoCaption ||
            `Dokumentasi ${photoCategory} - ${file.name.replace(/\.[^/.]+$/, '')}`,
          category: photoCategory,
          timestamp: `${new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          })} WIB`,
        };
        setPhotos((prev) => [...prev, newPhoto]);
        setPhotoError(null);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Preset sample photo generator
  const handleAddPresetPhoto = (
    category: DailyProgressPhoto['category'],
    defaultCaption: string,
    imageUrl: string
  ) => {
    const newPhoto: DailyProgressPhoto = {
      id: `ph-preset-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      url: imageUrl,
      caption: defaultCaption,
      category,
      timestamp: `${new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })} WIB`,
    };
    setPhotos((prev) => [...prev, newPhoto]);
    setPhotoError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length === 0) {
      setPhotoError('Wajib melampirkan minimal 1 foto dokumentasi pekerjaan lapangan!');
      const el = document.getElementById('photo-upload-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const overallPct = calculateDprOverallProgress(items);

    const report: DailyProgressReport = {
      id: initialReport?.id || `dpr-${Date.now()}`,
      spkId: selectedSpkId,
      clusterName: selectedSpk?.clusterName || 'Cluster FTTH',
      siteId: selectedSiteId,
      siteName: selectedSite?.name || 'Site Utama',
      vendorName: selectedSpk?.vendorName || 'Telkom Akses',
      date,
      dayName,
      startImDate,
      mitraName,
      mandorName,
      teamSize,
      jointerName,
      overallProgressPercent: overallPct,
      items,
      photos,
      activitiesToday: activitiesToday.split('\n').filter((t) => t.trim().length > 0),
      planTomorrow: planTomorrow.split('\n').filter((t) => t.trim().length > 0),
      issues: issues.split('\n').filter((t) => t.trim().length > 0),
      weather,
      submittedBy,
      createdAt: initialReport?.createdAt || new Date().toISOString(),
    };

    if (initialReport) {
      updateDailyReport(report);
    } else {
      addDailyReport(report, syncToSite);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl glass-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* MODAL HEADER */}
        <div className="p-5 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {initialReport ? 'Edit Laporan Harian (DPR)' : 'Input Daily Progress Report (DPR)'}
                </h3>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  Cluster BOQ Synced
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Volume pengerjaan otomatis terhubung dengan rincian SOW & BOQ Cluster.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress Badge */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Total Akumulasi Fisik
              </span>
              <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                {currentOverallProgress.toFixed(1)}%
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          {/* CLUSTER SELECTION & VOLUME SYNC BANNER */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-200 dark:border-sky-800/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  Sumber Data: SOW & BOQ Cluster Proyek
                </span>
              </div>

              <button
                type="button"
                onClick={handleReloadFromCluster}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-700 font-bold text-xs shadow-sm transition-all self-start sm:self-auto"
                title="Muat ulang volume dan item sesuai BOQ Cluster terkini"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>🔄 Muat Ulang SOW dari Cluster</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. Pilih Cluster SPK *
                </label>
                <select
                  value={selectedSpkId}
                  onChange={(e) => handleSpkChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-sky-500"
                >
                  {spks.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.clusterName} ({s.vendorName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  2. Pilih Site SOW *
                </label>
                <select
                  value={selectedSiteId}
                  onChange={(e) => handleSiteChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-sky-500"
                >
                  {selectedSpk?.sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name} ({site.services.length} Item SOW)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Laporan *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white shadow-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hari
                </label>
                <input
                  type="text"
                  value={dayName}
                  onChange={(e) => setDayName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white shadow-sm"
                />
              </div>
            </div>

            {/* Site Info Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-sky-200/50 dark:border-sky-800/40 text-[11px]">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 font-semibold text-slate-700 dark:text-slate-300">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>Site: <strong>{selectedSite?.name || '-'}</strong></span>
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 font-semibold text-slate-700 dark:text-slate-300">
                <HardHat className="w-3 h-3 text-amber-500" />
                <span>Mandor: <strong>{mandorName}</strong></span>
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Jumlah Item SOW: <strong>{items.length} Baris</strong></span>
              </span>
            </div>
          </div>

          {/* SOW & ITEMS PROGRESS TABLE */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Tabel Rincian Volume SOW (Target Plan / Hari Ini / Total Aktual / Sisa)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Target Plan otomatis terisi dari BOQ Cluster. Masukkan volume yang dikerjakan mandor pada kolom <strong>Hari Ini</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Item Manual</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl glass-card">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 w-32">Kategori</th>
                    <th className="p-3 min-w-[200px]">Item SOW / Pekerjaan</th>
                    <th className="p-3 text-center w-20">Satuan</th>
                    <th className="p-3 text-right w-28 bg-slate-200/50 dark:bg-slate-800/50">Target Plan</th>
                    <th className="p-3 text-right w-28 bg-sky-500/10 text-sky-700 dark:text-sky-300">Hari Ini (Today)</th>
                    <th className="p-3 text-right w-28 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-black">Total Aktual</th>
                    <th className="p-3 text-right w-24 text-rose-500">Sisa</th>
                    <th className="p-3 text-center w-28">Status</th>
                    <th className="p-3 text-center w-12">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {items.map((item, idx) => {
                    const remaining = Math.max(0, item.planQty - item.totalActualQty);
                    const pct = item.planQty > 0 ? (item.totalActualQty / item.planQty) * 100 : 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-sans">
                          <select
                            value={item.category}
                            onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                            className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold"
                          >
                            <option value="POLE">POLE (Tiang)</option>
                            <option value="CABLE">CABLE (Kabel FO)</option>
                            <option value="CIVIL_DIGGING">DIGGING (Gali)</option>
                            <option value="FAT_FDT">FAT / FDT</option>
                            <option value="ACCESSORIES">ACCESSORIES</option>
                            <option value="OTHER">LAINNYA</option>
                          </select>
                        </td>

                        <td className="p-2.5 font-sans">
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                            className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </td>

                        <td className="p-2.5 text-center font-sans">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            className="w-16 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center text-xs"
                          />
                        </td>

                        {/* TARGET PLAN (READONLY / EDITABLE) */}
                        <td className="p-2.5 text-right bg-slate-50 dark:bg-slate-900/50">
                          <input
                            type="number"
                            value={item.planQty}
                            onChange={(e) => handleItemChange(idx, 'planQty', Number(e.target.value))}
                            className="w-20 p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right font-bold text-xs"
                          />
                        </td>

                        {/* TODAY QTY */}
                        <td className="p-2.5 text-right bg-sky-50/50 dark:bg-sky-950/30">
                          <input
                            type="number"
                            min="0"
                            value={item.todayQty || ''}
                            placeholder="0"
                            onChange={(e) => handleItemChange(idx, 'todayQty', Number(e.target.value))}
                            className="w-20 p-1.5 rounded-lg bg-white dark:bg-slate-900 border-2 border-sky-400 dark:border-sky-600 text-right font-black text-sky-700 dark:text-sky-300 text-xs focus:ring-2 focus:ring-sky-500"
                          />
                        </td>

                        {/* TOTAL ACTUAL QTY */}
                        <td className="p-2.5 text-right bg-emerald-50/50 dark:bg-emerald-950/30">
                          <input
                            type="number"
                            value={item.totalActualQty}
                            onChange={(e) => handleItemChange(idx, 'totalActualQty', Number(e.target.value))}
                            className="w-20 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-right font-black text-emerald-700 dark:text-emerald-300 text-xs"
                          />
                        </td>

                        {/* REMAINING */}
                        <td className="p-2.5 text-right font-bold text-rose-500">
                          {remaining}
                        </td>

                        {/* STATUS */}
                        <td className="p-2.5 text-center font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold inline-block ${
                              item.status === 'DONE'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : item.status === 'IN_PROGRESS'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {item.status === 'DONE' ? 'Done ✅' : item.status === 'IN_PROGRESS' ? 'Progres ⏳' : 'Pending'}
                          </span>
                        </td>

                        {/* ACTION */}
                        <td className="p-2.5 text-center font-sans">
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(idx)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MANDATORY PHOTO EVIDENCE UPLOAD SECTION */}
          <div
            id="photo-upload-section"
            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-indigo-500/30 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-indigo-500" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Foto Dokumentasi Lapangan * (Wajib Dilampirkan)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Upload file foto, drag & drop, paste dari clipboard (Ctrl+V), atau gunakan preset simulasi lapangan.
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                  photos.length > 0
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                }`}
              >
                {photos.length > 0 ? `✅ ${photos.length} Foto Terlampir` : '⚠️ Wajib Min. 1 Foto'}
              </span>
            </div>

            {photoError && (
              <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            {/* UPLOAD CONTROLS & PRESETS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">Kategori Pekerjaan Foto:</label>
                <select
                  value={photoCategory}
                  onChange={(e) => setPhotoCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-xs"
                >
                  <option value="TIANG">Tanam Tiang & Gali</option>
                  <option value="PENARIKAN_FO">Penarikan Kabel FO</option>
                  <option value="SPLICING">Splicing & OTDR Test</option>
                  <option value="FAT_FDT">Instalasi FAT & FDT</option>
                  <option value="KENDALA">Kendala / Izin Lapangan</option>
                  <option value="UMUM">Foto Personil Tim / Umum</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-500 mb-1">Keterangan / Caption Foto:</label>
                <input
                  type="text"
                  placeholder="mis. Tanam tiang 7m 3 inch di pole 12 Desa Sukaperna"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            {/* DRAG & DROP AREA */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-sky-400 bg-white/50 dark:bg-slate-900/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                Klik untuk Memilih File atau Drag & Drop Gambar ke Sini
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Format didukung: JPG, PNG, WEBP (Bisa langsung Paste / Ctrl+V)
              </p>
            </div>

            {/* PRESET QUICK ATTACH BUTTONS */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                ⚡ Contoh Preset Foto Simulasi:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleAddPresetPhoto(
                      'TIANG',
                      `Tanam tiang 7m & Gali - Site ${selectedSite?.name}`,
                      'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?auto=format&fit=crop&w=600&q=80'
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[11px] font-semibold hover:bg-sky-200 transition-colors flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  <span>+ Foto Tanam Tiang</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleAddPresetPhoto(
                      'PENARIKAN_FO',
                      `Penarikan Kabel ADSS 24c - Site ${selectedSite?.name}`,
                      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-200 transition-colors flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  <span>+ Foto Penarikan FO</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleAddPresetPhoto(
                      'SPLICING',
                      `Penyambungan Core FO & OTB - Site ${selectedSite?.name}`,
                      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80'
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[11px] font-semibold hover:bg-purple-200 transition-colors flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  <span>+ Foto Splicing & QC</span>
                </button>
              </div>
            </div>

            {/* ATTACHED PHOTO GALLERY */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                {photos.map((ph) => (
                  <div
                    key={ph.id}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                  >
                    <img
                      src={ph.url}
                      alt={ph.caption}
                      className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="p-2 space-y-0.5 text-[10px]">
                      <span className="px-1.5 py-0.2 rounded font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 inline-block">
                        {ph.category}
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={ph.caption}>
                        {ph.caption}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(ph.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-500 transition-colors opacity-90 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVITIES & NOTES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Aktivitas Selesai Hari Ini:
              </label>
              <textarea
                rows={3}
                value={activitiesToday}
                onChange={(e) => setActivitiesToday(e.target.value)}
                placeholder="mis. Gali 24 lubang, pasang 17 tiang 7m 3 inch"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rencana Kerja Besok:
              </label>
              <textarea
                rows={3}
                value={planTomorrow}
                onChange={(e) => setPlanTomorrow(e.target.value)}
                placeholder="mis. Lanjutan penarikan kabel ADSS 24c line A"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kendala Lapangan / Catatan:
              </label>
              <textarea
                rows={3}
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
                placeholder="mis. Nihil / Izin RT setempat selesai"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
          </div>

          {/* SYNC TO CLUSTER TOGGLE */}
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <div>
                <strong className="text-slate-900 dark:text-white block text-xs">
                  Sinkronisasi Otomatis ke Progress Cluster & Site
                </strong>
                <span className="text-[11px] text-slate-500">
                  Mengupdate persentase penyelesaian fisik cluster & kelayakan syarat pengajuan termin mandor.
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              checked={syncToSite}
              onChange={(e) => setSyncToSite(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
          </div>

          {/* MODAL FOOTER BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-sky-600/25 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Rilis Laporan DPR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
