const handleUploadError = (uploadMiddlewareInstance) => {
  return (req, res, next) => {
    uploadMiddlewareInstance(req, res, (err) => {
      if (err) {
        console.error('File upload error caught:', err.message);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }
      next();
    });
  };
};

module.exports = { handleUploadError };
