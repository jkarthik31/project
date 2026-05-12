require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
  });

  console.log('Connected to DB. Applying approval_workflow migration...');

  const steps = [
    // 1. Add approval columns to profiles (safe check)
    async () => {
      const [rows] = await conn.query(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='profiles' AND COLUMN_NAME='approval_status'`
      );
      if (rows.length === 0) {
        await conn.query(`
          ALTER TABLE profiles
            ADD COLUMN approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
            ADD COLUMN approved_by     VARCHAR(36) DEFAULT NULL,
            ADD COLUMN approved_at     TIMESTAMP   NULL DEFAULT NULL,
            ADD COLUMN rejection_reason TEXT        DEFAULT NULL,
            ADD COLUMN is_first_login  BOOLEAN     NOT NULL DEFAULT TRUE
        `);
        console.log('✓ Added approval columns to profiles');
      } else {
        console.log('- approval columns already exist, skipping.');
      }
    },

    // 2. Expand notification type enum
    async () => {
      await conn.query(`
        ALTER TABLE notifications
        MODIFY COLUMN type ENUM(
          'new_job','status_update','deadline_reminder','general',
          'approval_request','approval_granted','approval_rejected'
        ) NOT NULL DEFAULT 'general'
      `);
      console.log('✓ Updated notifications.type ENUM');
    },

    // 3. Create approval_audit_log table
    async () => {
      await conn.query(`
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
        )
      `);
      console.log('✓ Created approval_audit_log table');
    },

    // 4. Mark all existing users as approved
    async () => {
      const [result] = await conn.query(`
        UPDATE profiles SET approval_status = 'approved', is_first_login = FALSE
        WHERE approval_status = 'pending'
      `);
      console.log(`✓ Marked ${result.affectedRows} existing user(s) as approved`);
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
  console.log('\n✅ Approval workflow migration complete!');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
