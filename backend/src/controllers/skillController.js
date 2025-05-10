 const CommonController = require('./commonController');
const CommonModel = require("../models/CommonModel");


const SKILL_TABLE = 'skills';

class SkillController {
    // Create new skill
    static async createSkill(req, res) {
        try {
            const { name, description } = req.body;

            const skillData = { name, description };
            const id = await CommonController.insertRecord(SKILL_TABLE, skillData);

            res.status(201).json({ message: 'Skill created', skill_id: id });
        } catch (error) {
            console.error('Error creating skill:', error);
            res.status(500).json({ error: 'Failed to create skill' });
        }
    }

    // Get all skills
    static async listSkills(req, res) {
        try {
            const skills = await CommonModel.findAll(SKILL_TABLE);
            res.status(200).json({ skills });
        } catch (error) {
            console.error('Error fetching skills:', error);
            res.status(500).json({ error: 'Failed to fetch skills' });
        }
    }

    // Get skill by ID
    static async getSkillById(req, res) {
        try {
            const { skillId } = req.params;
            const skill = await CommonController.getRecordById(SKILL_TABLE, skillId);

            if (!skill) return res.status(404).json({ error: 'Skill not found' });
            res.status(200).json({ skill });
        } catch (error) {
            console.error('Error fetching skill:', error);
            res.status(500).json({ error: 'Failed to fetch skill' });
        }
    }
}

module.exports = SkillController;
