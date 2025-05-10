const db = require('../config/db'); // Adjust path based on your structure

class ProgressController {
  static async updateProgress(req, res) {
    const { user_id, step_id, status } = req.body;

    if (!user_id || !step_id || !['completed', 'in_progress'].includes(status)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    try {
      const existing = await db('user_step_progress')
        .where({ user_id, step_id })
        .first();

      if (existing) {
        await db('user_step_progress')
          .where({ user_id, step_id })
          .update({ status });
        return res.status(200).json({ message: 'Progress updated' });
      } else {
        await db('user_step_progress')
          .insert({ user_id, step_id, status });
        return res.status(201).json({ message: 'Progress recorded' });
      }
    } catch (err) {
      console.error('Progress update error:', err);
      res.status(500).json({ error: 'Failed to update progress' });
    }
  }

  static async getUserProgress(req, res) {
    const { userId } = req.params;
    try {
      const rows = await db('user_step_progress as usp')
        .join('roadmap_steps as rs', 'usp.step_id', 'rs.id')
        .select('usp.*', 'rs.title as step_title', 'rs.week_number', 'rs.roadmap_id')
        .where('usp.user_id', userId);

      res.status(200).json({ user_id: userId, progress: rows });
    } catch (err) {
      console.error('Get progress error:', err);
      res.status(500).json({ error: 'Failed to get progress' });
    }
  }
}

module.exports = ProgressController;
