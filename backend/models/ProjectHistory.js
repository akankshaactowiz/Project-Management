import mongoose from "mongoose";

const changedFieldSchema = new mongoose.Schema({
  field: { type: String, required: true },

  oldValue: {
    _id: { type: mongoose.Schema.Types.ObjectId, refPath: "changedFields.oldValue.refModel" },
    refModel: { type: String }, // e.g., "User", "Project", "Feed" or leave undefined for primitives
    value: { type: String }     // store primitive value or display-friendly text
  },

  newValue: {
    _id: { type: mongoose.Schema.Types.ObjectId, refPath: "changedFields.newValue.refModel" },
    refModel: { type: String },
    value: { type: String }
  }
});

const activityHistorySchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  feedId: { type: mongoose.Schema.Types.ObjectId, ref: "Feed" },

  actionType: {
    type: String,
    enum: [
      "Project Created",
      "Feed Created",
      "Project Updated",
      "TL Assigned",
      "PC Assigned",
      "Developer Assigned",
      "Feed Updated",
      "Feed Delivered",
      "Other"
    ],
    default: "Other"
  },

  changedFields: [changedFieldSchema],

  description: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  performedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const ActivityHistory = mongoose.model("ActivityHistory", activityHistorySchema);
export default ActivityHistory;
