const express = require("express");
const router = express.Router();
const {
  createService,
  getAllServices,
  getServiceById,
  getServicesByProviderId,
  updateService,
  deleteService,
  getCategories
} = require("../controllers/service.controller");
const { authenticate, requireProvider, requireAdmin } = require("../middleware/auth");

/**
 * GET /services/categories
 * Public - returns available categories
 */
router.get("/categories", getCategories);

/**
 * POST /services
 * Create a new service (Provider only)
 */
router.post("/", authenticate, requireProvider, createService);

/**
 * GET /services
 * Public - list active services with optional filters
 */
router.get("/", getAllServices);

/**
 * GET /services/provider/:providerId
 * Get services for a provider (authenticated)
 */
router.get("/provider/:providerId", authenticate, getServicesByProviderId);

/**
 * GET /services/:id
 * Public - get a specific service by ID
 */
router.get("/:id", getServiceById);

/**
 * PATCH /services/:id
 * Update a service (Provider only, ownership verified)
 */
router.patch("/:id", authenticate, requireProvider, updateService);

/**
 * DELETE /services/:id
 * Delete a service (Provider + Admin checks as configured in controller)
 */
router.delete("/:id", authenticate, requireProvider, requireAdmin, deleteService);

module.exports = router;
