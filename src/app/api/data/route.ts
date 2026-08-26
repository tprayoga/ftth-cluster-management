import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { initDatabase } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDatabase();

    const [
      spksRes,
      catalogRes,
      vendorsRes,
      mandorsRes,
      suppliersRes,
      requestsRes,
      dprRes,
      posRes,
      handoversRes,
      logsRes,
      usersRes,
      settingsRes,
    ] = await Promise.all([
      query('SELECT data FROM spks WHERE data IS NOT NULL ORDER BY updated_at DESC'),
      query('SELECT data FROM price_catalog WHERE data IS NOT NULL ORDER BY updated_at DESC'),
      query('SELECT data FROM vendors WHERE data IS NOT NULL ORDER BY updated_at DESC'),
      query('SELECT data FROM mandors WHERE data IS NOT NULL ORDER BY updated_at DESC'),
      query('SELECT data FROM suppliers WHERE data IS NOT NULL ORDER BY updated_at DESC'),
      query('SELECT data FROM payment_requests WHERE data IS NOT NULL ORDER BY updated_at DESC'),
      query('SELECT data FROM daily_reports WHERE data IS NOT NULL ORDER BY updated_at DESC'),
      query('SELECT data FROM material_pos WHERE data IS NOT NULL ORDER BY updated_at DESC'),
      query('SELECT data FROM material_handovers WHERE data IS NOT NULL ORDER BY updated_at DESC'),
      query('SELECT data FROM approval_logs WHERE data IS NOT NULL ORDER BY updated_at DESC'),
      query('SELECT data FROM users WHERE data IS NOT NULL ORDER BY updated_at DESC'),
      query("SELECT value FROM app_settings WHERE key = 'approval_rules'"),
    ]);

    const spks = spksRes.rows.map((r) => r.data).filter(Boolean);
    const priceCatalog = catalogRes.rows.map((r) => r.data).filter(Boolean);
    const vendors = vendorsRes.rows.map((r) => r.data).filter(Boolean);
    const mandors = mandorsRes.rows.map((r) => r.data).filter(Boolean);
    const suppliers = suppliersRes.rows.map((r) => r.data).filter(Boolean);
    const paymentRequests = requestsRes.rows.map((r) => r.data).filter(Boolean);
    const dailyReports = dprRes.rows.map((r) => r.data).filter(Boolean);
    const materialPurchaseOrders = posRes.rows.map((r) => r.data).filter(Boolean);
    const materialHandovers = handoversRes.rows.map((r) => r.data).filter(Boolean);
    const approvalLogs = logsRes.rows.map((r) => r.data).filter(Boolean);
    const users = usersRes.rows.map((r) => r.data).filter(Boolean);
    const approvalRules = settingsRes.rows[0]?.value || null;

    return NextResponse.json({
      success: true,
      data: {
        spks,
        priceCatalog,
        vendors,
        mandors,
        suppliers,
        paymentRequests,
        dailyReports,
        materialPurchaseOrders,
        materialHandovers,
        approvalLogs,
        users,
        approvalRules,
      },
    });
  } catch (error: any) {
    console.error('Error fetching database bundle in /api/data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch data from database',
      },
      { status: 500 }
    );
  }
}
