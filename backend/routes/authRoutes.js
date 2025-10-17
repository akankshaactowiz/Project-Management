import express from "express";
import {getUsersByRoleAndDepartment, registerUser, loginUser, logoutUser, getUserProfile } from "../controllers/authController.js";
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
router.get("/profile", protect, getUserProfile);

export default router;
