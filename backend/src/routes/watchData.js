const express = require('express');
const router = express.Router();
const watchDataController = require('../controllers/watchDataController');
const { authenticate } = require('../middleware/auth');

router.get('/latest', authenticate, watchDataController.getLatestData);
router.get('/history', authenticate, watchDataController.getHistory);
router.post('/', authenticate, watchDataController.saveData);

module.exports = router;
