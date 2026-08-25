'use client';

import React, { useState } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { UserRole, UserProfile } from '@/types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Mail,
  Phone,
  Building2,
  Save,
  X,
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
];

const ALL_AVAILABLE_PERMISSIONS = [
  { id: 'APPROVE_SPK_MANDOR', label: 'Approve & Rilis SPK Mandor' },
  { id: 'APPROVE_MATERIAL_PO_L1', label: 'Approve PO Material (Level 1)' },
  { id: 'APPROVE_PAYMENT_REQUEST_L1', label: 'Approve Termin & Kasbon Mandor' },
  { id: 'VERIFY_DAILY_PROGRESS', label: 'Verifikasi Laporan Harian (DPR)' },
  { id: 'CREATE_EDIT_CLUSTER_BOQ', label: 'Buat & Edit BOQ Cluster SPK' },
  { id: 'IMPORT_EXCEL_BOQ', label: 'Import Excel BOQ Vendor' },
  { id: 'SET_MANDOR_RATES', label: 'Kalkulasi & Setting Harga Borongan' },
  { id: 'APPROVE_EXECUTE_PAYMENT', label: 'Eksekusi Pembayaran Kas / Bank' },
  { id: 'MANAGE_KASBON_LEDGER', label: 'Kelola Buku Kasbon Mandor' },
  { id: 'CREATE_MATERIAL_PO', label: 'Terbitkan PO Material Aksesoris' },
  { id: 'MANAGE_MASTER_DATA', label: 'Kelola Master Vendor & Mandor' },
  { id: 'SYSTEM_ADMINISTRATION', label: 'Administrasi Sistem & User' },
];

