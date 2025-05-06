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

// Lấy danh sách hình ảnh từ Cloudinary
async function fetchImagesFromCloudinary(folder) {
  try {
    let imageResources = [];
    let nextCursor = null;

    do {
      const result = await cloudinary.search
        .expression(`folder:${folder}/*`)
        .sort_by('public_id','desc')
        .max_results(100)
        .next_cursor(nextCursor)
        .execute();

      const imageUrls = result.resources.map(resource => {
        const displayName = resource.context?.custom?.display_name
                          || `${resource.filename}.${resource.format}`;
        return {
          url: resource.secure_url,
          display_name: displayName,
          public_id: resource.public_id
        };
      });

      imageResources = imageResources.concat(imageUrls);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    return imageResources;
  } catch (err) {
    console.error(err);
    throw err;
  }
}


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Lấy danh sách hình ảnh từ Cloudinary
async function fetchImagesFromCloudinary(folder) {
  try {
    let imageResources = [];
    let nextCursor = null;

    do {
      const result = await cloudinary.search
        .expression(`folder:${folder}/*`)
        .sort_by('public_id', 'desc')
        .max_results(100) 
        .next_cursor(nextCursor)
        .execute();

      const imageUrls = result.resources.map(resource => {
        const displayName = resource.context?.custom?.display_name || '';  
        return {
          url: resource.secure_url,  
          display_name: displayName, 
          public_id: resource.public_id 
        };
      });

      imageResources = imageResources.concat(imageUrls);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    return imageResources; 
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    throw error;
  }
}

// Endpoint gốc
app.get('/', async (req, res) => {
  const filePath = path.join(__dirname, 'tua-erre.html');
  res.sendFile(filePath);
});

/*/ API để lấy URL của hình ảnh cần thiết (cover.jpg)
app.get('/image-url/:folder', async (req,res) => {
  const folder = req.params.folder;
  if (!folder) return res.status(400).json({error:'Folder required'});

  try {
    const images = await fetchImagesFromCloudinary(folder);
    // tìm theo display_name bây giờ đúng
    const coverImage = images.find(img => img.display_name.toLowerCase()==='cover.jpg');
    if (!coverImage) return res.status(404).json({error:'Cover not found'});
    res.json({url: coverImage.url});
  } catch {
    res.status(500).json({error:'Fetch failed'});
  }
});*/

app.get('/image-url/:folder', async (req, res) => {
  const folder = req.params.folder;
  if (!folder) return res.status(400).json({ error: 'Folder required' });

  try {
    const images = await fetchImagesFromCloudinary(folder);
    res.json(images); // ← trả về toàn bộ hình
  } catch {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

