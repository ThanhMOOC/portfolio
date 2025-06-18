const express = require('express');
const router = express.Router();
const ImageController = require('../controllers/imageController');
const path = require('path');

// Serve the main page
router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../../../client/pages/tua-erre.html');
  res.sendFile(filePath);
});

// Get images by folder
router.get('/image-url/:folder', ImageController.getImagesByFolder);

module.exports = router; 