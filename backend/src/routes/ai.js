const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.get('/workout-suggestion', authenticate, aiController.getWorkoutSuggestion);
router.get('/recovery', authenticate, aiController.getRecoveryAnalysis);

module.exports = router;
