import { DailyProgressReport, DailyProgressItem, PaymentRequestType } from '@/types';

/**
 * Calculate overall weighted physical progress percentage from DPR items
 */
export function calculateDprOverallProgress(items: DailyProgressItem[]): number {
  if (!items || items.length === 0) return 0;

  // Exclude items with 0 plan
  const validItems = items.filter((i) => i.planQty > 0 && i.category !== 'OTHER');
  if (validItems.length === 0) {
    const allValid = items.filter((i) => i.planQty > 0);
    if (allValid.length === 0) return 0;
    const sum = allValid.reduce((acc, i) => acc + Math.min(100, (i.totalActualQty / i.planQty) * 100), 0);
    return Number((sum / allValid.length).toFixed(2));
  }

  const sum = validItems.reduce((acc, i) => acc + Math.min(100, (i.totalActualQty / i.planQty) * 100), 0);
  return Number((sum / validItems.length).toFixed(2));
}

/**
 * Validates whether the payment request satisfies company DPR progress rules
 */
export function checkPaymentRuleEligibility(
  type: PaymentRequestType,
  termNumber: number | undefined,
  currentDprPercent: number,
  siteTotalJasa: number,
  requestedAmount: number,
  currentKasbon: number = 0
): { isEligible: boolean; ruleNote: string; badgeText: string; color: string } {
  if (type === 'KASBON') {
    const maxSafeKasbon = Math.round(siteTotalJasa * 0.3);
    const totalPotentialDebt = currentKasbon + requestedAmount;

    if (totalPotentialDebt > maxSafeKasbon) {
      return {
        isEligible: false,
        ruleNote: `Kasbon (${requestedAmount.toLocaleString('id-ID')}) melebihi batas aman 30% hak jasa mandor (Maks: Rp ${maxSafeKasbon.toLocaleString('id-ID')}). Total hutang aktif menjadi Rp ${totalPotentialDebt.toLocaleString('id-ID')}.`,
        badgeText: '⚠️ Warning: Over Limit Kasbon',
        color: 'amber',
      };
    }

    return {
      isEligible: true,
      ruleNote: `Kasbon dalam batas aman (< 30% nilai kontrak jasa mandor). Akan dipotongkan pada termin berikutnya.`,
      badgeText: '✅ Kasbon Valid',
      color: 'emerald',
    };
  }

  // TERMIN RULES
  const term = termNumber || 1;

  if (term === 1) {
    // Termin 1 (DP 30%): Minimal 20% Progres DPR atau Mobilisasi
    const isEligible = currentDprPercent >= 20;
    return {
      isEligible,
      ruleNote: isEligible
        ? `Syarat Termin 1 Terpenuhi: Progres DPR (${currentDprPercent.toFixed(1)}%) >= Syarat Min. 20% (Mobilisasi & Tarik Kabel Awal).`
        : `Belum Memenuhi Syarat Termin 1: Progres fisik DPR baru ${currentDprPercent.toFixed(1)}% (Syarat minimal 20%).`,
      badgeText: isEligible ? '✅ Lolos Syarat Termin 1 (>=20%)' : '⏳ Belum Memenuhi Syarat (<20%)',
      color: isEligible ? 'emerald' : 'rose',
    };
  }

  if (term === 2) {
    // Termin 2 (40%): Minimal 60% Progres DPR
    const isEligible = currentDprPercent >= 60;
    return {
      isEligible,
      ruleNote: isEligible
        ? `Syarat Termin 2 Terpenuhi: Progres fisik DPR (${currentDprPercent.toFixed(1)}%) >= Syarat Min. 60% (Sebagian besar tiang & kabel terpasang).`
        : `Belum Memenuhi Syarat Termin 2: Progres fisik DPR baru ${currentDprPercent.toFixed(1)}% (Syarat minimal 60%).`,
      badgeText: isEligible ? '✅ Lolos Syarat Termin 2 (>=60%)' : '❌ Belum Memenuhi Syarat (<60%)',
      color: isEligible ? 'emerald' : 'rose',
    };
  }

  if (term === 3) {
    // Termin 3 (Pelunasan 30%): Wajib 100% Progres DPR & QC Splicing
    const isEligible = currentDprPercent >= 98;
    return {
      isEligible,
      ruleNote: isEligible
        ? `Syarat Pelunasan Terpenuhi: Progres fisik DPR ${currentDprPercent.toFixed(1)}% (100% Selesai & siap BAST).`
        : `Belum Memenuhi Syarat Pelunasan: Progres fisik DPR ${currentDprPercent.toFixed(1)}% (Wajib 100% Selesai).`,
      badgeText: isEligible ? '✅ Lolos Pelunasan BAST (100%)' : '❌ Belum Memenuhi Syarat (<100%)',
      color: isEligible ? 'emerald' : 'rose',
    };
  }

  return {
    isEligible: true,
    ruleNote: 'Sesuai persetujuan manajemen.',
    badgeText: '✅ Valid',
    color: 'emerald',
  };
}

