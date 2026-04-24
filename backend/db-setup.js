require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('Testing connection with:');
console.log('  Host:', process.env.DB_HOST);
console.log('  User:', process.env.DB_USER);
console.log('  Pass:', process.env.DB_PASSWORD ? '(set)' : '(empty)');
console.log('  DB:  ', process.env.DB_NAME);

mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 3306,
}).then(async conn => {
  console.log('\n✅ Connection successful!');
  
  // Create database
  await conn.query('CREATE DATABASE IF NOT EXISTS campus_nexus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  console.log('✅ Database campus_nexus created/verified');

  await conn.query('USE campus_nexus');

  // Create tables
  await conn.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL DEFAULT '',
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('student','teacher','hod','admin') NOT NULL DEFAULT 'student',
      department VARCHAR(255),
      phone VARCHAR(50),
      avatar_url TEXT,
      cgpa DECIMAL(4,2),
      skills TEXT,
      resume_url TEXT,
      portfolio_url TEXT,
      github_url TEXT,
      linkedin_url TEXT,
      profile_completion INT DEFAULT 20,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Table: profiles');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      position VARCHAR(255) NOT NULL,
      description TEXT,
      location VARCHAR(255),
      package VARCHAR(100),
      requirements TEXT,
      status ENUM('active','closed','draft') NOT NULL DEFAULT 'active',
      deadline DATE,
      created_by VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
    )
  `);
  console.log('✅ Table: jobs');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(36) NOT NULL,
      job_id BIGINT NOT NULL,
      status ENUM('applied','shortlisted','selected','rejected') NOT NULL DEFAULT 'applied',
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_application (student_id, job_id),
      FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Table: applications');

  console.log('\n🎉 Database setup complete! You can now start the server.');
  await conn.end();
}).catch(err => {
  console.error('\n❌ Connection failed:', err.message);
  console.error('\nPlease check:');
  console.error('  1. MySQL service is running (check Services in Task Manager)');
  console.error('  2. The password in .env is correct');
  console.error('  3. Try connecting via MySQL Workbench with the same credentials');
  process.exit(1);
});
