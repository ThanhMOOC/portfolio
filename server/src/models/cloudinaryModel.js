const cloudinary = require('../config/cloudinary');

class CloudinaryModel {
  static async fetchPortfolioTree() {
    let all = [];
    let nextCursor = null;

    do {
      const result = await cloudinary.search
        .expression('public_id:portfolio/*')
        .sort_by('public_id', 'asc')
        .max_results(100)
        .next_cursor(nextCursor)
        .execute();

      all = all.concat(result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    const tree = {};

    all.forEach(r => {
      let group = 'root';
      const prefix = 'portfolio/';

      if (r.public_id.startsWith(prefix)) {
        const remainder = r.public_id.slice(prefix.length); 
        const subParts = remainder.split('/');
        if (subParts.length > 1) {
          group = subParts[0];
        }
      }

      let url = r.secure_url;
      if (url.includes('/upload/')) {
        url = url.replace('/upload/', '/upload/f_auto,q_auto/');
      }

      if (!tree[group]) tree[group] = [];

      tree[group].push({
        url,
        display_name: r.context?.custom?.display_name || '',
        public_id: r.public_id,
        width: r.width,
        height: r.height
      });
    });

    return tree;
  }

  // Lấy hình nền (bất kỳ ảnh nào từ portfolio root, không phải subfolder)
  static async fetchBackgroundImage() {
    try {
      const result = await cloudinary.search
        .expression('folder:portfolio')
        .max_results(100)
        .execute();

      console.log('Background search result:', result);

      // Filter: chỉ lấy ảnh ở portfolio root (không có / thêm trong public_id)
      const rootImages = result.resources.filter(r => {
        const pathAfterPortfolio = r.public_id.replace('portfolio/', '');
        return !pathAfterPortfolio.includes('/'); // Không có subfolder
      });

      if (rootImages && rootImages.length > 0) {
        const r = rootImages[0]; // Lấy ảnh đầu tiên
        let url = r.secure_url;
        if (url.includes('/upload/')) {
          url = url.replace('/upload/', '/upload/f_auto,q_auto/');
        }
        return {
          url,
          display_name: r.context?.custom?.display_name || 'Background',
          public_id: r.public_id,
          width: r.width,
          height: r.height
        };
      }

      throw new Error('No background image found in portfolio root folder');
    } catch (error) {
      console.error('fetchBackgroundImage error:', error);
      throw error;
    }
  }

  // Lấy hình từ subfolder (portrait, wabi-sabi, street-photo)
  static async fetchImagesByFolder(folderName) {
    try {
      let all = [];
      let nextCursor = null;

      do {
        const result = await cloudinary.search
          .expression(`folder:portfolio/${folderName}`)
          .sort_by('public_id', 'asc')
          .max_results(100)
          .next_cursor(nextCursor)
          .execute();

        console.log(`Folder ${folderName} search result:`, result);

        all = all.concat(result.resources);
        nextCursor = result.next_cursor;
      } while (nextCursor);

      return all.map(r => {
        let url = r.secure_url;
        if (url.includes('/upload/')) {
          url = url.replace('/upload/', '/upload/f_auto,q_auto/');
        }

        return {
          url,
          display_name: r.context?.custom?.display_name || '',
          public_id: r.public_id,
          width: r.width,
          height: r.height
        };
      });
    } catch (error) {
      console.error(`fetchImagesByFolder(${folderName}) error:`, error);
      throw error;
    }
  }
}

module.exports = CloudinaryModel;