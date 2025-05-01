// server/routes/photos.js
const express = require('express');
const cloudinary = require('../config/cloudinary');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:portfolio') // Replace with your Cloudinary folder
      .sort_by('public_id', 'desc')
      .max_results(50)
      .execute();
    res.json(result.resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not retrieve photos' });
  }
});

module.exports = router;