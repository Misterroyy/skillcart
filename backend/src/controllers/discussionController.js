const db = require('../config/db');

class DiscussionController {
  static async createDiscussion(req, res) {
    const { step_id, user_id, content } = req.body;

    if (!step_id || !user_id || !content) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      const [id] = await db('discussions').insert({ step_id, user_id, content });
      res.status(201).json({ message: 'Discussion created', discussion_id: id });
    } catch (error) {
      console.error('Create discussion error:', error);
      res.status(500).json({ error: 'Failed to create discussion' });
    }
  }

  static async replyToDiscussion(req, res) {
    const { discussion_id, user_id, reply } = req.body;

    if (!discussion_id || !user_id || !reply) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      const [id] = await db('discussion_replies').insert({ discussion_id, user_id, content: reply });
      res.status(201).json({ message: 'Reply added', reply_id: id });
    } catch (error) {
      console.error('Reply error:', error);
      res.status(500).json({ error: 'Failed to post reply' });
    }
  }

  static async getDiscussionsByStep(req, res) {
    const { stepId } = req.params;

    try {
      const discussions = await db('discussions')
        .where({ step_id: stepId })
        .orderBy('created_at', 'desc');

      for (const discussion of discussions) {
        const replies = await db('discussion_replies')
          .where({ discussion_id: discussion.id })
          .orderBy('created_at', 'asc');
        discussion.replies = replies;
      }

      res.status(200).json(discussions);
    } catch (error) {
      console.error('Fetch discussions error:', error);
      res.status(500).json({ error: 'Failed to fetch discussions' });
    }
  }
}

module.exports = DiscussionController;
