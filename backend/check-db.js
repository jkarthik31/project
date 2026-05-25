const db = require('./db');

async function checkJobs() {
  try {
    const [tables] = await db.query('SHOW TABLES');
    console.log('--- TABLES ---');
    console.table(tables);

    const [jobs] = await db.query('SELECT count(*) as count FROM jobs');
    console.log(`\n--- JOBS COUNT: ${jobs[0].count} ---`);
    
    if (jobs[0].count > 0) {
      const [rows] = await db.query('SELECT id, title, company, status, allowed_departments FROM jobs LIMIT 10');
      console.log('\n--- FIRST 10 JOBS ---');
      console.table(rows);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkJobs();
