const jwt = require("jsonwebtoken");
const userService = require("../data/user.data");

// Authenticate using JWT in Authorization header: "Bearer <token>"
// Expects HS256 tokens signed with process.env.JWT_SECRET
const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"] || "";
  const match = authHeader.match(/^Bearer (.+)$/);
  const token = match ? match[1] : null;

  if (!token) return res.status(401).json({ error: "Authentication required" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "Server misconfiguration: JWT_SECRET not set" });

  try {
    const decoded = jwt.verify(token, secret);
    // support common claim names for uid
    const uid = decoded.sub || decoded.uid || decoded.id;
    if (!uid) return res.status(401).json({ error: "Invalid token payload" });

    const user = await userService.getUserById(uid);
    if (!user) return res.status(401).json({ error: "Invalid user" });

    // normalize user object: provide both `id` and `uid` for compatibility
    user.uid = user.id;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Authentication failed" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

const requireAdminOrSelf = (req, res, next) => {
  if (req.user.role !== "ADMIN" && req.user.id !== req.params.id) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};

const requireProvider = (req, res, next) => {
  if (req.user.role !== "PROVIDER" && req.user.role !== "ADMIN") {
    return res.status(403).json({ 
      error: "Provider access required",
      requiredRole: "PROVIDER"
    });
  }
  next();
};

const requireClient = (req, res, next) => {
  if (!req.user || req.user.role !== "CLIENT") {
    return res.status(403).json({
      error: "Client access required",
      requiredRole: "CLIENT"
    });
  }
  next();
};

module.exports = {
  authenticate,
  requireAdmin,
  requireAdminOrSelf,
  requireProvider,
  requireClient
};
