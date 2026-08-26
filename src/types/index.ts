export type ScopeType = 'IMPLEMENTATION_ONLY' | 'END_TO_END';
export type WorkflowStage =
  | 'DRAFT_ESTIMASI'
  | 'SPK_MANDOR_DIRILIS'
  | 'PELAKSANAAN'
  | 'QC_BAST'
  | 'SELESAI';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'PROJECT_MANAGER'
  | 'ESTIMATOR'
  | 'PROCUREMENT'
  | 'FINANCE';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  avatar: string;
  email: string;
  password?: string;
  department: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  permissions?: string[];
  description?: string;
  createdAt?: string;
}

export interface ApprovalRulesConfig {
  spkMarginThreshold: number; // e.g. 20% margin below which requires Director approval
  poTier1Limit: number; // e.g. 10,000,000 IDR limit for PM-only approval
  maxKasbonPercent: number; // e.g. 30%
  term1MinProgress: number; // e.g. 20%
  term2MinProgress: number; // e.g. 60%
  term3MinProgress: number; // e.g. 100%
  requirePhotoOnDpr: boolean;
  autoNotifyWhatsApp: boolean;
  allowMandorOverdraft: boolean;
}

export interface ApprovalLog {
  id: string;
  entityType: 'SPK_MANDOR' | 'MATERIAL_PO' | 'PAYMENT_REQUEST' | 'DPR';
  entityId: string;
  entityTitle: string;
  action: 'APPROVED' | 'REJECTED' | 'REQUESTED';
  actedByRole: UserRole;
  actedByName: string;
  timestamp: string;
  notes?: string;
}

export type PaymentRequestType = 'TERMIN' | 'KASBON' | 'PELUNASAN_BAST';
export type PaymentRequestStatus = 'PENDING_FINANCE' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface Vendor {
  id: string;
  name: string;
  code: string;
  scopeType: ScopeType;
  picName: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: 'AKSESORIS_FO' | 'TIANG_DAN_BESI' | 'KABEL_DAN_FIBER' | 'CONSUMABLES' | 'GENERAL';
  city: string;
  picName: string;
  phone: string;
  email?: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  notes?: string;
}

export interface PriceCatalogItem {
  id: string;
  name: string;
  category?: 'MATERIAL' | 'JASA_MANDOR' | 'PERIZINAN';
  unit?: string;
  estimatedQty: number;
  referencePrice: number;
  notes?: string;
}

export interface Mandor {
  id: string;
  name: string;
  phone: string;
  teamSize: number;
  specialization: 'Tarik Kabel FO' | 'Sipil Tiang' | 'Splicing & OTDR' | 'All-in-One';
  area: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  outstandingKasbon: number;
  notes?: string;
}

export interface DailyProgressPhoto {
  id: string;
  url: string;
  caption: string;
  category: 'TIANG' | 'PENARIKAN_FO' | 'SPLICING' | 'FAT_FDT' | 'KENDALA' | 'UMUM';
  timestamp: string;
}

export interface MandorPaymentRequest {
  id: string;
  requestNo: string;
  spkId: string;
  clusterName: string;
  siteId: string;
  siteName: string;
  mandorId: string;
  mandorName: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  type: PaymentRequestType;
  termNumber?: number;
  requestedAmount: number;
  deductedKasbon: number;
  netTransferAmount: number;
  verifiedProgressPercent: number;
  isDprRuleSatisfied?: boolean;
  ruleRequirementNote?: string;
  attachedPhotos?: string[];
  reason: string;
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  transferRef?: string;
  status: PaymentRequestStatus;
  financeNotes?: string;
}

export interface DailyProgressItem {
  id: string;
  category: 'CIVIL_DIGGING' | 'POLE' | 'CABLE' | 'FAT_FDT' | 'ACCESSORIES' | 'OTHER';
  itemName: string;
  unit: string;
  planQty: number;
  todayQty: number;
  totalActualQty: number;
  status: 'DONE' | 'IN_PROGRESS' | 'PENDING';
}

