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
  // 1. Create Tables
  await query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key VARCHAR(50) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vendors (
      id VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mandors (
      id VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS price_catalog (
      id VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS spks (
      id VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_requests (
      id VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_reports (
      id VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS material_pos (
      id VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS material_handovers (
      id VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS approval_logs (
      id VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Check if seeding is required (e.g. spks is empty)
  const spkCountResult = await query<{ count: string }>('SELECT COUNT(*) as count FROM spks');
  const count = parseInt(spkCountResult.rows[0]?.count || '0', 10);

  if (count === 0) {
    console.log('Database empty, performing initial data seeding...');
    await seedDatabase();
  }
}

export async function seedDatabase() {
  // Settings
  await query(
    `INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2`,
    ['approval_rules', JSON.stringify(DEFAULT_APPROVAL_RULES)]
  );

  // Users
  for (const user of AVAILABLE_USERS) {
    await query(
      `INSERT INTO users (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
      [user.id, JSON.stringify(user)]
    );
  }

  // Vendors
  for (const vendor of INITIAL_VENDORS) {
    await query(
      `INSERT INTO vendors (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
      [vendor.id, JSON.stringify(vendor)]
    );
  }

  // Mandors
  for (const mandor of INITIAL_MANDORS) {
    await query(
      `INSERT INTO mandors (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
      [mandor.id, JSON.stringify(mandor)]
    );
  }

  // Suppliers
  for (const supplier of INITIAL_SUPPLIERS) {
    await query(
      `INSERT INTO suppliers (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
      [supplier.id, JSON.stringify(supplier)]
    );
  }

  // Price Catalog
  for (const item of INITIAL_PRICE_CATALOG) {
    await query(
      `INSERT INTO price_catalog (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
      [item.id, JSON.stringify(item)]
    );
  }

  // SPKs
  for (const spk of INITIAL_SPKS) {
    await query(
      `INSERT INTO spks (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
      [spk.id, JSON.stringify(spk)]
    );
  }

  // Payment Requests
  for (const req of INITIAL_PAYMENT_REQUESTS) {
    await query(
      `INSERT INTO payment_requests (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
      [req.id, JSON.stringify(req)]
    );
  }

  // Daily Reports
  for (const report of INITIAL_DAILY_REPORTS) {
    await query(
      `INSERT INTO daily_reports (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
      [report.id, JSON.stringify(report)]
    );
  }

  // Material POs
  for (const po of INITIAL_MATERIAL_POS) {
    await query(
      `INSERT INTO material_pos (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
      [po.id, JSON.stringify(po)]
    );
  }

  // Material Handovers
  for (const handover of INITIAL_MATERIAL_HANDOVERS) {
    await query(
      `INSERT INTO material_handovers (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
      [handover.id, JSON.stringify(handover)]
    );
  }

  // Approval Logs
  for (const log of INITIAL_APPROVAL_LOGS) {
    await query(
      `INSERT INTO approval_logs (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
      [log.id, JSON.stringify(log)]
    );
  }

  console.log('Database seeded successfully!');
}
