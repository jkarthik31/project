require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
}).then(async conn => {
  console.log('Connected to DB');
  const sql = fs.readFileSync(path.join(__dirname, 'migrations', '01_eligibility_and_saved_jobs.sql'), 'utf-8');
  
  // mysql2 by default does not support multiple statements in query unless enabled.
  // We can just run them separately.
  const statements = sql.split(';').filter(s => s.trim().length > 0);
  for (const stmt of statements) {
    try {
      await conn.query(stmt);
      console.log('Executed statement successfully.');
    } catch (err) {
      console.error('Error executing statement:', stmt.substring(0, 50), '...', err.message);
    }
  }
  await conn.end();
  console.log('Migration complete');
}).catch(err => {
  console.error('Migration failed:', err);
});
