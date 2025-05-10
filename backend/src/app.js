const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // For handling CORS
const corsOptions = require('./middleware/corsOptions'); // Ensure this file exists and is correctly configured
const authRoutes = require('./routes/authroutes'); // Import authentication routes
const progressRoutes = require('./routes/progressroutes'); // Import progress routes
const discussionRoutes = require('./routes/discussionrroutes'); // Import discussion routes
const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(cors(corsOptions)); // Enable CORS with specified options
 
// Register routes with base path
app.use('/api/roadmaps', require('./routes/roadmaproutes')); // Routes for roadmaps
app.use('/api/resources', require('./routes/resourceroutes')); // Routes for resources
app.use('/api/steps' , require('./routes/roadmapSteproutes')); // Routes for roadmap steps
app.use('/api/skills', require('./routes/skillroutes')); // Routes for skills
app.use('/api/auth', authRoutes); // Routes for authentication
app.use('/api/progress', progressRoutes); // Routes for user progress
app.use('/api', discussionRoutes);
app.use('/api/gamification', require('./routes/gamificationroutes')); // Routes for gamification
app.use('/api/roadmap-personalized', require('./routes/roadmapPersonalizedroutes')); // Routes for personalized roadmaps
app.use('/api/user-roadmaps', require('./routes/userRoadmaproutes')); // Routes for user roadmaps
app.use('/api/quizzes', require('./routes/quizroutes')); // Routes for quizzes
// Default route for testing server
app.get('/', (req, res) => {
    res.send('Welcome to The Observer Post API');
});

module.exports = app;   
