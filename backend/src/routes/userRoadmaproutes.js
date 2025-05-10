const express = require('express');
const router = express.Router();
const UserRoadmapController = require('../controllers/userRoadmapController');

// Join a roadmap
router.post('/join', UserRoadmapController.joinRoadmap);

// Get user's roadmaps
router.get('/:userId', UserRoadmapController.getUserRoadmaps);

module.exports = router;
