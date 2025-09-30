import mongoose from "mongoose";

const escalationSchema = new mongoose.Schema({
    // No: { type: Number, required: true },
    Title: { type: String, required: true },
    "Created Date": { type: Date, required: true },
    Project: { type: String, required: true },
    Feed: { type: String, required: true },
    Description: { type: String },
    Status: { type: String, enum: ["Open", "Closed", "Pending"], required: true },
    "Assigned By": { type: String, required: true },
    "Assigned To": { type: String, required: true },
    "Department From": { type: String, required: true },
    "Department To": { type: String, required: true },
    Watcher: [{ type: String,}],
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

export default mongoose.model("Escalations", escalationSchema, "Escalation-data");
