const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, requireAdminOrSelf } = require("../middleware/auth");
const { createUser, getAllUsers, getUserById, getUserByEmail, updateUser, deleteUser} = require("../controllers/user");

router.post("/", createUser);

router.get("/", authenticate, requireAdmin, getAllUsers);

router.get("/:id", authenticate, requireAdminOrSelf, getUserById);

router.get("/email/:email", authenticate, requireAdmin, getUserByEmail);

router.put("/:id", authenticate, requireAdminOrSelf, updateUser);

router.delete("/:id", authenticate, requireAdmin, deleteUser);

module.exports = router;