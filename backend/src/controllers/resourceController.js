const CommonController = require('./commonController');
const CommonModel = require("../models/CommonModel");
const QuizController = require('./quizController');

const RESOURCE_TABLE = 'resources';
const QUIZ_TABLE = 'quizzes';

class ResourceController {
    
    static async addResource(req, res) {
        try {
            const { step_id, type, title, url, quiz_data } = req.body;

            // Validate required fields based on resource type
            if (!step_id || !type || !title) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // For non-quiz resources, URL is required
            if (type !== 'quiz' && !url) {
                return res.status(400).json({ error: 'URL is required for non-quiz resources' });
            }

            // For quiz resources, quiz_data is required
            if (type === 'quiz' && (!quiz_data || !quiz_data.question || !quiz_data.options || !quiz_data.correct_answer)) {
                return res.status(400).json({ error: 'Quiz data is incomplete' });
            }

            // Create the resource record
            const data = { 
                step_id, 
                type, 
                title, 
                url: type === 'quiz' ? '#quiz' : url // Use placeholder for quiz resources
            };
            const resource_id = await CommonController.insertRecord(RESOURCE_TABLE, data);

            // If this is a quiz resource, create the quiz record
            if (type === 'quiz' && quiz_data) {
                const quizData = {
                    resource_id,
                    question: quiz_data.question,
                    options: typeof quiz_data.options === 'string' ? quiz_data.options : JSON.stringify(quiz_data.options),
                    correct_answer: quiz_data.correct_answer
                };
                
                await CommonController.insertRecord(QUIZ_TABLE, quizData);
            }

            res.status(201).json({ 
                message: 'Resource added', 
                resource_id,
                type
            });
        } catch (error) {
            console.error('Error adding resource:', error);
            res.status(500).json({ error: 'Failed to add resource', details: error.message });
        }
    }

    // 📄 Get resources for a specific step
    static async getResourcesByStep(req, res) {
        try {
            const { stepId } = req.params;
            const { user_id } = req.query; // Optional: for tracking progress if needed

            const resources = await CommonController.getRecords({
                tableName: RESOURCE_TABLE,
                conditions: { step_id: stepId }
            });

            // Fetch quiz data for quiz resources
            for (let resource of resources) {
                if (resource.type === 'quiz') {
                    try {
                        const quiz = await CommonModel.findOne(QUIZ_TABLE, { resource_id: resource.id });
                        if (quiz) {
                            // Parse options from JSON string
                            quiz.options = JSON.parse(quiz.options);
                            
                            // For learners, don't send the correct answer
                            if (req.user && req.user.role !== 'curator') {
                                delete quiz.correct_answer;
                            }
                            
                            resource.quiz_data = quiz;
                        }
                    } catch (quizError) {
                        console.error('Error fetching quiz data:', quizError);
                    }
                }
            }

            res.status(200).json({ step_id: stepId, resources });
        } catch (error) {
            console.error('Error fetching resources:', error);
            res.status(500).json({ error: 'Failed to fetch resources', details: error.message });
        }
    }

    // 🗑️ Delete a resource
    static async deleteResource(req, res) {
        try {
            const { resourceId } = req.params;

            const deleted = await CommonModel.deleteById(RESOURCE_TABLE, resourceId);
            if (deleted) {
                res.status(200).json({ message: 'Resource deleted' });
            } else {
                res.status(404).json({ error: 'Resource not found' });
            }
        } catch (error) {
            console.error('Error deleting resource:', error);
            res.status(500).json({ error: 'Failed to delete resource' });
        }
    }
}

module.exports = ResourceController;
