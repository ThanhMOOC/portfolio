require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Cấu hình cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Đường dẫn thư mục tạm
const tmpFolder = path.join(__dirname, '.img_tmp');

// Hàm tải ảnh từ URL về local
async function downloadImage(url, filename) {
  const filePath = path.join(tmpFolder, filename);
  const writer = fs.createWriteStream(filePath);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}

// Hàm xóa ảnh theo publicId trên Cloudinary
async function deleteImage(publicId) {
  console.log(`🔴 Đang xóa file: ${publicId}`);
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === 'ok') {
      console.log(`✅ Đã xóa file: ${publicId}`);
    } else {
      console.error(`❌ Không thể xóa file: ${publicId}`);
    }
  } catch (error) {
    console.error(`Lỗi khi xóa file ${publicId}: ${error.message}`);
  }
}

// Hàm xóa toàn bộ ảnh trên Cloudinary
async function deleteAllImages() {
  console.log('🔴 Đang xóa toàn bộ hình trên Cloudinary...');
  
  try {
    // Lấy tất cả các ảnh trong thư mục 'portfolio/'
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'portfolio/', // Tìm ảnh trong thư mục 'portfolio/'
      max_results: 500,      // Tăng số lượng ảnh tối đa nếu bạn cần
    });

    const publicIds = result.resources.map((resource) => resource.public_id);

    if (publicIds.length > 0) {
      console.log(`🔴 Đang xóa ${publicIds.length} file...`);

      // Xóa từng file theo publicId
      for (const publicId of publicIds) {
        await deleteImage(publicId);
      }
    } else {
      console.log('Không có ảnh nào để xóa.');
    }
  } catch (error) {
    console.error('Lỗi khi xóa file:', error.message);
  }
}

// Hàm upload ảnh
async function uploadImage(localFilePath, newPublicId) {
  const uploadResult = await cloudinary.uploader.upload(localFilePath, {
    folder: 'portfolio',         // ✨ Đảm bảo vào đúng folder
    public_id: newPublicId,       // ✨ Tên file đơn giản
    overwrite: true,
    resource_type: "image",
  });
  
  console.log(`✅ Đã up file mới: ${uploadResult.public_id}`);
  return uploadResult;
}

// Hàm lấy danh sách, tải, rename và up lại
async function processImages() {
  if (!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder);
  }

  console.log('🔵 Đang lấy danh sách hình...');
  const allImages = await cloudinary.search
    .expression('folder:portfolio') // Chỉ tìm ảnh trong thư mục portfolio
    .max_results(500)  // Lấy hết ảnh mà không bị giới hạn 100
    .execute();

  console.log(`🔵 Đã tìm thấy ${allImages.resources.length} hình.`);

  // Download toàn bộ hình
  for (const resource of allImages.resources) {
    const originalFilename = resource.public_id.split('/').pop(); // Tên file gốc
    const cleanName = originalFilename.replace(/_[a-zA-Z0-9]{6,7}$/, ''); // Bỏ hậu tố _xxxxxx

    const extension = path.extname(resource.url).split('?')[0] || '.jpg'; // Lấy extension nếu có
    const newFileName = cleanName + extension;

    console.log(`⬇️ Tải file: ${resource.url}`);
    await downloadImage(resource.url, newFileName);
  }

  // Xóa toàn bộ file trên Cloud
  await deleteAllImages();

  // Upload lại từng file
  const files = fs.readdirSync(tmpFolder);
  for (const file of files) {
    const localPath = path.join(tmpFolder, file);
    const publicId = path.parse(file).name; // Bỏ đuôi .jpg

    await uploadImage(localPath, publicId);
  }

  // Dọn dẹp thư mục tạm
  fs.rmSync(tmpFolder, { recursive: true, force: true });
  console.log('🧹 Đã dọn sạch thư mục .img_tmp.');

  console.log('🎉 Hoàn tất!');
}

// Chạy script
processImages().catch((err) => {
  console.error('Có lỗi xảy ra:', err.message);
});
