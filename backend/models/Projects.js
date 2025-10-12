import mongoose from "mongoose";
import User from "./User.js";
import ActivityHistory from "./ProjectHistory.js";


// 


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
  ProjectName: { type: String, required: true, unique: true},
  BDEId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  DepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  CreatedDate: { type: Date, default: Date.now },
  BAUStartDate: { type: Date },
  CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
updateHistory: [
      {
        field: String,  // e.g. "TLId", "ProjectName"
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
  EndDate: { type: Date },
  // FrameworkType: { type: String, default: "N/A" },
  // QAReportCount: { type: Number, default: 0 },
  // ManageBy: { type: String, default: "N/A" },
  // QARules: { type: Number, default: 0 },
  // RulesStatus: { type: String, default: "Draft" },
  // RulesApply: { type: String, default: "Database" },
  // DBStatus: { type: String, default: "Actowizdb" },
  // DBType: { type: String, default: "MongoDB" },

  Feeds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feed" }],
  history: [historySchema],

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

  // Internal field for tracking who updates
  _updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

// =================== MIDDLEWARE ===================

// projectSchema.pre("save", async function (next) {
//   try {
//     const Project = this.constructor;
//     const Activity = ActivityHistory;

//     if (this.isNew) {
//       // Log Project Creation
//       await Activity.create({
//         projectId: this._id,
//         actionType: "Project Created",
//         description: `Project ${this.ProjectName} created`,
//         performedBy: this._updatedBy || this.CreatedBy
        
//       });
//     } else {
//       // Log Project Updates
//       const original = await Project.findById(this._id).lean();
//       const changedFields = [];
//        const IGNORED_FIELDS = ["updatedAt", "_updatedBy", "Feeds"]; 
//       this.modifiedPaths().forEach((path) => {
//         if (IGNORED_FIELDS.includes(path)) return; // 
//         if (path !== "updatedAt" && path !== "_updatedBy") {
//           const oldValueRaw = original[path];
//           const newValueRaw = this[path];

//           // Skip if nothing changed
//           if (["_updatedBy", "updatedAt"].includes(path)) return;
//           if (oldValueRaw?.toString() === newValueRaw?.toString()) return;
//           // if (Array.isArray(this[path])) return;
//           if (this[path] instanceof mongoose.Types.Array) return;

//           const wrapValue = (val) => {
//             if (!val) return null;
//             if (val._id) return { _id: val._id, refModel: val.constructor.modelName, value: val.name || val.value || val.toString() };
//             return { value: val.toString() };
//           };

//           changedFields.push({
//             field: path,
//             oldValue: wrapValue(oldValueRaw),
//             newValue: wrapValue(newValueRaw)
//           });
//         }
//       });

//       if (changedFields.length) {
//         await Activity.create({
//           projectId: this._id,
//           actionType: "Project Updated",
//           changedFields,
//           description: `Project ${this.ProjectName} updated`,
//           performedBy: this._updatedBy
//         });
//       }
//     }

//     next();
//   } catch (err) {
//     console.error("Project Activity log error:", err);
//     next(err);
//   }
// });
// projectSchema.pre("save", async function (next) {
//   try {
//     const Project = this.constructor;
//     const Activity = ActivityHistory;
// if (this._skipActivityLog) return next();
//     if (this.isNew) {
//       // Log Project Creation
//       await Activity.create({
//         projectId: this._id,
//         actionType: "Project Created",
//         description: `Project ${this.ProjectName} created`,
//         performedBy: this._updatedBy || this.CreatedBy
//       });
//       return next();
//     }

//     // Log Project Updates
//     const original = await Project.findById(this._id).lean();
//     const changedFields = [];
//     const IGNORED_FIELDS = ["updatedAt", "_updatedBy", "Feeds"];

//     this.modifiedPaths().forEach((path) => {
//       if (IGNORED_FIELDS.includes(path)) return;

//       const oldValueRaw = original[path];
//       const newValueRaw = this[path];

//       // Skip if nothing changed
//       if (
//         (oldValueRaw === null && newValueRaw === null) ||
//         (oldValueRaw === undefined && newValueRaw === undefined) ||
//         (oldValueRaw?.toString() === newValueRaw?.toString())
//       ) return;

//       // Skip arrays completely
//       if (Array.isArray(newValueRaw)) return;

//       const wrapValue = (val) => {
//         if (!val) return null;
//         if (val._id) return { _id: val._id, refModel: val.constructor.modelName, value: val.name || val.value || val.toString() };
//         return { value: val.toString() };
//       };

//       changedFields.push({
//         field: path,
//         oldValue: wrapValue(oldValueRaw),
//         newValue: wrapValue(newValueRaw)
//       });
//     });

//     if (changedFields.length > 0) {
//       await Activity.create({
//         projectId: this._id,
//         actionType: "Project Updated",
//         changedFields,
//         description: `Project ${this.ProjectName} updated`,
//         performedBy: this._updatedBy
//       });
//     }

//     next();
//   } catch (err) {
//     console.error("Project Activity log error:", err);
//     next(err);
//   }
// });






export default mongoose.model("Project", projectSchema, "Projects_data");
