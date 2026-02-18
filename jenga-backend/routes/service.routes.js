const express = require("express");
const router = express.Router();
const {
  createService,
  getAllServices,
  getServiceById,
  getServicesByProviderId,
  updateService,
  deleteService
} = require("../controllers/service.controller");
const { authenticate, requireProvider, requireAdmin } = require("../middleware/auth");
// Authentication removed from routes per request

/**
 * POST /services
 * Create a new service
 * Required: Authentication + PROVIDER role
 */
router.post("/", authenticate, requireProvider, createService);

/**
 * GET /services
 * Get all active services with pagination and optional filters
 * Required: Authentication
 * Query params: limit, startAfter, category, minPrice, maxPrice, orderBy
 */
router.get("/", getAllServices);

/**
 * GET /services/provider/:providerId
 * Get all services by a specific provider
 * Required: Authentication
 * Query params: limit, startAfter, includeInactive
 */
router.get("/provider/:providerId", authenticate, getServicesByProviderId);

/**
 * GET /services/:id
 * Get a specific service by ID
 * Required: Authentication
 */
router.get("/:id", authenticate, getServiceById);

/**
 * PATCH /services/:id
 * Update a service
 * Required: Authentication + PROVIDER role + ownership verification
 * Allowed fields: title, description, category, price
 */
router.patch("/:id", authenticate, requireProvider, updateService);

/**
 * DELETE /services/:id
 * Delete a service (soft or hard delete)
 * Required: Authentication + PROVIDER role + ownership verification
 * Soft delete if bookings exist, hard delete otherwise
 */
router.delete("/:id", authenticate, requireProvider, requireAdmin, deleteService);

module.exports = router;
