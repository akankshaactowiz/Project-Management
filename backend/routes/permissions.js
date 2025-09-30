// routes/permissions.js
import express from "express";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { protect } from "../middlewares/authMiddleware.js";
import { hasRole } from "../middlewares/roleAuthMiddleware.js"; // your middleware

const router = express.Router();

/**
 * GET /api/permissions/:userId
 * Get user info + their role + permissions
 * Only Superadmin can access
 */
router.get("/:userId", protect, hasRole("Superadmin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("roleId");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions, // show permissions from role
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/permissions/:userId/permissions
 * Update a user role's permissions
 * Only Superadmin can access
 */
router.put("/:userId/permissions", protect, hasRole("Superadmin"), async (req, res) => {
  const { permissions } = req.body; // array of permissions
  try {
    const user = await User.findById(req.params.userId).populate("roleId");
    if (!user) return res.status(404).json({ message: "User not found" });

    const role = await Role.findById(user.role._id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    // Update role's permissions
    role.permissions = permissions || [];
    await role.save();

    res.json({
      message: "Permissions updated successfully",
      permissions: role.permissions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
