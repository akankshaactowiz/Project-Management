import express from "express";


import { addReport, getYourReports } from "../controllers/workReportController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.post("/add", protect, authorize("Work", "add work report"), addReport);

router.get("/me", protect, authorize("Work", "view"), getYourReports);
export default router;