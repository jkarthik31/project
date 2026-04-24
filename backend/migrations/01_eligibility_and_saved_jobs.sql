-- Migration: Add Eligibility fields to jobs and create saved_jobs table
-- Run this in your MySQL console or Workbench

USE campus_nexus;

-- 1. Add eligibility fields to jobs table
ALTER TABLE jobs 
ADD COLUMN min_cgpa DECIMAL(4,2) DEFAULT 0.00 AFTER requirements,
ADD COLUMN allowed_departments VARCHAR(500) AFTER min_cgpa,
ADD COLUMN allowed_batches VARCHAR(255) AFTER allowed_departments;

-- 2. Create saved_jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  job_id BIGINT NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_saved_job (student_id, job_id),
  FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
