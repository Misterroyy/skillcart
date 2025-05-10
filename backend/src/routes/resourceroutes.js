const express = require('express');
const router = express.Router();
const ResourceController = require('../controllers/resourceController');

// Routes
router.post('/', ResourceController.addResource);                      // Add resource to step
router.get('/step/:stepId', ResourceController.getResourcesByStep);    // Get all resources for a step
router.delete('/:resourceId', ResourceController.deleteResource);      // Delete resource by ID

module.exports = router;
