import ImageModel from './imageModel.js';

class StateModel {
  constructor() {
    this.state = {
      images: [],
      loading: false,
      error: null,
      currentFolder: null
    };
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  async fetchImages(folder) {
    this.setState({ 
      loading: true, 
      error: null, 
      currentFolder: folder,
      images: []
    });

    try {
      const images = await ImageModel.fetchImages(folder);
      this.setState({ 
        images, 
        loading: false,
        error: null
      });
    } catch (error) {
      this.setState({ 
        error: error.message || 'Failed to load portfolio images. Please check your connection.', 
        loading: false,
        images: []
      });
    }
  }
}

export default new StateModel(); 