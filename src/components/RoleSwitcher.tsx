'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCluster } from '@/context/ClusterContext';
import { UserRole } from '@/types';
import {
  ChevronDown,
  Shield,
  LogOut,
  Check,
  Building2,
  Mail,
} from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, logout } = useCluster();
  const [isOpen, setIsOpen] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeColor = (role: UserRole) => {
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
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left group"
        title="Profil Akun Pengguna"
      >
        <div className="relative flex-shrink-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-300 dark:ring-slate-700"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>

        <div className="hidden sm:block text-xs leading-tight">
          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px] block">
            {currentUser.name.split(' ')[0]}
          </span>
          <span
            className={`inline-block px-1 py-0.1 text-[9px] font-bold rounded border mt-0.5 ${getRoleBadgeColor(
              currentUser.role
            )}`}
          >
            {currentUser.role.replace('_', ' ')}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
          {/* USER HEADER CARD */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 mb-2">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-300 dark:ring-slate-700"
              />
              <div className="min-w-0 flex-1">
                <strong className="text-slate-900 dark:text-white font-bold text-xs block truncate">
                  {currentUser.name}
                </strong>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                </div>
                <span
                  className={`inline-block px-1.5 py-0.2 text-[9px] font-semibold rounded border mt-1.5 ${getRoleBadgeColor(
                    currentUser.role
                  )}`}
                >
                  {currentUser.roleLabel}
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/50 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="truncate">{currentUser.department}</span>
              </div>
              {currentUser.description && (
                <p className="text-[10px] italic leading-relaxed pt-0.5">
                  &ldquo;{currentUser.description}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* PERMISSIONS ACCORDION TOGGLE */}
          <div className="mb-2">
            <button
              onClick={() => setShowRoleInfo(!showRoleInfo)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>Hak Akses & Otoritas ({currentUser.permissions?.length || 0})</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRoleInfo ? 'rotate-180' : ''}`} />
            </button>

            {showRoleInfo && (
              <div className="mt-1 p-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/40 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                {currentUser.permissions?.map((perm) => (
                  <div key={perm} className="flex items-center gap-1.5 text-[10px] text-slate-700 dark:text-slate-300">
                    <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span className="font-mono">{perm}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LOGOUT BUTTON */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun (Logout)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
