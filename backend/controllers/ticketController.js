import Ticket from "../models/TicketData.js";
import Counter from "../models/Counter.js";

export const generateTicket = async (req, res) => {
  try {
    const { department, title, status, priority, description, watcher } = req.body;


    if (!department || !title) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!req.user || !req.user.name) {
      return res.status(401).json({ message: "User not authorized." });
    }

    // Increment counter for tickets atomically
    const counter = await Counter.findOneAndUpdate(
      { id: "ticketNo" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const newTicketNo = `T${counter.seq.toString().padStart(2, "0")}`;

    const newTicket = new Ticket({
      ticketNo: newTicketNo,
      department,
      title,
      status: status || "New",
      priority,
      description,
      watcher,
      raisedBy: req.user.name,
    });

    const savedTicket = await newTicket.save();

    res.status(201).json({ message: "Ticket created successfully.", ticket: savedTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: "Server error." });
  }
};
