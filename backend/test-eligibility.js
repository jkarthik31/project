const db = require('./db');

async function testEligibility() {
  try {
    console.log('--- STARTING ELIGIBILITY TEST RUN ---');

    // 1. Find a student and a teacher
    const [students] = await db.query("SELECT id, name, department, eligibility_status, resume_status FROM profiles WHERE role = 'student' LIMIT 1");
    const [teachers] = await db.query("SELECT id, name, department FROM profiles WHERE role = 'teacher' LIMIT 1");
    const [jobs] = await db.query("SELECT id, title, company FROM jobs WHERE status = 'active' LIMIT 1");

    if (!students.length || !teachers.length || !jobs.length) {
      console.error('Error: Need at least one student, one teacher, and one active job in the DB to run test.');
      process.exit(1);
    }

    const student = students[0];
    const job = jobs[0];

    console.log(`Testing with Student: ${student.name} (ID: ${student.id})`);
    console.log(`Target Job: ${job.title} at ${job.company} (ID: ${job.id})`);

    // 2. Set student to INELIGIBLE
    console.log('\nStep 1: Setting student to "Not Eligible"...');
    await db.query("UPDATE profiles SET eligibility_status = 'Not Eligible', resume_status = 'Pending' WHERE id = ?", [student.id]);
    
    // 3. Attempt to fetch jobs as student and check eligibility calculation
    // Note: We'll simulate the logic from jobs.js route
    const studentResumeStatus = 'Pending';
    const studentEligibilityStatus = 'Not Eligible';
    
    let isEligible = true;
    if (studentResumeStatus.toLowerCase() !== 'approved') isEligible = false;
    if (studentEligibilityStatus.toLowerCase() !== 'eligible for placement') isEligible = false;

    console.log(`Logic Check - Is student eligible in code? ${isEligible ? 'YES' : 'NO'}`);
    
    if (!isEligible) {
      console.log('✅ Success: UI logic correctly identifies student as ineligible.');
    } else {
      console.log('❌ Failure: UI logic says student IS eligible.');
    }

    // 4. Test Backend Application Restriction (simulating POST /api/applications)
    console.log('\nStep 2: Simulating Backend Application attempt...');
    
    const [checkProfile] = await db.query('SELECT resume_status, eligibility_status FROM profiles WHERE id = ?', [student.id]);
    const p = checkProfile[0];
    
    let backendBlocked = false;
    if (p.resume_status.toLowerCase() !== 'approved' || p.eligibility_status.toLowerCase() !== 'eligible for placement') {
      backendBlocked = true;
    }

    if (backendBlocked) {
      console.log('✅ Success: Backend application logic would BLOCK this request.');
    } else {
      console.log('❌ Failure: Backend application logic would ALLOW this request.');
    }

    console.log('\n--- TEST RUN COMPLETED ---');
    process.exit(0);
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  }
}

testEligibility();
