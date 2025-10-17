import mongoose from "mongoose";
import User from "./User.js";
import ActivityHistory from "./ProjectHistory.js";

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true }, // store user's name to avoid extra joins
  action: { type: String, required: true }, // e.g., "Updated Project Name"
  field: { type: String, required: true }, // e.g., "ProjectName"
  from: { type: String }, // old value
  to: { type: String },   // new value
  date: { type: Date, default: Date.now }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  ProjectCode: { type: String, required: true, unique: true },

  Frequency: { type: String, default: "Daily" },
  IndustryType: {type:String, default: "N/A"},
  DeliveryType: { type: String, default: "N/A" },
  ProjectType: { type: String, default: "N/A" },
  VolumeCount: { type: String, default: "N/A" },
  

  // --- SALES ---
  SOWFile: [
    {
      fileName: { type: String, required: true },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  SampleFiles: [
    {
      fileName: { type: String, required: true },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],

  PMId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ProjectName: { type: String, required: true, unique: true},
  BDEId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  DepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  CreatedDate: { type: Date, default: Date.now },
  BAUStartDate: { type: Date },
  CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
updateHistory: [
      {
        field: String, 
        // oldValue: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        oldValue: String,
        newValue: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedAt: { type: Date, default: Date.now }
      }
    ],
  Timeline: { type: String },

  ExpectedDeliveryDate: { type: String, default: "N/A" },

  Description: { type: String },


  Priority: { type: String, default: "N/A" },

  // Project Statuses
  Status: { type: String, default: "New" },
  qaStatus: { type: String, default: "N/A" },


  Platform: { type: String, },
  BAU: { type: String, default: "None" },
  POC: { type: String, default: "None" },
  PCId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  TLId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  DeveloperIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  QAId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  BAUPersonId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  StartDate: { type: Date },
  Feeds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feed" }],
  history: [historySchema],

  devSubmissions: [
    {
      fileName: String,
      fileUrl: String,
      submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      submittedAt: { type: Date, default: Date.now }
    }
  ],
  developerStatus: { type: String, default: "New" },
  qaStatus: { type: String, default: "" },

  // Internal field for tracking who updates
  _updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });


export default mongoose.model("Project", projectSchema, "Projects_data");
