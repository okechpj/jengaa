const messagesData = require("../data/messages.data");
const bookingsData = require("../data/bookings.data");
const conversations = require("../data/conversations.data");

const getMessagesForBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    if (!bookingId) return res.status(400).json({ error: "bookingId required" });

    // ensure requester belongs to booking
    const booking = await bookingsData.getBookingById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const user = req.user;
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const allowed = user.uid === booking.clientId || user.uid === booking.providerId || user.role === 'ADMIN';
    if (!allowed) return res.status(403).json({ error: "Not authorized to view messages for this booking" });

    const conv = await conversations.getConversationByBookingId(bookingId);
    if (!conv) return res.json({ data: [] });

    const messages = await messagesData.getMessagesByConversationId(conv.id);
    return res.json({ data: messages });
  } catch (err) {
    console.error("getMessagesForBooking error", err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

module.exports = {
  getMessagesForBooking
};
