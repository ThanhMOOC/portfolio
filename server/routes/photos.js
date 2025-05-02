// server/routes/photos.js
const cloudinary = require('../config/cloudinary');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:portfolio')
      .sort_by('public_id', 'desc')
      .max_results(50)
      .execute();
    res.json(result.resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Không lấy được ảnh' });
  }
});

module.exports = router;
