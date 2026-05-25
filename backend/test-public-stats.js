const db = require('./db');

async function test() {
  try {
    console.log('Testing totalStudents...');
    const [q1] = await db.query("SELECT COUNT(*) as totalStudents FROM profiles WHERE role = 'student'");
    console.log('q1:', q1[0]);

    console.log('Testing totalJobs...');
    const [q2] = await db.query("SELECT COUNT(*) as totalJobs FROM jobs WHERE status = 'active'");
    console.log('q2:', q2[0]);

    console.log('Testing totalCompanies...');
    const [q3] = await db.query("SELECT COUNT(DISTINCT company) as totalCompanies FROM jobs");
    console.log('q3:', q3[0]);

    console.log('Testing totalPlaced...');
    const [q4] = await db.query("SELECT COUNT(*) as totalPlaced FROM applications WHERE status IN ('selected', 'offer')");
    console.log('q4:', q4[0]);

    console.log('Testing totalDepts...');
    const [q5] = await db.query("SELECT COUNT(DISTINCT department) as totalDepts FROM profiles WHERE department IS NOT NULL AND department != ''");
    console.log('q5:', q5[0]);

    console.log('All tests passed!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    process.exit();
  }
}

test();
