import express from "express";
import {getUsersByRoleAndDepartment, registerUser, loginUser, logoutUser } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";
import User from "../models/User.js";


const router = express.Router();

// Public
router.post("/register", registerUser);
// router.get("/by-role", protect, authorize("User", "create"), getUsersByRoleAndDepartment);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Protected: profile (no extra authorize so user can always fetch own profile)
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("roleId").populate("departmentId")// get role with permissions
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      roleName: user.roleId?.name || null,
      department: user.departmentId?.department || null,
      permissions: user.roleId?.permissions || [],
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
