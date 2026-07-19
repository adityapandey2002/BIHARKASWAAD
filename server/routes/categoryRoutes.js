const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/categories');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', categoryController.getAllCategories);
router.post('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), upload.single('image'), categoryController.createCategory);
router.delete('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), categoryController.deleteCategory);

module.exports = router;
