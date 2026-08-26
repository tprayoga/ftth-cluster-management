import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { seedDatabase } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Truncate all data tables
    await query(`
      TRUNCATE TABLE 
        spks, 
        price_catalog, 
        vendors, 
        mandors, 
        suppliers, 
        payment_requests, 
        daily_reports, 
        material_pos, 
        material_handovers, 
        approval_logs, 
        users, 
        app_settings 
      CASCADE;
    `);

    // Re-seed with clean default data
    await seedDatabase();

    return NextResponse.json({ success: true, message: 'Database reset to default initial state' });
  } catch (error: any) {
    console.error('Error in /api/reset:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Reset failed' },
      { status: 500 }
    );
  }
}
