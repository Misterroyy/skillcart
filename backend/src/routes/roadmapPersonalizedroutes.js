const express = require('express');
const router = express.Router();
const { 
  getPersonalizedRoadmap,
  getRecommendedRoadmaps,
  getTrendingRoadmaps
} = require('../controllers/roadmapPersonalizedController');

// Get personalized roadmaps based on user preferences
router.get('/personalized/:user_id', getPersonalizedRoadmap);

// Get recommended roadmaps based on user's completed roadmaps
router.get('/recommended/:user_id', getRecommendedRoadmaps);

// Get trending roadmaps based on recent user activity
router.get('/trending', getTrendingRoadmaps);

module.exports = router;
