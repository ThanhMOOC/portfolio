const validateFolder = (req, res, next) => {
  const { folder } = req.params;
  
  if (!folder) {
    return res.status(400).json({
      status: 'error',
      message: 'Folder parameter is required'
    });
  }

  // Add any additional validation rules here
  if (folder.includes('..') || folder.includes('/')) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid folder name'
    });
  }

  next();
};

module.exports = {
  validateFolder
}; 