import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema({
  module: { type: String, required: true },
  actions: [{ type: String, required: true }],
  departments: [{ type: Number, required: true }]
});

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [ModuleSchema],
  description: String,
});
export default mongoose.model("Role", RoleSchema, "roles");
