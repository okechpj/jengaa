const jwt = require('jsonwebtoken');
const bookingsData = require('../data/bookings.data');
const conversations = require('../data/conversations.data');
const messagesData = require('../data/messages.data');
const userData = require('../data/user.data');

module.exports = function initChatSocket(io) {
  // authenticate socket connections via token passed in handshake.auth.token
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      const authHeader = socket.handshake.headers && socket.handshake.headers.authorization;
      let raw = token;
      if (!raw && authHeader) {
        const m = authHeader.match(/^Bearer\s+(.+)$/);
        raw = m && m[1];
      }
      if (!raw) return next(new Error('Authentication required'));
      const secret = process.env.JWT_SECRET;
      if (!secret) return next(new Error('Server misconfiguration: JWT_SECRET not set'));
      const decoded = jwt.verify(raw, secret);
      const uid = decoded.sub || decoded.uid || decoded.id;
      if (!uid) return next(new Error('Invalid token payload'));
      const user = await userData.getUserById(uid);
      if (!user) return next(new Error('Invalid user'));
      socket.user = user;
      socket.token = raw;
      next();
    } catch (err) {
      console.error('Socket auth failed', err.message || err);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`Socket connected: ${user.id}`);

    socket.on('joinConversation', async (bookingId, cb) => {
      try {
        if (!bookingId) throw new Error('bookingId required');
        const booking = await bookingsData.getBookingById(bookingId);
        if (!booking) throw new Error('Booking not found');

        const isAllowed = (user.id === booking.clientId) || (user.id === booking.providerId) || (user.role === 'ADMIN');
        if (!isAllowed) throw new Error('Not authorized to join this conversation');

        const room = `room_booking_${bookingId}`;
        socket.join(room);
        // ensure conversation exists
        await conversations.createConversation({ bookingId, clientId: booking.clientId, providerId: booking.providerId });
        if (typeof cb === 'function') cb({ success: true });
      } catch (err) {
        console.warn('joinConversation failed', err.message || err);
        if (typeof cb === 'function') cb({ success: false, error: err.message });
      }
    });

    socket.on('sendMessage', async (payload, cb) => {
      try {
        const { bookingId, message } = payload || {};
        if (!bookingId) throw new Error('bookingId required');
        if (typeof message !== 'string' || message.trim() === '') throw new Error('message is required');

        const booking = await bookingsData.getBookingById(bookingId);
        if (!booking) throw new Error('Booking not found');

        const isAllowed = (user.id === booking.clientId) || (user.id === booking.providerId) || (user.role === 'ADMIN');
        if (!isAllowed) throw new Error('Not authorized to send messages for this booking');

        // ensure conversation exists
        const conv = await conversations.createConversation({ bookingId, clientId: booking.clientId, providerId: booking.providerId });
        const saved = await messagesData.createMessage({ conversationId: conv.id, senderId: user.id, message: message.trim() });

        const messageData = {
          id: saved.id,
          conversationId: conv.id,
          senderId: saved.senderId,
          message: saved.message,
          timestamp: saved.timestamp
        };

        const room = `room_booking_${bookingId}`;
        io.to(room).emit('newMessage', messageData);

        if (typeof cb === 'function') cb({ success: true, data: messageData });
      } catch (err) {
        console.warn('sendMessage failed', err.message || err);
        if (typeof cb === 'function') cb({ success: false, error: err.message });
      }
    });

    // Request to end the session (initiated by one participant)
    socket.on('requestEndSession', async (bookingId, cb) => {
      try {
        if (!bookingId) throw new Error('bookingId required');
        const booking = await bookingsData.getBookingById(bookingId);
        if (!booking) throw new Error('Booking not found');

        const isAllowed = (user.id === booking.clientId) || (user.id === booking.providerId) || (user.role === 'ADMIN');
        if (!isAllowed) throw new Error('Not authorized to request end session for this booking');

        const room = `room_booking_${bookingId}`;
        // inform other participants that an end-session has been requested
        io.to(room).emit('endSessionRequested', { bookingId, requester: { id: user.id, name: user.name || user.clientName || user.uid } });
        if (typeof cb === 'function') cb({ success: true });
      } catch (err) {
        console.warn('requestEndSession failed', err.message || err);
        if (typeof cb === 'function') cb({ success: false, error: err.message });
      }
    });

    // Confirmation (accept/decline) from the other participant
    socket.on('confirmEndSession', async (payload, cb) => {
      try {
        const { bookingId, confirm } = payload || {};
        if (!bookingId) throw new Error('bookingId required');
        const booking = await bookingsData.getBookingById(bookingId);
        if (!booking) throw new Error('Booking not found');

        const isAllowed = (user.id === booking.clientId) || (user.id === booking.providerId) || (user.role === 'ADMIN');
        if (!isAllowed) throw new Error('Not authorized to confirm end session for this booking');

        const room = `room_booking_${bookingId}`;
        if (confirm) {
          // delete conversation and messages
          await conversations.deleteConversationByBookingId(bookingId);
          io.to(room).emit('conversationClosed', { bookingId, by: user.id });
          if (typeof cb === 'function') cb({ success: true });
        } else {
          io.to(room).emit('endSessionDeclined', { bookingId, by: user.id });
          if (typeof cb === 'function') cb({ success: true });
        }
      } catch (err) {
        console.warn('confirmEndSession failed', err.message || err);
        if (typeof cb === 'function') cb({ success: false, error: err.message });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${user.id} (${reason})`);
    });
  });
};

