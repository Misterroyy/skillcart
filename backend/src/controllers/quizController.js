const CommonController = require('./commonController');
const CommonModel = require("../models/CommonModel");

const QUIZ_TABLE = 'quizzes';
const RESOURCE_TABLE = 'resources';

class QuizController {
    
    // Add a new quiz for a resource
    static async addQuiz(req, res) {
        try {
            const { resource_id, question, options, correct_answer } = req.body;

            if (!resource_id || !question || !options || !correct_answer) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Validate that the resource exists
            const resource = await CommonModel.findById(RESOURCE_TABLE, resource_id);
            if (!resource) {
                return res.status(404).json({ error: 'Resource not found' });
            }

            // Validate that the resource type is 'quiz'
            if (resource.type !== 'quiz') {
                return res.status(400).json({ error: 'Resource is not of type quiz' });
            }

            // Convert options to JSON if it's not already
            const optionsJson = typeof options === 'string' ? options : JSON.stringify(options);

            const data = { 
                resource_id, 
                question, 
                options: optionsJson, 
                correct_answer 
            };
            
            const id = await CommonController.insertRecord(QUIZ_TABLE, data);

            res.status(201).json({ 
                message: 'Quiz added successfully', 
                quiz_id: id 
            });
        } catch (error) {
            console.error('Error adding quiz:', error);
            res.status(500).json({ error: 'Failed to add quiz', details: error.message });
        }
    }

    // Get quiz by resource ID
    static async getQuizByResourceId(req, res) {
        try {
            const { resourceId } = req.params;

            // Validate that the resource exists
            const resource = await CommonModel.findById(RESOURCE_TABLE, resourceId);
            if (!resource) {
                return res.status(404).json({ error: 'Resource not found' });
            }

            // Get quiz for the resource
            const quiz = await CommonModel.findOne(QUIZ_TABLE, { resource_id: resourceId });
            
            if (!quiz) {
                return res.status(404).json({ error: 'Quiz not found for this resource' });
            }

            // Parse options from JSON string to object
            quiz.options = JSON.parse(quiz.options);

            res.status(200).json({ quiz });
        } catch (error) {
            console.error('Error fetching quiz:', error);
            res.status(500).json({ error: 'Failed to fetch quiz', details: error.message });
        }
    }

    // Update an existing quiz
    static async updateQuiz(req, res) {
        try {
            const { quizId } = req.params;
            const { question, options, correct_answer } = req.body;

            // Check if quiz exists
            const existingQuiz = await CommonModel.findById(QUIZ_TABLE, quizId);
            if (!existingQuiz) {
                return res.status(404).json({ error: 'Quiz not found' });
            }

            // Prepare update data
            const updateData = {};
            if (question) updateData.question = question;
            if (options) {
                updateData.options = typeof options === 'string' ? options : JSON.stringify(options);
            }
            if (correct_answer) updateData.correct_answer = correct_answer;

            // Update the quiz
            await CommonModel.update(QUIZ_TABLE, quizId, updateData);

            res.status(200).json({ message: 'Quiz updated successfully' });
        } catch (error) {
            console.error('Error updating quiz:', error);
            res.status(500).json({ error: 'Failed to update quiz', details: error.message });
        }
    }

    // Delete a quiz
    static async deleteQuiz(req, res) {
        try {
            const { quizId } = req.params;

            // Check if quiz exists
            const existingQuiz = await CommonModel.findById(QUIZ_TABLE, quizId);
            if (!existingQuiz) {
                return res.status(404).json({ error: 'Quiz not found' });
            }

            // Delete the quiz
            await CommonModel.deleteById(QUIZ_TABLE, quizId);

            res.status(200).json({ message: 'Quiz deleted successfully' });
        } catch (error) {
            console.error('Error deleting quiz:', error);
            res.status(500).json({ error: 'Failed to delete quiz', details: error.message });
        }
    }

    // Check quiz answer
    static async checkAnswer(req, res) {
        try {
            const { quizId } = req.params;
            const { answer } = req.body;

            if (!answer) {
                return res.status(400).json({ error: 'Answer is required' });
            }

            // Get the quiz
            const quiz = await CommonModel.findById(QUIZ_TABLE, quizId);
            if (!quiz) {
                return res.status(404).json({ error: 'Quiz not found' });
            }

            // Check if the answer is correct
            const isCorrect = answer === quiz.correct_answer;

            res.status(200).json({ 
                correct: isCorrect,
                correct_answer: isCorrect ? undefined : quiz.correct_answer
            });
        } catch (error) {
            console.error('Error checking answer:', error);
            res.status(500).json({ error: 'Failed to check answer', details: error.message });
        }
    }
}

module.exports = QuizController;
