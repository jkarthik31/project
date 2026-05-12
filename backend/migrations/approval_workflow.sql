-- ============================================================
-- Campus Nexus - Approval Workflow Migration
-- Run via: node run-migration.js approval_workflow.sql
-- ============================================================

USE campus_nexus;

-- -------------------------------------------------------
-- 1. Add approval columns to profiles (safe idempotent)
-- -------------------------------------------------------
DROP PROCEDURE IF EXISTS add_approval_columns;
CREATE PROCEDURE add_approval_columns()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'profiles'
      AND COLUMN_NAME  = 'approval_status'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
      ADD COLUMN approved_by     VARCHAR(36) DEFAULT NULL,
      ADD COLUMN approved_at     TIMESTAMP   NULL DEFAULT NULL,
      ADD COLUMN rejection_reason TEXT        DEFAULT NULL,
      ADD COLUMN is_first_login  BOOLEAN     NOT NULL DEFAULT TRUE;
  END IF;
END;
CALL add_approval_columns();
DROP PROCEDURE IF EXISTS add_approval_columns;

-- -------------------------------------------------------
-- 2. Expand notification type enum to include approval types
-- -------------------------------------------------------
ALTER TABLE notifications
  MODIFY COLUMN type ENUM(
    'new_job','status_update','deadline_reminder','general',
    'approval_request','approval_granted','approval_rejected'
  ) NOT NULL DEFAULT 'general';

-- -------------------------------------------------------
-- 3. Approval audit log table
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_audit_log (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  target_user_id  VARCHAR(36) NOT NULL,
  action          ENUM('approved','rejected') NOT NULL,
  performed_by    VARCHAR(36) NOT NULL,
  reason          TEXT DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (target_user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by)   REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_audit_target (target_user_id),
  INDEX idx_audit_performer (performed_by)
);

-- -------------------------------------------------------
-- 4. Mark ALL existing users as approved (prevent lockout)
-- -------------------------------------------------------
UPDATE profiles SET approval_status = 'approved', is_first_login = FALSE
WHERE approval_status = 'pending';

-- -------------------------------------------------------
-- Done
-- -------------------------------------------------------
SELECT 'Migration approval_workflow.sql completed successfully.' AS result;
