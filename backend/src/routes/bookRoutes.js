const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireStaff } = require('../middlewares/roleMiddleware');

// Public routes
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBookById);

// Staff routes (ADMIN & BOOK_MANAGER)
router.post('/', authMiddleware, requireStaff, bookController.createBook);
router.put('/:id', authMiddleware, requireStaff, bookController.updateBook);
router.patch('/:id/restore', authMiddleware, requireStaff, bookController.restoreBook);
router.put('/:id/restore', authMiddleware, requireStaff, bookController.restoreBook);
router.delete('/:id', authMiddleware, requireStaff, bookController.deleteBook);

module.exports = router;
