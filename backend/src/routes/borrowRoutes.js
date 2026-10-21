const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const authMiddleware = require('../middlewares/authMiddleware');
const borrowCheck = require('../middlewares/borrowCheck');
const { requireUser, requireStaff } = require('../middlewares/roleMiddleware');
const { borrowLimiter } = require('../middlewares/rateLimiter');

// Reader routes (USER)
router.post('/', authMiddleware, requireUser, borrowLimiter, borrowCheck, borrowController.requestBorrow);
router.get('/my-borrows', authMiddleware, requireUser, borrowController.getMyBorrows);
router.get('/my-history', authMiddleware, requireUser, borrowController.getMyBorrows);
router.put('/:id/cancel', authMiddleware, requireUser, borrowController.cancelMyBorrow);
router.patch('/:id/cancel', authMiddleware, requireUser, borrowController.cancelMyBorrow);
router.put('/:id/renew', authMiddleware, requireUser, borrowController.renewBorrow);
router.patch('/:id/renew', authMiddleware, requireUser, borrowController.renewBorrow);

// Staff routes (ADMIN & BOOK_MANAGER)
router.get('/', authMiddleware, requireStaff, borrowController.getAllBorrows);
router.put('/:id/approve', authMiddleware, requireStaff, borrowController.approveBorrow);
router.put('/:id/reject', authMiddleware, requireStaff, borrowController.rejectBorrow);
router.put('/:id/checkout', authMiddleware, requireStaff, borrowController.checkoutBorrow);
router.put('/:id/checkin', authMiddleware, requireStaff, borrowController.checkinBorrow);

module.exports = router;
