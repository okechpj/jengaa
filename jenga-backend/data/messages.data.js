const db = require("../config/firestore");
const { FieldValue } = require("firebase-admin/firestore");
const conversations = require("./conversations.data");

const MSG_COLLECTION = "messages";
const collection = db.collection(MSG_COLLECTION);

const createMessage = async ({ conversationId, senderId, message }) => {
  if (!conversationId) throw new Error("conversationId is required");
  if (!senderId) throw new Error("senderId is required");
  if (typeof message !== 'string') throw new Error("message must be a string");

  const docRef = await collection.add({
    conversationId,
    senderId,
    message,
    timestamp: FieldValue.serverTimestamp()
  });

  const doc = await collection.doc(docRef.id).get();
  return { id: doc.id, ...doc.data() };
};

const getMessagesByConversationId = async (conversationId, limit = 100) => {
  if (!conversationId) throw new Error("conversationId is required");
  // Use simple equality query and sort in-memory to avoid Firestore composite index requirements
  const snapshot = await collection
    .where("conversationId", "==", conversationId)
    .limit(limit)
    .get();
  const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  // sort by timestamp if available
  msgs.sort((a, b) => {
    const ta = a.timestamp && (a.timestamp.seconds || a.timestamp._seconds) ? (a.timestamp.seconds || a.timestamp._seconds) : (a.timestamp ? new Date(a.timestamp).getTime()/1000 : 0);
    const tb = b.timestamp && (b.timestamp.seconds || b.timestamp._seconds) ? (b.timestamp.seconds || b.timestamp._seconds) : (b.timestamp ? new Date(b.timestamp).getTime()/1000 : 0);
    return ta - tb;
  });
  return msgs.slice(0, limit);
};

const getMessagesForBooking = async (bookingId) => {
  if (!bookingId) throw new Error("bookingId is required");
  const conv = await conversations.getConversationByBookingId(bookingId);
  if (!conv) return [];
  return getMessagesByConversationId(conv.id);
};

const deleteMessagesByConversationId = async (conversationId) => {
  if (!conversationId) throw new Error('conversationId is required');
  const snapshot = await collection.where('conversationId', '==', conversationId).get();
  if (snapshot.empty) return { deleted: 0 };
  const deletes = snapshot.docs.map(doc => collection.doc(doc.id).delete());
  await Promise.all(deletes);
  return { deleted: deletes.length };
};

module.exports = {
  createMessage,
  getMessagesByConversationId,
  getMessagesForBooking
  , deleteMessagesByConversationId
};