export const UserManagementView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useCluster();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    roleLabel: string;
    department: string;
    avatar: string;
    description: string;
    status: 'ACTIVE' | 'INACTIVE';
    permissions: string[];
  }>({
    name: '',
    email: '',
    phone: '',
    password: 'password123',
    role: 'PROJECT_MANAGER',
    roleLabel: 'Project Manager (PM)',
    department: 'Divisi Operasional & Lapangan',
    avatar: PRESET_AVATARS[0],
    description: '',
    status: 'ACTIVE',
    permissions: ['APPROVE_SPK_MANDOR', 'VERIFY_DAILY_PROGRESS'],
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search)) ||
      u.department.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesDept = departmentFilter === 'all' || u.department === departmentFilter;

    return matchesSearch && matchesRole && matchesDept;
  });

  const departments = Array.from(new Set(users.map((u) => u.department)));

  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: 'password123',
      role: 'PROJECT_MANAGER',
      roleLabel: 'Project Manager (PM)',
      department: 'Divisi Operasional & Lapangan',
      avatar: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
      description: '',
      status: 'ACTIVE',
      permissions: ['APPROVE_SPK_MANDOR', 'VERIFY_DAILY_PROGRESS'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: user.password || 'password123',
      role: user.role,
      roleLabel: user.roleLabel,
      department: user.department,
      avatar: user.avatar,
      description: user.description || '',
      status: user.status || 'ACTIVE',
      permissions: user.permissions || [],
    });
    setIsModalOpen(true);
  };

  const handleRoleChange = (role: UserRole) => {
    let label = '';
    let dept = '';
    let defaultPerms: string[] = [];

    switch (role) {
      case 'SUPER_ADMIN':
        label = 'Direktur Utama / Super Admin';
        dept = 'Management & Direksi';
        defaultPerms = ['ALL_PERMISSIONS', 'SYSTEM_ADMINISTRATION', 'MANAGE_MASTER_DATA'];
        break;
      case 'PROJECT_MANAGER':
        label = 'Project Manager (PM)';
        dept = 'Divisi Operasional & Lapangan';
        defaultPerms = ['APPROVE_SPK_MANDOR', 'APPROVE_MATERIAL_PO_L1', 'APPROVE_PAYMENT_REQUEST_L1', 'VERIFY_DAILY_PROGRESS'];
        break;
      case 'ESTIMATOR':
        label = 'Cost Estimator / Commercial';
        dept = 'Divisi Estimasi & Komersial';
        defaultPerms = ['CREATE_EDIT_CLUSTER_BOQ', 'IMPORT_EXCEL_BOQ', 'SET_MANDOR_RATES'];
        break;
      case 'FINANCE':
        label = 'Finance & Treasury';
        dept = 'Divisi Keuangan & Kasir';
        defaultPerms = ['APPROVE_EXECUTE_PAYMENT', 'MANAGE_KASBON_LEDGER'];
        break;
      case 'PROCUREMENT':
        label = 'Procurement & Logistik';
        dept = 'Divisi Pengadaan & Gudang';
        defaultPerms = ['CREATE_MATERIAL_PO', 'MANAGE_MASTER_DATA'];
        break;
    }

    setFormData((prev) => ({
      ...prev,
      role,
      roleLabel: label,
      department: dept,
      permissions: defaultPerms,
    }));
  };

  const handleTogglePermission = (permId: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permId)
          : [...prev.permissions, permId],
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingUserId) {
      updateUser(editingUserId, formData);
    } else {
      addUser(formData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun yang sedang aktif digunakan.');
      return;
    }
    if (confirm(`Hapus akun pengguna "${name}" secara permanen?`)) {
      deleteUser(id);
    }
  };

  const handleToggleStatus = (user: UserProfile) => {
    const nextStatus = user.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    updateUser(user.id, { status: nextStatus });
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 font-bold';
      case 'PROJECT_MANAGER':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/60 font-semibold';
      case 'ESTIMATOR':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-semibold';
      case 'FINANCE':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 font-semibold';
      case 'PROCUREMENT':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Manajemen Pengguna (User Management)
            </h2>
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Role & Akses
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola akun tim perusahaan, pembagian hak akses (RBAC), divisi kerja, dan status aktivasi.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 text-white shadow-sm transition-all active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl glass-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Pengguna
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {users.length} Akun
          </p>
          <span className="text-[11px] text-slate-500">Terdaftar di sistem</span>
        </div>

        <div className="p-4 rounded-xl glass-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Akun Aktif
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {users.filter((u) => u.status !== 'INACTIVE').length} User
          </p>
          <span className="text-[11px] text-slate-500">Memiliki izin login aktif</span>
        </div>

        <div className="p-4 rounded-xl glass-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Jumlah Departemen
            </span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {departments.length} Divisi
          </p>
          <span className="text-[11px] text-slate-500">Struktur organisasi</span>
        </div>

        <div className="p-4 rounded-xl glass-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Wewenang Aktif Anda
            </span>
            <ShieldCheck className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {currentUser.name}
          </p>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
            {currentUser.roleLabel.split('(')[0]}
          </span>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="p-3.5 rounded-xl glass-card flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, divisi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">Semua Role ({users.length})</option>
            <option value="SUPER_ADMIN">Direktur / Super Admin</option>
            <option value="PROJECT_MANAGER">Project Manager (PM)</option>
            <option value="ESTIMATOR">Cost Estimator</option>
            <option value="FINANCE">Finance & Treasury</option>
            <option value="PROCUREMENT">Procurement & Logistik</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tabel
          </button>
        </div>
      </div>

      {/* USER LIST: GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const isInactive = user.status === 'INACTIVE';
            return (
              <div
                key={user.id}
                className={`p-4 rounded-xl glass-card flex flex-col justify-between space-y-4 border transition-all ${
                  isInactive ? 'opacity-60 border-dashed' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                          {user.name}
                        </strong>
                        <span className={`inline-block px-1.5 py-0.2 text-[9px] rounded border mt-0.5 ${getRoleBadge(user.role)}`}>
                          {user.roleLabel}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-full border transition-all ${
                        isInactive
                          ? 'bg-slate-100 text-slate-500 border-slate-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                      }`}
                      title="Klik untuk mengubah status aktif"
                    >
                      {isInactive ? 'Nonaktif' : 'Aktif'}
                    </button>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mt-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>

                    {user.phone && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{user.department}</span>
                    </div>

                    {user.description && (
                      <p className="text-[11px] text-slate-500 italic line-clamp-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                        &ldquo;{user.description}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Permissions tag count & Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {user.permissions?.length || 0} Hak Akses
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Pengguna"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Hapus Pengguna"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* USER LIST: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl glass-card">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">Pengguna</th>
                <th className="p-3">Role & Wewenang</th>
                <th className="p-3">Departemen</th>
                <th className="p-3">Kontak Email / Telp</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <strong className="text-slate-900 dark:text-white block text-xs">
                          {user.name}
                        </strong>
                        <span className="text-[10px] text-slate-400">ID: {user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${getRoleBadge(user.role)}`}>
                      {user.roleLabel}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    {user.department}
                  </td>
                  <td className="p-3">
                    <span className="block text-slate-900 dark:text-white font-mono text-[11px]">
                      {user.email}
                    </span>
                    <span className="text-[10px] text-slate-400">{user.phone || '-'}</span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                        user.status === 'INACTIVE'
                          ? 'bg-slate-100 text-slate-500 border-slate-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                      }`}
                    >
                      {user.status === 'INACTIVE' ? 'Nonaktif' : 'Aktif'}
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="p-1 rounded text-slate-400 hover:text-sky-600"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                        title="Hapus"
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

      {/* MODAL TAMBAH / EDIT USER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {editingUserId ? 'Edit Akun Pengguna' : 'Tambah Pengguna Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Atur nama, peran wewenang (role), divisi, dan kata sandi akses.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Avatar Selector */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                  Foto Profil / Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, avatar: av }))}
                      className={`w-10 h-10 rounded-xl overflow-hidden ring-2 transition-all flex-shrink-0 ${
                        formData.avatar === av
                          ? 'ring-sky-500 scale-105'
                          : 'ring-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Teguh Prayoga, S.T."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Alamat Email Kerja *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@indotek.co.id"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Kata Sandi (Password)
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="password123"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Role & Wewenang *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold"
                  >
                    <option value="PROJECT_MANAGER">Project Manager (PM)</option>
                    <option value="ESTIMATOR">Cost Estimator / Komersial</option>
                    <option value="FINANCE">Finance & Treasury</option>
                    <option value="PROCUREMENT">Procurement & Logistik</option>
                    <option value="SUPER_ADMIN">Direktur Utama / Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Divisi / Departemen
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Divisi Operasional & Lapangan"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Deskripsi Tanggung Jawab
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ringkasan wewenang dan job description pengguna..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Custom Permissions Matrix */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                  Hak Akses & Otoritas (Permissions Checklist)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  {ALL_AVAILABLE_PERMISSIONS.map((perm) => {
                    const checked = formData.permissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="rounded text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-[11px]">{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 text-white shadow-sm transition-all active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingUserId ? 'Simpan Perubahan' : 'Buat Akun Pengguna'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
