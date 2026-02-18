const db = require("../config/firestore");
const { FieldValue } = require("firebase-admin/firestore");
const serviceData = require("./service.data");

const COLLECTION_NAME = "bookings";
const collection = db.collection(COLLECTION_NAME);

const VALID_STATUSES = ["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED", "DECLINED"];

const validateCreateBooking = ({ serviceId, scheduledDate }) => {
  const errors = [];
  if (!serviceId || typeof serviceId !== "string") {
    errors.push("serviceId is required and must be a string");
  }
  if (!scheduledDate) {
    errors.push("scheduledDate is required");
  } else {
    const date = new Date(scheduledDate);
    if (isNaN(date.getTime())) {
      errors.push("scheduledDate must be a valid date");
    } else if (date <= new Date()) {
      errors.push("scheduledDate must be in the future");
    }
  }
  if (errors.length) throw new Error(errors.join("; "));
};

/**
 * Create booking with snapshot fields
 * Uses transaction to optionally prevent duplicate active booking for same service + scheduledDate
 */
const createBooking = async (clientId, clientName, { serviceId, scheduledDate }, options = {}) => {
  if (!clientId) throw new Error("clientId is required");
  if (!clientName) throw new Error("clientName is required");

  validateCreateBooking({ serviceId, scheduledDate });

  // Fetch service
  const service = await serviceData.getServiceById(serviceId);
  if (!service) throw new Error("Service not found or inactive");

  // Prevent provider booking own service
  if (service.providerId === clientId) {
    throw new Error("Providers cannot book their own services");
  }

  const scheduled = new Date(scheduledDate);

  // Optionally prevent duplicate active booking at same exact datetime
  const preventDuplicate = options.preventDuplicate !== false;

  if (preventDuplicate) {
    // Query for existing booking with same serviceId and scheduledDate and active statuses
    const snapshot = await collection
      .where("serviceId", "==", serviceId)
      .where("scheduledDate", "==", scheduled)
      .where("status", "in", ["PENDING", "ACCEPTED"]) // active bookings
      .limit(1)
      .get();

    if (!snapshot.empty) {
      throw new Error("An active booking already exists for that service at the requested time");
    }
  }

  const docRef = await collection.add({
    clientId,
    clientName,
    providerId: service.providerId,
    serviceId,
    serviceTitle: service.title,
    servicePrice: service.price,
    status: "PENDING",
    scheduledDate: scheduled,
    // New fields
    clientLocation: options.clientLocation || null,
    urgency: options.urgency || 'STANDARD',
    description: options.description || '',
    providerLocation: null, // Initial provider location is null until they accept/update

    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  const created = await collection.doc(docRef.id).get();
  return { id: created.id, ...created.data() };
};

/**
 * Get bookings for authenticated user (client or provider)
 */
const getBookingsForUser = async (user, options = {}) => {
  const { limit = 10, startAfter = null } = options;

  if (!user || !user.uid || !user.role) throw new Error("Invalid user");

  const parsedLimit = Math.min(parseInt(limit) || 10, 100);
  if (parsedLimit < 1) throw new Error("limit must be between 1 and 100");

  let query;
  if (user.role === "CLIENT") {
    query = collection.where("clientId", "==", user.uid);
  } else if (user.role === "PROVIDER") {
    query = collection.where("providerId", "==", user.uid);
  } else {
    // ADMIN or others can see none by default
    throw new Error("Unauthorized role for retrieving bookings");
  }

  // query = query.orderBy("createdAt", "desc"); // Requires index

  if (startAfter) {
    const lastDocSnapshot = await collection.doc(startAfter).get();
    if (!lastDocSnapshot.exists) throw new Error("Invalid startAfter parameter");
    query = query.startAfter(lastDocSnapshot);
  }

  const snapshot = await query.limit(parsedLimit + 1).get();
  const hasMore = snapshot.docs.length > parsedLimit;
  const docs = hasMore ? snapshot.docs.slice(0, parsedLimit) : snapshot.docs;
  const bookings = docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return {
    bookings,
    hasMore,
    nextPageStartAfter: hasMore ? docs[docs.length - 1].id : null
  };
};

/**
 * Get booking by ID
 */
const getBookingById = async (id) => {
  if (!id) throw new Error("Booking ID is required");
  const doc = await collection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

/**
 * Update booking status with strict transition rules
 */
const updateBookingStatus = async (bookingId, user, newStatus) => {
  if (!bookingId) throw new Error("Booking ID is required");
  if (!VALID_STATUSES.includes(newStatus)) throw new Error("Invalid status");

  const docRef = collection.doc(bookingId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Booking not found");

  const booking = doc.data();
  const current = booking.status;

  // Allowed transitions
  const allowed = {
    PENDING: ["ACCEPTED", "CANCELLED", "DECLINED"], // Added DECLINED
    ACCEPTED: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
    DECLINED: []
  };

  if (!allowed[current] || !allowed[current].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${current} to ${newStatus}`);
  }

  // Authorization: only provider can ACCEPT, DECLINE or COMPLETE; client can CANCEL
  const isProviderAction = ["ACCEPTED", "COMPLETED", "DECLINED"].includes(newStatus);
  const isClientCancel = newStatus === "CANCELLED";

  if (isProviderAction) {
    if (!user || user.uid !== booking.providerId) {
      throw new Error("Unauthorized: Only the service provider can perform this action");
    }
  }

  if (isClientCancel) {
    // client may cancel if they are the client and status allows
    if (!user || user.uid !== booking.clientId) {
      throw new Error("Unauthorized: Only the booking client can cancel this booking");
    }
  }

  await docRef.update({ status: newStatus, updatedAt: FieldValue.serverTimestamp() });

  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() };
};

const updateBookingLocation = async (bookingId, providerLocation) => {
  if (!bookingId) throw new Error("Booking ID is required");

  // providerLocation expected format: { lat: number, lng: number }
  if (!providerLocation || typeof providerLocation.lat !== 'number' || typeof providerLocation.lng !== 'number') {
    throw new Error("Invalid location format");
  }

  const docRef = collection.doc(bookingId);
  await docRef.update({
    providerLocation,
    updatedAt: FieldValue.serverTimestamp()
  });

  return { success: true };
};

module.exports = {
  createBooking,
  getBookingsForUser,
  getBookingById,
  updateBookingStatus,
  updateBookingLocation
};
