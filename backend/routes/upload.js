const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Require authentication for uploads
router.use(authMiddleware);

// Configure storage for photos
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/photos/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${uuidv4()}${ext}`);
  }
});

// Configure storage for resumes
const resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${uuidv4()}${ext}`);
  }
});

// File filters
const photoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const resumeFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Please upload a PDF or Word document.'), false);
  }
};

const uploadPhoto = multer({ storage: photoStorage, fileFilter: photoFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
const uploadResume = multer({ storage: resumeStorage, fileFilter: resumeFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// POST /api/upload/photo
router.post('/photo', uploadPhoto.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const url = `http://localhost:5000/uploads/photos/${req.file.filename}`;
  res.json({ url });
});

// POST /api/upload/resume
router.post('/resume', uploadResume.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const url = `http://localhost:5000/uploads/resumes/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
