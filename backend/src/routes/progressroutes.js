const express = require('express');
const router = express.Router();
const ProgressController = require('../controllers/progressController');

// Update or create progress
router.post('/', ProgressController.updateProgress);

// Get all progress for a user
router.get('/:userId', ProgressController.getUserProgress);

module.exports = router;
