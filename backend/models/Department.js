import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    department: { type: String, required: true, unique: true },
    id: { type: Number, required: true, unique: true },
});

export default mongoose.model("Department", departmentSchema, "department");