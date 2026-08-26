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
      query('SELECT data FROM spks ORDER BY updated_at DESC'),
      query('SELECT data FROM price_catalog ORDER BY updated_at DESC'),
      query('SELECT data FROM vendors ORDER BY updated_at DESC'),
      query('SELECT data FROM mandors ORDER BY updated_at DESC'),
      query('SELECT data FROM suppliers ORDER BY updated_at DESC'),
      query('SELECT data FROM payment_requests ORDER BY updated_at DESC'),
      query('SELECT data FROM daily_reports ORDER BY updated_at DESC'),
      query('SELECT data FROM material_pos ORDER BY updated_at DESC'),
      query('SELECT data FROM material_handovers ORDER BY updated_at DESC'),
      query('SELECT data FROM approval_logs ORDER BY updated_at DESC'),
      query('SELECT data FROM users ORDER BY updated_at DESC'),
      query("SELECT value FROM app_settings WHERE key = 'approval_rules'"),
    ]);

    const spks = spksRes.rows.map((r) => r.data);
    const priceCatalog = catalogRes.rows.map((r) => r.data);
    const vendors = vendorsRes.rows.map((r) => r.data);
    const mandors = mandorsRes.rows.map((r) => r.data);
    const suppliers = suppliersRes.rows.map((r) => r.data);
    const paymentRequests = requestsRes.rows.map((r) => r.data);
    const dailyReports = dprRes.rows.map((r) => r.data);
    const materialPurchaseOrders = posRes.rows.map((r) => r.data);
    const materialHandovers = handoversRes.rows.map((r) => r.data);
    const approvalLogs = logsRes.rows.map((r) => r.data);
    const users = usersRes.rows.map((r) => r.data);
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
