import {
  ServiceItem,
  MaterialItem,
  Site,
  SPK,
  CalculatedServiceItem,
  CalculatedMaterialItem,
  CalculatedSite,
  CalculatedSPK,
  PortfolioSummary,
} from '@/types';

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function calculateServiceItem(item: ServiceItem): CalculatedServiceItem {
  const total = item.qty * item.unitPrice;
  const progressPercent = item.qty > 0 ? (item.actualProgress / item.qty) * 100 : 0;
  const isAddWork = item.actualProgress > item.qty;

  return {
    ...item,
    total,
    progressPercent,
    isAddWork,
  };
}

export function calculateMaterialItem(item: MaterialItem): CalculatedMaterialItem {
  const total = item.qty * item.unitPrice;
  return {
    ...item,
    total,
  };
}

export function calculateSite(site: Site): CalculatedSite {
  const calculatedServices = site.services.map(calculateServiceItem);
  const calculatedMaterials = site.materials.map(calculateMaterialItem);
  const permitItems = site.permitItems || [];

  const totalJasa = calculatedServices.reduce((sum, item) => sum + item.total, 0);
  const totalMaterial = calculatedMaterials.reduce((sum, item) => sum + item.total, 0);
  const totalPermit = permitItems.reduce((sum, item) => sum + (item.actualCost || item.estimatedCost || 0), 0);

  const totalEksternal = totalJasa + totalMaterial + totalPermit;

  const poAmount = site.poAmount || 0;
  const jasaRatio = poAmount > 0 ? (totalJasa / poAmount) * 100 : 0;
  const materialRatio = poAmount > 0 ? (totalMaterial / poAmount) * 100 : 0;
  const permitRatio = poAmount > 0 ? (totalPermit / poAmount) * 100 : 0;
  const costRatio = poAmount > 0 ? (totalEksternal / poAmount) * 100 : 0;

  // Physical items for progress calculation (exclude negotiation / lot items)
  const physicalItems = calculatedServices.filter(
    (item) => !item.isNegosiasi && item.uom?.toLowerCase() !== 'lot'
  );

  const progressPercent =
    physicalItems.length > 0
      ? physicalItems.reduce((sum, item) => sum + item.progressPercent, 0) / physicalItems.length
      : 0;

  // Payment terms (Standard 30% - 40% - 30%)
  const term1 = site.paymentTerms?.find((t) => t.termNumber === 1);
  const term2 = site.paymentTerms?.find((t) => t.termNumber === 2);
  const term3 = site.paymentTerms?.find((t) => t.termNumber === 3);

  const expectedTerm1 = Math.round(totalJasa * 0.3);
  const expectedTerm2 = Math.round(totalJasa * 0.4);
  const expectedTerm3 = Math.round(totalJasa * 0.3);

  const term1Amount = term1
    ? (term1.amount > 0 ? term1.amount : expectedTerm1)
    : expectedTerm1;

  const term2Amount = term2
    ? (term2.isPaid ? (term2.amount > 0 ? term2.amount : expectedTerm2) : (term2.amount > 0 ? term2.amount : 0))
    : 0;

  const term3Amount = term3
    ? (term3.isPaid ? (term3.amount > 0 ? term3.amount : expectedTerm3) : (term3.amount > 0 ? term3.amount : 0))
    : 0;

  let totalPaid = 0;
  if (term1?.isPaid) totalPaid += term1Amount;
  if (term2?.isPaid) totalPaid += (term2Amount > 0 ? term2Amount : expectedTerm2);
  if (term3?.isPaid) totalPaid += (term3Amount > 0 ? term3Amount : expectedTerm3);

  const pendingPayment = Math.max(0, totalJasa - totalPaid);

  const marginRp = poAmount - totalEksternal;
  const marginPercent = poAmount > 0 ? (marginRp / poAmount) * 100 : 0;

  let marginHealth: 'healthy' | 'warning' | 'danger' = 'healthy';
  if (marginPercent < 15) {
    marginHealth = 'danger';
  } else if (marginPercent < 25) {
    marginHealth = 'warning';
  }

  return {
    ...site,
    totalJasa,
    jasaRatio,
    totalMaterial,
    materialRatio,
    totalPermit,
    permitRatio,
    totalEksternal,
    costRatio,
    progressPercent,
    term1Amount,
    term2Amount,
    term3Amount,
    totalPaid,
    pendingPayment,
    marginRp,
    marginPercent,
    marginHealth,
    services: calculatedServices,
    materials: calculatedMaterials,
    permitItems,
  };
}

