// server/app.js
require('dotenv').config();
const express = require('express'); // ✅ Thêm dòng này
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const util = require('util');

const photosRoute = require('./routes/photos');
const { uploadImagesToCloudinary } = require('./utils/upload');

const app = express();
app.use(cors());

// Ghi log ra file server.log
const logFile = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
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

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Route trang chủ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'index.html'));
});

// API route
app.use('/api/photos', photosRoute);

// Trigger upload via route
app.get('/upload', async (req, res) => {
  await uploadImagesToCloudinary();
  res.send('Images upload process initiated.');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

// Trigger upload via CLI
if (require.main === module && process.argv.includes('upload')) {
  uploadImagesToCloudinary();
}
