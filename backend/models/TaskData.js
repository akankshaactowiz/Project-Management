import mongoose from "mongoose";
import Project from './Projects.js'

const taskSchema = new mongoose.Schema(
    {
  title: { type: String, required: true },
  department: String,
  relatedTo: String,
  taskType: String,
  taskPriority: String,
  taskStatus: {type: String, default: "New"},
  // project: {type: mongoose.Schema.Types.ObjectId, ref: "Project"},
  feed: String,
  assignedTo: String,
  assignedBy: String,
  estimateStartDate: Date,
  estimateEndDate: Date,
  watcher: [{ type: String }],
}, { timestamps: true }
);

export default mongoose.model("Task", taskSchema, "Tasks_data");