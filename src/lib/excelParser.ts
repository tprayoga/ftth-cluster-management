import * as XLSX from 'xlsx';
import { SPK, Site, ServiceItem, MaterialItem, PriceCatalogItem, CalculatedSPK } from '@/types';

/**
 * Parses an FTTH Cluster Excel workbook (.xlsx) into an SPK data structure
 */
export function parseFTTHExcel(fileBuffer: ArrayBuffer, fileName: string): { spk: SPK; priceCatalog: PriceCatalogItem[] } {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  let clusterName = fileName.replace(/\.[^/.]+$/, '').replace(/^FTTH\s*/i, '');
  if (!clusterName) clusterName = 'NEW CLUSTER';

  const priceCatalog: PriceCatalogItem[] = [];
  const sitesMap = new Map<string, {
    name: string;
    poAmount: number;
    services: ServiceItem[];
    materials: MaterialItem[];
  }>();

  let partnerName = 'ADW';
  let spkNumber = `SPK/${Date.now().toString().slice(-6)}/INDOTEK/FTTH/${new Date().getFullYear()}`;
  const notes: string[] = [];

  // 1. Parse ESTIMASI HARGA MATERIAL sheet if present
  const estSheetName = sheetNames.find((s) => s.toUpperCase().includes('ESTIMASI') || s.toUpperCase().includes('HARGA'));
  if (estSheetName) {
    const ws = workbook.Sheets[estSheetName];
    const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
    data.forEach((row, idx) => {
      if (row && row[0]) {
        const matName = String(row[0]).trim();
        const estQty = Number(row[1]) || 0;
        const refPrice = Number(row[2]) || 0;
        if (matName && !matName.toLowerCase().includes('material') && refPrice > 0) {
          priceCatalog.push({
            id: `cat-${idx + 1}`,
            name: matName,
            estimatedQty: estQty,
            referencePrice: refPrice,
          });
        }
      }
    });
  }

  // 2. Parse SUMMARY sheet
  const summarySheetName = sheetNames.find((s) => s.toUpperCase() === 'SUMMARY');
  if (summarySheetName) {
    const ws = workbook.Sheets[summarySheetName];
    const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

    data.forEach((row) => {
      if (!row || row.length === 0) return;
      const colB = String(row[1] || '').trim();
      const colC = String(row[2] || '').trim();
      const colD = String(row[3] || '').trim();
      const colE = Number(row[4]);

      // Partner and SPK number
      if (colB && colB.length <= 10 && !colB.toLowerCase().includes('partner') && !colB.toLowerCase().includes('jumlah')) {
        partnerName = colB;
      }
      if (colC && colC.toLowerCase().includes('spk')) {
        spkNumber = colC;
      }

      // Site row with PO amount
      if (colD && colD.length > 5 && !colD.toLowerCase().includes('site name') && !colD.toLowerCase().includes('status') && colE > 0) {
        sitesMap.set(colD, {
          name: colD,
          poAmount: colE,
          services: [],
          materials: [],
        });
      }

      // Notes
      if (colC && (colC.startsWith('1.') || colC.startsWith('2.') || colC.startsWith('3.') || colC.startsWith('4.'))) {
        notes.push(colC);
      }
      if (colB && colB.toLowerCase().includes('note') && colC && !notes.includes(colC)) {
        notes.push(colC);
      }
    });
  }

  // 3. Parse JASA sheet
  const jasaSheetName = sheetNames.find((s) => s.toUpperCase() === 'JASA' || s.toUpperCase().includes('JASA'));
  if (jasaSheetName) {
    const ws = workbook.Sheets[jasaSheetName];
    const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

    let currentSiteName = '';
    data.forEach((row, rowIdx) => {
      if (!row || row.length === 0) return;
      const colB = String(row[1] || '').trim();
      const colD = String(row[3] || '').trim();
      const colE = Number(row[4]); // Qty
      const colF = String(row[5] || '').trim(); // UOM
      const colG = Number(row[6]); // Unit Price
      const colI = String(row[8] || '').trim(); // Remark
      const colK = Number(row[10]); // Actual progress

      if (colB && colB.length > 5 && !colB.toLowerCase().includes('site name') && !colB.toLowerCase().includes('total')) {
        currentSiteName = colB;
        if (!sitesMap.has(currentSiteName)) {
          sitesMap.set(currentSiteName, {
            name: currentSiteName,
            poAmount: 0,
            services: [],
            materials: [],
          });
        }
      }

      if (colD && colD.length > 2 && !colD.toLowerCase().includes('item') && currentSiteName) {
        const isNegosiasi = colD.toLowerCase().includes('negosiasi') || colF.toLowerCase() === 'lot';
        const siteData = sitesMap.get(currentSiteName);
        if (siteData) {
          siteData.services.push({
            id: `j-import-${rowIdx}`,
            siteId: '',
            name: colD,
            qty: colE || 1,
            uom: colF || (isNegosiasi ? 'Lot' : 'Set'),
            unitPrice: colG || 0,
            remark: colI || '',
            actualProgress: isNaN(colK) ? 0 : colK,
            isNegosiasi,
          });
        }
      }
    });
  }

  // 4. Parse MATERIAL sheet
  const matSheetName = sheetNames.find((s) => s.toUpperCase() === 'MATERIAL' || s.toUpperCase().includes('MATERIAL'));
  if (matSheetName) {
    const ws = workbook.Sheets[matSheetName];
    const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

    let currentSiteName = '';
    data.forEach((row, rowIdx) => {
      if (!row || row.length === 0) return;
      const colB = String(row[1] || '').trim();
      const colD = String(row[3] || '').trim();
      const colE = Number(row[4]); // Qty
      const colF = Number(row[5]); // Unit Price

      if (colB && colB.length > 5 && !colB.toLowerCase().includes('site name') && !colB.toLowerCase().includes('total')) {
        currentSiteName = colB;
        if (!sitesMap.has(currentSiteName)) {
          sitesMap.set(currentSiteName, {
            name: currentSiteName,
            poAmount: 0,
            services: [],
            materials: [],
          });
        }
      }

      if (colD && colD.length > 2 && !colD.toLowerCase().includes('material') && currentSiteName) {
        const siteData = sitesMap.get(currentSiteName);
        if (siteData) {
          siteData.materials.push({
            id: `m-import-${rowIdx}`,
            siteId: '',
            name: colD,
            qty: colE || 1,
            unitPrice: colF || 0,
          });
        }
      }
    });
  }

  // Build final sites array
  const sites: Site[] = [];
  let siteIdx = 1;
  sitesMap.forEach((val) => {
    const sId = `site-${siteIdx}`;
    sites.push({
      id: sId,
      spkId: '',
      name: val.name,
      sowType: val.name.toLowerCase().includes('subfeeder') ? 'Subfeeder' : val.name.toLowerCase().includes('feeder') ? 'Feeder' : 'Distribusi',
      poAmount: val.poAmount,
      services: val.services.map((s, i) => ({ ...s, id: `${sId}-svc-${i + 1}`, siteId: sId })),
      materials: val.materials.map((m, i) => ({ ...m, id: `${sId}-mat-${i + 1}`, siteId: sId })),
      permitItems: [],
      paymentTerms: [
        { id: `${sId}-t1`, siteId: sId, termNumber: 1, percentage: 30, amount: 0, isPaid: false, note: 'Termin 1 (DP)' },
        { id: `${sId}-t2`, siteId: sId, termNumber: 2, percentage: 40, amount: 0, isPaid: false, note: 'Termin 2 (Progress)' },
        { id: `${sId}-t3`, siteId: sId, termNumber: 3, percentage: 30, amount: 0, isPaid: false, note: 'Termin 3 (Pelunasan)' },
      ],
      mandorId: 'm1',
      mandorName: 'Mandor ADW Mandiri (Pak Fatrah)',
    });
    siteIdx++;
  });

  const spkId = `spk-${Date.now()}`;
  sites.forEach((s) => { s.spkId = spkId; });

  const spk: SPK = {
    id: spkId,
    vendorId: 'v1',
    clusterName: clusterName.toUpperCase(),
    vendorName: partnerName || 'Telkom Akses',
    region: 'Jawa Tengah',
    spkNumber,
    scopeType: 'IMPLEMENTATION_ONLY',
    workflowStage: 'DRAFT_ESTIMASI',
    status: 'Draft',
    sites,
    notes,
    revisionLogs: [
      {
        id: `rev-1`,
        version: 'v1.0',
        author: 'Cost Estimator',
        date: new Date().toISOString().split('T')[0],
        status: 'Imported from Excel',
        note: `Imported from ${fileName}`,
      },
    ],
    signOffs: [
      { role: 'Estimator', name: 'Budhimansyah', date: new Date().toISOString().split('T')[0], status: 'Approved', note: 'BOQ Imported from Excel' },
    ],
    createdAt: new Date().toISOString().split('T')[0],
  };

  return { spk, priceCatalog };
}

