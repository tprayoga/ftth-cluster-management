-- =========================================================================
-- INITIAL DATABASE SCHEMA: FTTH CLUSTER MANAGEMENT SYSTEM
-- PT INDOTEK BUANA KARYA
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROLES TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    role_label VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. VENDORS TABLE
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    scope_type VARCHAR(50) NOT NULL,
    pic_name VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. MANDORS TABLE
CREATE TABLE IF NOT EXISTS mandors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    team_size INT DEFAULT 6,
    specialization VARCHAR(100) DEFAULT 'All-in-One',
    area VARCHAR(100),
    bank_name VARCHAR(50),
    account_number VARCHAR(50),
    account_holder VARCHAR(150),
    outstanding_kasbon NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    city VARCHAR(100),
    pic_name VARCHAR(100),
    phone VARCHAR(50),
    bank_name VARCHAR(50),
    account_number VARCHAR(50),
    account_holder VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SPKS / CLUSTERS TABLE
CREATE TABLE IF NOT EXISTS spks (
    id VARCHAR(50) PRIMARY KEY,
    vendor_id VARCHAR(50) REFERENCES vendors(id) ON DELETE SET NULL,
    vendor_name VARCHAR(150) NOT NULL,
    scope_type VARCHAR(50) NOT NULL,
    workflow_stage VARCHAR(50) NOT NULL,
    spk_number VARCHAR(100) NOT NULL,
    cluster_name VARCHAR(200) NOT NULL,
    region VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Draft',
    notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SITES TABLE
CREATE TABLE IF NOT EXISTS sites (
    id VARCHAR(50) PRIMARY KEY,
    spk_id VARCHAR(50) REFERENCES spks(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    sow_type VARCHAR(100) DEFAULT 'PULLING FEEDER & DISTRIBUSI',
    po_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    mandor_id VARCHAR(50) REFERENCES mandors(id) ON DELETE SET NULL,
    mandor_name VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SERVICES (JASA SOW) TABLE
CREATE TABLE IF NOT EXISTS site_services (
    id VARCHAR(50) PRIMARY KEY,
    site_id VARCHAR(50) REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    qty NUMERIC(10, 2) NOT NULL DEFAULT 0,
    uom VARCHAR(50) NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    actual_progress NUMERIC(10, 2) DEFAULT 0,
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. MATERIALS (AKSESORIS) TABLE
CREATE TABLE IF NOT EXISTS site_materials (
    id VARCHAR(50) PRIMARY KEY,
    site_id VARCHAR(50) REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) DEFAULT 'ACCESSORIES',
    uom VARCHAR(50) DEFAULT 'Pcs',
    qty NUMERIC(10, 2) NOT NULL DEFAULT 0,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    installed_qty NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. DAILY PROGRESS REPORTS TABLE
CREATE TABLE IF NOT EXISTS daily_reports (
    id VARCHAR(50) PRIMARY KEY,
    spk_id VARCHAR(50) REFERENCES spks(id) ON DELETE CASCADE,
    cluster_name VARCHAR(200) NOT NULL,
    site_id VARCHAR(50) REFERENCES sites(id) ON DELETE CASCADE,
    site_name VARCHAR(200) NOT NULL,
    vendor_name VARCHAR(150),
    report_date DATE NOT NULL,
    day_name VARCHAR(50),
    mandor_name VARCHAR(150),
    team_size INT DEFAULT 6,
    overall_progress_percent NUMERIC(5, 2) DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    photos JSONB NOT NULL DEFAULT '[]'::jsonb,
    activities_today JSONB DEFAULT '[]'::jsonb,
    plan_tomorrow JSONB DEFAULT '[]'::jsonb,
    issues JSONB DEFAULT '[]'::jsonb,
    weather VARCHAR(50) DEFAULT 'Cerah',
    submitted_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. PAYMENT REQUESTS TABLE (TERMIN & KASBON)
CREATE TABLE IF NOT EXISTS payment_requests (
    id VARCHAR(50) PRIMARY KEY,
    request_no VARCHAR(100) UNIQUE NOT NULL,
    spk_id VARCHAR(50) REFERENCES spks(id) ON DELETE CASCADE,
    cluster_name VARCHAR(200) NOT NULL,
    site_id VARCHAR(50),
    site_name VARCHAR(200),
    mandor_id VARCHAR(50) REFERENCES mandors(id) ON DELETE SET NULL,
    mandor_name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    term_number INT,
    requested_amount NUMERIC(15, 2) NOT NULL,
    deducted_kasbon NUMERIC(15, 2) DEFAULT 0,
    net_transfer_amount NUMERIC(15, 2) NOT NULL,
    verified_progress_percent NUMERIC(5, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING_FINANCE',
    reason TEXT,
    submitted_by VARCHAR(100),
    approved_by VARCHAR(100),
    transfer_ref VARCHAR(100),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS approval_logs (
    id VARCHAR(50) PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    entity_title VARCHAR(200) NOT NULL,
    action VARCHAR(50) NOT NULL,
    acted_by_role VARCHAR(50) NOT NULL,
    acted_by_name VARCHAR(150) NOT NULL,
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-speed queries
CREATE INDEX IF NOT EXISTS idx_spks_vendor ON spks(vendor_id);
CREATE INDEX IF NOT EXISTS idx_sites_spk ON sites(spk_id);
CREATE INDEX IF NOT EXISTS idx_dpr_site ON daily_reports(site_id);
CREATE INDEX IF NOT EXISTS idx_payment_mandor ON payment_requests(mandor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON approval_logs(entity_type, entity_id);
