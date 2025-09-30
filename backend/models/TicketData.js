import mongoose from "mongoose";
import User from "../models/User.js";

const TicketSchema = new mongoose.Schema({
  ticketNo: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  title: { type: String, required: true },
  status: { type: String, required: true , default: "New"},
  createdAt: { type: Date, default: Date.now },
  raisedBy: { type: String, required: true },
  // assignedTo: { type: String, required: true },
  priority: { type: String, required: true },
  description: { type: String, required: true },
  watcher: [{ type: String }]
})

export default mongoose.model("Ticket", TicketSchema, "Ticket_data");