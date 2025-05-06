const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFolder = async () => {
  const tmpDir = path.join(__dirname, '.tmp');

  fs.readdir(tmpDir, async (err, files) => {
    if (err) {
      return console.error('Không thể đọc thư mục .tmp:', err);
    }

    for (const file of files) {
      const filePath = path.join(tmpDir, file);

      const stat = fs.statSync(filePath);
      if (!stat.isFile()) continue;

      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'portfolio',
          use_filename: true,
          unique_filename: false,
          overwrite: true, // nếu bạn muốn ghi đè khi trùng tên
        });

        console.log(`✅ Uploaded: ${file} => ${result.secure_url}`);
      } catch (uploadErr) {
        console.error(`❌ Lỗi khi upload ${file}:`, uploadErr);
      }
    }
  });
};

uploadFolder();
