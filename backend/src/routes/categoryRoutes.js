const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireStaff, requireAdmin } = require('../middlewares/roleMiddleware');

// Route công khai cho độc giả và hệ thống
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Route quản trị cho ADMIN và Thủ thư (BOOK_MANAGER)
router.post('/', authMiddleware, requireStaff, categoryController.createCategory);
router.put('/:id', authMiddleware, requireStaff, categoryController.updateCategory);
router.delete('/:id', authMiddleware, requireAdmin, categoryController.deleteCategory);

module.exports = router;
