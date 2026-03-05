const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availability.controller');
const { authenticate, requireProvider } = require('../middleware/auth');

// GET /availability/services/:serviceId
router.get('/services/:serviceId', availabilityController.getAvailabilitiesForService);

// POST /availability/services/:serviceId  (provider only)
router.post('/services/:serviceId', authenticate, requireProvider, availabilityController.createAvailability);

// PATCH /availability/:id
router.patch('/:id', authenticate, requireProvider, availabilityController.updateAvailability);

// DELETE /availability/:id
router.delete('/:id', authenticate, requireProvider, availabilityController.deleteAvailability);

module.exports = router;
