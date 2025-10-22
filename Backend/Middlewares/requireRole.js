module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Normalize all roles to lowercase
    const allowed = allowedRoles.map((role) =>
      typeof role === "string" ? role.toLowerCase() : role
    );

    const userRole =
      typeof req.user.role === "string"
        ? req.user.role.toLowerCase()
        : req.user.role;

    if (!allowed.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }

    next();
  };
};
