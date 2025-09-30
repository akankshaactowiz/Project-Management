import mongoose from "mongoose";
import User from "./User.js";


const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fromStatus: { type: String, },
  toStatus: { type: String, },
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
const projectSchema = new mongoose.Schema({
  ProjectCode: { type: String, required: true, unique: true },
  Frequency: { type: String, default: "Daily" },
  IndustryType: {type:String, default: "N/A"},
  DeliveryType: { type: String, default: "N/A" },
  ProjectType: { type: String, default: "N/A" },

  // --- SALES ---
  // SOWFile: [{ type: String, required: true }],
  // SampleFiles: [{ type: String, required: true }],
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
  ProjectName: { type: String, required: true },
  BDEId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  DepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  CreatedDate: { type: Date, default: Date.now },
  BAUStartDate: { type: Date },
  CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  Timeline: { type: String },

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
  // DeveloperIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  QAId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  BAUPersonId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  StartDate: { type: Date },
  EndDate: { type: Date },
  FrameworkType: { type: String, default: "N/A" },
  QAReportCount: { type: Number, default: 0 },
  ManageBy: { type: String, default: "N/A" },
  QARules: { type: Number, default: 0 },
  RulesStatus: { type: String, default: "Draft" },
  RulesApply: { type: String, default: "Database" },
  DBStatus: { type: String, default: "Actowizdb" },
  DBType: { type: String, default: "MongoDB" },

  Feeds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feed" }],

  // New fields for tracking QA cycles, history, etc.
  // history: [activityLogSchema],
  // qaCycleTimes: [{ start: Date, end: Date }],
  // reworkCount: { type: Number, default: 0 },
  // assignedFiles: [assignedFileSchema],
  // qaReports: [
  //   {
  //     comment: String,
  //     status: { type: String, },
  //     fileName: String,
  //     fileLink: String,
  //     uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  //     uploadedAt: Date,
  //     // uniqueId: String,
  //     developerComments: [
  //       {
  //         comment: String,
  //         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  //         date: { type: Date, default: Date.now }
  //       }
  //     ]
  //   }
  // ],
  // qaReportLink: { type: String, unique: true },
  //  qaReports: [qaReportSchema],
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
}, { timestamps: true });



export default mongoose.model("Project", projectSchema, "Projects_data");
