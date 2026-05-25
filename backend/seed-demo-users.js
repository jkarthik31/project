require('dotenv').config();

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const demoUsers = [
  {
    email: 'student@college.edu',
    password: 'password',
    name: 'Student User',
    role: 'student',
    department: 'BCA',
  },
  {
    email: 'teacher@college.edu',
    password: 'password',
    name: 'Dr. Rajesh',
    role: 'teacher',
    department: 'BCA',
  },
  {
    email: 'hod@college.edu',
    password: 'password',
    name: 'Prof. Verma',
    role: 'hod',
    department: 'BCA',
  },
  {
    email: 'admin@campusnexus.com',
    password: 'admin123',
    name: 'Admin',
    role: 'admin',
    department: null,
  },
];

const ensureDemoUser = async (user) => {
  const passwordHash = await bcrypt.hash(user.password, 12);

  const [existing] = await db.query('SELECT id FROM profiles WHERE email = ?', [user.email]);

  if (existing.length) {
    await db.query(
      `UPDATE profiles
       SET name = ?, password_hash = ?, role = ?, department = ?, approval_status = 'approved', is_first_login = FALSE
       WHERE email = ?`,
      [user.name, passwordHash, user.role, user.department, user.email]
    );
    return 'updated';
  }

  await db.query(
    `INSERT INTO profiles
       (id, email, name, password_hash, role, department, approval_status, is_first_login)
     VALUES (?, ?, ?, ?, ?, ?, 'approved', FALSE)`,
    [uuidv4(), user.email, user.name, passwordHash, user.role, user.department]
  );

  return 'created';
};

(async () => {
  try {
    for (const user of demoUsers) {
      const action = await ensureDemoUser(user);
      console.log(`${action}: ${user.email} / ${user.password}`);
    }
    console.log('Demo login users are ready.');
  } catch (err) {
    console.error('Failed to seed demo users:', err.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
