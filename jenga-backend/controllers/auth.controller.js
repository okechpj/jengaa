const userService = require("../data/user.data");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({ success: false, error: "Missing required fields: email, password, name, role" });
    }

    // Role validation for public registration
    if (role === "ADMIN") {
      return res.status(403).json({ success: false, error: "Admin registration is not allowed via public endpoint" });
    }

    if (!["CLIENT", "PROVIDER"].includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role. Must be CLIENT or PROVIDER" });
    }

    // Create user
    const user = await userService.createUser({ email, password, name, role });

    // Generate token immediately
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ success: false, error: "Server misconfiguration: JWT_SECRET not set" });

    const payload = { sub: user.id, uid: user.id, role: user.role, name: user.name };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      }
    });

  } catch (err) {
    const msg = err.message || "Registration failed";
    if (msg.includes("Email already exists")) {
      return res.status(409).json({ success: false, error: msg });
    }
    return res.status(400).json({ success: false, error: msg });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "email and password are required" });
    }

    const user = await userService.getUserByEmail(email);
    if (!user) return res.status(401).json({ success: false, error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ success: false, error: "Invalid credentials" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ success: false, error: "Server misconfiguration: JWT_SECRET not set" });

    const payload = { sub: user.id, uid: user.id, role: user.role, name: user.name };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    return res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Dev-only token minting route protected by DEV_AUTH_KEY header
const mintToken = async (req, res) => {
  try {
    const devKey = process.env.DEV_AUTH_KEY;
    if (!devKey) return res.status(403).json({ success: false, error: "Dev token minting disabled" });

    const provided = req.headers["x-dev-key"] || req.body.devKey;
    if (provided !== devKey) return res.status(403).json({ success: false, error: "Invalid dev key" });

    const { uid } = req.body;
    if (!uid) return res.status(400).json({ success: false, error: "uid is required" });

    const user = await userService.getUserById(uid);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ success: false, error: "Server misconfiguration: JWT_SECRET not set" });

    const payload = { sub: user.id, uid: user.id, role: user.role, name: user.name };
    const token = jwt.sign(payload, secret, { expiresIn: "24h" });

    return res.json({ success: true, data: { token } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { login, register, mintToken };
