class ImageModel {
  static async fetchImages(folder) {
    try {
      const response = await fetch(`/image-url/${folder}`);
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching images:', error);
      throw error;
    }
  }
}

export default ImageModel; 