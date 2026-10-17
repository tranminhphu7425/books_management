const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireAdmin, requireStaff } = require('../middlewares/roleMiddleware');

// Tất cả routes yêu cầu đăng nhập
router.use(authMiddleware);

// Thủ thư & Admin có thể tra cứu chi tiết thông tin bạn đọc
router.get('/:id', requireStaff, userController.getUserById);

// Các thao tác quản trị cấp cao chỉ dành cho Admin
router.get('/', requireAdmin, userController.getUsers);
router.post('/', requireAdmin, userController.createStaff);
router.put('/:id/role', requireAdmin, userController.updateRole);
router.put('/:id/blacklist', requireAdmin, userController.toggleBlacklist);

module.exports = router;
