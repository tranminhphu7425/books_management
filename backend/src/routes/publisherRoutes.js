const express = require('express');
const router = express.Router();
const publisherController = require('../controllers/publisherController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireAdmin, requireStaff } = require('../middlewares/roleMiddleware');

// Public
router.get('/', publisherController.getPublishers);
router.get('/:id', publisherController.getPublisherById);

// Staff (ADMIN & BOOK_MANAGER)
router.post('/', authMiddleware, requireStaff, publisherController.createPublisher);
router.put('/:id', authMiddleware, requireStaff, publisherController.updatePublisher);

// Admin only
router.delete('/:id', authMiddleware, requireAdmin, publisherController.deletePublisher);

module.exports = router;
