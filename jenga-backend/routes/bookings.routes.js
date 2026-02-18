const express = require("express");
const router = express.Router();
const { createBooking, getBookingsForUser, updateBookingStatus, getBookingById, acceptBooking, declineBooking, updateLocation } = require("../controllers/bookings.controller");
const { authenticate, requireClient } = require("../middleware/auth");

// POST /bookings - create a booking (CLIENT only)
router.post("/", authenticate, requireClient, createBooking);

// GET /bookings/user/:userId - list bookings for authenticated user (ignore userId param)
router.get("/user/:userId", authenticate, getBookingsForUser);

// PATCH /bookings/:id/status - update booking status
router.patch("/:id/status", authenticate, updateBookingStatus);

// GET /bookings/:id - get single booking details
router.get("/:id", authenticate, getBookingById);

// PATCH /bookings/:id/accept - provider accept
router.patch("/:id/accept", authenticate, acceptBooking);

// PATCH /bookings/:id/decline - provider decline
router.patch("/:id/decline", authenticate, declineBooking);

// PATCH /bookings/:id/location - provider update location
router.patch("/:id/location", authenticate, updateLocation);

module.exports = router;
