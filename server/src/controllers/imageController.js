const CloudinaryModel = require('../models/cloudinaryModel');

class ImageController {
  static async getImagesByFolder(req, res) {
    const folder = req.params.folder;
    if (!folder) {
      return res.status(400).json({ error: 'Folder required' });
    }

    try {
      const images = await CloudinaryModel.fetchImagesFromFolder(folder);
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: 'Fetch failed' });
    }
  }
}

module.exports = ImageController; 