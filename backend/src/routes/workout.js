const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, workoutController.createWorkout);
router.get('/', authenticate, workoutController.getWorkouts);
router.get('/date/:date', authenticate, workoutController.getWorkoutsByDate);
router.patch('/:uuid/complete', authenticate, workoutController.completeWorkout);
router.patch('/:uuid/uncomplete', authenticate, workoutController.uncompleteWorkout);
router.delete('/:uuid', authenticate, workoutController.deleteWorkout);

module.exports = router;