/**
 * Parses a standalone JASA Excel file into ServiceItem array
 */
export function parseJasaItemsExcel(fileBuffer: ArrayBuffer): { siteName?: string; items: Omit<ServiceItem, 'id' | 'siteId'>[] } {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const ws = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

  let siteName: string | undefined = undefined;
  const items: Omit<ServiceItem, 'id' | 'siteId'>[] = [];

  data.forEach((row) => {
    if (!row || row.length === 0) return;
    
    const colA = String(row[0] || '').trim();
    const colB = String(row[1] || '').trim();
    const colC = String(row[2] || '').trim();
    const colD = row[3];
    const colE = String(row[4] || '').trim();
    const colF = row[5];
    const colG = String(row[6] || '').trim();

    if (colA.toLowerCase().includes('site') && colB) {
      siteName = colB;
    }

    let name = '';
    let qty = 1;
    let uom = 'Meter';
    let unitPrice = 0;
    let remark = '';

    if (colB && !colB.toLowerCase().includes('item') && !colB.toLowerCase().includes('deskripsi') && !colB.toLowerCase().includes('site')) {
      name = colB;
      qty = Number(colC) || Number(colD) || 1;
      uom = colD && isNaN(Number(colD)) ? String(colD).trim() : colE || 'Set';
      unitPrice = Number(colF) || Number(colE) || Number(colD) || 0;
      remark = colG || '';
    } else if (colC && !colC.toLowerCase().includes('item') && !colC.toLowerCase().includes('deskripsi')) {
      name = colC;
      qty = Number(colD) || 1;
      uom = colE || 'Set';
      unitPrice = Number(colF) || 0;
      remark = colG || '';
    }

    if (name && name.length >= 3 && !name.toLowerCase().includes('total')) {
      const isNegosiasi = name.toLowerCase().includes('negosiasi') || uom.toLowerCase() === 'lot';
      items.push({
        name,
        qty: qty || 1,
        uom: uom || (isNegosiasi ? 'Lot' : 'Set'),
        unitPrice: unitPrice || 0,
        remark,
        actualProgress: 0,
        isNegosiasi,
      });
    }
  });

  return { siteName, items };
}

