// models/QAData.js
import mongoose from "mongoose";
const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fromStatus: { type: String, },
  toStatus: { type: String,},
  date: { type: Date, default: Date.now },
  comment: { type: String, },
  timestamp: { type: Date, default: Date.now }
});
const assignedFileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileLink: { type: String, required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedAt: { type: Date, default: Date.now },
});
const qaReportSchema = new mongoose.Schema({
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    fileName: {type : String, },
    fileLink: {type: String},
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadedAt: { type: Date, default: Date.now },

});
const QASchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",   // link to Project collection
      // required: true
    },
    feedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feed",   // link to Feed collection
      // required: true
    },
    qaError: {
      type: String,
      required: true
    },
    qaStatus: {
      type: String,
      // enum: ["Open", "Closed"],
      default: "Open"
    },
    // qaReport: {
    //   type: String,
    //   required: true
    // },
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    // reports: [
    //   {
    //     filePath: { type: String },
    //     uploadedAt: { type: Date, default: Date.now }
    //   }
    // ],
    history: [activityLogSchema],
    assignedFiles: [assignedFileSchema],
    qaReports: [qaReportSchema]
  },
  { timestamps: true }
);

export default mongoose.model("QA", QASchema, "QA-data");
