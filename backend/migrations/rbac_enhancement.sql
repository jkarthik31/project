-- ============================================================
-- Campus Nexus - Role-Based Access Enhancement
-- Adds columns for Resume Verification and Placement Eligibility
-- ============================================================

USE campus_nexus;

-- -------------------------------------------------------
-- 1. Add columns to profiles for Teacher verification
-- -------------------------------------------------------

-- Resume Verification
ALTER TABLE profiles 
  ADD COLUMN resume_status ENUM('Pending', 'Approved', 'Needs Revision') NOT NULL DEFAULT 'Pending',
  ADD COLUMN resume_remarks TEXT DEFAULT NULL;

-- Placement Eligibility
ALTER TABLE profiles
  ADD COLUMN eligibility_status ENUM('Eligible for Placement', 'Not Eligible', 'Training Pending') NOT NULL DEFAULT 'Training Pending',
  ADD COLUMN eligibility_remarks TEXT DEFAULT NULL;

-- -------------------------------------------------------
-- 2. Expand notification type enum
-- -------------------------------------------------------
ALTER TABLE notifications
  MODIFY COLUMN type ENUM(
    'new_job','status_update','deadline_reminder','general',
    'approval_request','approval_granted','approval_rejected',
    'resume_update', 'eligibility_update'
  ) NOT NULL DEFAULT 'general';

-- -------------------------------------------------------
-- Done
-- -------------------------------------------------------
SELECT 'Migration rbac_enhancement.sql completed successfully.' AS result;
