const db = require('../config/firestore');
const { FieldValue } = require('firebase-admin/firestore');

const COLLECTION_NAME = 'availabilities';
const collection = db.collection(COLLECTION_NAME);

/**
 * Create availability entry
 */
const createAvailability = async (providerId, serviceId, data) => {
  if (!providerId) throw new Error('providerId is required');
  if (!serviceId) throw new Error('serviceId is required');

  const { from, to, notes } = data;
  if (!from) throw new Error('from is required');
  if (!to) throw new Error('to is required');

  const docRef = await collection.add({
    providerId,
    serviceId,
    from: new Date(from),
    to: new Date(to),
    notes: notes || null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  const doc = await collection.doc(docRef.id).get();
  return { id: doc.id, ...doc.data() };
};

const getAvailabilitiesByService = async (serviceId) => {
  if (!serviceId) throw new Error('serviceId is required');
  const snapshot = await collection.where('serviceId', '==', serviceId).orderBy('from', 'asc').get();
  const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return items;
};

const updateAvailability = async (id, providerId, updateData) => {
  if (!id) throw new Error('id is required');
  const docRef = collection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Availability not found');
  const data = doc.data();
  if (data.providerId !== providerId) throw new Error('Unauthorized');

  const toUpdate = {};
  if (updateData.from) toUpdate.from = new Date(updateData.from);
  if (updateData.to) toUpdate.to = new Date(updateData.to);
  if (updateData.notes !== undefined) toUpdate.notes = updateData.notes;
  toUpdate.updatedAt = FieldValue.serverTimestamp();

  await docRef.update(toUpdate);
  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() };
};

const deleteAvailability = async (id, providerId) => {
  if (!id) throw new Error('id is required');
  const docRef = collection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Availability not found');
  const data = doc.data();
  if (data.providerId !== providerId) throw new Error('Unauthorized');
  await docRef.delete();
  return { success: true };
};

module.exports = {
  createAvailability,
  getAvailabilitiesByService,
  updateAvailability,
  deleteAvailability
};
