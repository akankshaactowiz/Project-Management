const projectHistorySchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  field: String,         // which field was changed
  oldValue: String,
  newValue: String,
  updatedAt: { type: Date, default: Date.now }
});
