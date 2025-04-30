// server/app.js => autorun
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors());

// Check if a file is a JPG
function isJPG(file) {
    return path.extname(file).toLowerCase() === '.jpg';
}

// Check if a resource exists by its public_id 
async function isFileExistsInCloudinary(publicId) {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'portfolio/',
      max_results: 500,
    });

    return result && result.resources ? result.resources.some(resource => resource.public_id === publicId) : false;
  } catch (error) {
    throw error;
  }
}

// Upload JPG images to Cloudinary
async function uploadImagesToCloudinary() {
  try {
    const tmpFolderPath = path.join(__dirname, '.tmp');
    const files = await readdir(tmpFolderPath);
    const jpgFiles = files.filter(file => isJPG(file));

    if (jpgFiles.length === 0) {
      console.log('📁 No JPG files found in .tmp folder.');
      return;
    }
    console.log(`📂 Found ${jpgFiles.length} JPG files to upload.`);
    
    for (const file of jpgFiles) {
      const filePath = path.join(tmpFolderPath, file);
      const fileNameWithoutExtension = path.basename(file, '.jpg');
      const publicId = `portfolio/${fileNameWithoutExtension}`;
      console.log(`🔧 Preparing to upload: ${file} to Cloudinary with public ID: ${publicId}`);

      const fileExists = await isFileExistsInCloudinary(publicId);
      const options = {
        folder: 'portfolio',
        public_id: fileNameWithoutExtension,
        overwrite: fileExists,
      };
      console.log(`⬆️ Uploading ${file} to Cloudinary...`);
      if (fileExists) {
        console.log(`♻️ Overwriting existing file with public ID: ${publicId} on Cloudinary`);
      };

      const uploadResult = await cloudinary.uploader.upload(filePath, options);
      if (fileExists){
        console.log(`✅ File with public ID ${publicId} already exists and has been overwritten on Cloudinary.`);
      } else {
        console.log(`✅ Uploaded ${file} to Cloudinary: ${uploadResult.secure_url}`);
      };
      fs.unlinkSync(filePath);
      console.log(`🗑️ File ${file} uploaded to Cloudinary. Public ID: ${publicId}, Secure URL: ${uploadResult.secure_url}`);
      console.log('==========');
    };
    console.log('🎉 All JPG files uploaded successfully.');
  } catch (error) {
    console.error('❌ Error uploading images to Cloudinary:', error);
  }
}

uploadImagesToCloudinary();
