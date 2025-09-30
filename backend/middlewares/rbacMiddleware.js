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
// import Department from "../models/Department.js";
// // authorize middleware - uses req.user (must run after protect)
// export const authorize = (moduleName, action) => async (req, res, next) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const role = req.user.roleId;
//     const userDeptId = req.user.departmentId; // ObjectId

//     if (!role || !userDeptId) {
//       return res.status(403).json({ message: "No role or department assigned" });
//     }

//     // Fetch numeric department ID from Department collection
//     const dept = await Department.findById(userDeptId).lean();
//     if (!dept) return res.status(403).json({ message: "User department not found" });

//     const numericDeptId = dept.id; // number

//     const permissions = role.permissions || [];

//     // Find permission matching module + department
//     const modulePerm = permissions.find((perm) => {
//       // Match module by string or object (existing support)
//       const moduleMatch =
//         (typeof perm.module === "string" && perm.module === moduleName) ||
//         (perm.module && typeof perm.module === "object" &&
//           (perm.module.module === moduleName || perm.module.name === moduleName));

//       if (!moduleMatch) return false;

//       // Match department by numeric ID (allow wildcard '*' for all)
//       const deptMatch =
//         perm.departments?.includes("*") ||
//         perm.departments?.some((d) => Number(d) === Number(numericDeptId));

//       return deptMatch;
//     });

//     if (!modulePerm) {
//       return res.status(403).json({ message: "Permission denied (module/department not allowed)" });
//     }

//     // Check action
//     const actions = modulePerm.actions || [];
//     if (actions.includes("*") || actions.includes(action)) {
//       return next();
//     }

//     return res.status(403).json({ message: "Permission denied (action not allowed)" });
//   } catch (err) {
//     console.error("RBAC error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