/**
 * Parses a standalone MATERIAL Excel file into MaterialItem array
 */
export function parseMaterialItemsExcel(fileBuffer: ArrayBuffer): { siteName?: string; items: Omit<MaterialItem, 'id' | 'siteId'>[] } {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const ws = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

  let siteName: string | undefined = undefined;
  const items: Omit<MaterialItem, 'id' | 'siteId'>[] = [];

  data.forEach((row) => {
    if (!row || row.length === 0) return;

    const colA = String(row[0] || '').trim();
    const colB = String(row[1] || '').trim();
    const colC = String(row[2] || '').trim();
    const colD = row[3];
    const colE = row[4];
    const colF = row[5];

    if (colA.toLowerCase().includes('site') && colB) {
      siteName = colB;
    }

    let name = '';
    let qty = 1;
    let unitPrice = 0;

    if (colB && !colB.toLowerCase().includes('material') && !colB.toLowerCase().includes('item') && !colB.toLowerCase().includes('site')) {
      name = colB;
      qty = Number(colC) || Number(colD) || 1;
      unitPrice = Number(colE) || Number(colD) || Number(colF) || 0;
    } else if (colC && !colC.toLowerCase().includes('material') && !colC.toLowerCase().includes('item')) {
      name = colC;
      qty = Number(colD) || 1;
      unitPrice = Number(colE) || 0;
    }

    if (name && name.length >= 3 && !name.toLowerCase().includes('total')) {
      items.push({
        name,
        qty: qty || 1,
        unitPrice: unitPrice || 0,
      });
    }
  });

  return { siteName, items };
}

