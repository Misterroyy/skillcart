const express = require('express');
const router = express.Router();
const RoadmapController = require('../controllers/roadmap.controller');

// Basic roadmap operations
router.post('/', RoadmapController.createRoadmap); // Create roadmap
router.get('/:roadmapId', RoadmapController.getRoadmapWithDetails); // Get roadmap with steps + resources
router.get('/', RoadmapController.listAllRoadmaps); // Admin/all roadmaps

// Gamification integration endpoints
router.post('/check-week-completion', RoadmapController.checkWeekCompletion); // Check if a week is completed and award XP
router.post('/check-roadmap-completion', RoadmapController.checkRoadmapCompletion); // Check if a roadmap is completed and award XP

module.exports = router;
