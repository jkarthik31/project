const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Only students can access recommendations
// GET /api/recommendations
// Returns top matching jobs with match_score and missing_skills
router.get('/', async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can view recommendations.' });
  }

  try {
    // Fetch student profile
    const [profiles] = await db.query(
      'SELECT cgpa, department, skills FROM profiles WHERE id = ?',
      [req.user.id]
    );
    if (!profiles.length) return res.status(404).json({ error: 'Profile not found.' });

    const student = profiles[0];
    const studentCgpa = parseFloat(student.cgpa) || 0;
    const studentDept = (student.department || '').toLowerCase().trim();
    const studentSkills = (student.skills || '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    // Fetch all active jobs
    const [jobs] = await db.query(
      'SELECT * FROM jobs WHERE status = ? ORDER BY created_at DESC',
      ['active']
    );

    // Fetch jobs the student has already applied to
    const [applied] = await db.query(
      'SELECT job_id FROM applications WHERE student_id = ?',
      [req.user.id]
    );
    const appliedIds = new Set(applied.map(a => a.job_id));

    const scored = jobs.map(job => {
      let score = 0;
      const reasons = [];
      const missing_skills = [];

      // --- CGPA check (40 points) ---
      const jobCgpa = parseFloat(job.min_cgpa) || 0;
      if (jobCgpa === 0 || studentCgpa >= jobCgpa) {
        score += 40;
      } else {
        reasons.push(`Requires CGPA ≥ ${job.min_cgpa} (yours: ${studentCgpa})`);
      }

      // --- Department check (30 points) ---
      const allowedDepts = (job.allowed_departments || '')
        .split(',')
        .map(d => d.trim().toLowerCase())
        .filter(Boolean);
      if (allowedDepts.length === 0 || allowedDepts.includes(studentDept)) {
        score += 30;
      } else {
        reasons.push(`Open to: ${job.allowed_departments}`);
      }

      // --- Skills check (30 points, proportional) ---
      const requiredSkills = (job.required_skills || '')
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);

      if (requiredSkills.length === 0) {
        // No skill requirement — give full 30 points
        score += 30;
      } else {
        const matched = requiredSkills.filter(s => studentSkills.includes(s));
        const skillScore = Math.round((matched.length / requiredSkills.length) * 30);
        score += skillScore;
        const unmatched = requiredSkills.filter(s => !studentSkills.includes(s));
        unmatched.forEach(s => missing_skills.push(s));
        if (unmatched.length > 0) {
          reasons.push(`Missing skills: ${unmatched.join(', ')}`);
        }
      }

      return {
        ...job,
        match_score: score,
        is_eligible: score >= 70,
        ineligibility_reasons: reasons,
        missing_skills,
        already_applied: appliedIds.has(job.id),
      };
    });

    // Sort by score descending, return top 8
    const recommendations = scored
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 8);

    res.json({ recommendations });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
