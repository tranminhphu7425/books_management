const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');

// Public route cho cả độc giả và quản trị xem quy chế lưu thông
router.get('/', settingController.getSettings);

// Route dành riêng cho Quản trị viên tối cao (ADMIN) cập nhật quy chế
router.put('/', authMiddleware, requireAdmin, settingController.updateSettings);

module.exports = router;

