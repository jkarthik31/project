-- ============================================================
-- Campus Nexus - Feature Enhancement Migration v2
-- Run via: node run-migration.js migrations/features_v2.sql
-- ============================================================

USE campus_nexus;

-- -------------------------------------------------------
-- 1. JOBS TABLE: Add required_skills column (safe for MySQL 5.x)
-- -------------------------------------------------------
DROP PROCEDURE IF EXISTS add_required_skills;
CREATE PROCEDURE add_required_skills()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'jobs'
      AND COLUMN_NAME  = 'required_skills'
  ) THEN
    ALTER TABLE jobs ADD COLUMN required_skills TEXT DEFAULT NULL;
  END IF;
END;
CALL add_required_skills();
DROP PROCEDURE IF EXISTS add_required_skills;


-- -------------------------------------------------------
-- 2. APPLICATIONS TABLE: Add interview + offer statuses
-- -------------------------------------------------------
ALTER TABLE applications
  MODIFY COLUMN status
    ENUM('applied','shortlisted','interview','selected','offer','rejected')
    NOT NULL DEFAULT 'applied';

-- -------------------------------------------------------
-- 3. NEW: application_status_history
-- Tracks every status change for the progress timeline
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS application_status_history (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT NOT NULL,
  status      VARCHAR(50) NOT NULL,
  changed_by  VARCHAR(36) DEFAULT NULL COMMENT 'Profile ID of the user who made the change',
  notes       TEXT DEFAULT NULL,
  changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by)     REFERENCES profiles(id)     ON DELETE SET NULL
);

-- Backfill history for existing applications (status = 'applied' at creation time)
INSERT IGNORE INTO application_status_history (application_id, status, changed_at)
SELECT id, status, applied_at FROM applications;

-- -------------------------------------------------------
-- 4. NEW: notifications table
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  type        ENUM('new_job','status_update','deadline_reminder','general') NOT NULL DEFAULT 'general',
  title       VARCHAR(255) NOT NULL,
  message     TEXT DEFAULT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  link        VARCHAR(500) DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id, is_read, created_at)
);

-- -------------------------------------------------------
-- Done
-- -------------------------------------------------------
SELECT 'Migration features_v2.sql completed successfully.' AS result;