export function calculateSPK(spk: SPK): CalculatedSPK {
  const calculatedSites = (spk.sites || []).map(calculateSite);

  const totalPO = calculatedSites.reduce((sum, s) => sum + s.poAmount, 0);
  const totalJasa = calculatedSites.reduce((sum, s) => sum + s.totalJasa, 0);
  const totalMaterial = calculatedSites.reduce((sum, s) => sum + s.totalMaterial, 0);
  const totalPermit = calculatedSites.reduce((sum, s) => sum + s.totalPermit, 0);
  const totalEksternal = totalJasa + totalMaterial + totalPermit;

  const costRatio = totalPO > 0 ? (totalEksternal / totalPO) * 100 : 0;

  const avgProgress =
    calculatedSites.length > 0
      ? calculatedSites.reduce((sum, s) => sum + s.progressPercent, 0) / calculatedSites.length
      : 0;

  const totalPaid = calculatedSites.reduce((sum, s) => sum + s.totalPaid, 0);
  const pendingPayment = calculatedSites.reduce((sum, s) => sum + s.pendingPayment, 0);

  const marginRp = totalPO - totalEksternal;
  const marginPercent = totalPO > 0 ? (marginRp / totalPO) * 100 : 0;

  let marginHealth: 'healthy' | 'warning' | 'danger' = 'healthy';
  if (marginPercent < 15) {
    marginHealth = 'danger';
  } else if (marginPercent < 25) {
    marginHealth = 'warning';
  }

  return {
    ...spk,
    sites: calculatedSites,
    totalPO,
    totalJasa,
    totalMaterial,
    totalPermit,
    totalEksternal,
    costRatio,
    avgProgress,
    totalPaid,
    pendingPayment,
    marginRp,
    marginPercent,
    marginHealth,
  };
}

export function calculatePortfolio(spks: SPK[]): PortfolioSummary {
  const calculated = spks.map(calculateSPK);

  const totalClusters = calculated.length;
  const totalSites = calculated.reduce((sum, s) => sum + s.sites.length, 0);
  const totalPO = calculated.reduce((sum, s) => sum + s.totalPO, 0);
  const totalJasa = calculated.reduce((sum, s) => sum + s.totalJasa, 0);
  const totalMaterial = calculated.reduce((sum, s) => sum + s.totalMaterial, 0);
  const totalPermit = calculated.reduce((sum, s) => sum + s.totalPermit, 0);
  const totalCost = totalJasa + totalMaterial + totalPermit;

  const overallMarginRp = totalPO - totalCost;
  const overallMarginPercent = totalPO > 0 ? (overallMarginRp / totalPO) * 100 : 0;

  const avgProgress =
    calculated.length > 0
      ? calculated.reduce((sum, s) => sum + s.avgProgress, 0) / calculated.length
      : 0;

  const totalPaid = calculated.reduce((sum, s) => sum + s.totalPaid, 0);
  const pendingPayment = calculated.reduce((sum, s) => sum + s.pendingPayment, 0);

  const healthyCount = calculated.filter((s) => s.marginHealth === 'healthy').length;
  const warningCount = calculated.filter((s) => s.marginHealth === 'warning').length;
  const dangerCount = calculated.filter((s) => s.marginHealth === 'danger').length;

  return {
    totalClusters,
    totalSites,
    totalPO,
    totalCost,
    totalJasa,
    totalMaterial,
    totalPermit,
    overallMarginRp,
    overallMarginPercent,
    avgProgress,
    totalPaid,
    pendingPayment,
    healthyCount,
    warningCount,
    dangerCount,
  };
}
