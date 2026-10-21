const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireStaff } = require('../middlewares/roleMiddleware');
const { uploadCover, uploadAvatar } = require('../middlewares/upload');

// Upload bìa sách (Staff only)
router.post('/cover', authMiddleware, requireStaff, uploadCover.single('cover'), uploadController.uploadCover);

// Upload avatar (All logged in users)
router.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), uploadController.uploadAvatar);

module.exports = router;
