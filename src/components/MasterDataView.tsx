'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { Mandor, Vendor, Supplier, PriceCatalogItem } from '@/types';
import { formatIDR } from '@/lib/calculations';
import {
  Users,
  Building,
  ShoppingBag,
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
  HardHat,
  Shield,
  Layers,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const MasterDataView: React.FC = () => {
  const {
    mandors,
    addMandor,
    updateMandor,
    deleteMandor,
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    priceCatalog,
    addPriceCatalogItem,
    updatePriceCatalogItem,
    deletePriceCatalogItem,
  } = useCluster();

  const [activeTab, setActiveTab] = useState<'mandor' | 'vendor' | 'supplier' | 'catalog'>('mandor');
  const [searchTerm, setSearchTerm] = useState('');

  // Mandor Modal State
  const [isMandorModalOpen, setIsMandorModalOpen] = useState(false);
  const [editingMandor, setEditingMandor] = useState<Mandor | null>(null);
  const [mandorFormData, setMandorFormData] = useState<Omit<Mandor, 'id'>>({
    name: '',
    phone: '',
    teamSize: 8,
    specialization: 'All-in-One',
    area: '',
    bankName: 'BCA',
    accountNumber: '',
    accountHolder: '',
    outstandingKasbon: 0,
    notes: '',
  });

  // Vendor Modal State
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorFormData, setVendorFormData] = useState<Omit<Vendor, 'id'>>({
    name: '',
    code: '',
    scopeType: 'END_TO_END',
    picName: '',
    phone: '',
    email: '',
    notes: '',
  });

  // Supplier Modal State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierFormData, setSupplierFormData] = useState<Omit<Supplier, 'id'>>({
    name: '',
    category: 'AKSESORIS_FO',
    city: '',
    picName: '',
    phone: '',
    email: '',
    bankName: 'BCA',
    accountNumber: '',
    accountHolder: '',
    notes: '',
  });

  // Price Catalog Modal State
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<PriceCatalogItem | null>(null);
  const [catalogFormData, setCatalogFormData] = useState<Omit<PriceCatalogItem, 'id'>>({
    name: '',
    category: 'MATERIAL',
    unit: 'Pcs',
    estimatedQty: 100,
    referencePrice: 10000,
    notes: '',
  });

  // MANDOR HANDLERS
  const handleOpenMandorModal = (mandor?: Mandor) => {
    if (mandor) {
      setEditingMandor(mandor);
      setMandorFormData({
        name: mandor.name,
        phone: mandor.phone,
        teamSize: mandor.teamSize,
        specialization: mandor.specialization,
        area: mandor.area,
        bankName: mandor.bankName,
        accountNumber: mandor.accountNumber,
        accountHolder: mandor.accountHolder,
        outstandingKasbon: mandor.outstandingKasbon,
        notes: mandor.notes || '',
      });
    } else {
      setEditingMandor(null);
      setMandorFormData({
        name: '',
        phone: '',
        teamSize: 8,
        specialization: 'All-in-One',
        area: '',
        bankName: 'BCA',
        accountNumber: '',
        accountHolder: '',
        outstandingKasbon: 0,
        notes: '',
      });
    }
    setIsMandorModalOpen(true);
  };

  const handleSaveMandor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mandorFormData.name.trim()) return;

    if (editingMandor) {
      updateMandor({ ...mandorFormData, id: editingMandor.id });
    } else {
      addMandor({ ...mandorFormData, id: `mandor-${Date.now()}` });
    }
    setIsMandorModalOpen(false);
  };

  // VENDOR HANDLERS
  const handleOpenVendorModal = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendor(vendor);
      setVendorFormData({
        name: vendor.name,
        code: vendor.code,
        scopeType: vendor.scopeType,
        picName: vendor.picName,
        phone: vendor.phone,
        email: vendor.email,
        notes: vendor.notes || '',
      });
    } else {
      setEditingVendor(null);
      setVendorFormData({
        name: '',
        code: '',
        scopeType: 'END_TO_END',
        picName: '',
        phone: '',
        email: '',
        notes: '',
      });
    }
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorFormData.name.trim()) return;

    if (editingVendor) {
      updateVendor({ ...vendorFormData, id: editingVendor.id });
    } else {
      addVendor({ ...vendorFormData, id: `vendor-${Date.now()}` });
    }
    setIsVendorModalOpen(false);
  };

  // SUPPLIER HANDLERS
  const handleOpenSupplierModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setSupplierFormData({
        name: supplier.name,
        category: supplier.category,
        city: supplier.city,
        picName: supplier.picName,
        phone: supplier.phone,
        email: supplier.email || '',
        bankName: supplier.bankName,
        accountNumber: supplier.accountNumber,
        accountHolder: supplier.accountHolder,
        notes: supplier.notes || '',
      });
    } else {
      setEditingSupplier(null);
      setSupplierFormData({
        name: '',
        category: 'AKSESORIS_FO',
        city: '',
        picName: '',
        phone: '',
        email: '',
        bankName: 'BCA',
        accountNumber: '',
        accountHolder: '',
        notes: '',
      });
    }
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierFormData.name.trim()) return;

    if (editingSupplier) {
      updateSupplier({ ...supplierFormData, id: editingSupplier.id });
    } else {
      addSupplier({ ...supplierFormData, id: `sup-${Date.now()}` });
    }
    setIsSupplierModalOpen(false);
  };

  // CATALOG HANDLERS
  const handleOpenCatalogModal = (item?: PriceCatalogItem) => {
    if (item) {
      setEditingCatalog(item);
      setCatalogFormData({
        name: item.name,
        category: item.category || 'MATERIAL',
        unit: item.unit || 'Pcs',
        estimatedQty: item.estimatedQty || 100,
        referencePrice: item.referencePrice,
        notes: item.notes || '',
      });
    } else {
      setEditingCatalog(null);
      setCatalogFormData({
        name: '',
        category: 'MATERIAL',
        unit: 'Pcs',
        estimatedQty: 100,
        referencePrice: 10000,
        notes: '',
      });
    }
    setIsCatalogModalOpen(true);
  };

  const handleSaveCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catalogFormData.name.trim()) return;

    if (editingCatalog) {
      updatePriceCatalogItem(editingCatalog.id, catalogFormData);
    } else {
      addPriceCatalogItem({ ...catalogFormData, id: `cat-${Date.now()}` });
    }
    setIsCatalogModalOpen(false);
  };

  // FILTERED DATA
  const filteredMandors = mandors.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.picName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCatalog = priceCatalog.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Master Data Management Hub
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              Master Database
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sentralisasi database master: Mandor Lapangan, Vendor Klien, Toko Supplier Material, dan Standar Harga Acuan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'mandor' && (
            <button
              onClick={() => handleOpenMandorModal()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Master Mandor</span>
            </button>
          )}

          {activeTab === 'vendor' && (
            <button
              onClick={() => handleOpenVendorModal()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Master Vendor</span>
            </button>
          )}

          {activeTab === 'supplier' && (
            <button
              onClick={() => handleOpenSupplierModal()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Master Supplier</span>
            </button>
          )}

          {activeTab === 'catalog' && (
            <button
              onClick={() => handleOpenCatalogModal()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Harga Acuan</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('mandor')}
          className={`p-5 rounded-2xl glass-card border transition-all cursor-pointer ${
            activeTab === 'mandor'
              ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-500 uppercase tracking-wider block">
              Master Mandor
            </span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {mandors.length} Tim
          </p>
          <span className="text-xs text-slate-500">Partner pelaksana lapangan</span>
        </div>

        <div
          onClick={() => setActiveTab('vendor')}
          className={`p-5 rounded-2xl glass-card border transition-all cursor-pointer ${
            activeTab === 'vendor'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">
              Master Vendor
            </span>
            <Building className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {vendors.length} Vendor
          </p>
          <span className="text-xs text-slate-500">Telkom, FiberStar, MyRep</span>
        </div>

        <div
          onClick={() => setActiveTab('supplier')}
          className={`p-5 rounded-2xl glass-card border transition-all cursor-pointer ${
            activeTab === 'supplier'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">
              Master Supplier
            </span>
            <ShoppingBag className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {suppliers.length} Toko / Produsen
          </p>
          <span className="text-xs text-slate-500">Pemasok material aksesoris</span>
        </div>

        <div
          onClick={() => setActiveTab('catalog')}
          className={`p-5 rounded-2xl glass-card border transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">
              Katalog Acuan
            </span>
            <Tag className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {priceCatalog.length} Item
          </p>
          <span className="text-xs text-slate-500">Harga standar acuan estimasi</span>
        </div>
      </div>

      {/* Tabs & Filter */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 flex-wrap gap-4 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('mandor')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'mandor'
                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Master Mandor ({mandors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vendor')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'vendor'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Master Vendor ({vendors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('supplier')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'supplier'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Master Supplier ({suppliers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'catalog'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Katalog Harga Acuan ({priceCatalog.length})</span>
          </button>
        </div>

        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari dalam master data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      {/* 1. MASTER MANDOR TAB */}
      {activeTab === 'mandor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMandors.map((mandor) => (
            <div
              key={mandor.id}
              className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition-all text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {mandor.name}
                  </h3>
                  <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                    {mandor.specialization}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenMandorModal(mandor)}
                    className="p-1 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus mandor ${mandor.name}?`)) {
                        deleteMandor(mandor.id);
                      }
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{mandor.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Area: {mandor.area || 'Jawa Tengah'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kapasitas: {mandor.teamSize} Personil</span>
                </div>
              </div>

              {/* Rekening Bank & Kasbon */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans text-[10px]">Rekening Bank:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {mandor.bankName} - {mandor.accountNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans text-[10px]">Atas Nama:</span>
                  <span className="text-slate-600 dark:text-slate-300 font-sans font-semibold">
                    {mandor.accountHolder}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-amber-500 font-sans font-bold text-[10px]">Saldo Kasbon Aktif:</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">
                    {formatIDR(mandor.outstandingKasbon)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. MASTER VENDOR TAB */}
      {activeTab === 'vendor' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition-all text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px] block">
                    {vendor.code}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {vendor.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenVendorModal(vendor)}
                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus vendor ${vendor.name}?`)) {
                        deleteVendor(vendor.id);
                      }
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  vendor.scopeType === 'END_TO_END'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  Scope: {vendor.scopeType.replace('_', ' ')}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  {vendor.scopeType === 'END_TO_END'
                    ? 'Termasuk Perizinan (Permit) + Implementasi Fisik'
                    : 'Hanya Implementasi Fisik (Izin diurus vendor)'}
                </p>
              </div>

              <div className="space-y-1.5 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">PIC:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{vendor.picName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Telepon/WA:</span>
                  <span>{vendor.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span>{vendor.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. MASTER SUPPLIER TAB */}
      {activeTab === 'supplier' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition-all text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {supplier.name}
                  </h3>
                  <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {supplier.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenSupplierModal(supplier)}
                    className="p-1 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus supplier ${supplier.name}?`)) {
                        deleteSupplier(supplier.id);
                      }
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{supplier.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{supplier.phone} (PIC: {supplier.picName})</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]">
                <span className="text-slate-400 font-sans text-[10px] block">Rekening Bank Tujuan PO:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {supplier.bankName} - {supplier.accountNumber}
                </p>
                <p className="text-slate-500 text-[10px] font-sans">a.n. {supplier.accountHolder}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. MASTER KATALOG HARGA ACUAN TAB */}
      {activeTab === 'catalog' && (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl glass-card">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Nama Material / Jasa</th>
                <th className="p-3 text-center">Satuan</th>
                <th className="p-3 text-right">Harga Acuan Standar (Rp)</th>
                <th className="p-3">Catatan / Spesifikasi</th>
                <th className="p-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredCatalog.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 text-center font-sans text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.category === 'JASA_MANDOR'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {item.category === 'JASA_MANDOR' ? 'Jasa Mandor' : 'Material'}
                    </span>
                  </td>
                  <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </td>
                  <td className="p-3 text-center font-sans text-slate-600 dark:text-slate-400">
                    {item.unit || 'Pcs'}
                  </td>
                  <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                    {formatIDR(item.referencePrice)}
                  </td>
                  <td className="p-3 font-sans text-slate-500">
                    {item.notes || '-'}
                  </td>
                  <td className="p-3 text-center font-sans">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenCatalogModal(item)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-500"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus item ${item.name}?`)) {
                            deletePriceCatalogItem(item.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MANDOR MODAL */}
      {isMandorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl glass-card p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingMandor ? 'Edit Data Mandor' : 'Tambah Master Mandor Baru'}
              </h3>
              <button onClick={() => setIsMandorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMandor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Mandor / Tim</label>
                <input
                  type="text"
                  required
                  placeholder="mis. Mandor Sugeng & Tim"
                  value={mandorFormData.name}
                  onChange={(e) => setMandorFormData({ ...mandorFormData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">No. Telepon / WA</label>
                  <input
                    type="text"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={mandorFormData.phone}
                    onChange={(e) => setMandorFormData({ ...mandorFormData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Spesialisasi</label>
                  <select
                    value={mandorFormData.specialization}
                    onChange={(e: any) => setMandorFormData({ ...mandorFormData, specialization: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  >
                    <option value="All-in-One">All-in-One (Semua SOW)</option>
                    <option value="Tarik Kabel FO">Tarik Kabel FO</option>
                    <option value="Sipil Tiang">Sipil Tiang</option>
                    <option value="Splicing & OTDR">Splicing & OTDR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Personil</label>
                  <input
                    type="number"
                    value={mandorFormData.teamSize}
                    onChange={(e) => setMandorFormData({ ...mandorFormData, teamSize: Number(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Area Operasional</label>
                  <input
                    type="text"
                    placeholder="mis. Pemalang, Tegal, Slawi"
                    value={mandorFormData.area}
                    onChange={(e) => setMandorFormData({ ...mandorFormData, area: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Bank Info */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-sky-600 block text-[11px]">Rekening Bank Pembayaran Mandor:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Nama Bank</label>
                    <input
                      type="text"
                      placeholder="BCA"
                      value={mandorFormData.bankName}
                      onChange={(e) => setMandorFormData({ ...mandorFormData, bankName: e.target.value })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      placeholder="891-xxx-xxxx"
                      value={mandorFormData.accountNumber}
                      onChange={(e) => setMandorFormData({ ...mandorFormData, accountNumber: e.target.value })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Atas Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    placeholder="SUGENG RIYADI"
                    value={mandorFormData.accountHolder}
                    onChange={(e) => setMandorFormData({ ...mandorFormData, accountHolder: e.target.value })}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMandorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  {editingMandor ? 'Simpan Perubahan' : 'Tambah Mandor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENDOR MODAL */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl glass-card p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingVendor ? 'Edit Master Vendor' : 'Tambah Master Vendor Baru'}
              </h3>
              <button onClick={() => setIsVendorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Vendor</label>
                  <input
                    type="text"
                    required
                    placeholder="mis. PT Telkom Akses"
                    value={vendorFormData.name}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Singkat</label>
                  <input
                    type="text"
                    required
                    placeholder="TELKOM"
                    value={vendorFormData.code}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Scope of Work</label>
                <select
                  value={vendorFormData.scopeType}
                  onChange={(e: any) => setVendorFormData({ ...vendorFormData, scopeType: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                >
                  <option value="END_TO_END">End to End (Perizinan + Implementasi Fisik)</option>
                  <option value="IMPLEMENTATION_ONLY">Implementation Only (Hanya Fisik / Izin Diurus Klien)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama PIC Vendor</label>
                  <input
                    type="text"
                    placeholder="Pak Budi Hartono"
                    value={vendorFormData.picName}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, picName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">No. Kontak / WA</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={vendorFormData.phone}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Resmi</label>
                <input
                  type="email"
                  placeholder="vendor@company.com"
                  value={vendorFormData.email}
                  onChange={(e) => setVendorFormData({ ...vendorFormData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  {editingVendor ? 'Simpan Perubahan' : 'Tambah Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPLIER MODAL */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl glass-card p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSupplier ? 'Edit Master Supplier' : 'Tambah Master Supplier Baru'}
              </h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Toko / Supplier</label>
                <input
                  type="text"
                  required
                  placeholder="mis. CV Surya Aksesoris Optik"
                  value={supplierFormData.name}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Barang</label>
                  <select
                    value={supplierFormData.category}
                    onChange={(e: any) => setSupplierFormData({ ...supplierFormData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  >
                    <option value="AKSESORIS_FO">Aksesoris FO & Klem</option>
                    <option value="TIANG_DAN_BESI">Tiang & Konstruksi Besi</option>
                    <option value="KABEL_DAN_FIBER">Kabel FO & Perangkat Pasif</option>
                    <option value="CONSUMABLES">Consumables & Fasteners</option>
                    <option value="GENERAL">General Supplier</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kota / Lokasi</label>
                  <input
                    type="text"
                    placeholder="Semarang, Jawa Tengah"
                    value={supplierFormData.city}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama PIC Sales</label>
                  <input
                    type="text"
                    placeholder="Pak Hendra"
                    value={supplierFormData.picName}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, picName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">No. Kontak / WA</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={supplierFormData.phone}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Rekening Supplier */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-amber-600 block text-[11px]">Rekening Bank Tujuan Transfer PO:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Bank</label>
                    <input
                      type="text"
                      placeholder="BCA"
                      value={supplierFormData.bankName}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, bankName: e.target.value })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      placeholder="8090-xxx-xx"
                      value={supplierFormData.accountNumber}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, accountNumber: e.target.value })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Atas Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    placeholder="CV Surya Aksesoris Optik"
                    value={supplierFormData.accountHolder}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, accountHolder: e.target.value })}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  {editingSupplier ? 'Simpan Perubahan' : 'Tambah Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATALOG MODAL */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl glass-card p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCatalog ? 'Edit Harga Acuan' : 'Tambah Harga Acuan Baru'}
              </h3>
              <button onClick={() => setIsCatalogModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCatalog} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Item / Jasa</label>
                <input
                  type="text"
                  required
                  placeholder="mis. Clamps Dead end Fittings"
                  value={catalogFormData.name}
                  onChange={(e) => setCatalogFormData({ ...catalogFormData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <select
                    value={catalogFormData.category}
                    onChange={(e: any) => setCatalogFormData({ ...catalogFormData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  >
                    <option value="MATERIAL">Material / Aksesoris</option>
                    <option value="JASA_MANDOR">Jasa Mandor Lapangan</option>
                    <option value="PERIZINAN">Perizinan / Permit</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Satuan</label>
                  <input
                    type="text"
                    placeholder="Pcs, Meter, Set..."
                    value={catalogFormData.unit}
                    onChange={(e) => setCatalogFormData({ ...catalogFormData, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Acuan Standar (Rp)</label>
                <input
                  type="number"
                  required
                  value={catalogFormData.referencePrice}
                  onChange={(e) => setCatalogFormData({ ...catalogFormData, referencePrice: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan / Spesifikasi</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan spesifikasi teknis acuan..."
                  value={catalogFormData.notes}
                  onChange={(e) => setCatalogFormData({ ...catalogFormData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCatalogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  {editingCatalog ? 'Simpan Perubahan' : 'Tambah Acuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
