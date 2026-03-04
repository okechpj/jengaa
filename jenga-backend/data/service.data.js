const db = require("../config/firestore");
const { FieldValue } = require("firebase-admin/firestore");

const COLLECTION_NAME = "services";
const collection = db.collection(COLLECTION_NAME);
const VALID_CATEGORIES = [
  "cleaning",
  "plumbing",
  "electrical",
  "carpentry",
  "painting",
  "landscaping",
  "hvac",
  "appliance-repair"
];

// Category metadata for frontend display
const CATEGORY_METADATA = {
  cleaning: {
    name: "Cleaning",
    description: "Professional Cleaners",
    icon: "Droplet",
    color: "text-cyan-500",
    bg: "bg-cyan-50",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80"
  },
  plumbing: {
    name: "Plumbing",
    description: "Expert Plumbers",
    icon: "Wrench",
    color: "text-blue-500",
    bg: "bg-blue-50",
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=400&q=80"
  },
  electrical: {
    name: "Electrical",
    description: "Certified Electricians",
    icon: "Zap",
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80"
  },
  carpentry: {
    name: "Carpentry",
    description: "Skilled Carpenters",
    icon: "Hammer",
    color: "text-amber-600",
    bg: "bg-amber-50",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80"
  },
  painting: {
    name: "Painting",
    description: "Professional Painters",
    icon: "Paintbrush",
    color: "text-purple-500",
    bg: "bg-purple-50",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80"
  },
  landscaping: {
    name: "Landscaping",
    description: "Garden & Lawn Experts",
    icon: "Trees",
    color: "text-green-500",
    bg: "bg-green-50",
    image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=400&q=80"
  },
  hvac: {
    name: "HVAC",
    description: "Heating & Cooling",
    icon: "Wind",
    color: "text-sky-500",
    bg: "bg-sky-50",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80"
  },
  "appliance-repair": {
    name: "Appliance Repair",
    description: "Home Appliance Fixes",
    icon: "Briefcase",
    color: "text-orange-500",
    bg: "bg-orange-50",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80"
  }
};

/**
 * Gets all available categories with metadata
 * @returns {Array} Array of category objects
 */
const getAllCategories = () => {
  return VALID_CATEGORIES.map(slug => ({
    slug,
    ...CATEGORY_METADATA[slug]
  }));
};

/**
 * Validates required and allowed fields for service creation/update
 */
const validateServiceData = (data, isUpdate = false) => {
  const errors = [];

  // Check for unknown fields
  const allowedFields = [
    "title",
    "description",
    "category",
    "price"
  ];
  const providedFields = Object.keys(data);
  const unknownFields = providedFields.filter(f => !allowedFields.includes(f));

  if (unknownFields.length > 0) {
    errors.push(`Unknown fields: ${unknownFields.join(", ")}`);
  }

  // Validate required fields for creation
  if (!isUpdate) {
    if (!data.title || typeof data.title !== "string") {
      errors.push("title is required and must be a string");
    }
    if (!data.description || typeof data.description !== "string") {
      errors.push("description is required and must be a string");
    }
    if (!data.category || typeof data.category !== "string") {
      errors.push("category is required and must be a string");
    }
    if (data.price === undefined || typeof data.price !== "number") {
      errors.push("price is required and must be a number");
    }
  }

  // Validate optional fields for updates
  if (isUpdate) {
    if (data.title !== undefined && typeof data.title !== "string") {
      errors.push("title must be a string");
    }
    if (data.description !== undefined && typeof data.description !== "string") {
      errors.push("description must be a string");
    }
    if (data.category !== undefined && typeof data.category !== "string") {
      errors.push("category must be a string");
    }
    if (data.price !== undefined && typeof data.price !== "number") {
      errors.push("price must be a number");
    }
  }

  // Validate category if provided
  if (data.category && !VALID_CATEGORIES.includes(data.category)) {
    errors.push(
      `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`
    );
  }

  // Validate price is non-negative
  if (data.price !== undefined && data.price < 0) {
    errors.push("price must be greater than or equal to 0");
  }

  // Validate string lengths
  if (data.title && data.title.trim().length === 0) {
    errors.push("title cannot be empty");
  }
  if (data.description && data.description.trim().length === 0) {
    errors.push("description cannot be empty");
  }

  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }
};

/**
 * Trims all string fields in the data object
 */
