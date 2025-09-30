import express from "express";
import Department from "../models/Department.js";

const router = express.Router();

// GET all departments
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find().select("_id department id");
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching departments", error: err.message });
  }
});

export default router;
