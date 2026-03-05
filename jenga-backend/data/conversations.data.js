const db = require("../config/firestore");
const { FieldValue } = require("firebase-admin/firestore");

const COLLECTION_NAME = "conversations";
const collection = db.collection(COLLECTION_NAME);

const getConversationByBookingId = async (bookingId) => {
  if (!bookingId) throw new Error("bookingId is required");
  const snapshot = await collection.where("bookingId", "==", bookingId).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

const createConversation = async ({ bookingId, clientId, providerId }) => {
  if (!bookingId) throw new Error("bookingId is required");
  if (!clientId || !providerId) throw new Error("clientId and providerId are required");

  const existing = await getConversationByBookingId(bookingId);
  if (existing) return existing;

  const docRef = await collection.add({
    bookingId,
    clientId,
    providerId,
    createdAt: FieldValue.serverTimestamp()
  });
  const created = await collection.doc(docRef.id).get();
  return { id: created.id, ...created.data() };
};

const deleteConversationByBookingId = async (bookingId) => {
  if (!bookingId) throw new Error('bookingId is required');
  const snapshot = await collection.where('bookingId', '==', bookingId).limit(1).get();
  if (snapshot.empty) return { deleted: false };
  const doc = snapshot.docs[0];
  // delete messages first
  const messagesData = require('./messages.data');
  await messagesData.deleteMessagesByConversationId(doc.id);
  await collection.doc(doc.id).delete();
  return { deleted: true };
};

const deleteConversationById = async (conversationId) => {
  if (!conversationId) throw new Error('conversationId is required');
  const doc = await collection.doc(conversationId).get();
  if (!doc.exists) return { deleted: false };
  const messagesData = require('./messages.data');
  await messagesData.deleteMessagesByConversationId(conversationId);
  await collection.doc(conversationId).delete();
  return { deleted: true };
};

module.exports = {
  getConversationByBookingId,
  createConversation
  , deleteConversationByBookingId,
  deleteConversationById
};

