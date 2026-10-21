const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');

// Public routes
router.post('/register', authLimiter, authController.register);

// Đăng nhập riêng biệt theo phân hệ cổng (Độc giả vs Quản trị)
router.post('/reader/login', authLimiter, authController.readerLogin);
router.post('/login/reader', authLimiter, authController.readerLogin);
router.post('/admin/login', authLimiter, authController.adminLogin);
router.post('/login/admin', authLimiter, authController.adminLogin);

// Route đăng nhập chung (hỗ trợ điều hướng tương thích ngược)
router.post('/login', authLimiter, authController.login);

router.post('/google', authLimiter, authController.googleLogin);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
