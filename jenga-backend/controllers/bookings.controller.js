const bookingsData = require("../data/bookings.data");

const createBooking = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, error: "Authentication required" });
    const clientId = req.user.uid;
    const clientName = req.user.name || "Unknown Client";
    const { serviceId, scheduledDate, clientLocation, urgency, description } = req.body;

    if (!serviceId || !scheduledDate) {
      return res.status(400).json({ success: false, error: "serviceId and scheduledDate are required" });
    }

    const booking = await bookingsData.createBooking(clientId, clientName, {
      serviceId,
      scheduledDate,
      clientLocation,
      urgency,
      description
    });

    return res.status(201).json({ success: true, data: booking });
  } catch (err) {
    const msg = err.message || "Error creating booking";
    if (msg.includes("Unauthorized")) return res.status(403).json({ success: false, error: msg });
    if (msg.includes("not found") || msg.includes("Service not found")) return res.status(404).json({ success: false, error: msg });
    return res.status(400).json({ success: false, error: msg });
  }
};

const getBookingsForUser = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, error: "Authentication required" });
    const user = req.user;
    const { limit = 10, startAfter = null } = req.query;

    const result = await bookingsData.getBookingsForUser(user, { limit, startAfter });

    return res.json({ success: true, data: result.bookings, pagination: { limit: parseInt(limit) || 10, hasMore: result.hasMore, nextPageStartAfter: result.nextPageStartAfter } });
  } catch (err) {
    const msg = err.message || "Error fetching bookings";
    if (msg.includes("Unauthorized role")) return res.status(403).json({ success: false, error: msg });
    return res.status(400).json({ success: false, error: msg });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: "status is required" });

    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, error: "Authentication required" });
    const actingUser = req.user;
    const updated = await bookingsData.updateBookingStatus(bookingId, actingUser, status);
    return res.json({ success: true, data: updated });
  } catch (err) {
    const msg = err.message || "Error updating booking status";
    if (msg.includes("Unauthorized")) return res.status(403).json({ success: false, error: msg });
    if (msg.includes("Invalid status transition") || msg.includes("Invalid status")) return res.status(400).json({ success: false, error: msg });
    if (msg.includes("not found")) return res.status(404).json({ success: false, error: msg });
    return res.status(400).json({ success: false, error: msg });
  }
};

const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!bookingId) return res.status(400).json({ success: false, error: "Booking ID is required" });

    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, error: "Authentication required" });

    const booking = await bookingsData.getBookingById(bookingId);
    if (!booking) return res.status(404).json({ success: false, error: "Booking not found" });

    // Authorization: User must be either the client or the provider of the booking
    if (booking.clientId !== req.user.uid && booking.providerId !== req.user.uid && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: "Unauthorized access to this booking" });
    }

    return res.json({ success: true, data: booking });
  } catch (err) {
    const msg = err.message || "Error fetching booking";
    return res.status(500).json({ success: false, error: msg });
  }
};

const acceptBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, error: "Authentication required" });

    // Update status to ACCEPTED
    const updated = await bookingsData.updateBookingStatus(bookingId, req.user, 'ACCEPTED');
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

const declineBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, error: "Authentication required" });

    // Update status to DECLINED
    const updated = await bookingsData.updateBookingStatus(bookingId, req.user, 'DECLINED');
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { lat, lng } = req.body;

    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, error: "Authentication required" });

    // In a real app, verify user is the provider of this booking
    const booking = await bookingsData.getBookingById(bookingId);
    if (!booking) return res.status(404).json({ success: false, error: "Booking not found" });

    if (booking.providerId !== req.user.uid) {
      return res.status(403).json({ success: false, error: "Unauthorized: Only the provider can update location" });
    }

    await bookingsData.updateBookingLocation(bookingId, { lat, lng });
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = {
  createBooking,
  getBookingsForUser,
  updateBookingStatus,
  getBookingById,
  acceptBooking,
  declineBooking,
  updateLocation
};
