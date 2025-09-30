import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";
import { getModules, getRoles, updatePermissions } from "../controllers/rolesAndModulesController.js";
const router = express.Router();

// 1️⃣ Get all roles visible to current user
router.get("/", protect, getRoles);

router.get("/modules", protect, getModules);


// Edit permissions of a role
router.put(
  "/:id",
  protect,
  authorize("Settings", "update"),
  updatePermissions
);

export default router;
