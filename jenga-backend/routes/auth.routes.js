const express = require("express");
const router = express.Router();
const { login, register, mintToken } = require("../controllers/auth.controller");
const { me } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");

// POST /auth/login -> { email, password }
router.post("/login", login);

// POST /auth/register -> { email, password, name, role }
router.post("/register", register);

// POST /auth/mint -> { uid } (dev-only, requires DEV_AUTH_KEY via header x-dev-key or body.devKey)
router.post("/mint", mintToken);

// GET /auth/me -> returns current user info when authenticated
router.get('/me', authenticate, me);

module.exports = router;
