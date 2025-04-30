// server/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);

const app = express();
app.use(cors());

// Ghi log ra file server.log
const logFile = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' }); // 'a' = append
const logStdout = process.stdout;

console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
};

// Cấu hình Cloudinary từ biến môi trường
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Serve các file tĩnh từ thư mục cha của 'server' (chính là thư mục portfolio)
app.use(express.static(path.join(__dirname, '..')));

// Route trang chủ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html')); // Gửi file index.html từ thư mục cha
});

// Route API lấy danh sách ảnh từ Cloudinary
app.get('/api/photos', async (req, res) => {
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
