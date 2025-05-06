const express = require('express');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function fetchImagesFromCloudinary(folder) {
  try {
    const result = await cloudinary.search
      .expression(`folder:${folder}/*`)
      .sort_by('public_id', 'desc')
      .max_results(50)
      .execute();

    const imageUrls = result.resources.map((resource) => resource.secure_url);
    return imageUrls;
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    throw error;
  }
}

app.get('/', (req, res) => {
  res.send('hello');
});

app.get('/images', async (req, res) => {
  const folder = req.query.folder;
  if (!folder) {
    return res.status(400).json({ error: 'Folder query parameter is required' });
  }
  try {
    const imageUrls = await fetchImagesFromCloudinary(folder);
    res.json(imageUrls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch images from Cloudinary' });
  }
});

app.post('/upload', async (req, res) => {
  const imagePath = req.body.image;
    if (!imagePath) {
        return res.status(400).json({ error: 'Image path is required' });
    }
    const fullPath = path.join(__dirname, '.tmp', imagePath);
  try {
    
    if (!fs.existsSync(path.join(__dirname, '.tmp'))) {
      fs.mkdirSync(path.join(__dirname, '.tmp'));
    }
    if (!fs.existsSync(fullPath))
        return res.status(404).json({ error: 'file not found' });

    const result = await cloudinary.uploader.upload(fullPath, {
      folder: 'portfolio',
      public_id: path.basename(imagePath, path.extname(imagePath)),
    });
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});