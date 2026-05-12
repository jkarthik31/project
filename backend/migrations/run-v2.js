require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  console.log('Connected to DB. Applying feature migration v2...');

  const steps = [
    // 1. Add required_skills to jobs (safe check)
    async () => {
      const [rows] = await conn.query(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='jobs' AND COLUMN_NAME='required_skills'`
      );
      if (rows.length === 0) {
        await conn.query('ALTER TABLE jobs ADD COLUMN required_skills TEXT DEFAULT NULL');
        console.log('✓ Added jobs.required_skills');
      } else {
        console.log('- jobs.required_skills already exists, skipping.');
      }
    },

    // 2. Alter applications.status ENUM to include interview + offer
    async () => {
      await conn.query(`
        ALTER TABLE applications
        MODIFY COLUMN status
          ENUM('applied','shortlisted','interview','selected','offer','rejected')
          NOT NULL DEFAULT 'applied'
      `);
      console.log('✓ Updated applications.status ENUM');
    },

    // 3. Create application_status_history
    async () => {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS application_status_history (
          id             BIGINT AUTO_INCREMENT PRIMARY KEY,
          application_id BIGINT NOT NULL,
          status         VARCHAR(50) NOT NULL,
          changed_by     VARCHAR(36) DEFAULT NULL,
          notes          TEXT DEFAULT NULL,
          changed_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
          FOREIGN KEY (changed_by)     REFERENCES profiles(id)     ON DELETE SET NULL
        )
      `);
      console.log('✓ Created application_status_history');
    },

    // 4. Backfill history for existing applications
    async () => {
      await conn.query(`
        INSERT IGNORE INTO application_status_history (application_id, status, changed_at)
        SELECT id, status, applied_at FROM applications
      `);
      console.log('✓ Backfilled application_status_history');
    },

    // 5. Create notifications table
    async () => {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id         BIGINT AUTO_INCREMENT PRIMARY KEY,
          user_id    VARCHAR(36) NOT NULL,
          type       ENUM('new_job','status_update','deadline_reminder','general') NOT NULL DEFAULT 'general',
          title      VARCHAR(255) NOT NULL,
          message    TEXT DEFAULT NULL,
          is_read    BOOLEAN NOT NULL DEFAULT FALSE,
          link       VARCHAR(500) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
          INDEX idx_notifications_user (user_id, is_read, created_at)
        )
      `);
      console.log('✓ Created notifications table');
    },
  ];

  for (const step of steps) {
    try {
      await step();
    } catch (err) {
      console.error('  ✗ Error:', err.message);
    }
  }

  await conn.end();
  console.log('\n✅ Feature migration v2 complete!');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
