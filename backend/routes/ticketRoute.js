import express from "express";
import Ticket from '../models/TicketData.js';
import { protect } from "../middlewares/authMiddleware.js";
import { generateTicket } from "../controllers/ticketController.js";
import { authorize } from "../middlewares/rbacMiddleware.js";
const router = express.Router();

router.post("/",protect,  generateTicket);
router.get("/", async (req, res) => {
  try {
    const ticketData = await Ticket.find();
    res.status(200).json(ticketData);
  } catch (err) {
    console.error("Error fetching ticket data:", err);
    res.status(500).json({ error: "Failed to fetch ticket data" });
  }
}   );

export default router;