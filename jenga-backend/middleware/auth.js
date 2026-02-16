const userService = require("../data/user");

const authenticate = async (req, res, next) => {
  const userId = req.headers["x-user-id"];
  
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: "Invalid user" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication failed" });
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

module.exports = {
  authenticate,
  requireAdmin,
  requireAdminOrSelf
};