const trimStringFields = (data) => {
  const trimmed = {};
  Object.keys(data).forEach(key => {
    if (typeof data[key] === "string") {
      trimmed[key] = data[key].trim();
    } else {
      trimmed[key] = data[key];
    }
  });
  return trimmed;
};

/**
 * Creates a new service
 * @param {string} providerId - Provider's UID
 * @param {string} providerName - Provider's name
 * @param {object} serviceData - { title, description, category, price }
 * @returns {object} Created service with ID
 */
const createService = async (providerId, providerName, serviceData) => {
  if (!providerId) throw new Error("providerId is required");
  if (!providerName) throw new Error("providerName is required");

  validateServiceData(serviceData);
  const trimmedData = trimStringFields(serviceData);

  const docRef = await collection.add({
    providerId,
    providerName,
    title: trimmedData.title,
    description: trimmedData.description,
    category: trimmedData.category,
    price: trimmedData.price,
    ratingAverage: 0,
    reviewsCount: 0,
    isActive: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  return getServiceById(docRef.id);
};

/**
 * Gets all active services with pagination and optional filters
 * @param {object} options - { limit, startAfter, category, minPrice, maxPrice, orderBy }
 * @returns {object} { services, hasMore }
 */
const getAllServices = async (options = {}) => {
  const {
    limit = 10,
    startAfter = null,
    category = null,
    minPrice = null,
    maxPrice = null,
    orderBy = "createdAt"
  } = options;

  // Validate pagination
  if (limit < 1 || limit > 100) {
    throw new Error("limit must be between 1 and 100");
  }

  // Validate orderBy
  const validOrderBy = ["createdAt", "ratingAverage"];
  if (!validOrderBy.includes(orderBy)) {
    throw new Error(`orderBy must be one of: ${validOrderBy.join(", ")}`);
  }

  // Start with filtering for active services
  let query = collection.where("isActive", "==", true);

  // Apply category filter
  if (category) {
    if (!VALID_CATEGORIES.includes(category)) {
      throw new Error(
        `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`
      );
    }
    query = query.where("category", "==", category);
  }

  // Apply price filters
  if (minPrice !== null) {
    if (typeof minPrice !== "number" || minPrice < 0) {
      throw new Error("minPrice must be a non-negative number");
    }
    query = query.where("price", ">=", minPrice);
  }

  if (maxPrice !== null) {
    if (typeof maxPrice !== "number" || maxPrice < 0) {
      throw new Error("maxPrice must be a non-negative number");
    }
    query = query.where("price", "<=", maxPrice);
  }

  // Order by selected field (descending for ratingAverage, descending for createdAt)
  query = query.orderBy(orderBy, "desc");

  // Apply pagination
  if (startAfter) {
    const lastDocSnapshot = await collection.doc(startAfter).get();
    if (!lastDocSnapshot.exists) {
      throw new Error("Invalid startAfter parameter");
    }
    query = query.startAfter(lastDocSnapshot);
  }

  // Fetch one extra document to determine hasMore
  const snapshot = await query.limit(limit + 1).get();

  const hasMore = snapshot.docs.length > limit;
  const docs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs;

  const services = docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return {
    services,
    hasMore,
    nextPageStartAfter: hasMore ? docs[docs.length - 1].id : null
  };
};

/**
 * Gets a service by ID
 * @param {string} id - Service ID
 * @returns {object} Service document or null
 */
const getServiceById = async (id) => {
  if (!id) throw new Error("Service ID is required");

  const doc = await collection.doc(id).get();
  if (!doc.exists) return null;

  const data = doc.data();

  // Return 404 if service is inactive
  if (!data.isActive) return null;

  return {
    id: doc.id,
    ...data
  };
};

/**
 * Gets services by provider ID
 * @param {string} providerId - Provider's UID
 * @param {object} options - Pagination and filter options
 * @returns {object} { services, hasMore }
 */
const getServicesByProviderId = async (providerId, options = {}) => {
  if (!providerId) throw new Error("providerId is required");

  const { limit = 10, startAfter = null, includeInactive = false } = options;

  if (limit < 1 || limit > 100) {
    throw new Error("limit must be between 1 and 100");
  }

  let query = collection.where("providerId", "==", providerId);

  if (!includeInactive) {
    query = query.where("isActive", "==", true);
  }

  // query = query.orderBy("createdAt", "desc"); // Requires index

  if (startAfter) {
    const lastDocSnapshot = await collection.doc(startAfter).get();
    if (!lastDocSnapshot.exists) {
      throw new Error("Invalid startAfter parameter");
    }
    query = query.startAfter(lastDocSnapshot);
  }

  const snapshot = await query.limit(limit + 1).get();
  const hasMore = snapshot.docs.length > limit;
  const docs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs;

  const services = docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return {
    services,
    hasMore,
    nextPageStartAfter: hasMore ? docs[docs.length - 1].id : null
  };
};

/**
 * Updates a service
 * @param {string} id - Service ID
 * @param {string} providerId - Provider's UID (for ownership verification)
 * @param {object} updateData - Fields to update { title, description, category, price }
 * @returns {object} Updated service
 */
const updateService = async (id, providerId, updateData) => {
  if (!id) throw new Error("Service ID is required");
  if (!providerId) throw new Error("providerId is required");

  const doc = await collection.doc(id).get();
  if (!doc.exists) throw new Error("Service not found");

  const currentData = doc.data();

  // Verify ownership
  if (currentData.providerId !== providerId) {
    throw new Error("Unauthorized: You can only update your own services");
  }

  // Validate update data (allowing partial updates)
  validateServiceData(updateData, true);
  const trimmedData = trimStringFields(updateData);

  // Check for protected fields
  const protectedFields = [
    "providerId",
    "ratingAverage",
    "reviewsCount",
    "createdAt"
  ];
  const attemptedProtectedFields = Object.keys(trimmedData).filter(f =>
    protectedFields.includes(f)
  );

  if (attemptedProtectedFields.length > 0) {
    throw new Error(
      `Cannot update protected fields: ${attemptedProtectedFields.join(", ")}`
    );
  }

  // Prepare update object
  const updateObject = {
    ...trimmedData,
    updatedAt: FieldValue.serverTimestamp()
  };

  await collection.doc(id).update(updateObject);

  return getServiceById(id);
};

/**
 * Deletes a service (soft delete if bookings exist, hard delete otherwise)
 * @param {string} id - Service ID
 * @param {string} providerId - Provider's UID (for ownership verification)
 * @returns {object} Result of deletion
 */
const deleteService = async (id, providerId) => {
  if (!id) throw new Error("Service ID is required");
  if (!providerId) throw new Error("providerId is required");

  const doc = await collection.doc(id).get();
  if (!doc.exists) throw new Error("Service not found");

  const currentData = doc.data();

  // Verify ownership
  if (currentData.providerId !== providerId) {
    throw new Error("Unauthorized: You can only delete your own services");
  }

  // Check if bookings exist for this service
  const bookingsCollection = db.collection("bookings");
  const bookingsSnapshot = await bookingsCollection
    .where("serviceId", "==", id)
    .limit(1)
    .get();

  const hasBookings = !bookingsSnapshot.empty;

  if (hasBookings) {
    // Soft delete: set isActive to false
    await collection.doc(id).update({
      isActive: false,
      updatedAt: FieldValue.serverTimestamp()
    });

    return {
      success: true,
      message: "Service soft deleted (bookings exist)",
      deleted: false,
      softDeleted: true
    };
  } else {
    // Hard delete: remove the document
    await collection.doc(id).delete();

    return {
      success: true,
      message: "Service hard deleted",
      deleted: true,
      softDeleted: false
    };
  }
};

/**
 * Updates service rating (internal use only)
 * Called after review operations
 */
const updateServiceRating = async (serviceId, ratingAverage, reviewsCount) => {
  if (!serviceId) throw new Error("Service ID is required");
  if (typeof ratingAverage !== "number" || ratingAverage < 0 || ratingAverage > 5) {
    throw new Error("ratingAverage must be a number between 0 and 5");
  }
  if (typeof reviewsCount !== "number" || reviewsCount < 0) {
    throw new Error("reviewsCount must be a non-negative number");
  }

  const doc = await collection.doc(serviceId).get();
  if (!doc.exists) throw new Error("Service not found");

  await collection.doc(serviceId).update({
    ratingAverage,
    reviewsCount,
    updatedAt: FieldValue.serverTimestamp()
  });

  return getServiceById(serviceId);
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  getServicesByProviderId,
  updateService,
  deleteService,
  updateServiceRating,
  getAllCategories
};
