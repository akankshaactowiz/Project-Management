import mongoose from "mongoose";

const workDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",    
        required: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        // required: true
    },
    workDate: {
        type: Date,
        default: Date.now
    },
    hoursWorked: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

export default mongoose.model("WorkData", workDataSchema, "Work_data");