const db = require('../config/db');

class UserRoadmapController {
  // Join a roadmap
  static async joinRoadmap(req, res) {
    try {
      const { user_id, roadmap_id } = req.body;

      if (!user_id || !roadmap_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user has already joined this roadmap
      const existingJoin = await db('user_roadmaps')
        .where({ user_id, roadmap_id })
        .first();

      if (existingJoin) {
        return res.status(400).json({ error: 'User has already joined this roadmap' });
      }

      // Join the roadmap
      await db('user_roadmaps').insert({
        user_id,
        roadmap_id,
        joined_at: db.fn.now(),
        status: 'active'
      });

      // Get roadmap details to return
      const roadmap = await db('roadmaps')
        .join('skills', 'roadmaps.skill_id', 'skills.id')
        .where('roadmaps.id', roadmap_id)
        .select(
          'roadmaps.id',
          'roadmaps.duration_weeks',
          'skills.name as title',
          'skills.description'
        )
        .first();

      return res.status(201).json({
        message: 'Successfully joined roadmap',
        roadmap
      });
    } catch (error) {
      console.error('Error joining roadmap:', error);
      return res.status(500).json({ error: 'Failed to join roadmap' });
    }
  }

  // Get user's roadmaps
  static async getUserRoadmaps(req, res) {
    try {
      const { userId } = req.params;

      // Get all roadmaps joined by the user
      const userRoadmaps = await db('user_roadmaps')
        .join('roadmaps', 'user_roadmaps.roadmap_id', 'roadmaps.id')
        .join('skills', 'roadmaps.skill_id', 'skills.id')
        .where('user_roadmaps.user_id', userId)
        .select(
          'roadmaps.id',
          'roadmaps.duration_weeks',
          'skills.name as title',
          'skills.description',
          'user_roadmaps.status',
          'user_roadmaps.joined_at'
        );

      // For each roadmap, get progress information
      for (let roadmap of userRoadmaps) {
        // Get total steps in the roadmap
        const totalSteps = await db('roadmap_steps')
          .where('roadmap_id', roadmap.id)
          .count('id as count')
          .first();

        // Get completed steps for this user and roadmap
        const completedSteps = await db('user_step_progress')
          .join('roadmap_steps', 'user_step_progress.step_id', 'roadmap_steps.id')
          .where({
            'roadmap_steps.roadmap_id': roadmap.id,
            'user_step_progress.user_id': userId,
            'user_step_progress.status': 'completed'
          })
          .count('user_step_progress.step_id as count')
          .first();

        // Calculate progress percentage
        roadmap.total_steps = totalSteps.count;
        roadmap.completed_steps = completedSteps.count;
        roadmap.progress_percentage = totalSteps.count > 0 
          ? Math.round((completedSteps.count / totalSteps.count) * 100) 
          : 0;
      }

      return res.status(200).json({ roadmaps: userRoadmaps });
    } catch (error) {
      console.error('Error fetching user roadmaps:', error);
      return res.status(500).json({ error: 'Failed to fetch user roadmaps' });
    }
  }
}

module.exports = UserRoadmapController;
