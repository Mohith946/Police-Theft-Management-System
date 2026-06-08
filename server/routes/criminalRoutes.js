const express = require('express');
const router = express.Router();
const {
  getCriminals,
  getCriminalById,
  createCriminal,
  updateCriminal,
  deleteCriminal
} = require('../controllers/criminalController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadCriminal } = require('../config/multerConfig');
const { handleUploadError } = require('../middleware/uploadMiddleware');

// All criminal routes are protected and restricted to police officers and admins
router.use(protect);
router.use(authorize('officer', 'admin'));

router.route('/')
  .get(getCriminals)
  .post(handleUploadError(uploadCriminal.single('photo')), createCriminal);

router.route('/:id')
  .get(getCriminalById)
  .put(handleUploadError(uploadCriminal.single('photo')), updateCriminal)
  .delete(authorize('admin'), deleteCriminal); // Only admins can delete criminal entries

module.exports = router;
