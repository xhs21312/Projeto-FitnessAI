const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, nutritionController.getMeals);
router.post('/', authenticate, nutritionController.addMeal);
router.get('/pre-workout', authenticate, nutritionController.getPreWorkoutSuggestions);
router.get('/post-workout', authenticate, nutritionController.getPostWorkoutSuggestions);

module.exports = router;
