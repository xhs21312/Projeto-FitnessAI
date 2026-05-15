const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.post('/message', authenticate, chatController.sendMessage);

module.exports = router;
