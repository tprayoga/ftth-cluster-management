'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { SPK, Site, ScopeType } from '@/types';
import { X, Building2, HardHat, FileCheck2 } from 'lucide-react';

interface NewClusterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewClusterModal: React.FC<NewClusterModalProps> = ({ isOpen, onClose }) => {
  const { vendors, mandors, addSPK } = useCluster();

  const [clusterName, setClusterName] = useState('');
  const [vendorId, setVendorId] = useState(vendors[0]?.id || 'vendor-ta');
  const [scopeType, setScopeType] = useState<ScopeType>('END_TO_END');
  const [mandorId, setMandorId] = useState(mandors[0]?.id || 'mandor-1');
  const [spkNumber, setSpkNumber] = useState(`SPK ${Math.floor(Math.random() * 90 + 10)}/PT INDOTEK BUANA KARYA/TSN - FTTH/VIII/2026`);
  const [region] = useState('Central Java');
  const [siteName, setSiteName] = useState('');
  const [sowType, setSowType] = useState<Site['sowType']>('Distribusi');
  const [poAmount, setPoAmount] = useState(35000000);

  if (!isOpen) return null;

  const handleVendorChange = (vId: string) => {
    setVendorId(vId);
    const selectedVendor = vendors.find((v) => v.id === vId);
    if (selectedVendor) {
      setScopeType(selectedVendor.scopeType);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clusterName || !siteName) return;

    const vendor = vendors.find((v) => v.id === vendorId) || vendors[0];
    const mandor = mandors.find((m) => m.id === mandorId) || mandors[0];
    const spkId = `spk-${Date.now()}`;
    const siteId = `site-${spkId}-1`;

    const newSPK: SPK = {
      id: spkId,
      vendorId: vendor.id,
      vendorName: vendor.name,
      scopeType,
      workflowStage: 'DRAFT_ESTIMASI',
      spkNumber,
      clusterName: clusterName.toUpperCase().startsWith('CLUSTER') ? clusterName.toUpperCase() : `CLUSTER ${clusterName.toUpperCase()}`,
      region,
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0],
      targetCompletionDate: '30 Hari Kerja',
      notes: [`SPK diterima dari ${vendor.name} (${scopeType})`],
      revisionLogs: [
        {
          id: `rev-${Date.now()}`,
          version: 'v1',
          date: new Date().toISOString().split('T')[0],
          author: 'Estimator Team',
          status: 'Draft',
          note: `Olah BOQ awal dari PO ${vendor.name} & alokasi ke ${mandor.name}`,
        },
      ],
      signOffs: [
        { role: 'Estimator', name: 'Estimator Lapangan', date: new Date().toISOString().split('T')[0], status: 'Draft' },
      ],
      sites: [
        {
          id: siteId,
          spkId,
          name: siteName.toUpperCase(),
          sowType,
          poAmount: Number(poAmount) || 0,
          mandorId: mandor.id,
          mandorName: mandor.name,
          permitItems:
            scopeType === 'END_TO_END'
              ? [
                  {
                    id: `permit-${Date.now()}-1`,
                    siteId,
                    name: `Izin Lingkungan RT/RW Area ${siteName}`,
                    category: 'Lingkungan / Warga',
                    estimatedCost: 500000,
                    actualCost: 0,
                    status: 'Pending',
                    pic: 'Tim Sitac',
                  },
                ]
              : [],
          services: [
            {
              id: `srv-${Date.now()}-1`,
              siteId,
              name: 'FO core type SM G.652.D-ADSS 48 cores',
              qty: 2000,
              uom: 'Meter',
              unitPrice: 2100,
              remark: 'Include Pemasangan Label Kabel',
              actualProgress: 0,
            },
            {
              id: `srv-${Date.now()}-2`,
              siteId,
              name: 'Pemasangan Tiang 7 meter 3 inch',
              qty: 30,
              uom: 'Set',
              unitPrice: 105000,
              remark: 'Include Pole Clamp Single',
              actualProgress: 0,
            },
          ],
          materials: [
            {
              id: `mat-${Date.now()}-1`,
              siteId,
              name: 'Strand Wire Messenger 6 mm',
              qty: 600,
              unitPrice: 4050,
            },
            {
              id: `mat-${Date.now()}-2`,
              siteId,
              name: 'Clamps Dead End Fittings/clamp buaya',
              qty: 50,
              unitPrice: 11000,
            },
          ],
          paymentTerms: [
            {
              id: `term-${siteId}-1`,
              siteId,
              termNumber: 1,
              percentage: 30,
              amount: Math.round(2000 * 2100 * 0.3),
              isPaid: false,
              note: 'Termin 1 Mandor (DP 30%)',
            },
          ],
        },
      ],
    };

    addSPK(newSPK);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg my-8 rounded-2xl glass-card p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Input SPK Vendor Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih Vendor Utama, Aturan Scope, dan Alokasi Mandor
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Cluster *
              </label>
              <input
                type="text"
                required
                placeholder="mis. PEMALANG KOTA"
                value={clusterName}
                onChange={(e) => setClusterName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vendor Utama
              </label>
              <select
                value={vendorId}
                onChange={(e) => handleVendorChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipe Scope Kontrak
              </label>
              <select
                value={scopeType}
                onChange={(e) => setScopeType(e.target.value as ScopeType)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="END_TO_END">End-to-End (Permit + Impl)</option>
                <option value="IMPLEMENTATION_ONLY">Implementation Only</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alokasi Mandor Lapangan
              </label>
              <select
                value={mandorId}
                onChange={(e) => setMandorId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {mandors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nomor Kontrak / SPK Vendor
            </label>
            <input
              type="text"
              required
              value={spkNumber}
              onChange={(e) => setSpkNumber(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">
              Data Site Pertama (SOW)
            </h4>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Site SOW *
              </label>
              <input
                type="text"
                required
                placeholder="mis. PULLING DISTRIBUSI AREA KOTA..."
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipe SOW
                </label>
                <select
                  value={sowType}
                  onChange={(e) => setSowType(e.target.value as any)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                >
                  <option value="Distribusi">Distribusi</option>
                  <option value="Subfeeder">Subfeeder</option>
                  <option value="Feeder">Feeder</option>
                  <option value="Drop">Drop Cable</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nilai PO Vendor (Rp)
                </label>
                <input
                  type="number"
                  required
                  value={poAmount}
                  onChange={(e) => setPoAmount(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20"
            >
              Buat SPK & Rilis ke Estimator
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
