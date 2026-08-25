'use client';

import React from 'react';
import { MaterialPurchaseOrder } from '@/types';
import { formatIDR } from '@/lib/calculations';
import {
  X,
  Printer,
  ShoppingBag,
  Building,
  CheckCircle2,
  Calendar,
  CreditCard,
} from 'lucide-react';

interface MaterialPurchaseVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  po: MaterialPurchaseOrder;
}

export const MaterialPurchaseVoucherModal: React.FC<MaterialPurchaseVoucherModalProps> = ({
  isOpen,
  onClose,
  po,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="w-full max-w-3xl my-8 rounded-2xl glass-card p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:m-0 print:p-0">
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Voucher Resmi Pembelian Material & Aksesoris
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak PO / Voucher</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Purchase Order Document */}
        <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 print:border-none print:p-0 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase text-slate-900">
                PT INDOTEK BUANA KARYA
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Departemen Procurement & Logistik FTTH
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Head Office: Jl. Pelaksana FTTH No. 88, Central Java | Telp: (0283) 356-7890
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 text-xs font-bold rounded tracking-wider uppercase bg-amber-600 text-white">
                PURCHASE ORDER MATERIAL
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                {po.poNumber}
              </p>
            </div>
          </div>

          {/* Letter Title */}
          <div className="text-center space-y-1">
            <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
              PURCHASE ORDER & BUKTI BELANJA MATERIAL AKSESORIS
            </h3>
            <p className="text-xs text-slate-600">
              Cluster: <strong>{po.clusterName}</strong> | Site: {po.siteName}
            </p>
          </div>

          {/* Supplier & Order Details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-2">
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Toko / Supplier Tujuan:</span>
                <strong className="text-slate-900 text-sm font-bold">{po.supplierName}</strong>
                {po.supplierContact && <span className="block text-slate-600">Telp/WA: {po.supplierContact}</span>}
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Rekening Bank Pembayaran:</span>
                <span className="text-slate-900 font-mono font-bold">
                  {po.supplierBankName || 'Bank'} - {po.supplierBankAccount || '-'}
                </span>
                <span className="block text-slate-600">a.n. {po.supplierBankHolder || po.supplierName}</span>
              </div>
            </div>

            <div className="space-y-2 text-right">
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Tanggal Pembelian:</span>
                <span className="text-slate-800 font-mono font-semibold">{po.purchaseDate}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Metode Pembayaran:</span>
                <span className="text-slate-800 font-bold uppercase">{po.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Status Realisasi:</span>
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                  {po.status}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                  <th className="p-2.5 text-center w-10">No</th>
                  <th className="p-2.5">Deskripsi Material / Aksesoris</th>
                  <th className="p-2.5 text-center">Satuan</th>
                  <th className="p-2.5 text-right">Qty</th>
                  <th className="p-2.5 text-right">Harga Satuan (Rp)</th>
                  <th className="p-2.5 text-right">Total (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {po.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="p-2.5 text-center font-sans text-slate-400">{idx + 1}</td>
                    <td className="p-2.5 font-sans font-bold text-slate-900">{item.materialName}</td>
                    <td className="p-2.5 text-center font-sans text-slate-600">{item.uom}</td>
                    <td className="p-2.5 text-right font-bold text-slate-800">{item.qty}</td>
                    <td className="p-2.5 text-right text-slate-700">{formatIDR(item.unitPrice)}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{formatIDR(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-amber-50 font-bold border-t-2 border-slate-900 text-slate-900">
                  <td colSpan={5} className="p-3 text-right font-sans uppercase">
                    Total Pembelian Material:
                  </td>
                  <td className="p-3 text-right font-mono text-sm text-amber-900 font-black">
                    {formatIDR(po.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Receipt Photo & Notes */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block text-[11px]">Catatan Pengadaan:</span>
              <p className="text-slate-800 mt-1">{po.notes || '-'}</p>
              <span className="text-slate-500 font-semibold block text-[11px] mt-2">No. Surat Jalan Toko:</span>
              <p className="font-mono font-bold text-slate-800">{po.deliveryOrderNo || '-'}</p>
            </div>

            {po.receiptPhotoUrl && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block text-[11px]">Bukti Kuitansi / Nota Toko:</span>
                <img src={po.receiptPhotoUrl} alt="Receipt" className="w-full h-20 object-cover rounded border border-slate-300" />
              </div>
            )}
          </div>

          {/* 3-Party Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-center text-xs">
            <div className="space-y-14">
              <p className="text-slate-600 font-semibold">Diajukan (Procurement):</p>
              <div>
                <p className="font-bold text-slate-900 underline">{po.requestedBy}</p>
                <p className="text-[10px] text-slate-500">{po.requestedAt}</p>
              </div>
            </div>

            <div className="space-y-14">
              <p className="text-slate-600 font-semibold">Disetujui (Project Manager):</p>
              <div>
                <p className="font-bold text-slate-900 underline">{po.approvedBy || 'Teguh Prayoga'}</p>
                <p className="text-[10px] text-slate-500">{po.approvedAt || 'Approved'}</p>
              </div>
            </div>

            <div className="space-y-14">
              <p className="text-slate-600 font-semibold">Dibayar (Finance / Kasir):</p>
              <div>
                <p className="font-bold text-slate-900 underline">Finance Department</p>
                <p className="text-[10px] text-slate-500">{po.paidAt || 'Lunas Transfer'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
