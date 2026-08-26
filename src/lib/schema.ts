import { query } from './db';
import {
  INITIAL_SPKS,
  INITIAL_PRICE_CATALOG,
  INITIAL_VENDORS,
  INITIAL_MANDORS,
  INITIAL_SUPPLIERS,
  INITIAL_PAYMENT_REQUESTS,
  INITIAL_DAILY_REPORTS,
  INITIAL_MATERIAL_POS,
  INITIAL_MATERIAL_HANDOVERS,
  INITIAL_APPROVAL_LOGS,
  AVAILABLE_USERS,
  DEFAULT_APPROVAL_RULES,
} from './initialData';

export async function initDatabase() {
  try {
    // 1. Ensure extensions & app_settings table
    await query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS app_settings (
        key VARCHAR(50) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Ensure all data tables exist and have 'data' column
    const tables = [
      'spks',
      'price_catalog',
      'vendors',
      'mandors',
      'suppliers',
      'payment_requests',
      'daily_reports',
      'material_pos',
      'material_handovers',
      'approval_logs',
      'users',
    ];

    for (const table of tables) {
      await query(`
        CREATE TABLE IF NOT EXISTS ${table} (
          id VARCHAR(100) PRIMARY KEY,
          data JSONB,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS data JSONB;
        ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      `);
    }

    // 3. Relax legacy constraints from old schema if they exist
    await query(`
      DO $$ 
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN 
          SELECT table_name, column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
            AND table_name IN ('users', 'vendors', 'mandors', 'suppliers', 'spks', 'daily_reports', 'payment_requests', 'approval_logs', 'sites', 'site_services', 'site_materials')
            AND column_name != 'id'
            AND is_nullable = 'NO'
        LOOP
          EXECUTE format('ALTER TABLE %I ALTER COLUMN %I DROP NOT NULL', r.table_name, r.column_name);
        END LOOP;
      END $$;
    `);

    // 4. Check if seeding is required (where data IS NOT NULL)
    const spkCountResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM spks WHERE data IS NOT NULL'
    );
    const count = parseInt(spkCountResult.rows[0]?.count || '0', 10);

    if (count === 0) {
      console.log('Database empty, performing initial data seeding...');
      await seedDatabase();
    }
  } catch (error) {
    console.error('Error during initDatabase:', error);
    throw error;
  }
}

export async function seedDatabase() {
  // Settings
  await query(
    `INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
    ['approval_rules', JSON.stringify(DEFAULT_APPROVAL_RULES)]
  );

  // Users
  for (const user of AVAILABLE_USERS) {
    await query(
      `INSERT INTO users (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [user.id, JSON.stringify(user)]
    );
  }

  // Vendors
  for (const vendor of INITIAL_VENDORS) {
    await query(
      `INSERT INTO vendors (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [vendor.id, JSON.stringify(vendor)]
    );
  }

  // Mandors
  for (const mandor of INITIAL_MANDORS) {
    await query(
      `INSERT INTO mandors (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [mandor.id, JSON.stringify(mandor)]
    );
  }

  // Suppliers
  for (const supplier of INITIAL_SUPPLIERS) {
    await query(
      `INSERT INTO suppliers (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [supplier.id, JSON.stringify(supplier)]
    );
  }

  // Price Catalog
  for (const item of INITIAL_PRICE_CATALOG) {
    await query(
      `INSERT INTO price_catalog (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [item.id, JSON.stringify(item)]
    );
  }

  // SPKs
  for (const spk of INITIAL_SPKS) {
    await query(
      `INSERT INTO spks (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [spk.id, JSON.stringify(spk)]
    );
  }

  // Payment Requests
  for (const req of INITIAL_PAYMENT_REQUESTS) {
    await query(
      `INSERT INTO payment_requests (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [req.id, JSON.stringify(req)]
    );
  }

  // Daily Reports
  for (const report of INITIAL_DAILY_REPORTS) {
    await query(
      `INSERT INTO daily_reports (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [report.id, JSON.stringify(report)]
    );
  }

  // Material POs
  for (const po of INITIAL_MATERIAL_POS) {
    await query(
      `INSERT INTO material_pos (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [po.id, JSON.stringify(po)]
    );
  }

  // Material Handovers
  for (const handover of INITIAL_MATERIAL_HANDOVERS) {
    await query(
      `INSERT INTO material_handovers (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [handover.id, JSON.stringify(handover)]
    );
  }

  // Approval Logs
  for (const log of INITIAL_APPROVAL_LOGS) {
    await query(
      `INSERT INTO approval_logs (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [log.id, JSON.stringify(log)]
    );
  }

  console.log('Database seeded successfully!');
}
