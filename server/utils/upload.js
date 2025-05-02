// server/utils/upload.js
require('dotenv').config();
const cloudinary = require('../config/cloudinary'); // ✅ Thêm dòng này
const path = require('path');
const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);

// Check if a file is a JPG
function isJPG(file) {
  return path.extname(file).toLowerCase() === '.jpg';
}

// Check if a resource exists on Cloudinary
async function isFileExistsInCloudinary(publicId) {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'portfolio/',
      max_results: 500,
    });

    return result.resources?.some(resource => resource.public_id === publicId) || false;
  } catch (error) {
    throw error;
  }
}

// Upload JPG images
async function uploadImagesToCloudinary() {
  try {
    const tmpFolderPath = path.join(__dirname, '../.tmp');
    if (!fs.existsSync(tmpFolderPath)) {
      fs.mkdirSync(tmpFolderPath);
      console.log(`📁 Created .tmp folder at ${tmpFolderPath}`);
    }

    const files = await readdir(tmpFolderPath);
    const jpgFiles = files.filter(isJPG);

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
        console.log(`♻️ Overwriting existing file: ${publicId}`);
      }

      const uploadResult = await cloudinary.uploader.upload(filePath, options);
      console.log(`✅ Uploaded: ${uploadResult.secure_url}`);
      fs.unlinkSync(filePath);
    }

    console.log('🎉 All JPG files uploaded successfully.');
  } catch (error) {
    console.error('❌ Error uploading images to Cloudinary:', error);
  }
}

if (require.main === module) {
  uploadImagesToCloudinary();
}

module.exports = { uploadImagesToCloudinary };
