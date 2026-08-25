'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { MaterialCategory, MaterialPurchaseOrderItem } from '@/types';
import { formatIDR } from '@/lib/calculations';
import {
  X,
  Plus,
  Trash2,
  Upload,
  ShoppingBag,
  Save,
  Building,
  CreditCard,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

interface MaterialPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSpkId?: string;
  defaultSiteId?: string;
}

export const MaterialPurchaseOrderModal: React.FC<MaterialPurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  defaultSpkId,
  defaultSiteId,
}) => {
  const { spks, createMaterialPO } = useCluster();

  const [selectedSpkId, setSelectedSpkId] = useState<string>(
    defaultSpkId || spks[0]?.id || ''
  );

  const selectedSpk = spks.find((s) => s.id === selectedSpkId) || spks[0];

  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    defaultSiteId || selectedSpk?.sites[0]?.id || ''
  );

  const selectedSite = selectedSpk?.sites.find((s) => s.id === selectedSiteId) || selectedSpk?.sites[0];

  const [supplierName, setSupplierName] = useState('CV Surya Aksesoris Optik Semarang');
  const [supplierContact, setSupplierContact] = useState('0812-3456-7890');
  const [supplierBankName, setSupplierBankName] = useState('BCA');
  const [supplierBankAccount, setSupplierBankAccount] = useState('8090-1122-33');
  const [supplierBankHolder, setSupplierBankHolder] = useState('CV Surya Aksesoris Optik');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER_SUPPLIER' | 'CASH_OPERASIONAL' | 'TEMPO_30_HARI'>('TRANSFER_SUPPLIER');
  const [notes, setNotes] = useState('Pembelian material aksesoris untuk pemenuhan pengerjaan cluster.');
  const [requestedBy, setRequestedBy] = useState('Budhimansyah (Commercial / Procurement)');
  const [receiptPhotoUrl, setReceiptPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80');

  // Initial purchase items prepopulated from site accessories
  const initialItems: MaterialPurchaseOrderItem[] = (selectedSite?.materials || [
    { id: '1', siteId: '1', name: 'Clamps Dead end Fittings/clamp buaya', qty: 90, unitPrice: 11000 },
    { id: '2', siteId: '1', name: 'Pole clamp single', qty: 45, unitPrice: 11000 },
    { id: '3', siteId: '1', name: 'Plate belt 20mm', qty: 80, unitPrice: 2700 },
  ]).slice(0, 4).map((m, idx) => ({
    id: `poi-${Date.now()}-${idx}`,
    materialName: m.name,
    category: 'ACCESSORIES' as MaterialCategory,
    uom: m.name.toLowerCase().includes('wire') || m.name.toLowerCase().includes('kabel') ? 'Meter' : 'Pcs',
    qty: m.qty,
    unitPrice: m.unitPrice,
    totalPrice: m.qty * m.unitPrice,
    notes: 'Sesuai BOQ Cluster',
  }));

  const [items, setItems] = useState<MaterialPurchaseOrderItem[]>(initialItems);

  if (!isOpen) return null;

  const handleItemChange = (idx: number, field: keyof MaterialPurchaseOrderItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[idx], [field]: value };
      if (field === 'qty' || field === 'unitPrice') {
        const q = field === 'qty' ? Number(value) : item.qty;
        const p = field === 'unitPrice' ? Number(value) : item.unitPrice;
        item.totalPrice = q * p;
      }
      updated[idx] = item;
      return updated;
    });
  };

  const handleAddItem = () => {
    const newItem: MaterialPurchaseOrderItem = {
      id: `poi-${Date.now()}`,
      materialName: 'Aksesoris Baru',
      category: 'ACCESSORIES',
      uom: 'Pcs',
      qty: 10,
      unitPrice: 10000,
      totalPrice: 100000,
      notes: '',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleDeleteItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalAmount = items.reduce((acc, i) => acc + (i.totalPrice || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    createMaterialPO({
      spkId: selectedSpk.id,
      clusterName: selectedSpk.clusterName,
      siteId: selectedSite?.id || '',
      siteName: selectedSite?.name || selectedSpk.clusterName,
      supplierName,
      supplierContact,
      supplierBankName,
      supplierBankAccount,
      supplierBankHolder,
      purchaseDate,
      paymentMethod,
      items,
      totalAmount,
      receiptPhotoUrl,
      notes,
      requestedBy,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl my-8 rounded-2xl glass-card p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 py-1 border-b border-slate-200 dark:border-slate-800 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Buat PO Belanja Material & Aksesoris (Pengajuan ke Finance)
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan pembelian aksesoris instalasi FTTH dari toko / supplier dan pencairan dana
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
          {/* Target Cluster & Site */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Cluster SPK *
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
                Pilih Site / SOW *
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
                Tanggal Pembelian / Rencana Belanja *
              </label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
          </div>

          {/* Supplier Info */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-500" />
              <span>Data Toko / Supplier Material</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Nama Toko / Supplier *</label>
                <input
                  type="text"
                  required
                  placeholder="mis. CV Surya Aksesoris Optik"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">No. Kontak / Sales</label>
                <input
                  type="text"
                  placeholder="mis. 0812-3456-7890"
                  value={supplierContact}
                  onChange={(e) => setSupplierContact(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Metode Pembayaran</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  <option value="TRANSFER_SUPPLIER">Transfer Bank Langsung ke Supplier</option>
                  <option value="CASH_OPERASIONAL">Cash / Reimburse Operasional</option>
                  <option value="TEMPO_30_HARI">Invoice / Tempo 30 Hari</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Bank Supplier</label>
                <input
                  type="text"
                  value={supplierBankName}
                  onChange={(e) => setSupplierBankName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  value={supplierBankAccount}
                  onChange={(e) => setSupplierBankAccount(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Atas Nama Rekening</label>
                <input
                  type="text"
                  value={supplierBankHolder}
                  onChange={(e) => setSupplierBankHolder(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Table of Material Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Rincian Barang / Aksesoris yang Dibeli
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white"
              >
                <Plus className="w-3 h-3" />
                <span>+ Tambah Item</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2.5">Kategori</th>
                    <th className="p-2.5">Nama Material / Aksesoris</th>
                    <th className="p-2.5 text-center">Satuan</th>
                    <th className="p-2.5 text-right">Jumlah (Qty)</th>
                    <th className="p-2.5 text-right">Harga Satuan Toko (Rp)</th>
                    <th className="p-2.5 text-right font-black">Subtotal (Rp)</th>
                    <th className="p-2.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2 font-sans">
                        <select
                          value={item.category}
                          onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                          className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]"
                        >
                          <option value="ACCESSORIES">Aksesoris (Clamp/Bracket)</option>
                          <option value="FASTENERS">Fasteners (Plate belt/Klem)</option>
                          <option value="MAIN_MATERIAL">Material Utama</option>
                          <option value="CONSUMABLES">Consumables (Label/Sleeve)</option>
                          <option value="OTHER">Lain-lain</option>
                        </select>
                      </td>

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
                          className="w-20 p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right font-bold text-xs"
                        />
                      </td>

                      <td className="p-2 text-right">
                        <input
                          type="number"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                          className="w-28 p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right font-bold text-amber-600 text-xs"
                        />
                      </td>

                      <td className="p-2 text-right font-bold text-slate-900 dark:text-white">
                        {formatIDR(item.totalPrice)}
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

          {/* Total Calculation & Receipt Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Receipt Preview */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>Foto Kuitansi / Nota Pembelian Supplier</span>
              </span>

              <div className="flex items-center gap-3">
                <img
                  src={receiptPhotoUrl}
                  alt="Receipt"
                  className="w-24 h-16 object-cover rounded-lg border border-slate-300 dark:border-slate-700"
                />
                <div className="space-y-1 flex-1">
                  <input
                    type="text"
                    value={receiptPhotoUrl}
                    onChange={(e) => setReceiptPhotoUrl(e.target.value)}
                    placeholder="URL Foto Nota..."
                    className="w-full p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]"
                  />
                  <p className="text-[10px] text-slate-400">Bukti nota toko untuk audit pembukuan Finance.</p>
                </div>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/20 border border-amber-300 dark:border-amber-700 flex flex-col justify-center">
              <span className="text-[11px] uppercase font-bold text-amber-800 dark:text-amber-300 tracking-wider">
                Total Nilai Pengajuan PO Material:
              </span>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono mt-1">
                {formatIDR(totalAmount)}
              </p>
              <span className="text-[11px] text-slate-500">
                {items.length} item material aksesoris akan dimintakan approval Finance.
              </span>
            </div>
          </div>

          {/* Notes & Requested By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Catatan Pengadaan / Spesifikasi</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Diajukan Oleh (Procurement / Logistik)</label>
              <input
                type="text"
                required
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
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
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan & Ajukan PO Material ke Finance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
