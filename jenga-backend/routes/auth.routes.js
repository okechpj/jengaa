const express = require("express");
const router = express.Router();
const { login, register, mintToken } = require("../controllers/auth.controller");

// POST /auth/login -> { email, password }
router.post("/login", login);

// POST /auth/register -> { email, password, name, role }
router.post("/register", register);

// POST /auth/mint -> { uid } (dev-only, requires DEV_AUTH_KEY via header x-dev-key or body.devKey)
router.post("/mint", mintToken);

module.exports = router;
