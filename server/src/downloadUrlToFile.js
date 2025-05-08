// cấu hình Cloudinary
const cloudinary = require('cloudinary').v2;
const fs         = require('fs');
const path       = require('path');
const https      = require('https');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name:   process.env.CLOUDINARY_CLOUD_NAME,
  api_key:      process.env.CLOUDINARY_API_KEY,
  api_secret:   process.env.CLOUDINARY_API_SECRET,
});

async function fetchAllResources(folder) {
  let resources = [], nextCursor = null;
  do {
    const result = await cloudinary.search
      .expression(`folder:${folder}/*`)
      .sort_by('public_id','desc')
      .max_results(100)
      .next_cursor(nextCursor)
      .execute();
    resources = resources.concat(result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);
  return resources;
}

function downloadUrlToFile(url, outPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outPath);
    https.get(url, res => {
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlink(outPath, ()=>{});
      reject(err);
    });
  });
}

async function downloadAndRenameByDisplayName(folder) {
  const tmpDir = path.join(__dirname, '.tmp');
  if (fs.existsSync(tmpDir)) {
    // nếu muốn ghi đè, xóa hết trước
    fs.rmdirSync(tmpDir, { recursive: true });
  }
  fs.mkdirSync(tmpDir);

  const resources = await fetchAllResources(folder);

  for (const r of resources) {
    const url = r.secure_url;
    // ưu tiên custom display_name, nếu không có dùng original_filename
    const rawName = r.context?.custom?.display_name 
                     || r.original_filename 
                     || r.filename;
    const safeName = rawName.replace(/[\/\\?%*:|"<> ]/g, '_');
    const ext = '.' + (r.format || path.extname(url).slice(1));
    const outPath = path.join(tmpDir, safeName + ext);

    await downloadUrlToFile(url, outPath);
    console.log(`✅ Downloaded & renamed: ${safeName + ext}`);
  }
}

if (require.main === module) {
  downloadAndRenameByDisplayName('portfolio')
    .then(()=>console.log('All done'))
    .catch(console.error);
}
