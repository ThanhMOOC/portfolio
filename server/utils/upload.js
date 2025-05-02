// server/utils/upload.js
require('dotenv').config();
const cloudinary = require('../config/cloudinary'); // Import Cloudinary configuration
const path = require('path');
const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);

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
     const tmpFolderPath = path.join(__dirname, '../.tmp');
        if (!fs.existsSync(tmpFolderPath)) {
            fs.mkdirSync(tmpFolderPath);
            console.log(`📁 Created .tmp folder at ${tmpFolderPath}`);
        }
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

// Only call uploadImagesToCloudinary if this file is run directly
if (require.main === module) {
    uploadImagesToCloudinary();
}
module.exports = {uploadImagesToCloudinary}

// server/routes/photos.js
const cloudinary = require('../config/cloudinary');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:portfolio') // THAY bằng folder Cloudinary bạn đang dùng
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

//server/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { uploadImagesToCloudinary } = require('./utils/upload');
const photosRoute = require('./routes/photos');
const path = require('path');
const fs = require('fs');
const util = require('util');

const app = express();
app.use(cors());

// Ghi log ra file server.log
const logFile = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' }); // 'a' = append
const logStdout = process.stdout;

console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
};

// Create the .tmp folder if it doesn't exist
const tmpFolderPath = path.join(__dirname, '.tmp');
if (!fs.existsSync(tmpFolderPath)) {
  fs.mkdirSync(tmpFolderPath);
  console.log('Created .tmp directory');
}

// Serve các file tĩnh từ thư mục cha của 'server' (chính là thư mục portfolio)
app.use(express.static(path.join(__dirname, '..')));

// Route trang chủ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public','html', 'index.html')); // Gửi file index.html từ thư mục cha
});

// Use the photos route
app.use('/api/photos', photosRoute);

// New route to trigger the uploadImagesToCloudinary function
app.get('/upload', async (req, res) => {
  await uploadImagesToCloudinary();
  res.send('Images upload process initiated.');
});

// xem frontend
app.use(express.static(path.join(__dirname, '../')));


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});



// Cho phép gọi upload từ dòng lệnh: node app.js upload
if (require.main === module && process.argv.includes('upload')) {
  uploadImagesToCloudinary();
}

// server/config/cloudinary.js
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;