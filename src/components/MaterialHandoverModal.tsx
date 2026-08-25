'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { MaterialHandoverItem } from '@/types';
import {
  X,
  Plus,
  Trash2,
  Truck,
  Printer,
  FileCheck2,
  HardHat,
  Save,
} from 'lucide-react';

interface MaterialHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSpkId?: string;
  defaultSiteId?: string;
}

export const MaterialHandoverModal: React.FC<MaterialHandoverModalProps> = ({
  isOpen,
  onClose,
  defaultSpkId,
  defaultSiteId,
}) => {
  const { spks, mandors, createMaterialHandover } = useCluster();

  const [selectedSpkId, setSelectedSpkId] = useState<string>(
    defaultSpkId || spks[0]?.id || ''
  );

  const selectedSpk = spks.find((s) => s.id === selectedSpkId) || spks[0];

  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    defaultSiteId || selectedSpk?.sites[0]?.id || ''
  );

  const selectedSite = selectedSpk?.sites.find((s) => s.id === selectedSiteId) || selectedSpk?.sites[0];
  const currentMandor = mandors.find((m) => m.id === selectedSite?.mandorId) || mandors[0];

  const [mandorName, setMandorName] = useState(currentMandor?.name || 'Mandor Lapangan');
  const [receiverName, setReceiverName] = useState('Wahyu (Leader Tim Mandor)');
  const [deliveredBy, setDeliveredBy] = useState('Agus Santoso (Logistik & Gudang IBK)');
  const [handoverDate, setHandoverDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Serah terima material aksesoris tahap pengerjaan lapangan.');

  // Prepopulate items from site accessories
  const initialItems: MaterialHandoverItem[] = (selectedSite?.materials || [
    { id: '1', siteId: '1', name: 'Clamps Dead end Fittings/clamp buaya', qty: 90, unitPrice: 11000 },
    { id: '2', siteId: '1', name: 'Pole clamp single', qty: 45, unitPrice: 11000 },
  ]).map((m, idx) => ({
    id: `sji-${Date.now()}-${idx}`,
    materialName: m.name,
    uom: m.name.toLowerCase().includes('wire') || m.name.toLowerCase().includes('kabel') ? 'Meter' : 'Pcs',
    qty: m.qty,
    notes: 'Kondisi Baik / Baru',
  }));

  const [items, setItems] = useState<MaterialHandoverItem[]>(initialItems);
  const [isPrintMode, setIsPrintMode] = useState(false);

  if (!isOpen) return null;

  const handleItemChange = (idx: number, field: keyof MaterialHandoverItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleAddItem = () => {
    const newItem: MaterialHandoverItem = {
      id: `sji-${Date.now()}`,
      materialName: 'Aksesoris Tambahan',
      uom: 'Pcs',
      qty: 10,
      notes: 'Lengkap',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleDeleteItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    createMaterialHandover({
      spkId: selectedSpk.id,
      clusterName: selectedSpk.clusterName,
      siteId: selectedSite?.id || '',
      siteName: selectedSite?.name || selectedSpk.clusterName,
      mandorId: currentMandor?.id || 'mandor-1',
      mandorName,
      handoverDate,
      receiverName,
      deliveredBy,
      items,
      status: 'ACKNOWLEDGED',
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl my-8 rounded-2xl glass-card p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 py-1 border-b border-slate-200 dark:border-slate-800 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Surat Jalan Serah Terima Material ke Mandor
              </h3>
              <p className="text-xs text-slate-500">
                Bukti Pengeluaran Barang (BPB) dari Gudang ke Tim Mandor Lapangan
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
          {/* Cluster & Mandor Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cluster SPK *
              </label>
              <select
                value={selectedSpkId}
                onChange={(e) => {
                  setSelectedSpkId(e.target.value);
                  const spk = spks.find((s) => s.id === e.target.value);
                  if (spk && spk.sites[0]) {
                    setSelectedSiteId(spk.sites[0].id);
                  }
                }}
                className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                {spks.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.clusterName} ({s.vendorName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Site / SOW *
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                {selectedSpk?.sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Serah Terima *
              </label>
              <input
                type="date"
                required
                value={handoverDate}
                onChange={(e) => setHandoverDate(e.target.value)}
                className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
          </div>

          {/* Mandor & Logistik Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Nama Mandor External *</label>
              <input
                type="text"
                required
                value={mandorName}
                onChange={(e) => setMandorName(e.target.value)}
                className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Nama Penerima Lapangan (Leader)</label>
              <input
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Diserahkan Oleh (Logistik)</label>
              <input
                type="text"
                required
                value={deliveredBy}
                onChange={(e) => setDeliveredBy(e.target.value)}
                className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Daftar Barang & Aksesoris yang Diserahkan
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white"
              >
                <Plus className="w-3 h-3" />
                <span>+ Tambah Baris</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2.5">Nama Material / Aksesoris</th>
                    <th className="p-2.5 text-center">Satuan</th>
                    <th className="p-2.5 text-right">Jumlah Diserahkan (Qty)</th>
                    <th className="p-2.5">Kondisi / Catatan</th>
                    <th className="p-2.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2 font-sans">
                        <input
                          type="text"
                          required
                          value={item.materialName}
                          onChange={(e) => handleItemChange(idx, 'materialName', e.target.value)}
                          className="w-full p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        />
                      </td>

                      <td className="p-2 text-center font-sans">
                        <input
                          type="text"
                          value={item.uom}
                          onChange={(e) => handleItemChange(idx, 'uom', e.target.value)}
                          className="w-16 p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-xs"
                        />
                      </td>

                      <td className="p-2 text-right">
                        <input
                          type="number"
                          required
                          value={item.qty}
                          onChange={(e) => handleItemChange(idx, 'qty', Number(e.target.value))}
                          className="w-24 p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right font-bold text-sky-600 text-xs"
                        />
                      </td>

                      <td className="p-2 font-sans">
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) => handleItemChange(idx, 'notes', e.target.value)}
                          placeholder="mis. Kondisi baik"
                          className="w-full p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </td>

                      <td className="p-2 text-center font-sans">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(idx)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">Catatan Tambahan Surat Jalan</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>

          {/* Actions */}
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
              <Save className="w-3.5 h-3.5" />
              <span>Simpan & Rilis Surat Jalan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