export interface DailyProgressReport {
  id: string;
  spkId: string;
  clusterName: string;
  siteId: string;
  siteName: string;
  vendorName: string;
  date: string; // e.g. 2026-08-24
  dayName: string; // e.g. Senin
  startImDate?: string;
  mitraName: string;
  mandorName: string;
  teamSize: number;
  jointerName?: string;
  overallProgressPercent: number; // Persentase pekerjaan penuh akumulasi
  items: DailyProgressItem[];
  photos: DailyProgressPhoto[]; // Wajib foto dokumentasi lapangan
  activitiesToday: string[];
  planTomorrow: string[];
  issues: string[];
  weather?: string;
  submittedBy: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  siteId: string;
  name: string;
  qty: number;
  uom: string;
  unitPrice: number; // Harga Jasa Mandor
  remark?: string;
  actualProgress: number;
  isNegosiasi?: boolean;
}

export type MaterialCategory = 'MAIN_MATERIAL' | 'ACCESSORIES' | 'FASTENERS' | 'CONSUMABLES' | 'OTHER';

export type MaterialPOStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PAID'
  | 'RECEIVED_GUDANG'
  | 'HANDOVER_MANDOR'
  | 'REJECTED';

export interface MaterialItem {
  id: string;
  siteId: string;
  name: string;
  category?: MaterialCategory;
  uom?: string;
  qty: number; // Target BOQ Qty
  unitPrice: number; // Harga Estimasi / Budget Satuan
  actualBuyPrice?: number; // Harga Beli Riil Toko/Supplier
  actualPurchasedQty?: number; // Total yang sudah dibeli
  issuedToMandorQty?: number; // Total yang sudah diserahkan ke mandor
  installedQty?: number; // Total terpasang di lapangan (dari DPR)
  supplierName?: string;
  remark?: string;
}

export interface MaterialPurchaseOrderItem {
  id: string;
  materialName: string;
  category: MaterialCategory;
  uom: string;
  qty: number;
  unitPrice: number; // Harga Beli Satuan Supplier
  totalPrice: number;
  notes?: string;
}

export interface MaterialPurchaseOrder {
  id: string;
  poNumber: string; // e.g. PO-MAT/2026/08/001
  spkId: string;
  clusterName: string;
  siteId: string;
  siteName: string;
  supplierName: string;
  supplierContact?: string;
  supplierBankName?: string;
  supplierBankAccount?: string;
  supplierBankHolder?: string;
  purchaseDate: string;
  paymentMethod: 'TRANSFER_SUPPLIER' | 'CASH_OPERASIONAL' | 'TEMPO_30_HARI';
  items: MaterialPurchaseOrderItem[];
  totalAmount: number;
  status: MaterialPOStatus;
  deliveryOrderNo?: string; // No. Surat Jalan dari Supplier
  receiptPhotoUrl?: string; // Foto Nota / Kuitansi Toko
  notes?: string;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  transferRef?: string;
}

export interface MaterialHandoverItem {
  id: string;
  materialName: string;
  uom: string;
  qty: number;
  notes?: string;
}

export interface MaterialHandover {
  id: string;
  suratJalanNo: string; // e.g. SJ-MAT/IBK/2026/08/01
  spkId: string;
  clusterName: string;
  siteId: string;
  siteName: string;
  mandorId: string;
  mandorName: string;
  handoverDate: string;
  receiverName: string; // Mandor / Leader Lapangan
  deliveredBy: string; // Logistik / Gudang
  items: MaterialHandoverItem[];
  status: 'DELIVERED' | 'ACKNOWLEDGED';
  notes?: string;
}

export interface PermitItem {
  id: string;
  siteId: string;
  name: string;
  category: 'Lingkungan / Warga' | 'Dinas / Pemda' | 'Sitac / Survey' | 'Lain-lain';
  estimatedCost: number;
  actualCost: number;
  status: 'Pending' | 'In Progress' | 'Approved / Selesai';
  pic?: string;
  notes?: string;
}

