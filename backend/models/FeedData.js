// models/FeedData.js
import mongoose from "mongoose";

const feedSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
    FeedName: { type: String },
    FeedId: { type: String},
    DomainName: { type: String },
    ApplicationType: { type: String },
    CountryName: { type: String },

    Status: { type: String, default: "New" },
    Platform: { type: String, },
    BAU: { type: String, default: "None" },
    POC: { type: String, default: "None" },
    PCId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    TLId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    DeveloperIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    QAId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    BAUPersonId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    DomainName: { type: String},
    FrameworkType: { type: String, default: "N/A" },
    CountryName: { type: String},
    ApplicationType: { type: String},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createdDate: { type: Date, default: Date.now },
  
     // --- New fields for frequency ---
    Frequency: { type: String, enum: ["Daily", "Weekly", "Monthly", "Once-off"]},
    TimelineTime: { type: String },          // e.g., "14:30"
    TimelineDay: { type: String },           // for weekly, e.g., "Monday"
    TimelineDate: { type: Number },          // for monthly, e.g., 15

    DeliveryStatus: { type: String, enum: ["Scheduled", "Delivered"]},
    StartTime: { type: Date },
    DeliveryTime: { type: Date },
    DeliveryCode: { type: Date },
    DeliveryComments: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Feed", feedSchema, "Feed-data");
