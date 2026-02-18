const serviceData = require("../data/service.data");

/**
 * POST /services
 * Create a new service
 */
const createService = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;

    // Require authenticated user
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }
    const providerId = req.user.uid;
    const providerName = req.user.name || "Unknown Provider";

    const service = await serviceData.createService(
      providerId,
      providerName,
      {
        title,
        description,
        category,
        price
      }
    );

    return res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /services
 * Get all active services with pagination and filters
 */
const getAllServices = async (req, res) => {
  try {
    const {
      limit = 10,
      startAfter = null,
      category = null,
      minPrice = null,
      maxPrice = null,
      orderBy = "createdAt"
    } = req.query;

    // Parse numeric values
    const parsedLimit = Math.min(parseInt(limit) || 10, 100);
    const parsedMinPrice = minPrice ? parseFloat(minPrice) : null;
    const parsedMaxPrice = maxPrice ? parseFloat(maxPrice) : null;

    const result = await serviceData.getAllServices({
      limit: parsedLimit,
      startAfter,
      category,
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
      orderBy
    });

    return res.json({
      success: true,
      data: result.services,
      pagination: {
        limit: parsedLimit,
        hasMore: result.hasMore,
        nextPageStartAfter: result.nextPageStartAfter
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /services/:id
 * Get a service by ID
 */
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await serviceData.getServiceById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found"
      });
    }

    return res.json({
      success: true,
      data: service
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /services/provider/:providerId
 * Get all services for a specific provider
 */
const getServicesByProviderId = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { limit = 10, startAfter = null, includeInactive = false } = req.query;

    const parsedLimit = Math.min(parseInt(limit) || 10, 100);
    const isIncludeInactive = includeInactive === "true";

    const result = await serviceData.getServicesByProviderId(providerId, {
      limit: parsedLimit,
      startAfter,
      includeInactive: isIncludeInactive
    });

    return res.json({
      success: true,
      data: result.services,
      pagination: {
        limit: parsedLimit,
        hasMore: result.hasMore,
        nextPageStartAfter: result.nextPageStartAfter
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * PATCH /services/:id
 * Update a service
 */
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, error: "Authentication required" });
    const providerId = req.user.uid;

    // Only allow updating specific fields
    const allowedFields = ["title", "description", "category", "price"];
    const updateData = {};

    allowedFields.forEach(field => {
      if (field in req.body) {
        updateData[field] = req.body[field];
      }
    });

    // Check if any disallowed fields were sent
    const sentFields = Object.keys(req.body);
    const disallowedFields = sentFields.filter(f => !allowedFields.includes(f));

    if (disallowedFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot update fields: ${disallowedFields.join(", ")}`
      });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid fields to update"
      });
    }

    const service = await serviceData.updateService(id, providerId, updateData);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found"
      });
    }

    return res.json({
      success: true,
      data: service
    });
  } catch (error) {
    // Check if it's an authorization error
    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * DELETE /services/:id
 * Delete a service (soft or hard delete)
 */
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, error: "Authentication required" });
    const providerId = req.user.uid;

    const result = await serviceData.deleteService(id, providerId);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    // Check if it's an authorization error
    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  getServicesByProviderId,
  updateService,
  deleteService
};