export interface PriceCatalogItem {
  id: string;
  name: string;
  estimatedQty: number;
  referencePrice: number;
}

export interface PaymentTerm {
  id: string;
  siteId: string;
  termNumber: number; // 1, 2, 3
  percentage: number;
  amount: number;
  isPaid: boolean;
  paidDate?: string;
  note?: string;
}

export interface Site {
  id: string;
  spkId: string;
  spkNumber?: string;
  name: string;
  sowType: 'Distribusi' | 'Subfeeder' | 'Feeder' | 'Drop' | 'Other';
  poAmount: number; // Nilai PO dari Vendor
  mandorId?: string;
  mandorName?: string;
  services: ServiceItem[]; // Jasa Mandor
  materials: MaterialItem[];
  permitItems?: PermitItem[]; // Biaya Perizinan (hanya jika End-to-End)
  paymentTerms: PaymentTerm[];
}

export interface RevisionLog {
  id: string;
  version: string;
  date: string;
  author: string;
  status: string;
  note: string;
}

export interface SignOff {
  role: string;
  name: string;
  date: string;
  status: string;
  note?: string;
}

export interface SPK {
  id: string;
  vendorId: string;
  vendorName: string;
  scopeType: ScopeType;
  workflowStage: WorkflowStage;
  spkNumber: string;
  clusterName: string;
  region: string;
  status: 'Draft' | 'Penawaran' | 'Revisi' | 'Approved' | 'In Progress' | 'Completed';
  createdAt: string;
  targetCompletionDate?: string;
  notes: string[];
  revisionLogs: RevisionLog[];
  signOffs: SignOff[];
  sites: Site[];
}

// Calculated types for UI display
export interface CalculatedServiceItem extends ServiceItem {
  total: number;
  progressPercent: number;
  isAddWork: boolean;
}

export interface CalculatedMaterialItem extends MaterialItem {
  total: number;
}

export interface CalculatedSite {
  id: string;
  spkId: string;
  spkNumber?: string;
  name: string;
  sowType: string;
  poAmount: number;
  mandorId?: string;
  mandorName?: string;
  totalJasa: number;
  jasaRatio: number;
  totalMaterial: number;
  materialRatio: number;
  totalPermit: number;
  permitRatio: number;
  totalEksternal: number;
  costRatio: number;
  progressPercent: number;
  term1Amount: number;
  term2Amount: number;
  term3Amount: number;
  totalPaid: number;
  pendingPayment: number;
  marginRp: number;
  marginPercent: number;
  marginHealth: 'healthy' | 'warning' | 'danger';
  services: CalculatedServiceItem[];
  materials: CalculatedMaterialItem[];
  permitItems: PermitItem[];
  paymentTerms: PaymentTerm[];
}

export interface CalculatedSPK {
  id: string;
  vendorId: string;
  vendorName: string;
  scopeType: ScopeType;
  workflowStage: WorkflowStage;
  spkNumber: string;
  clusterName: string;
  region: string;
  status: string;
  createdAt: string;
  targetCompletionDate?: string;
  notes: string[];
  revisionLogs: RevisionLog[];
  signOffs: SignOff[];
  sites: CalculatedSite[];
  // Aggregate stats
  totalPO: number;
  totalJasa: number;
  totalMaterial: number;
  totalPermit: number;
  totalEksternal: number;
  costRatio: number;
  avgProgress: number;
  totalPaid: number;
  pendingPayment: number;
  marginRp: number;
  marginPercent: number;
  marginHealth: 'healthy' | 'warning' | 'danger';
}

export interface PortfolioSummary {
  totalClusters: number;
  totalSites: number;
  totalPO: number;
  totalCost: number;
  totalJasa: number;
  totalMaterial: number;
  totalPermit: number;
  overallMarginRp: number;
  overallMarginPercent: number;
  avgProgress: number;
  totalPaid: number;
  pendingPayment: number;
  healthyCount: number;
  warningCount: number;
  dangerCount: number;
}
