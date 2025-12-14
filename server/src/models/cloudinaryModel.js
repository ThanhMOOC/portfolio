const cloudinary = require('../config/cloudinary');

class CloudinaryModel {
  static async fetchImagesFromFolder(folder) {
    try {
      let imageResources = [];
      let nextCursor = null;

      do {
        const result = await cloudinary.search
          .expression(`folder:${folder}/*`)
          .sort_by('public_id', 'desc')
          .max_results(100)
          .next_cursor(nextCursor)
          .execute();

        const imageUrls = result.resources.map(resource => {
          const displayName = resource.context?.custom?.display_name || '';

          let optimizedUrl = resource.secure_url;
          if (optimizedUrl.includes('/upload/')) {
             optimizedUrl = optimizedUrl.replace('/upload/', '/upload/f_auto,q_auto/');
          }

          return {
            url: optimizedUrl,
            display_name: displayName,
            public_id: resource.public_id
          };
        });

        imageResources = imageResources.concat(imageUrls);
        nextCursor = result.next_cursor;
      } while (nextCursor);

      return imageResources;
    } catch (error) {
      console.error('Error fetching images from Cloudinary:', error);
      throw error;
    }
  }
}

module.exports = CloudinaryModel; 