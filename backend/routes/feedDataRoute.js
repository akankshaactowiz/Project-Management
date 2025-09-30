import express from "express";
import { getFeeds, getFeedById, updateFeedById, createFeed, updateFeedTeam } from "../controllers/feedController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.post("/", createFeed);
router.get("/", getFeeds);      
router.get("/:id", getFeedById);
router.put("/:id/update-team", protect,  updateFeedTeam);
router.put("/:id", protect, authorize("Feed", "update"), updateFeedById);

export default router;