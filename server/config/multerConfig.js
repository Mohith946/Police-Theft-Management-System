const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist helper
const createDirIfNotExist = (dirPath) => {
  const absolutePath = path.resolve(__dirname, '..', dirPath);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
  return absolutePath;
};

// Storage configuration factory based on target type
const getStorage = (targetFolder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const destPath = createDirIfNotExist(`uploads/${targetFolder}`);
      cb(null, destPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });
};

// File type validator (accepts only images)
const imageFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
};

const uploadCriminal = multer({
  storage: getStorage('criminals'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadComplaint = multer({
  storage: getStorage('complaints'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadItem = multer({
  storage: getStorage('stolen-items'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = {
  uploadCriminal,
  uploadComplaint,
  uploadItem
};
