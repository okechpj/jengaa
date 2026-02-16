const db = require("../config/firestore");
const { FieldValue } = require("firebase-admin/firestore");
const bcrypt = require("bcrypt");

const COLLECTION_NAME = "users";
const collection = db.collection(COLLECTION_NAME);
const VALID_ROLES = ["CLIENT", "PROVIDER", "ADMIN"];

const createUser = async (userData) => {
  const { name, email, password, role } = userData;
  
  if (!email || !password || !role) {
    throw new Error("Missing required fields: email, password, role");
  }

  if (!VALID_ROLES.includes(role)) {
    throw new Error("Invalid role. Must be CLIENT, PROVIDER, or ADMIN");
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("Email already exists");
  }

  const password_hash = await bcrypt.hash(password, 10);

  const docRef = await collection.add({
    name: name || null,
    email,
    password_hash,
    role,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp()
  });

  return getUserById(docRef.id);
};

const getAllUsers = async () => {
  const snapshot = await collection.get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

const getUserById = async (id) => {
  if (!id) throw new Error("User ID is required");
  
  const doc = await collection.doc(id).get();
  if (!doc.exists) return null;
  
  return { id: doc.id, ...doc.data() };
};

const getUserByEmail = async (email) => {
  if (!email) throw new Error("Email is required");
  
  const snapshot = await collection.where("email", "==", email).limit(1).get();
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

const updateUser = async (id, updateData) => {
  if (!id) throw new Error("User ID is required");
  
  const doc = await collection.doc(id).get();
  if (!doc.exists) throw new Error("User not found");

  const { email, password, role, ...allowedUpdates } = updateData;
  
  if (email && email !== doc.data().email) {
    const existing = await getUserByEmail(email);
    if (existing) throw new Error("Email already exists");
    allowedUpdates.email = email;
  }

  if (password) {
    allowedUpdates.password_hash = await bcrypt.hash(password, 10);
  }

  if (role) {
    if (!VALID_ROLES.includes(role)) {
      throw new Error("Invalid role. Must be CLIENT, PROVIDER, or ADMIN");
    }
    allowedUpdates.role = role;
  }

  await collection.doc(id).update({
    ...allowedUpdates,
    updated_at: FieldValue.serverTimestamp()
  });
  
  return getUserById(id);
};

const deleteUser = async (id) => {
  if (!id) throw new Error("User ID is required");
  
  const doc = await collection.doc(id).get();
  if (!doc.exists) throw new Error("User not found");
  
  await collection.doc(id).delete();
  return { id, deleted: true };
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser
};
