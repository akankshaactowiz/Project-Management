import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema({
  module: { type: String, required: true, unique: true },
  label: { type: String },
  icon: { type: String },
  path: { type: String },
  actions: [{ type: String }],
});
export default mongoose.model("Module", ModuleSchema, "modules"); 