/**
 * Generate formatted WhatsApp text message for field team reporting
 * Matches the company standard field format
 */
export function generateWhatsAppDailyReport(report: DailyProgressReport): string {
  let text = `*Daily Progres*\n`;
  text += `${report.dayName} ${report.date}\n\n`;

  text += `Cluster : ${report.clusterName}\n`;
  text += `SITE NAME : ${report.siteName}\n`;
  text += `${report.vendorName}\n`;
  if (report.startImDate) {
    text += `START IM DATE : ${report.startImDate}\n`;
  }
  text += `MITRA : ${report.mitraName}\n`;
  text += `MANDOR : ${report.mandorName}\n`;
  text += `JUMLAH : ${report.teamSize} Orang\n`;
  if (report.jointerName) {
    text += `JOINTER : ${report.jointerName}\n`;
  }
  text += `*TOTAL PROGRES PEKERJAAN* : ${report.overallProgressPercent || calculateDprOverallProgress(report.items)}%\n`;
  text += `—————————————————\n`;
  text += `*PLAN / PROGRES / TOTAL PROGRES*\n\n`;

  // Group items by category
  const mainItems = report.items.filter((i) => i.category !== 'ACCESSORIES');
  const accItems = report.items.filter((i) => i.category === 'ACCESSORIES');

  mainItems.forEach((item) => {
    const isDone = item.totalActualQty >= item.planQty && item.planQty > 0;
    const remaining = Math.max(0, item.planQty - item.totalActualQty);
    const badge = isDone ? ' *Done* ✅' : remaining > 0 ? ' ⏳' : '';
    const unitStr = item.unit === 'Meter' ? 'm' : '';

    text += `${item.itemName} : ${item.planQty}${unitStr} / ${item.todayQty}${unitStr} / ${item.totalActualQty}${unitStr}${badge}\n`;
  });

  if (accItems.length > 0) {
    text += `\n*ACC*\n`;
    accItems.forEach((acc) => {
      text += `${acc.itemName} : ${acc.totalActualQty}\n`;
    });
  }

  text += `—————————————————\n`;
  text += `*PROGRES TODAY*\n`;
  if (report.activitiesToday && report.activitiesToday.length > 0) {
    report.activitiesToday.forEach((act) => {
      text += `- ${act}\n`;
    });
  } else {
    text += `- Tidak ada aktivitas khusus\n`;
  }

  text += `\n*PLAN TOMORROW*\n`;
  if (report.planTomorrow && report.planTomorrow.length > 0) {
    report.planTomorrow.forEach((plan) => {
      text += `- ${plan}\n`;
    });
  } else {
    text += `- Melanjutkan pekerjaan lapangan\n`;
  }

  text += `\n*ISSUE / KENDALA*\n`;
  if (report.issues && report.issues.length > 0) {
    report.issues.forEach((iss) => {
      text += `- ${iss}\n`;
    });
  } else {
    text += `-\n`;
  }

  if (report.photos && report.photos.length > 0) {
    text += `\n📸 *DOKUMENTASI FOTO*: ${report.photos.length} Foto Terlampir\n`;
  }

  return text;
}
