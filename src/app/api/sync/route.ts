import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { initDatabase } from '@/lib/schema';

export const dynamic = 'force-dynamic';

const TABLE_MAP: Record<string, string> = {
  spk: 'spks',
  vendor: 'vendors',
  mandor: 'mandors',
  supplier: 'suppliers',
  priceCatalogItem: 'price_catalog',
  paymentRequest: 'payment_requests',
  dailyReport: 'daily_reports',
  materialPO: 'material_pos',
  materialHandover: 'material_handovers',
  approvalLog: 'approval_logs',
  user: 'users',
};

export async function POST(req: Request) {
  try {
    await initDatabase();
    const body = await req.json();
    const { action, entity, id, data } = body;

    // Handle special entity: approvalRules
    if (entity === 'approvalRules') {
      await query(
        `INSERT INTO app_settings (key, value, updated_at) VALUES ('approval_rules', $1, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(data)]
      );
      return NextResponse.json({ success: true });
    }

    const tableName = TABLE_MAP[entity];
    if (!tableName) {
      return NextResponse.json(
        { success: false, error: `Invalid entity type: ${entity}` },
        { status: 400 }
      );
    }

    if (action === 'delete') {
      if (!id) {
        return NextResponse.json(
          { success: false, error: 'ID is required for delete' },
          { status: 400 }
        );
      }
      await query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
      return NextResponse.json({ success: true });
    }

    // Default action: upsert
    if (!id || !data) {
      return NextResponse.json(
        { success: false, error: 'ID and data are required for upsert' },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO ${tableName} (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [id, JSON.stringify(data)]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/sync:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
