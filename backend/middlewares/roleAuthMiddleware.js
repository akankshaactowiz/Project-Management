// Check if user has at least one role from allowedRoles array
export const hasRole = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    await req.user.populate("roleId");

    // Normalize to array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({ message: `Access denied: requires role ${roles.join(", ")}` });
    }
    next();
  };
};

// Check if user has at least one permission from allowedPermissions array
export const hasPermission = (allowedPermissions) => {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    await req.user.populate("roleId");

    const permissions = Array.isArray(allowedPermissions) ? allowedPermissions : [allowedPermissions];

    const hasAny = permissions.some((perm) => req.user.role.permissions.includes(perm));
    if (!hasAny) {
      return res.status(403).json({ message: `Access denied: requires permission ${permissions.join(", ")}` });
    }

    next();
  };
};

// Combine role + permission check
export const requireRoleAndPermission = (allowedRoles, allowedPermissions) => {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    await req.user.populate("roleId");

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const permissions = Array.isArray(allowedPermissions) ? allowedPermissions : [allowedPermissions];

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({ message: `Access denied: requires role ${roles.join(", ")}` });
    }

    const hasAnyPermission = permissions.some((perm) => req.user.role.permissions.includes(perm));
    if (!hasAnyPermission) {
      return res.status(403).json({ message: `Access denied: requires permission ${permissions.join(", ")}` });
    }

    next();
  };
};
