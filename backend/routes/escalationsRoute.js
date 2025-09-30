import express from "express";
import { createEscalation, getEscalations, getEscalationsById } from "../controllers/escalationsController.js";
import { authorize } from "../middlewares/rbacMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router()

router.post("/", authorize("Escalation", "create"), createEscalation)

router.get("/", protect,  getEscalations)

// GET single escalation details
router.get("/:id", getEscalationsById);
export default router;

