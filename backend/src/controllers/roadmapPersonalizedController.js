const db = require('../config/db');

/**
 * Get a personalized roadmap for a user based on their preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPersonalizedRoadmap = async (req, res) => {
  const userId = req.params.user_id;

  try {
    // Fetch preferences from users table
    const user = await db('users').where({ id: userId }).first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's interests, goals, and time commitment
    const { interests, goals, weekly_time } = user;
    
    // Calculate maximum duration based on weekly time commitment
    // A user with more weekly time can handle longer roadmaps
    const maxDuration = weekly_time * 4; // 4 weeks per hour of weekly commitment

    // Query for roadmaps that match user's interests and time constraints
    let roadmapsQuery = db('roadmaps')
      .join('skills', 'roadmaps.skill_id', 'skills.id')
      .select(
        'roadmaps.*',
        'skills.name as skill_name',
        'skills.description as skill_description'
      )
      .where('roadmaps.duration_weeks', '<=', maxDuration);
    
    // Apply interest filter if available
    if (interests) {
      // Split interests by comma if it's a comma-separated string
      const interestArray = typeof interests === 'string' ? 
        interests.split(',').map(i => i.trim()) : 
        [interests];
      
      // Build a where clause for each interest with OR condition
      roadmapsQuery = roadmapsQuery.where(function() {
        this.where('skills.name', 'like', `%${interestArray[0]}%`);
        
        for (let i = 1; i < interestArray.length; i++) {
          this.orWhere('skills.name', 'like', `%${interestArray[i]}%`);
        }
      });
    }
    
    // Apply goals filter if available
    if (goals) {
      roadmapsQuery = roadmapsQuery.where('roadmaps.description', 'like', `%${goals}%`);
    }
    
    // Order by relevance (more matching criteria = higher relevance)
    const roadmaps = await roadmapsQuery.orderBy('roadmaps.created_at', 'desc');

    if (!roadmaps || roadmaps.length === 0) {
      return res.status(404).json({ message: 'No suitable roadmaps found based on your preferences' });
    }

    // Get steps for each roadmap
    const roadmapsWithSteps = await Promise.all(roadmaps.map(async (roadmap) => {
      const steps = await db('roadmap_steps')
        .where({ roadmap_id: roadmap.id })
        .orderBy('week_number', 'asc')
        .orderBy('order_in_week', 'asc');
      
      return {
        ...roadmap,
        steps
      };
    }));

    res.status(200).json({ roadmaps: roadmapsWithSteps });
  } catch (err) {
    console.error('Error in getPersonalizedRoadmap:', err);
    res.status(500).json({ error: 'Error fetching personalized roadmap', detail: err.message });
  }
};

/**
 * Get personalized roadmap recommendations based on user activity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRecommendedRoadmaps = async (req, res) => {
  const userId = req.params.user_id;
  
  try {
    // Get user's completed roadmaps
    const completedRoadmaps = await db('user_roadmaps')
      .where({ user_id: userId, status: 'completed' })
      .select('roadmap_id');
    
    const completedRoadmapIds = completedRoadmaps.map(r => r.roadmap_id);
    
    // Get skills from completed roadmaps
    const relatedSkills = await db('roadmaps')
      .whereIn('id', completedRoadmapIds)
      .select('skill_id');
    
    const skillIds = relatedSkills.map(s => s.skill_id);
    
    // Find roadmaps with similar skills that user hasn't completed yet
    const recommendedRoadmaps = await db('roadmaps')
      .join('skills', 'roadmaps.skill_id', 'skills.id')
      .whereIn('roadmaps.skill_id', skillIds)
      .whereNotIn('roadmaps.id', completedRoadmapIds)
      .select(
        'roadmaps.*',
        'skills.name as skill_name',
        'skills.description as skill_description'
      )
      .limit(5);
    
    if (recommendedRoadmaps.length === 0) {
      // If no recommendations based on completed roadmaps, get popular roadmaps
      const popularRoadmaps = await db('roadmaps')
        .join('skills', 'roadmaps.skill_id', 'skills.id')
        .join('user_roadmaps', 'roadmaps.id', 'user_roadmaps.roadmap_id')
        .whereNotIn('roadmaps.id', completedRoadmapIds)
        .groupBy('roadmaps.id')
        .select(
          'roadmaps.*',
          'skills.name as skill_name',
          'skills.description as skill_description',
          db.raw('COUNT(user_roadmaps.id) as join_count')
        )
        .orderBy('join_count', 'desc')
        .limit(5);
      
      return res.status(200).json({ recommendations: popularRoadmaps });
    }
    
    res.status(200).json({ recommendations: recommendedRoadmaps });
  } catch (err) {
    console.error('Error in getRecommendedRoadmaps:', err);
    res.status(500).json({ error: 'Error fetching roadmap recommendations', detail: err.message });
  }
};

/**
 * Get trending roadmaps based on user activity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTrendingRoadmaps = async (req, res) => {
  try {
    // Get roadmaps with the most users joined in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const trendingRoadmaps = await db('roadmaps')
      .join('skills', 'roadmaps.skill_id', 'skills.id')
      .join('user_roadmaps', 'roadmaps.id', 'user_roadmaps.roadmap_id')
      .where('user_roadmaps.joined_at', '>=', thirtyDaysAgo)
      .groupBy('roadmaps.id')
      .select(
        'roadmaps.*',
        'skills.name as skill_name',
        'skills.description as skill_description',
        db.raw('COUNT(user_roadmaps.id) as join_count')
      )
      .orderBy('join_count', 'desc')
      .limit(5);
    
    res.status(200).json({ trending: trendingRoadmaps });
  } catch (err) {
    console.error('Error in getTrendingRoadmaps:', err);
    res.status(500).json({ error: 'Error fetching trending roadmaps', detail: err.message });
  }
};
