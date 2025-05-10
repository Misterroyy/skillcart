const express = require('express');
const router = express.Router();
const QuizController = require('../controllers/quizController');

// Routes
router.post('/', QuizController.addQuiz);                        // Add a new quiz
router.get('/resource/:resourceId', QuizController.getQuizByResourceId); // Get quiz by resource ID
router.put('/:quizId', QuizController.updateQuiz);               // Update a quiz
router.delete('/:quizId', QuizController.deleteQuiz);            // Delete a quiz
router.post('/:quizId/check', QuizController.checkAnswer);       // Check quiz answer

module.exports = router;
