const db = require('./db');

async function cleanUp() {
  try {
    // Update profiles
    const [res1] = await db.query("UPDATE profiles SET department = 'BCA' WHERE department = 'Computer Science' OR department = 'BSC CS'");
    console.log(`Updated ${res1.affectedRows} profiles.`);

    // Update jobs
    const [res2] = await db.query("UPDATE jobs SET allowed_departments = REPLACE(allowed_departments, 'Computer Science', 'BCA')");
    console.log(`Updated jobs (Computer Science -> BCA).`);
    
    const [res3] = await db.query("UPDATE jobs SET allowed_departments = REPLACE(allowed_departments, 'BSC CS', 'BCA')");
    console.log(`Updated jobs (BSC CS -> BCA).`);

    const [res4] = await db.query("UPDATE jobs SET allowed_departments = REPLACE(allowed_departments, 'BCS', 'BSC')");
    console.log(`Updated jobs (BCS -> BSC).`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanUp();
