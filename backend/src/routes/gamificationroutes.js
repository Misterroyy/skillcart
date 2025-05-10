const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');

// POST route to update XP and badge
router.post('/update', gamificationController.updateGamification);

// GET for leaderboard data
router.get('/leaderboard/top', gamificationController.getLeaderboard);

// GET for achievements list
router.get('/achievements/list', gamificationController.getAchievements);

// GET for user gamification status (must be after specific routes)
router.get('/:user_id', gamificationController.getUserGamification);

module.exports = router;
