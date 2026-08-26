'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SPK,
  Site,
  Vendor,
  Mandor,
  MandorPaymentRequest,
  DailyProgressReport,
  PriceCatalogItem,
  CalculatedSPK,
  PortfolioSummary,
  ServiceItem,
  MaterialItem,
  MaterialPurchaseOrder,
  MaterialPurchaseOrderItem,
  MaterialHandover,
  MaterialPOStatus,
  Supplier,
  PermitItem,
  PaymentTerm,
  RevisionLog,
  WorkflowStage,
  ScopeType,
  PaymentRequestStatus,
  UserRole,
  UserProfile,
  ApprovalLog,
  ApprovalRulesConfig,
} from '@/types';
import {
  INITIAL_VENDORS,
  INITIAL_MANDORS,
  INITIAL_SUPPLIERS,
  INITIAL_PAYMENT_REQUESTS,
  INITIAL_DAILY_REPORTS,
  INITIAL_MATERIAL_POS,
  INITIAL_MATERIAL_HANDOVERS,
  INITIAL_PRICE_CATALOG,
  INITIAL_SPKS,
  AVAILABLE_USERS,
  INITIAL_APPROVAL_LOGS,
  DEFAULT_APPROVAL_RULES,
} from '@/lib/initialData';
import { calculateSPK, calculatePortfolio } from '@/lib/calculations';
import {
  parseFTTHExcel,
  exportSPKToExcel,
  generateExcelTemplate,
  generateJasaTemplate,
  generateMaterialTemplate,
  parseJasaItemsExcel,
  parseMaterialItemsExcel,
} from '@/lib/excelParser';

interface ClusterContextType {
  spks: SPK[];
  calculatedSPKs: CalculatedSPK[];
  portfolio: PortfolioSummary;
  activeSpkId: string | null;
  activeSpk: CalculatedSPK | null;
  priceCatalog: PriceCatalogItem[];
  vendors: Vendor[];
  mandors: Mandor[];
  suppliers: Supplier[];
  paymentRequests: MandorPaymentRequest[];
  dailyReports: DailyProgressReport[];
  materialPurchaseOrders: MaterialPurchaseOrder[];
  materialHandovers: MaterialHandover[];
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  users: UserProfile[];
  approvalLogs: ApprovalLog[];
  approvalRules: ApprovalRulesConfig;
  isAuthenticated: boolean;
  searchTerm: string;
  marginFilter: 'all' | 'healthy' | 'warning' | 'danger';
  vendorFilter: string;
  scopeFilter: 'all' | ScopeType;
  isDarkMode: boolean;
  
  // Auth & User Management Actions
  login: (email: string, password?: string, role?: UserRole) => { success: boolean; message?: string };
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  setCurrentUserRole: (role: UserRole) => void;
  addUser: (user: Omit<UserProfile, 'id'>) => void;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  updateApprovalRules: (rules: Partial<ApprovalRulesConfig>) => void;
  addApprovalLog: (log: Omit<ApprovalLog, 'id' | 'timestamp'>) => void;
  setActiveSpkId: (id: string | null) => void;
  setSearchTerm: (term: string) => void;
  setMarginFilter: (filter: 'all' | 'healthy' | 'warning' | 'danger') => void;
  setVendorFilter: (vendorId: string) => void;
  setScopeFilter: (scope: 'all' | ScopeType) => void;
  toggleDarkMode: () => void;
  
  // SPK CRUD
  addSPK: (spk: SPK) => void;
  updateSPK: (spk: SPK) => void;
  deleteSPK: (id: string) => void;
  updateWorkflowStage: (spkId: string, stage: WorkflowStage) => void;

  // Master Data CRUD Actions
  addMandor: (mandor: Mandor) => void;
  updateMandor: (mandor: Mandor) => void;
  deleteMandor: (id: string) => void;

  addVendor: (vendor: Vendor) => void;
  updateVendor: (vendor: Vendor) => void;
  deleteVendor: (id: string) => void;

  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;

  addPriceCatalogItem: (item: PriceCatalogItem) => void;
  updatePriceCatalogItem: (id: string, updates: Partial<PriceCatalogItem>) => void;
  deletePriceCatalogItem: (id: string) => void;
  
  // Site Items CRUD
  addSite: (
    spkId: string,
    siteData: {
      name: string;
      sowType: 'Distribusi' | 'Subfeeder' | 'Feeder' | 'Drop' | 'Other';
      poAmount: number;
      mandorId?: string;
      mandorName?: string;
    }
  ) => void;
  deleteSite: (spkId: string, siteId: string) => void;
  assignMandor: (spkId: string, siteId: string, mandorId: string) => void;
  updateServiceItem: (spkId: string, siteId: string, serviceId: string, updates: Partial<ServiceItem>) => void;
  addServiceItem: (spkId: string, siteId: string, item: Omit<ServiceItem, 'id' | 'siteId'>) => void;
  deleteServiceItem: (spkId: string, siteId: string, serviceId: string) => void;
  
