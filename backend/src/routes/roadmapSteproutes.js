const express = require('express');
const router = express.Router();
const RoadmapStepController = require('../controllers/roadmapStepController');

// Add a step to a roadmap
router.post('/', RoadmapStepController.addStep);

// Get steps for a given roadmap
router.get('/roadmap/:roadmapId', RoadmapStepController.getStepsByRoadmap);

module.exports = router;
