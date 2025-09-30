import mongoose from "mongoose";

const WorkReportSchema = new mongoose.Schema(
  {
    project: { type: String,
      //  required: true 
      },
    feed: { type: String, 
      // required: true 
    },
    taskType: { type: String, required: true },
    task: { type: String, default: "None" },
    assignedBy: { type: String, default: "None" }, // could be manager/lead name
    name: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // instead of developer
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    date: { type: Date, default: Date.now },
    hours: { type: Number, default: 0, required: true },
    minutes: { type: Number, default: 0 },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("WorkReport", WorkReportSchema, "work_reports");
