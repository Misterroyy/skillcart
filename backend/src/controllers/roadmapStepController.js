  const CommonController = require('./commonController');
const CommonModel = require("../models/CommonModel");


const TABLE_NAME = 'roadmap_steps';

class RoadmapStepController {
    static async addStep(req, res) {
        try {
            const { roadmap_id, week_number, title, description } = req.body;

            if (!roadmap_id || !week_number || !title) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const stepData = { roadmap_id, week_number, title, description };
            const stepId = await CommonController.insertRecord(TABLE_NAME, stepData);

            res.status(201).json({ message: 'Step added', step_id: stepId });
        } catch (error) {
            console.error('Error adding roadmap step:', error);
            res.status(500).json({ error: 'Failed to add roadmap step' });
        }
    }

    // 📄 Get steps by roadmap ID
    static async getStepsByRoadmap(req, res) {
        try {
            const { roadmapId } = req.params;

            const steps = await CommonController.getRecords({
                tableName: TABLE_NAME,
                conditions: { roadmap_id: roadmapId },
                orderBy: 'week_number ASC'
            });

            res.status(200).json({ roadmap_id: roadmapId, steps });
        } catch (error) {
            console.error('Error fetching roadmap steps:', error);
            res.status(500).json({ error: 'Failed to fetch steps' });
        }
    }
}

module.exports = RoadmapStepController;
