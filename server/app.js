// server/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { uploadImagesToCloudinary } = require('./utils/upload');
const cloudinaryConfig = require('./config/cloudinary');
const path = require('path');
const fs = require('fs');
const util = require('util');
const photosRouter = require('./routes/photos');

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
  res.sendFile(path.join(__dirname, '..', 'index.html')); // Gửi file index.html từ thư mục cha
});

// Use the photos router for /api/photos route
app.use('/api/photos', photosRouter);

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
