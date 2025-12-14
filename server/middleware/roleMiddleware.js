// server/middleware/roleMiddleware.js
/**
 * Usage: role("Manager") or role("Admin","HR")
 * Accepts one or more roles (strings).
 */
module.exports = function (...allowedRoles) {
  // normalize allowed roles to lowercase trimmed
  const normalized = allowedRoles.map((r) => String(r).toLowerCase().trim());
  return (req, res, next) => {
    try {
      const payloadRole = (req.user && req.user.role) || "";
      const userRole = String(payloadRole).toLowerCase().trim();
      if (!userRole) return res.status(401).json({ msg: "Role missing in token" });

      if (!normalized.includes(userRole)) {
        return res.status(403).json({ msg: "Access denied: insufficient role" });
      }
      next();
    } catch (err) {
      console.error("roleMiddleware error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  };
};