/**
 * Generates standalone Template Excel for JASA MANDOR (.xlsx)
 */
export function generateJasaTemplate(): ArrayBuffer {
  const wb = XLSX.utils.book_new();

  const jasaRows: any[][] = [
    ['TEMPLATE SOW & TARIF JASA MANDOR BORONGAN FTTH'],
    ['PT INDOTEK BUANA KARYA - DEPARTEMEN ESTIMASI & OPERASIONAL'],
    [],
    ['Site / Rute Target:', 'PULLING DISTRIBUSI CLUSTER FTTH'],
    ['Mandor Lapangan:', 'Mandor Borongan Terpilih'],
    [],
    ['No', 'Deskripsi Item Pekerjaan Jasa', 'Qty / Volume', 'Satuan (UOM)', 'Tarif Acuan Mandor (Rp)', 'Total Biaya Jasa (Rp)', 'Remark / Catatan Lapangan'],
    [1, 'Digging Hole / Gali Lubang Tiang 7m', 50, 'Titik', 35000, 1750000, 'Kedalaman 100-120cm tanah standar'],
    [2, 'Erection / Tanam Tiang Besi 7m 3 Inch', 30, 'Set', 120000, 3600000, 'Termasuk cor semen & aksesoris'],
    [3, 'Erection / Tanam Tiang Besi 7m 2.5 Inch', 20, 'Set', 100000, 2000000, 'Tiang distribusi span pendek'],
    [4, 'Penarikan Kabel Udara ADSS / Fig-8 24 Core', 2500, 'Meter', 2500, 6250000, 'Span tiang ke tiang, incl. tensioning'],
    [5, 'Pemasangan FAT Aerial 1:8 / 1:16', 16, 'Unit', 150000, 2400000, 'FAT Aerial pada tiang distribusi'],
    [6, 'Pemasangan FDT Outdoor 48 / 96 Core', 1, 'Unit', 977500, 977500, 'FDT Pole Mounting incl. grounding'],
    [7, 'Splicing & Core Management per Core', 48, 'Core', 25000, 1200000, 'Splicing FO mesin fusi + tray'],
    [8, 'OTDR Testing, Power Meter & Document QC', 1, 'Lot', 500000, 500000, 'Laporan kurva OTDR & foto BAST'],
    [],
    ['', 'PETUNJUK PENGISIAN:'],
    ['', '1. Kolom "Deskripsi Item Pekerjaan Jasa", "Qty", "Satuan", dan "Tarif Acuan Mandor" wajib diisi.'],
    ['', '2. Gunakan satuan: Meter, Titik, Set, Unit, Core, atau Lot.'],
    ['', '3. File ini dapat langsung diimport ke tab Sheet Jasa Mandor pada aplikasi.'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(jasaRows);
  XLSX.utils.book_append_sheet(wb, ws, 'JASA_MANDOR');

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

/**
 * Generates standalone Template Excel for MATERIAL AKSESORIS (.xlsx)
 */
export function generateMaterialTemplate(): ArrayBuffer {
  const wb = XLSX.utils.book_new();

  const matRows: any[][] = [
    ['TEMPLATE DAFTAR KEBUTUHAN MATERIAL AKSESORIS FTTH'],
    ['PT INDOTEK BUANA KARYA - DEPARTEMEN PROCUREMENT & LOGISTIK'],
    [],
    ['Site / Alokasi:', 'DISTRIBUSI CLUSTER FTTH'],
    [],
    ['No', 'Nama Material Aksesoris', 'Qty / Kebutuhan', 'Satuan (UOM)', 'Estimasi Harga Satuan (Rp)', 'Total Estimasi (Rp)', 'Rekomendasi Toko / Catatan'],
    [1, 'Dead End Fitting 24 Core (Wedge Clamp)', 48, 'Pcs', 18500, 888000, 'Toko Mitra Mandiri FO'],
    [2, 'Suspension Clamp FO ADSS', 15, 'Pcs', 15000, 225000, 'Toko Mitra Mandiri FO'],
    [3, 'Pole Clamp 3 Inch + Baut Mur', 30, 'Set', 24000, 720000, 'Pabrikasi Tiang'],
    [4, 'Pole Clamp 2.5 Inch + Baut Mur', 20, 'Set', 22000, 440000, 'Pabrikasi Tiang'],
    [5, 'Stainless Steel Plat Belt (Bandit) 20mm', 4, 'Roll', 285000, 1140000, 'Roll 30 meter'],
    [6, 'Stopping Buckle Stainless (Pcs)', 150, 'Pcs', 2500, 375000, 'Kemasan pack'],
    [7, 'Slack Hanger FO (Gantungan Kabel)', 12, 'Pcs', 45000, 540000, 'Galvanized outdoor'],
    [8, 'Sling Wire Galvanized 3mm', 400, 'Meter', 5450, 2180000, 'Tembakan antar tiang panjang'],
    [9, 'Guy Grip / Preformed Dead End 3mm', 30, 'Pcs', 8500, 255000, 'Outdoor heavy duty'],
    [10, 'Protection Sleeve Core 60mm', 100, 'Pcs', 650, 65000, 'Pelindung splicing fusion'],
    [],
    ['', 'PETUNJUK PENGISIAN:'],
    ['', '1. Kolom "Nama Material Aksesoris", "Qty", dan "Estimasi Harga Satuan" wajib diisi.'],
    ['', '2. File ini dapat langsung diimport ke tab Sheet Material pada aplikasi untuk membuat PO Belanja.'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(matRows);
  XLSX.utils.book_append_sheet(wb, ws, 'MATERIAL_AKSESORIS');

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

/**
 * Generates a full 4-sheet FTTH Cluster Excel Template (.xlsx)
 */
export function generateExcelTemplate(): ArrayBuffer {
  const wb = XLSX.utils.book_new();

  // 1. SUMMARY SHEET
  const summaryRows: any[][] = [
    ['', 'FTTH ROLLOUT CLUSTER - TEMPLATE BOQ & ESTIMASI INDOTEK BUANA KARYA'],
    ['', 'Silakan isi data Site, Nilai PO Vendor, dan Target Alokasi pada template ini.'],
    [],
    ['', 'PARTNER', 'NO. SPK', 'SITE NAME', 'NILAI PO', 'TOTAL JASA', 'TOTAL MAT', 'GROSS MARGIN (RP)', 'MARGIN %'],
    ['', 'ADW', 'SPK/2026/08/TEMPLATE-001', 'Kelurahan Sukaperna Majalengka', 45000000, 24500000, 6800000, 13700000, '30.44%'],
    ['', 'ADW', 'SPK/2026/08/TEMPLATE-001', 'Kelurahan Gunung Tawang Wonosobo', 38000000, 20100000, 5200000, 12700000, '33.42%'],
    [],
    ['', 'Catatan / Notes:'],
    ['', '', '1. Pastikan nama Site di sheet SUMMARY sama persis dengan nama Site di sheet JASA dan MATERIAL.'],
    ['', '', '2. Kolom Qty dan Harga Satuan di sheet JASA & MATERIAL akan dihitung otomatis menjadi total biaya.'],
    ['', '', '3. Template ini mendukung 3 vendor utama: Telkom Akses, FiberStar, dan MyRepublic.'],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'SUMMARY');

  // 2. JASA SHEET
  const jasaRows: any[][] = [
    ['', 'RINCIAN SOW JASA MANDOR PER SITE'],
    [],
    ['', 'Site Name', '', 'Item', 'Qty', 'UOM', 'Harga Mitra', 'Total Mitra', 'Remark Mitra', '', 'Actual Progres', 'Persentase Progress', 'Keterangan'],
    ['', 'Kelurahan Sukaperna Majalengka'],
    ['', '', '', 'Digging Hole / Gali Lubang Tiang', 73, 'Titik', 35000, 2555000, 'Gali tanah lunak/keras', '', 24, '32.88%', ''],
    ['', '', '', 'Tanam Tiang Besi 7m 3 inch', 44, 'Set', 120000, 5280000, 'Termasuk cor semen & aksesoris', '', 17, '38.64%', ''],
    ['', '', '', 'Tanam Tiang Besi 7m 2.5 inch', 28, 'Set', 100000, 2800000, 'Tiang distribusi', '', 3, '10.71%', ''],
    ['', '', '', 'Penarikan Kabel ADSS 24 Core', 3655, 'Meter', 2500, 9137500, 'Span tiang ke tiang', '', 0, '0.00%', ''],
    ['', '', '', 'Pemasangan FAT 1:8 / 1:16', 25, 'Unit', 150000, 3750000, 'FAT Aerial', '', 0, '0.00%', ''],
    ['', '', '', 'Pemasangan FDT 48/96 Core', 1, 'Unit', 977500, 977500, 'FDT Pole Mounting', '', 0, '0.00%', ''],
    ['', 'Total Harga Jasa Kelurahan Sukaperna Majalengka', '', '', '', '', '', 24500000],
    [],
    ['', 'Kelurahan Gunung Tawang Wonosobo'],
    ['', '', '', 'Digging Hole / Gali Lubang Tiang', 34, 'Titik', 35000, 1190000, 'Gali tanah perbukitan', '', 0, '0.00%', ''],
    ['', '', '', 'Tanam Tiang Besi 7m 3 inch', 34, 'Set', 120000, 4080000, 'Tiang feeder & distribusi', '', 0, '0.00%', ''],
    ['', '', '', 'Penarikan Kabel FO 24c Line A', 1019, 'Meter', 2500, 2547500, 'Feeder line', '', 0, '0.00%', ''],
    ['', '', '', 'Penarikan Kabel FO 24c Line B', 819, 'Meter', 2500, 2047500, 'Branch line', '', 0, '0.00%', ''],
    ['', '', '', 'Pemasangan FAT Aerial', 15, 'Unit', 150000, 2250000, 'FAT 1:8', '', 0, '0.00%', ''],
    ['', '', '', 'Pemasangan FDT 48 Core', 1, 'Unit', 7985000, 7985000, 'FDT Outdoor', '', 0, '0.00%', ''],
    ['', 'Total Harga Jasa Kelurahan Gunung Tawang Wonosobo', '', '', '', '', '', 20100000],
  ];
  const wsJasa = XLSX.utils.aoa_to_sheet(jasaRows);
  XLSX.utils.book_append_sheet(wb, wsJasa, 'JASA');

  // 3. MATERIAL SHEET
  const matRows: any[][] = [
    ['', 'RINCIAN KEBUTUHAN MATERIAL AKSESORIS PER SITE'],
    [],
    ['', 'Site Name', '', 'Material', 'Qty', 'Harga Satuan', 'Total'],
    ['', 'Kelurahan Sukaperna Majalengka'],
    ['', '', '', 'Dead End Fitting 24C', 48, 18500, 888000],
    ['', '', '', 'Suspension Clamp FO', 10, 15000, 150000],
    ['', '', '', 'Pole Clamp 3 inch + Baut', 37, 24000, 888000],
    ['', '', '', 'Stainless Steel Plat Belt (Roll)', 5, 285000, 1425000],
    ['', '', '', 'Slack Hanger FO', 16, 45000, 720000],
    ['', '', '', 'Sling Wire Galvanized (Meter)', 500, 5458, 2729000],
    ['', 'Total Harga Material Kelurahan Sukaperna Majalengka', '', '', '', '', 6800000],
    [],
    ['', 'Kelurahan Gunung Tawang Wonosobo'],
    ['', '', '', 'Dead End Fitting 24C', 32, 18500, 592000],
    ['', '', '', 'Suspension Clamp FO', 8, 15000, 120000],
    ['', '', '', 'Pole Clamp 3 inch + Baut', 28, 24000, 672000],
    ['', '', '', 'Stainless Steel Plat Belt (Roll)', 4, 285000, 1140000],
    ['', '', '', 'Slack Hanger FO', 12, 45000, 540000],
    ['', '', '', 'Sling Wire Galvanized (Meter)', 392, 5450, 2136000],
    ['', 'Total Harga Material Kelurahan Gunung Tawang Wonosobo', '', '', '', '', 5200000],
  ];
  const wsMat = XLSX.utils.aoa_to_sheet(matRows);
  XLSX.utils.book_append_sheet(wb, wsMat, 'MATERIAL');

  // 4. ESTIMASI HARGA MATERIAL SHEET
  const estRows: any[][] = [
    ['Material', 'Est. Qty', 'Harga Referensi Satuan'],
    ['Dead End Fitting 24C', 100, 18500],
    ['Suspension Clamp FO', 50, 15000],
    ['Pole Clamp 3 inch + Baut', 100, 24000],
    ['Stainless Steel Plat Belt (Roll)', 10, 285000],
    ['Stopping Buckle Stainless (Pcs)', 200, 2500],
    ['Slack Hanger FO', 30, 45000],
    ['Sling Wire Galvanized (Meter)', 1000, 5450],
    ['Guy Grip / Bulldog Grip', 80, 8500],
    ['Protection Sleeve Core 60mm', 500, 650],
  ];
  const wsEst = XLSX.utils.aoa_to_sheet(estRows);
  XLSX.utils.book_append_sheet(wb, wsEst, 'ESTIMASI HARGA MATERIAL');

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

/**
 * Exports calculated SPK to Excel Workbook buffer
 */
export function exportSPKToExcel(calcSpk: CalculatedSPK): any {
  const wb = XLSX.utils.book_new();

  // 1. SUMMARY SHEET
  const summaryRows: any[][] = [
    ['', 'SUMMARY ESTIMASI BIAYA & MARGIN CLUSTER FTTH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', 'Vendor Utama', 'Nomor SPK', 'Site Name', 'Nilai PO Vendor', 'Eksternal', '', '', '', '', '', 'Progress', 'Payment Mandor', '', '', '', 'Margin', ''],
    ['', '', '', '', '', 'Jasa Mandor', '% Jasa', 'Material', '% Material', 'Jumlah', '% Eksternal', '', 'Term 1 (30%)', 'Term 2', 'Term 3', 'Pending Payment', 'Margin (Rp)', 'Margin (%)'],
  ];

  calcSpk.sites.forEach((site) => {
    summaryRows.push([
      '',
      calcSpk.vendorName,
      calcSpk.spkNumber,
      site.name,
      site.poAmount,
      site.totalJasa,
      `${site.jasaRatio.toFixed(2)}%`,
      site.totalMaterial,
      `${site.materialRatio.toFixed(2)}%`,
      site.totalEksternal,
      `${site.costRatio.toFixed(2)}%`,
      `${site.progressPercent.toFixed(2)}%`,
      site.term1Amount,
      site.term2Amount,
      site.term3Amount,
      site.pendingPayment,
      site.marginRp,
      `${site.marginPercent.toFixed(2)}%`,
    ]);
  });

  // Total summary row
  const spkJasaRatio = calcSpk.totalPO > 0 ? (calcSpk.totalJasa / calcSpk.totalPO) * 100 : 0;
  const spkMatRatio = calcSpk.totalPO > 0 ? (calcSpk.totalMaterial / calcSpk.totalPO) * 100 : 0;

  summaryRows.push([
    '',
    `Jumlah ${calcSpk.sites.length} Site`,
    '',
    '',
    calcSpk.totalPO,
    calcSpk.totalJasa,
    `${spkJasaRatio.toFixed(2)}%`,
    calcSpk.totalMaterial,
    `${spkMatRatio.toFixed(2)}%`,
    calcSpk.totalEksternal,
    `${calcSpk.costRatio.toFixed(2)}%`,
    `${calcSpk.avgProgress.toFixed(2)}%`,
    calcSpk.totalPaid,
    0,
    0,
    calcSpk.pendingPayment,
    calcSpk.marginRp,
    `${calcSpk.marginPercent.toFixed(2)}%`,
  ]);

  // Add notes & logs
  summaryRows.push([]);
  summaryRows.push(['', 'Catatan / Notes:']);
  calcSpk.notes.forEach((n) => summaryRows.push(['', '', n]));

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'SUMMARY');

  // 2. JASA SHEET
  const jasaRows: any[][] = [];
  calcSpk.sites.forEach((site) => {
    jasaRows.push(['', 'Site Name', '', 'Item', 'Qty', 'UOM', 'Harga Mitra', 'Total Mitra', 'Remark Mitra', '', 'Actual Progres', 'Persentase Progress', 'Keterangan']);
    jasaRows.push(['', site.name]);
    site.services.forEach((srv) => {
      jasaRows.push([
        '',
        '',
        '',
        srv.name,
        srv.qty,
        srv.uom,
        srv.unitPrice,
        srv.total,
        srv.remark || '',
        '',
        srv.actualProgress,
        `${srv.progressPercent.toFixed(2)}%`,
        srv.isAddWork ? 'Add Work' : '',
      ]);
    });
    jasaRows.push(['', `Total Harga Jasa ${site.name}`, '', '', '', '', '', site.totalJasa, '', 'Rata-rata Progress', '', `${site.progressPercent.toFixed(2)}%`]);
    jasaRows.push([]);
  });
  const wsJasa = XLSX.utils.aoa_to_sheet(jasaRows);
  XLSX.utils.book_append_sheet(wb, wsJasa, 'JASA');

  // 3. MATERIAL SHEET
  const matRows: any[][] = [];
  calcSpk.sites.forEach((site) => {
    matRows.push(['', 'Site Name', '', 'Material', 'Qty', 'Harga Satuan', 'Total']);
    matRows.push(['', site.name]);
    site.materials.forEach((mat) => {
      matRows.push(['', '', '', mat.name, mat.qty, mat.unitPrice, mat.total]);
    });
    matRows.push(['', `Total Harga Material ${site.name}`, '', '', '', '', site.totalMaterial]);
    matRows.push([]);
  });
  const wsMat = XLSX.utils.aoa_to_sheet(matRows);
  XLSX.utils.book_append_sheet(wb, wsMat, 'MATERIAL');

  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return out;
}
