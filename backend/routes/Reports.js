import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getReportsWithSummary, getUserReport } from "../controllers/reportsController.js";
import { authorize } from "../middlewares/rbacMiddleware.js";
// import { authorize } from "../middlewares/rbacMiddleware.js";
const router = express.Router();

router.get("/with-summary", protect, authorize("Reports", "view"),   getReportsWithSummary);

router.get("/:id", protect, authorize("Reports", "view"),  getUserReport);

export default router;
