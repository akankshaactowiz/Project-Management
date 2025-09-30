import Role from "../models/Role.js";
import Module from "../models/Module.js";
import User from "../models/User.js";
import { roleHierarchy } from "../config/roleHierarchy.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

// GET all roles visible to current user
export const getRoles = async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user._id).populate("roleId");
    if (!requestingUser) return res.status(404).json({ message: "User not found" });

    const requesterRole = requestingUser.roleId.name;
    const visibleRoles = roleHierarchy[requesterRole] || [];

    const roles = requesterRole === "Superadmin"
      ? await Role.find().lean()
      : await Role.find({ name: { $in: visibleRoles } }).lean();

    res.json({ roles });
  } catch (err) {
    console.error("Roles fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET all modules
export const getModules = async (req, res) => {
  try {
    const modules = await Module.find({}, { module: 1, actions: 1, _id: 0 }).lean();
    res.json({ modules });
  } catch (err) {
    console.error("Modules fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE role permissions (department-aware)
export const updatePermissions = async (req, res) => {
  try {
    const { permissions } = req.body; // expected array of { module, actions, departments }
    const roleId = req.params.id;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "Permissions must be an array" });
    }

    // Validate each permission
    for (const perm of permissions) {
      if (!perm.module || !Array.isArray(perm.actions)) {
        return res.status(400).json({ message: "Invalid permission object" });
      }
      if (!Array.isArray(perm.departments) || perm.departments.length === 0) {
        return res.status(400).json({ message: "Departments must be a non-empty array" });
      }
    }

    const updatedRole = await Role.findByIdAndUpdate(
      roleId,
      { $set: { permissions } },
      { new: true }
    );

    if (!updatedRole) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json({ message: "Permissions updated", role: updatedRole });
  } catch (err) {
    console.error("Role update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