  updateMaterialItem: (spkId: string, siteId: string, materialId: string, updates: Partial<MaterialItem>) => void;
  addMaterialItem: (spkId: string, siteId: string, item: Omit<MaterialItem, 'id' | 'siteId'>) => void;
  deleteMaterialItem: (spkId: string, siteId: string, materialId: string) => void;

  // Material Procurement & Handover Actions
  createMaterialPO: (po: Omit<MaterialPurchaseOrder, 'id' | 'poNumber' | 'requestedAt' | 'status'>) => void;
  updateMaterialPOStatus: (
    id: string,
    status: MaterialPOStatus,
    transferRef?: string,
    paidAt?: string,
    deliveryOrderNo?: string
  ) => void;
  deleteMaterialPO: (id: string) => void;
  createMaterialHandover: (handover: Omit<MaterialHandover, 'id' | 'suratJalanNo'>) => void;
  deleteMaterialHandover: (id: string) => void;

  updatePermitItem: (spkId: string, siteId: string, permitId: string, updates: Partial<PermitItem>) => void;
  addPermitItem: (spkId: string, siteId: string, item: Omit<PermitItem, 'id' | 'siteId'>) => void;
  deletePermitItem: (spkId: string, siteId: string, permitId: string) => void;
  
  updatePaymentTerm: (spkId: string, siteId: string, termId: string, updates: Partial<PaymentTerm>) => void;
  togglePaymentStatus: (spkId: string, siteId: string, termId: string) => void;
  
  // Finance Payment Requests (Termin & Kasbon)
  createPaymentRequest: (req: Omit<MandorPaymentRequest, 'id' | 'requestNo' | 'submittedAt' | 'status'>) => void;
  updatePaymentRequestStatus: (
    id: string,
    status: PaymentRequestStatus,
    financeNotes?: string,
    transferRef?: string,
    paidAt?: string
  ) => void;
  deletePaymentRequest: (id: string) => void;

  // Daily Activity & Progress (DPR)
  addDailyReport: (report: DailyProgressReport, syncToSite?: boolean) => void;
  updateDailyReport: (report: DailyProgressReport) => void;
  deleteDailyReport: (id: string) => void;
  
  addRevisionLog: (spkId: string, log: Omit<RevisionLog, 'id'>) => void;
  
  importExcelFile: (file: File) => Promise<{ success: boolean; message: string; spkId?: string }>;
  importJasaExcelToSite: (spkId: string, siteId: string, file: File) => Promise<{ success: boolean; message: string; count?: number }>;
  importMaterialExcelToSite: (spkId: string, siteId: string, file: File) => Promise<{ success: boolean; message: string; count?: number }>;
  exportToExcel: (spkId: string) => void;
  exportSPK: (spkId: string) => void;
  downloadExcelTemplate: () => void;
  downloadJasaTemplate: () => void;
  downloadMaterialTemplate: () => void;
  resetToDefaultData: () => void;
}

const ClusterContext = createContext<ClusterContextType | undefined>(undefined);

const STORAGE_KEY_SPKS = 'ftth_spks_v4';
const STORAGE_KEY_CATALOG = 'ftth_catalog_v4';
const STORAGE_KEY_MANDORS = 'ftth_mandors_v4';
const STORAGE_KEY_VENDORS = 'ftth_vendors_v4';
const STORAGE_KEY_SUPPLIERS = 'ftth_suppliers_v4';
const STORAGE_KEY_REQUESTS = 'ftth_requests_v4';
const STORAGE_KEY_DPR = 'ftth_dpr_v4';
const STORAGE_KEY_MAT_POS = 'ftth_mat_pos_v4';
const STORAGE_KEY_MAT_HANDOVERS = 'ftth_mat_handovers_v4';
const STORAGE_KEY_APPROVAL_LOGS = 'ftth_approval_logs_v4';
const STORAGE_KEY_USERS = 'ftth_users_v4';
const STORAGE_KEY_APPROVAL_RULES = 'ftth_approval_rules_v4';
const STORAGE_KEY_ROLE = 'ftth_active_role_v4';
const STORAGE_KEY_AUTH = 'ftth_auth_session_v4';
const STORAGE_KEY_THEME = 'ftth_theme_v4';

