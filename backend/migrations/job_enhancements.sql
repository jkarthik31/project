-- ============================================================
-- Campus Nexus - Job System Enhancements
-- Adds missing fields for detailed job filtering and posting
-- ============================================================

USE campus_nexus;

-- -------------------------------------------------------
-- 1. Add missing columns to JOBS table
-- Using direct ALTER TABLE with error suppression via dummy SELECT if needed
-- -------------------------------------------------------

-- Job Type (Full-time, Internship, etc.)
ALTER TABLE jobs ADD COLUMN job_type VARCHAR(100) DEFAULT NULL;

-- Experience Level (Fresher, 1-2 years, etc.)
ALTER TABLE jobs ADD COLUMN experience_level VARCHAR(100) DEFAULT NULL;

-- Work Mode (Remote, On-site, Hybrid)
ALTER TABLE jobs ADD COLUMN work_mode VARCHAR(100) DEFAULT NULL;

-- Company Type (IT, Core, Startup, MNC, etc.)
ALTER TABLE jobs ADD COLUMN company_type VARCHAR(100) DEFAULT NULL;
