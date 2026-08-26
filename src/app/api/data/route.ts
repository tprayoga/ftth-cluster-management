import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
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

export async function POST(req: Request) {
  const client = await getClient();
  try {
    await initDatabase();
    const payload = await req.json();
    const {
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
    } = payload;

    await client.query('BEGIN');

    // Helper to sync an entity list (upsert existing & remove deleted)
    const syncTableList = async (tableName: string, items?: any[]) => {
      if (!Array.isArray(items)) return;
      const validIds: string[] = [];

      for (const item of items) {
        if (!item || !item.id) continue;
        validIds.push(item.id);
        await client.query(
          `INSERT INTO ${tableName} (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
          [item.id, JSON.stringify(item)]
        );
      }

      if (validIds.length > 0) {
        await client.query(
          `DELETE FROM ${tableName} WHERE id NOT IN (${validIds.map((_, i) => `$${i + 1}`).join(',')})`,
          validIds
        );
      } else {
        await client.query(`DELETE FROM ${tableName}`);
      }
    };

    if (spks !== undefined) await syncTableList('spks', spks);
    if (priceCatalog !== undefined) await syncTableList('price_catalog', priceCatalog);
    if (vendors !== undefined) await syncTableList('vendors', vendors);
    if (mandors !== undefined) await syncTableList('mandors', mandors);
    if (suppliers !== undefined) await syncTableList('suppliers', suppliers);
    if (paymentRequests !== undefined) await syncTableList('payment_requests', paymentRequests);
    if (dailyReports !== undefined) await syncTableList('daily_reports', dailyReports);
    if (materialPurchaseOrders !== undefined) await syncTableList('material_pos', materialPurchaseOrders);
    if (materialHandovers !== undefined) await syncTableList('material_handovers', materialHandovers);
    if (approvalLogs !== undefined) await syncTableList('approval_logs', approvalLogs);
    if (users !== undefined) await syncTableList('users', users);

    if (approvalRules !== undefined) {
      await client.query(
        `INSERT INTO app_settings (key, value, updated_at) VALUES ('approval_rules', $1, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(approvalRules)]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true, message: 'Database synced successfully' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error saving database bundle in POST /api/data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to save data to database',
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
