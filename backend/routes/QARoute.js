import express from "express";
import { getQAData, getSingleQA } from '../controllers/QAcontroller.js'
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";
const router = express.Router();

// GET QA list with pagination, search, sort
router.get("/", protect, authorize("QA", "view"), getQAData);

// GET single QA by id
router.get("/:id", getSingleQA);

export default router;
