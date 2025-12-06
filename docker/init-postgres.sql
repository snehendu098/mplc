-- SRGG Marketplace Platform - PostgreSQL Initialization Script

-- Create database if not exists
SELECT 'CREATE DATABASE srgg_marketplace'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'srgg_marketplace');

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create custom types (if needed in future)
-- DO $$ BEGIN
--     CREATE TYPE tenant_status AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;
