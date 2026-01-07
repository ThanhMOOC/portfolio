require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const CloudinaryModel = require('./models/cloudinaryModel');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Serve GSAP locally to avoid CDN/network differences across browsers.
app.use(
  '/vendor/gsap',
  express.static(path.join(__dirname, '../../node_modules/gsap/dist'))
);

app.use(express.static(path.join(__dirname, '../../client')));

app.get('/image-url/portfolio', async (req, res, next) => {
  try {
    const data = await CloudinaryModel.fetchPortfolioTree();
    res.json(data);
  } catch (err) {
    err.statusCode = 500;
    err.message = 'Failed to fetch images from Cloudinary';
    next(err);
  }
});

// Route để lấy hình nền (lights.jpg từ portfolio root)
app.get('/image-url/background', async (req, res, next) => {
  try {
    const data = await CloudinaryModel.fetchBackgroundImage();
    res.json(data);
  } catch (err) {
    err.statusCode = 500;
    err.message = 'Failed to fetch background image from Cloudinary';
    next(err);
  }
});

app.get('/image-url/:folder', async (req, res, next) => {
  try {
    let folder = req.params.folder;
    
    // Map section names to folder names on Cloudinary
    const folderMap = {
      'street-photo': 'street',
      'wabi-sabi': 'wabi-sabi',
      'portrait': 'portrait'
    };
    
    // Get actual folder name
    const actualFolder = folderMap[folder] || folder;
    
    const data = await CloudinaryModel.fetchImagesByFolder(actualFolder);
    res.json(data);
  } catch (err) {
    err.statusCode = 500;
    err.message = 'Failed to fetch images from Cloudinary';
    next(err);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/index.html'));
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});