// models/FeedData.js
import mongoose, { mongo } from "mongoose";
import { format } from "path";
import ActivityHistory from "./ProjectHistory.js"; 
import Project from "./Projects.js"


const feedSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
    FeedName: { type: String },
    FeedId: { type: String},
    DomainName: { type: String },
    ApplicationType: { type: String },
    CountryName: { type: String },
    Status: { type: String, default: "New" },
    BAUStatus: { type: String, default: "N/A" },
    // FeedStatus: { type: String, default: "New" },
    // FeedBAUStatus: { type: String, default: "N/A" },
    Platform: { type: String, },
    // BAU: { type: String, default: "None" },
    POC: { type: String, default: "None" },
    QAProcess: { type: String, default: "None" },
    // PCId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // TLId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    DeveloperIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    QAPersonId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    BAUId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    DomainName: { type: String},
    FrameworkType: { type: String, default: "N/A" },
    ManageBy: { type: String, default: "N/A" },
    CountryName: { type: String},
    ApplicationType: { type: String},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createdDate: { type: Date, default: Date.now },
  
     // --- New fields for frequency ---
    // Frequency: { type: String, enum: ["Daily", "Weekly", "Monthly", "Once-off", "Custom"]},
    // TimelineTime: { type: String },          // e.g., "14:30"
    // TimelineDay: { type: String },           // for weekly, e.g., "Monday"
    // TimelineDate: { type: Number },          // for monthly, e.g., 15

     // --- Frequency & Schedule ---
    Frequency: { 
      type: String, 
      enum: ["Daily", "Weekly", "Monthly", "Once-off", "Custom"], 
      // required: true 
      // default: "Daily"
    },
    Schedule: {
      time: { type: String },           // e.g., "14:30" for Daily, Weekly, Monthly
      day: { type: String },            // e.g., "Monday" for Weekly
      date: { type: Number },           // e.g., 15 for Monthly
      datetime: { type: Date },         // exact datetime for Once-off
      custom: [
        {
          day: { type: String, required: true },   // e.g., "Monday"
          time: { type: String, required: true }   // e.g., "14:30"
        }
      ]
    },

    DatabaseSettings: {
    databaseType: String,
    host: String,
    mongoURI: String,
    port: String,
    username: String,
    password: String,
    databaseName: String,
    tableName: String,
    hasDataTable: Boolean,
    dateFormat: String,
    datePosition: String,
    format: String
  },
  // QARules: [{
  //   field: String,
  //   type: String,
  //   threshold: String,
  //   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  //   createdAt: { type: Date, default: Date.now }
  // }],

  QARules: [
      {
        field: { type: String, required: true },
        type: { type: String, required: true },
        threshold: { type: String, required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
  InputListing: {type: String, default: "N/A"},
  OutputListing: {type: String, default: "N/A"},
  Threads: {type: String, default: "N/A"},

    DeliveryStatus: { type: String, enum: ["Scheduled", "Delivered"]},
    StartTime: { type: Date },
    DeliveryTime: { type: Date },
    DeliveryCode: { type: Date },
    DeliveryComments: { type: String },
  },
  { timestamps: true }
);
// =================== MIDDLEWARE ===================

// Pre-save hook to log creation or updates
// feedSchema.pre("save", async function(next) {
//   try {
//     const Feed = this.constructor;
//     const isNewFeed = this.isNew;
//     const Activity = ActivityHistory;

//     if (isNewFeed) {
//       // Log Feed Creation
//       await Activity.create({
//         projectId: this.projectId,
//         feedId: this._id,
//         actionType: "Feed Created",
//         description: `Feed ${this.FeedName} created`,
//         performedBy: this._updatedBy || this.createdBy
//       });
//     } else {
//       // Log Feed Updates
//       const original = await Feed.findById(this._id);
//       const changedFields = [];

//       this.modifiedPaths().forEach(path => {
//         if (path !== "updatedAt" && path !== "_updatedBy") {
//           const oldValue = original[path];
//           const newValue = this[path];
//           if ((oldValue || newValue) && oldValue?.toString() !== newValue?.toString()) {
//             changedFields.push({
//               field: path,
//               oldValue: oldValue,
//               newValue: newValue
//             });
//           }
//         }
//       });

//       if (changedFields.length) {
//         await Activity.create({
//           projectId: this.projectId,
//           feedId: this._id,
//           actionType: "Feed Updated",
//           changedFields,
//           description: `Feed ${this.FeedName} updated`,
//           performedBy: this._updatedBy
//         });
//       }
//     }

//     next();
//   } catch (err) {
//     console.error("Activity log error:", err);
//     next(err);
//   }
// });

// feedSchema.pre("save", async function(next) {
//   try {
//     const Activity = ActivityHistory;

//     if (this.isNew) {
//       const project = await Project.findById(this.projectId).lean();


      
//       // console.log("DEBUG FeedName:", this.FeedName);
//       // console.log("DEBUG projectId:", this.projectId);
//       // console.log("DEBUG project:", project);
//       await Activity.create({
//         projectId: this.projectId,
//         feedId: this._id,
//         FeedName: this.FeedName,                 // now taken from feed document
//         ProjectName: project?.ProjectName || null, // fetch from Project collection
//         actionType: "Feed Created",
//         description: `Created Feed ${this.FeedName} in ${project?.ProjectName || ""}`,
//         actionType: "Feed Created",
//         // description: `Feed ${this.FeedName} created`,
//         performedBy: this.createdBy
//       });
//     } else {
//       // Log updates
//       const original = await this.constructor.findById(this._id).lean();
//       const changedFields = [];

//       this.modifiedPaths().forEach(path => {
//         if (path !== "updatedAt" && path !== "_updatedBy") {
//           const oldValue = original[path];
//           const newValue = this[path];
//           if ((oldValue || newValue) && oldValue?.toString() !== newValue?.toString()) {
//             changedFields.push({ field: path, oldValue, newValue });
//           }
//         }
//       });

//       // if (changedFields.length) {
//       //   await Activity.create({
//       //     projectId: this.projectId,
//       //     feedId: this._id,
//       //     actionType: "Feed Updated",
//       //     changedFields,
//       //     description: `Feed ${this.FeedName} updated`,
//       //     performedBy: this._updatedBy
//       //   });
//       // }
//     }

//     next();
//   } catch (err) {
//     console.error("Activity log error:", err);
//     next(err);
//   }
// });

export default mongoose.model("Feed", feedSchema, "Feed-data");
