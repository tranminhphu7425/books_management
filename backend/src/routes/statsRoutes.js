const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireStaff, requireAdmin } = require('../middlewares/roleMiddleware');

// Staff routes (Dashboard metrics)
router.get('/summary', authMiddleware, requireStaff, statsController.getSummary);
router.get('/top-books', authMiddleware, requireStaff, statsController.getTopBooks);
router.get('/damage-overview', authMiddleware, requireStaff, statsController.getDamageOverview);

// Admin routes (Exports & Audit Trail)
router.get('/export/borrows', authMiddleware, requireAdmin, statsController.exportBorrowsCSV);
router.get('/export/fines', authMiddleware, requireAdmin, statsController.exportFinesCSV);
router.get('/audit-logs', authMiddleware, requireAdmin, statsController.getAuditLogs);

module.exports = router;
