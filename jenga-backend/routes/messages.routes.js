const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages.controller');
const { authenticate } = require('../middleware/auth');

// GET /messages/booking/:bookingId - get history
router.get('/booking/:bookingId', authenticate, messagesController.getMessagesForBooking);

module.exports = router;
