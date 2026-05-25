const db = require('./db');

async function debugStudent() {
  try {
    const [rows] = await db.query("SELECT email, name, role, department, resume_status, eligibility_status FROM profiles WHERE email = 'srinivas@gmail.com'");
    console.log('--- STUDENT PROFILE ---');
    console.table(rows);
    
    if (rows.length > 0) {
      const student = rows[0];
      const resStatus = student.resume_status || 'Pending';
      const eligStatus = student.eligibility_status || 'Training Pending';
      
      console.log(`Resume Status: "${resStatus}"`);
      console.log(`Eligibility Status: "${eligStatus}"`);
      
      const isEligible = (resStatus.toLowerCase() === 'approved' && eligStatus.toLowerCase() === 'eligible for placement');
      console.log(`Calculated Eligibility: ${isEligible}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugStudent();
