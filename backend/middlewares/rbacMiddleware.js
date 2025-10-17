// authorize middleware - uses req.user (must run after protect)
export const authorize = (moduleName, action) => (req, res, next) => {
  try {
    // req.user must be a populated user document (protect ensures this)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // roleId should be populated by protect
    const role = req.user.roleId;
    if (!role) {
      return res.status(403).json({ message: "No role assigned" });
    }

    const department = req.user.departmentId;
    if (!department) {
      return res.status(403).json({ message: "No department assigned" });
    }

    // permissions: [{ module: "tasks", actions: ["read","create"] }, ...]
    const permissions = role.permissions || [];

    // find module in permissions
    const modulePerm = permissions.find((m) => {
      // allow either m.module string or m.module.name depending on schema 
      if (typeof m.module === "string") return m.module === moduleName;
      if (m.module && typeof m.module === "object") return m.module.module === moduleName || m.module.name === moduleName;
      return false;
    });

    if (!modulePerm) {
      return res.status(403).json({ message: "Permission denied (module not allowed)" });
    }

    // modulePerm.actions should be an array of strings
    const actions = modulePerm.actions || [];
    // support wildcard '*' meaning all actions allowed
    if (actions.includes("*") || actions.includes(action)) {
      return next();
    }

    return res.status(403).json({ message: "Permission denied (action not allowed)" });
  } catch (err) {
    console.error("RBAC error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
