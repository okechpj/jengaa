const availabilityData = require('../data/availability.data');
const db = require('../config/firestore');

const createAvailability = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, error: 'Authentication required' });
    const providerId = req.user.uid;
    const { serviceId } = req.params;
    const { from, to, notes } = req.body;

    // Verify provider owns the service
    const serviceDoc = await db.collection('services').doc(serviceId).get();
    if (!serviceDoc.exists) return res.status(404).json({ success: false, error: 'Service not found' });
    if (serviceDoc.data().providerId !== providerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const created = await availabilityData.createAvailability(providerId, serviceId, { from, to, notes });
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

const getAvailabilitiesForService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const items = await availabilityData.getAvailabilitiesByService(serviceId);
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

const updateAvailability = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, error: 'Authentication required' });
    const providerId = req.user.uid;
    const { id } = req.params;
    const updated = await availabilityData.updateAvailability(id, providerId, req.body);
    return res.json({ success: true, data: updated });
  } catch (err) {
    if (err.message === 'Unauthorized') return res.status(403).json({ success: false, error: err.message });
    return res.status(400).json({ success: false, error: err.message });
  }
};

const deleteAvailability = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, error: 'Authentication required' });
    const providerId = req.user.uid;
    const { id } = req.params;
    const result = await availabilityData.deleteAvailability(id, providerId);
    return res.json({ success: true, data: result });
  } catch (err) {
    if (err.message === 'Unauthorized') return res.status(403).json({ success: false, error: err.message });
    return res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = {
  createAvailability,
  getAvailabilitiesForService,
  updateAvailability,
  deleteAvailability
};