export const ClusterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spks, setSpks] = useState<SPK[]>(INITIAL_SPKS);
  const [priceCatalog, setPriceCatalog] = useState<PriceCatalogItem[]>(INITIAL_PRICE_CATALOG);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [mandors, setMandors] = useState<Mandor[]>(INITIAL_MANDORS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [paymentRequests, setPaymentRequests] = useState<MandorPaymentRequest[]>(INITIAL_PAYMENT_REQUESTS);
  const [dailyReports, setDailyReports] = useState<DailyProgressReport[]>(INITIAL_DAILY_REPORTS);
  const [materialPurchaseOrders, setMaterialPurchaseOrders] = useState<MaterialPurchaseOrder[]>(INITIAL_MATERIAL_POS);
  const [materialHandovers, setMaterialHandovers] = useState<MaterialHandover[]>(INITIAL_MATERIAL_HANDOVERS);
  const [approvalLogs, setApprovalLogs] = useState<ApprovalLog[]>(INITIAL_APPROVAL_LOGS);
  const [users, setUsers] = useState<UserProfile[]>(AVAILABLE_USERS);
  const [approvalRules, setApprovalRules] = useState<ApprovalRulesConfig>(DEFAULT_APPROVAL_RULES);
  const [currentUser, setCurrentUser] = useState<UserProfile>(AVAILABLE_USERS[0]); // default to PM
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // default authenticated for ease of demo
  const [activeSpkId, setActiveSpkId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [marginFilter, setMarginFilter] = useState<'all' | 'healthy' | 'warning' | 'danger'>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | ScopeType>('all');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const login = (email: string, password?: string, role?: UserRole): { success: boolean; message?: string } => {
    let matchedUser: UserProfile | undefined;
    
    if (role) {
      matchedUser = users.find((u) => u.role === role);
    } else if (email) {
      matchedUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    }

    if (!matchedUser) {
      return { success: false, message: 'Email atau username tidak terdaftar dalam sistem.' };
    }

    if (password && matchedUser.password && password !== matchedUser.password && password !== 'password123') {
      return { success: false, message: 'Password salah. Gunakan password yang sesuai atau klik akun demo.' };
    }

    setCurrentUser(matchedUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
      localStorage.setItem(STORAGE_KEY_ROLE, matchedUser.role);
    } catch (e) {
      console.error(e);
    }
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, 'false');
    } catch (e) {
      console.error(e);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    return currentUser.permissions?.includes(permission) ?? false;
  };

  const setCurrentUserRole = (role: UserRole) => {
    const user = users.find((u) => u.role === role) || users[0] || AVAILABLE_USERS[0];
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, role);
    } catch (e) {
      console.error(e);
    }
  };

  const addUser = (userData: Omit<UserProfile, 'id'>) => {
    const newUser: UserProfile = {
      ...userData,
      id: `usr-${Date.now()}`,
      status: userData.status || 'ACTIVE',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<UserProfile>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const updateApprovalRules = (updates: Partial<ApprovalRulesConfig>) => {
    setApprovalRules((prev) => ({ ...prev, ...updates }));
  };

  const addApprovalLog = (log: Omit<ApprovalLog, 'id' | 'timestamp'>) => {
    const newLog: ApprovalLog = {
      ...log,
      id: `app-log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setApprovalLogs((prev) => [newLog, ...prev]);
  };

  useEffect(() => {
    try {
      const savedSpks = localStorage.getItem(STORAGE_KEY_SPKS);
      const savedCatalog = localStorage.getItem(STORAGE_KEY_CATALOG);
      const savedMandors = localStorage.getItem(STORAGE_KEY_MANDORS);
      const savedVendors = localStorage.getItem(STORAGE_KEY_VENDORS);
      const savedSuppliers = localStorage.getItem(STORAGE_KEY_SUPPLIERS);
      const savedRequests = localStorage.getItem(STORAGE_KEY_REQUESTS);
      const savedDpr = localStorage.getItem(STORAGE_KEY_DPR);
      const savedMatPos = localStorage.getItem(STORAGE_KEY_MAT_POS);
      const savedMatHandovers = localStorage.getItem(STORAGE_KEY_MAT_HANDOVERS);
      const savedApprovalLogs = localStorage.getItem(STORAGE_KEY_APPROVAL_LOGS);
      const savedUsers = localStorage.getItem(STORAGE_KEY_USERS);
      const savedApprovalRules = localStorage.getItem(STORAGE_KEY_APPROVAL_RULES);
      const savedRole = localStorage.getItem(STORAGE_KEY_ROLE);
      const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);

      if (savedSpks) setSpks(JSON.parse(savedSpks));
      if (savedCatalog) setPriceCatalog(JSON.parse(savedCatalog));
      if (savedMandors) setMandors(JSON.parse(savedMandors));
      if (savedVendors) setVendors(JSON.parse(savedVendors));
      if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
      if (savedRequests) setPaymentRequests(JSON.parse(savedRequests));
      if (savedDpr) setDailyReports(JSON.parse(savedDpr));
      if (savedMatPos) setMaterialPurchaseOrders(JSON.parse(savedMatPos));
      if (savedMatHandovers) setMaterialHandovers(JSON.parse(savedMatHandovers));
      if (savedApprovalLogs) setApprovalLogs(JSON.parse(savedApprovalLogs));
      if (savedUsers) setUsers(JSON.parse(savedUsers));
      if (savedApprovalRules) setApprovalRules(JSON.parse(savedApprovalRules));
      if (savedRole) {
        const userList = savedUsers ? JSON.parse(savedUsers) : AVAILABLE_USERS;
        const found = userList.find((u: UserProfile) => u.role === savedRole);
        if (found) setCurrentUser(found);
      }
      if (savedAuth !== null) {
        setIsAuthenticated(savedAuth === 'true');
      }
      if (savedTheme !== null) setIsDarkMode(savedTheme === 'dark');
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_SPKS, JSON.stringify(spks));
      localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(priceCatalog));
      localStorage.setItem(STORAGE_KEY_MANDORS, JSON.stringify(mandors));
      localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(vendors));
      localStorage.setItem(STORAGE_KEY_SUPPLIERS, JSON.stringify(suppliers));
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(paymentRequests));
      localStorage.setItem(STORAGE_KEY_DPR, JSON.stringify(dailyReports));
      localStorage.setItem(STORAGE_KEY_MAT_POS, JSON.stringify(materialPurchaseOrders));
      localStorage.setItem(STORAGE_KEY_MAT_HANDOVERS, JSON.stringify(materialHandovers));
      localStorage.setItem(STORAGE_KEY_APPROVAL_LOGS, JSON.stringify(approvalLogs));
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY_APPROVAL_RULES, JSON.stringify(approvalRules));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [spks, priceCatalog, mandors, vendors, suppliers, paymentRequests, dailyReports, materialPurchaseOrders, materialHandovers, approvalLogs, users, approvalRules, isLoaded]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const calculatedSPKs = spks.map(calculateSPK);
  const portfolio = calculatePortfolio(spks);
  const activeSpk = activeSpkId ? calculatedSPKs.find((s) => s.id === activeSpkId) || null : null;

  const addSPK = (newSpk: SPK) => {
    setSpks((prev) => [newSpk, ...prev]);
    setActiveSpkId(newSpk.id);
  };

  const updateSPK = (updatedSpk: SPK) => {
    setSpks((prev) => prev.map((s) => (s.id === updatedSpk.id ? updatedSpk : s)));
  };

  const deleteSPK = (id: string) => {
    setSpks((prev) => prev.filter((s) => s.id !== id));
    if (activeSpkId === id) setActiveSpkId(null);
  };

  const updateWorkflowStage = (spkId: string, stage: WorkflowStage) => {
    setSpks((prev) =>
      prev.map((s) => (s.id === spkId ? { ...s, workflowStage: stage } : s))
    );
  };

  const addSite = (
    spkId: string,
    siteData: {
      name: string;
      sowType: 'Distribusi' | 'Subfeeder' | 'Feeder' | 'Drop' | 'Other';
      poAmount: number;
      mandorId?: string;
      mandorName?: string;
    }
  ) => {
    const siteId = `site-${Date.now()}`;
    const newSite: Site = {
      id: siteId,
      spkId,
      name: siteData.name,
      sowType: siteData.sowType,
      poAmount: siteData.poAmount || 0,
      mandorId: siteData.mandorId || 'm1',
      mandorName: siteData.mandorName || 'Mandor ADW Mandiri (Pak Fatrah)',
      services: [],
      materials: [],
      permitItems: [],
      paymentTerms: [
        { id: `${siteId}-t1`, siteId, termNumber: 1, percentage: 30, amount: 0, isPaid: false, note: 'Termin 1 (DP)' },
        { id: `${siteId}-t2`, siteId, termNumber: 2, percentage: 40, amount: 0, isPaid: false, note: 'Termin 2 (Progress)' },
        { id: `${siteId}-t3`, siteId, termNumber: 3, percentage: 30, amount: 0, isPaid: false, note: 'Termin 3 (Pelunasan)' },
      ],
    };

    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          sites: [...spk.sites, newSite],
        };
      })
    );
  };

  const deleteSite = (spkId: string, siteId: string) => {
    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          sites: spk.sites.filter((s) => s.id !== siteId),
        };
      })
    );
  };

  const assignMandor = (spkId: string, siteId: string, mandorId: string) => {
    const mandorObj = mandors.find((m) => m.id === mandorId);
    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          sites: spk.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              mandorId,
              mandorName: mandorObj?.name || 'Mandor External',
            };
          }),
        };
      })
    );
  };

  const updateServiceItem = (
    spkId: string,
    siteId: string,
    serviceId: string,
    updates: Partial<ServiceItem>
  ) => {
    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          sites: spk.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              services: site.services.map((srv) =>
                srv.id === serviceId ? { ...srv, ...updates } : srv
              ),
            };
          }),
        };
      })
    );
  };

  const addServiceItem = (
    spkId: string,
    siteId: string,
    item: Omit<ServiceItem, 'id' | 'siteId'>
  ) => {
    const newId = `srv-${Date.now()}`;
    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          sites: spk.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              services: [...site.services, { ...item, id: newId, siteId }],
            };
          }),
        };
      })
    );
  };

  const deleteServiceItem = (spkId: string, siteId: string, serviceId: string) => {
    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          sites: spk.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              services: site.services.filter((s) => s.id !== serviceId),
            };
          }),
        };
      })
    );
  };

  const updateMaterialItem = (
    spkId: string,
    siteId: string,
    materialId: string,
    updates: Partial<MaterialItem>
  ) => {
    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          sites: spk.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              materials: site.materials.map((mat) =>
                mat.id === materialId ? { ...mat, ...updates } : mat
              ),
            };
          }),
        };
      })
    );
  };

  const addMaterialItem = (
    spkId: string,
    siteId: string,
    item: Omit<MaterialItem, 'id' | 'siteId'>
  ) => {
    const newId = `mat-${Date.now()}`;
    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          sites: spk.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              materials: [...site.materials, { ...item, id: newId, siteId }],
            };
          }),
        };
      })
    );
  };

  const deleteMaterialItem = (spkId: string, siteId: string, materialId: string) => {
    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          sites: spk.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              materials: site.materials.filter((m) => m.id !== materialId),
            };
          }),
        };
      })
    );
  };

  const updatePermitItem = (
    spkId: string,
    siteId: string,
    permitId: string,
    updates: Partial<PermitItem>
  ) => {
    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          sites: spk.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              permitItems: (site.permitItems || []).map((p) =>
                p.id === permitId ? { ...p, ...updates } : p
              ),
            };
          }),
        };
      })
    );
  };

  const addPermitItem = (
    spkId: string,
    siteId: string,
    item: Omit<PermitItem, 'id' | 'siteId'>
  ) => {
    const newId = `permit-${Date.now()}`;
    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          sites: spk.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              permitItems: [...(site.permitItems || []), { ...item, id: newId, siteId }],
            };
          }),
        };
      })
    );
  };

  const deletePermitItem = (spkId: string, siteId: string, permitId: string) => {
    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          sites: spk.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              permitItems: (site.permitItems || []).filter((p) => p.id !== permitId),
            };
          }),
        };
      })
    );
  };

  const updatePaymentTerm = (
    spkId: string,
    siteId: string,
    termId: string,
    updates: Partial<PaymentTerm>
  ) => {
    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          sites: spk.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              paymentTerms: site.paymentTerms.map((term) =>
                term.id === termId ? { ...term, ...updates } : term
              ),
            };
          }),
        };
      })
    );
  };

  const togglePaymentStatus = (spkId: string, siteId: string, termId: string) => {
    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          sites: spk.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              paymentTerms: site.paymentTerms.map((term) => {
                if (term.id !== termId) return term;
                const nextPaid = !term.isPaid;
                return {
                  ...term,
                  isPaid: nextPaid,
                  paidDate: nextPaid ? new Date().toISOString().split('T')[0] : undefined,
                };
              }),
            };
          }),
        };
      })
    );
  };

  // Finance Payment Requests Operations
  const createPaymentRequest = (
    req: Omit<MandorPaymentRequest, 'id' | 'requestNo' | 'submittedAt' | 'status'>
  ) => {
    const count = paymentRequests.length + 1;
    const reqNo = `REQ-OPS/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(count).padStart(3, '0')}`;
    const newReq: MandorPaymentRequest = {
      ...req,
      id: `req-${Date.now()}`,
      requestNo: reqNo,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'PENDING_FINANCE',
    };
    setPaymentRequests((prev) => [newReq, ...prev]);
  };

  const updatePaymentRequestStatus = (
    id: string,
    status: PaymentRequestStatus,
    financeNotes?: string,
    transferRef?: string,
    paidAt?: string
  ) => {
    const req = paymentRequests.find((r) => r.id === id);
    if (!req) return;

    setPaymentRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          status,
          financeNotes: financeNotes || r.financeNotes,
          transferRef: transferRef || r.transferRef,
          paidAt: paidAt || (status === 'PAID' ? new Date().toISOString().split('T')[0] : r.paidAt),
          approvedAt: status === 'APPROVED' || status === 'PAID' ? new Date().toISOString().split('T')[0] : r.approvedAt,
          approvedBy: status === 'APPROVED' || status === 'PAID' ? 'Finance Team' : r.approvedBy,
        };
      })
    );

    // If marked as PAID:
    if (status === 'PAID') {
      // 1. If it's a Kasbon, add to Mandor's outstanding kasbon
      if (req.type === 'KASBON') {
        setMandors((prev) =>
          prev.map((m) =>
            m.id === req.mandorId
              ? { ...m, outstandingKasbon: m.outstandingKasbon + req.netTransferAmount }
              : m
          )
        );
      }
      // 2. If it's a Termin with Kasbon deduction, reduce Mandor's outstanding kasbon
      if (req.type === 'TERMIN' && req.deductedKasbon > 0) {
        setMandors((prev) =>
          prev.map((m) =>
            m.id === req.mandorId
              ? { ...m, outstandingKasbon: Math.max(0, m.outstandingKasbon - req.deductedKasbon) }
              : m
          )
        );
      }
      // 3. Mark site payment term as isPaid
      if (req.type === 'TERMIN' && req.termNumber) {
        setSpks((prev) =>
          prev.map((spk) => {
            if (spk.id !== req.spkId) return spk;
            return {
              ...spk,
              sites: spk.sites.map((site) => {
                if (site.id !== req.siteId) return site;
                return {
                  ...site,
                  paymentTerms: site.paymentTerms.map((term) =>
                    term.termNumber === req.termNumber
                      ? { ...term, isPaid: true, paidDate: new Date().toISOString().split('T')[0] }
                      : term
                  ),
                };
              }),
            };
          })
        );
      }
    }
  };

  const deletePaymentRequest = (id: string) => {
    setPaymentRequests((prev) => prev.filter((r) => r.id !== id));
  };

  // Daily Activity & Progress (DPR) Operations
  const addDailyReport = (report: DailyProgressReport, syncToSite: boolean = true) => {
    setDailyReports((prev) => [report, ...prev]);

    // If syncToSite is true, update the site's services actual progress
    if (syncToSite && report.spkId && report.siteId) {
      setSpks((prev) =>
        prev.map((spk) => {
          if (spk.id !== report.spkId) return spk;
          return {
            ...spk,
            sites: spk.sites.map((site) => {
              if (site.id !== report.siteId) return site;
              return {
                ...site,
                services: site.services.map((srv) => {
                  // Find matching DPR item
                  const matchedDpr = report.items.find(
                    (item) =>
                      srv.name.toLowerCase().includes(item.itemName.toLowerCase()) ||
                      item.itemName.toLowerCase().includes(srv.name.toLowerCase()) ||
                      (item.itemName.includes('24c') && srv.name.includes('24 cores')) ||
                      (item.itemName.includes('48c') && srv.name.includes('48 cores')) ||
                      (item.itemName.includes('3"') && srv.name.includes('3 inch')) ||
                      (item.itemName.includes('2.5"') && srv.name.includes('2,5 inch')) ||
                      (item.itemName.includes('FAT') && srv.name.includes('FAT'))
                  );

                  if (matchedDpr && matchedDpr.totalActualQty > 0) {
                    return { ...srv, actualProgress: matchedDpr.totalActualQty };
                  }
                  return srv;
                }),
              };
            }),
          };
        })
      );
    }
  };

  const updateDailyReport = (report: DailyProgressReport) => {
    setDailyReports((prev) => prev.map((d) => (d.id === report.id ? report : d)));
  };

  const deleteDailyReport = (id: string) => {
    setDailyReports((prev) => prev.filter((d) => d.id !== id));
  };

  // Material Procurement & Handover Operations
  const createMaterialPO = (
    po: Omit<MaterialPurchaseOrder, 'id' | 'poNumber' | 'requestedAt' | 'status'>
  ) => {
    const count = materialPurchaseOrders.length + 1;
    const poNum = `PO-MAT/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(count).padStart(3, '0')}`;
    const newPO: MaterialPurchaseOrder = {
      ...po,
      id: `po-mat-${Date.now()}`,
      poNumber: poNum,
      requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'PENDING_APPROVAL',
    };
    setMaterialPurchaseOrders((prev) => [newPO, ...prev]);
  };

  const updateMaterialPOStatus = (
    id: string,
    status: MaterialPOStatus,
    transferRef?: string,
    paidAt?: string,
    deliveryOrderNo?: string
  ) => {
    setMaterialPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id !== id) return po;
        const isApproved = status === 'APPROVED' || status === 'PAID';
        return {
          ...po,
          status,
          approvedBy: isApproved ? 'Teguh Prayoga (PM)' : po.approvedBy,
          approvedAt: isApproved ? (po.approvedAt || new Date().toISOString().split('T')[0]) : po.approvedAt,
          paidAt: status === 'PAID' ? (paidAt || new Date().toISOString().split('T')[0]) : po.paidAt,
          transferRef: transferRef || po.transferRef,
          deliveryOrderNo: deliveryOrderNo || po.deliveryOrderNo,
        };
      })
    );
  };

  const deleteMaterialPO = (id: string) => {
    setMaterialPurchaseOrders((prev) => prev.filter((p) => p.id !== id));
  };

  const createMaterialHandover = (
    handover: Omit<MaterialHandover, 'id' | 'suratJalanNo'>
  ) => {
    const count = materialHandovers.length + 1;
    const sjNo = `SJ-MAT/IBK/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(count).padStart(3, '0')}`;
    const newHandover: MaterialHandover = {
      ...handover,
      id: `sj-${Date.now()}`,
      suratJalanNo: sjNo,
    };
    setMaterialHandovers((prev) => [newHandover, ...prev]);
  };

  const deleteMaterialHandover = (id: string) => {
    setMaterialHandovers((prev) => prev.filter((h) => h.id !== id));
  };

  const addRevisionLog = (spkId: string, log: Omit<RevisionLog, 'id'>) => {
    const newLog: RevisionLog = { ...log, id: `rev-${Date.now()}` };
    setSpks((prev) =>
      prev.map((spk) => {
        if (spk.id !== spkId) return spk;
        return {
          ...spk,
          revisionLogs: [newLog, ...(spk.revisionLogs || [])],
        };
      })
    );
  };

  // Master Data CRUD Actions
  const addMandor = (mandor: Mandor) => {
    setMandors((prev) => [mandor, ...prev]);
  };

  const updateMandor = (updatedMandor: Mandor) => {
    setMandors((prev) => prev.map((m) => (m.id === updatedMandor.id ? updatedMandor : m)));
  };

  const deleteMandor = (id: string) => {
    setMandors((prev) => prev.filter((m) => m.id !== id));
  };

  const addVendor = (vendor: Vendor) => {
    setVendors((prev) => [vendor, ...prev]);
  };

  const updateVendor = (updatedVendor: Vendor) => {
    setVendors((prev) => prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v)));
  };

  const deleteVendor = (id: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
  };

  const addSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => [supplier, ...prev]);
  };

  const updateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s)));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const addPriceCatalogItem = (item: PriceCatalogItem) => {
    setPriceCatalog((prev) => [item, ...prev]);
  };

  const updatePriceCatalogItem = (id: string, updates: Partial<PriceCatalogItem>) => {
    setPriceCatalog((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  };

  const deletePriceCatalogItem = (id: string) => {
    setPriceCatalog((prev) => prev.filter((cat) => cat.id !== id));
  };

  const importExcelFile = async (file: File): Promise<{ success: boolean; message: string; spkId?: string }> => {
    try {
      const buffer = await file.arrayBuffer();
      const { spk, priceCatalog: newCatalog } = parseFTTHExcel(buffer, file.name);

      if (!spk.sites || spk.sites.length === 0) {
        return { success: false, message: 'Tidak dapat menemukan data site dalam file Excel ini.' };
      }

      setSpks((prev) => [spk, ...prev.filter((s) => s.clusterName !== spk.clusterName)]);
      if (newCatalog.length > 0) {
        setPriceCatalog((prev) => {
          const merged = [...prev];
          newCatalog.forEach((item) => {
            const idx = merged.findIndex((m) => m.name.toLowerCase() === item.name.toLowerCase());
            if (idx >= 0) {
              merged[idx] = item;
            } else {
              merged.push(item);
            }
          });
          return merged;
        });
      }

      setActiveSpkId(spk.id);
      return { success: true, message: `Berhasil mengimpor cluster "${spk.clusterName}" dengan ${spk.sites.length} site!`, spkId: spk.id };
    } catch (err: any) {
      console.error('Import error', err);
      return { success: false, message: `Gagal membaca file: ${err?.message || 'Format tidak dikenali'}` };
    }
  };

  const exportToExcel = (spkId: string) => {
    const targetCalc = calculatedSPKs.find((s) => s.id === spkId);
    if (!targetCalc) return;

    const data = exportSPKToExcel(targetCalc);
    const blob = new Blob([data as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FTTH ${targetCalc.vendorName.toUpperCase()} - ${targetCalc.clusterName.toUpperCase()} v4.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadExcelTemplate = () => {
    const data = generateExcelTemplate();
    const blob = new Blob([data as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TEMPLATE_FTTH_CLUSTER_INDOTEK_FULL.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJasaTemplate = () => {
    const data = generateJasaTemplate();
    const blob = new Blob([data as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TEMPLATE_JASA_MANDOR_FTTH.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadMaterialTemplate = () => {
    const data = generateMaterialTemplate();
    const blob = new Blob([data as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TEMPLATE_MATERIAL_AKSESORIS_FTTH.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importJasaExcelToSite = async (
    spkId: string,
    siteId: string,
    file: File
  ): Promise<{ success: boolean; message: string; count?: number }> => {
    try {
      const buffer = await file.arrayBuffer();
      const { items } = parseJasaItemsExcel(buffer);
      if (items.length === 0) {
        return { success: false, message: 'Tidak ada baris item jasa yang valid dalam file Excel ini.' };
      }
      setSpks((prev) =>
        prev.map((spk) => {
          if (spk.id !== spkId) return spk;
          return {
            ...spk,
            sites: spk.sites.map((site) => {
              if (site.id !== siteId) return site;
              const newServices: ServiceItem[] = items.map((item, idx) => ({
                ...item,
                id: `${siteId}-jasa-imp-${Date.now()}-${idx}`,
                siteId,
              }));
              return {
                ...site,
                services: [...site.services, ...newServices],
              };
            }),
          };
        })
      );
      return { success: true, message: `Berhasil mengimpor ${items.length} item jasa ke site!`, count: items.length };
    } catch (err: any) {
      return { success: false, message: `Gagal import jasa: ${err?.message || 'Format tidak valid'}` };
    }
  };

  const importMaterialExcelToSite = async (
    spkId: string,
    siteId: string,
    file: File
  ): Promise<{ success: boolean; message: string; count?: number }> => {
    try {
      const buffer = await file.arrayBuffer();
      const { items } = parseMaterialItemsExcel(buffer);
      if (items.length === 0) {
        return { success: false, message: 'Tidak ada baris material yang valid dalam file Excel ini.' };
      }
      setSpks((prev) =>
        prev.map((spk) => {
          if (spk.id !== spkId) return spk;
          return {
            ...spk,
            sites: spk.sites.map((site) => {
              if (site.id !== siteId) return site;
              const newMaterials: MaterialItem[] = items.map((item, idx) => ({
                ...item,
                id: `${siteId}-mat-imp-${Date.now()}-${idx}`,
                siteId,
              }));
              return {
                ...site,
                materials: [...site.materials, ...newMaterials],
              };
            }),
          };
        })
      );
      return { success: true, message: `Berhasil mengimpor ${items.length} item material ke site!`, count: items.length };
    } catch (err: any) {
      return { success: false, message: `Gagal import material: ${err?.message || 'Format tidak valid'}` };
    }
  };

  const resetToDefaultData = () => {
    setSpks(INITIAL_SPKS);
    setPriceCatalog(INITIAL_PRICE_CATALOG);
    setVendors(INITIAL_VENDORS);
    setMandors(INITIAL_MANDORS);
    setSuppliers(INITIAL_SUPPLIERS);
    setPaymentRequests(INITIAL_PAYMENT_REQUESTS);
    setDailyReports(INITIAL_DAILY_REPORTS);
    setMaterialPurchaseOrders(INITIAL_MATERIAL_POS);
    setMaterialHandovers(INITIAL_MATERIAL_HANDOVERS);
    setApprovalLogs(INITIAL_APPROVAL_LOGS);
    setCurrentUser(AVAILABLE_USERS[0]);
    localStorage.removeItem(STORAGE_KEY_SPKS);
    localStorage.removeItem(STORAGE_KEY_CATALOG);
    localStorage.removeItem(STORAGE_KEY_VENDORS);
    localStorage.removeItem(STORAGE_KEY_MANDORS);
    localStorage.removeItem(STORAGE_KEY_SUPPLIERS);
    localStorage.removeItem(STORAGE_KEY_REQUESTS);
    localStorage.removeItem(STORAGE_KEY_DPR);
    localStorage.removeItem(STORAGE_KEY_MAT_POS);
    localStorage.removeItem(STORAGE_KEY_MAT_HANDOVERS);
    localStorage.removeItem(STORAGE_KEY_APPROVAL_LOGS);
    localStorage.removeItem(STORAGE_KEY_ROLE);
    setActiveSpkId(null);
  };

  return (
    <ClusterContext.Provider
      value={{
        spks,
        calculatedSPKs,
        portfolio,
        activeSpkId,
        activeSpk,
        priceCatalog,
        vendors,
        mandors,
        suppliers,
        paymentRequests,
        dailyReports,
        materialPurchaseOrders,
        materialHandovers,
        currentUser,
        availableUsers: users,
        users,
        approvalLogs,
        approvalRules,
        isAuthenticated,
        searchTerm,
        marginFilter,
        vendorFilter,
        scopeFilter,
        isDarkMode,
        login,
        logout,
        hasPermission,
        setCurrentUserRole,
        addUser,
        updateUser,
        deleteUser,
        updateApprovalRules,
        addApprovalLog,
        setActiveSpkId,
        setSearchTerm,
        setMarginFilter,
        setVendorFilter,
        setScopeFilter,
        toggleDarkMode,
        addSPK,
        updateSPK,
        deleteSPK,
        updateWorkflowStage,
        addMandor,
        updateMandor,
        deleteMandor,
        addVendor,
        updateVendor,
        deleteVendor,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addPriceCatalogItem,
        updatePriceCatalogItem,
        deletePriceCatalogItem,
        addSite,
        deleteSite,
        assignMandor,
        updateServiceItem,
        addServiceItem,
        deleteServiceItem,
        updateMaterialItem,
        addMaterialItem,
        deleteMaterialItem,
        createMaterialPO,
        updateMaterialPOStatus,
        deleteMaterialPO,
        createMaterialHandover,
        deleteMaterialHandover,
        updatePermitItem,
        addPermitItem,
        deletePermitItem,
        updatePaymentTerm,
        togglePaymentStatus,
        createPaymentRequest,
        updatePaymentRequestStatus,
        deletePaymentRequest,
        addDailyReport,
        updateDailyReport,
        deleteDailyReport,
        addRevisionLog,
        importExcelFile,
        importJasaExcelToSite,
        importMaterialExcelToSite,
        exportToExcel,
        exportSPK: exportToExcel,
        downloadExcelTemplate,
        downloadJasaTemplate,
        downloadMaterialTemplate,
        resetToDefaultData,
      }}
    >
      {children}
    </ClusterContext.Provider>
  );
};

export const useCluster = () => {
  const context = useContext(ClusterContext);
  if (!context) {
    throw new Error('useCluster must be used within a ClusterProvider');
  }
  return context;
};
