import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getProjectFullHistory } from "../controllers/historyController.js";
const router = express.Router();

router.get("/:projectId", protect, getProjectFullHistory);


export default router;