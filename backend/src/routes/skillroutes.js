const express = require('express');
const router = express.Router();
const SkillController = require('../controllers/skillController');

// Routes
router.post('/', SkillController.createSkill);        // Create new skill
router.get('/', SkillController.listSkills);          // Get all skills
router.get('/:skillId', SkillController.getSkillById); // Get skill by ID

module.exports = router;
