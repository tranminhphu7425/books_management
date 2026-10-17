const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireStaff, requireUser } = require('../middlewares/roleMiddleware');

// Reader routes (USER)
router.get('/my-fines', authMiddleware, requireUser, fineController.getMyFines);

// Staff routes (ADMIN & BOOK_MANAGER)
router.get('/', authMiddleware, requireStaff, fineController.getAllFines);
router.post('/', authMiddleware, requireStaff, fineController.createFine);
router.put('/:id/pay', authMiddleware, requireStaff, fineController.payFine);

module.exports = router;
