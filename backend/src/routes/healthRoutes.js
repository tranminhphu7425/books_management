const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// Public health check route
router.get('/', healthController.checkHealth);

module.exports = router;
