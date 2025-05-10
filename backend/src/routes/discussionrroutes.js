const express = require('express');
const router = express.Router();
const DiscussionController = require('../controllers/discussionController');

router.post('/discussions', DiscussionController.createDiscussion);
router.post('/discussions/reply', DiscussionController.replyToDiscussion);
router.get('/discussions/step/:stepId', DiscussionController.getDiscussionsByStep);

module.exports = router;
