import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // new field
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });




// Encrypt password before save
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Match password method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", UserSchema, "User-data");
