import Project from "../models/Projects.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from 'uuid';
import Task from "../models/TaskData.js";
import Notification from "../models/Notification.js";
import Feed from "../models/FeedData.js";
import { generateFeedId } from "../utils/generateFeedId.js";
import mongoose from "mongoose";
import getDateRangeFilter from "../utils/ScheduleFilter.js";
import Activity from "../models/ProjectHistory.js";
import { logHistory } from "../middlewares/logHistory.js";




export const createProject = async (req, res) => {
  try {
    const {
      ProjectCode,
      ProjectName,
      FeedName,
      PMId,
      BDEId,
      DepartmentId: Department,
      Frequency,
      Priority,
      ProjectType,
      IndustryType,
      DeliveryType,
      VolumeCount,
      Timeline,
      ExpectedDeliveryDate,
      Description,
      DomainName,
      ApplicationType,
      CountryName,
    } = req.body;

    const createdBy = req.user?._id || null;
    const updatedBy = req.user?._id || null;
    const errors = {};

    // if (!ProjectCode) return res.status(400).json({ success: false, message: "Project Code is required" });
    // if (!ProjectCode) errors.ProjectCode = "Project Code is required";
    if (!ProjectName) errors.ProjectName = "Project Name is required";
    // if (!ProjectName) return res.status(400).json({ success: false, message: "Project Name is required" });

    // const BACKEND_URL = process.env.BACKEND_URL || "http://172.28.148.120/:5000";

    const SOWFile = req.files?.SOWFile?.map(f => ({
      fileName: `/uploads/projects/${f.filename}`,
      uploadedBy: createdBy,
      uploadedAt: new Date(),
    })) || [];

    const SampleFiles = req.files?.SampleFiles?.map(f => ({
      fileName: `/uploads/projects/${f.filename}`,
      uploadedBy: createdBy,
      uploadedAt: new Date(),
    })) || [];


    if (SOWFile.length === 0) errors.SOWFile = "SOW File is required";
    if (SampleFiles.length === 0) errors.SampleFiles = "Sample Files are required";

    // ✅ Field-wise backend validation
    // Feed-related
    if (!FeedName) errors.FeedName = "Feed Name is required";
    if (!DomainName) errors.DomainName = "Domain Name is required";
    if (!ApplicationType) errors.ApplicationType = "Application Type is required";
    if (!CountryName) errors.CountryName = "Country Name is required";

    // Assignment
    if (!PMId) errors.PMId = "Project Manager is required";
    // if (!BDEId) errors.BDEId = "Business Development Executive is required";
    if (!Department) errors.Department = "Department is required";

    // Project details
    // if (!Frequency) errors.Frequency = "Frequency is required";
    // if (!Priority) errors.Priority = "Priority is required";
    if (!ProjectType) errors.ProjectType = "Project Type is required";
    if (!IndustryType) errors.IndustryType = "Industry Type is required";
    if (!DeliveryType) errors.DeliveryType = "Delivery Type is required";


    // ✅ VolumeCount validation
    if (VolumeCount) {
      const volumePattern = /^\d+(\.\d+)?[A-Za-z]*$/;
      if (!volumePattern.test(VolumeCount.trim())) {
        errors.VolumeCount = "Volume Count must start with a number (e.g., 8L, 80M, 100K)";
      }
    }

    // ✅ If any errors exist, return them all together
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    // Prepend ACT prefix
    // const finalProjectCode = `[ACT-${ProjectCode}]`;

    // Get last project number
    // const lastProject = await Project.findOne({}).sort({ _id: -1 });
    // let seq = 1;

    // if (lastProject) {
    //   const lastNumber = parseInt(lastProject.ProjectCode.split('-')[1]);
    //   seq = lastNumber + 1;
    // }

    // const finalProjectCode = `ACT-${seq.toString().padStart(4, '0')}`;

    // 1️⃣ Get the last created project safely
    const lastProject = await Project.findOne()
      .sort({ _id: -1 }) // sort by creation order
      .select("ProjectCode")
      .lean();

    // 2️⃣ Extract and increment number safely
    let nextNumber = 1;
    if (lastProject?.ProjectCode) {
      const match = lastProject.ProjectCode.match(/\d+/); // works even with brackets
      if (match) nextNumber = parseInt(match[0], 10) + 1;
    }

    // 3️⃣ Generate new code
    const finalProjectCode = `[ACT-${String(nextNumber).padStart(4, "0")}]`;

    // 1️⃣ Create Project
    // 1️⃣ Create Project
    const project = await Project.create({
      ProjectCode: finalProjectCode,
      ProjectName,
      SOWFile,
      SampleFiles,
      PMId,
      BDEId: BDEId || createdBy,
      DepartmentId: Department,
      Frequency,
      ProjectType,
      IndustryType,
      DeliveryType,
      VolumeCount,
      Priority,
      Timeline: Timeline || "",
      ExpectedDeliveryDate: ExpectedDeliveryDate || "N/A",
      Description: Description || "",
      CreatedBy: createdBy,
      _updatedBy: updatedBy,
      TLId: null,
      PCId: null,
      QAId: null,
      BAUPersonId: null,
      Feeds: [],
    });

    // Log Project creation
    await logHistory({
      modelName: "Project",
      newDoc: project,
      userId: createdBy,
      projectId: project._id,
    });
    // await project.save(); 
    // 2️⃣ Create initial Feed linked to project
    const FeedId = generateFeedId();

    const initialFeed = await Feed.create({
      projectId: project._id,
      FeedId,
      FeedName,
      DomainName,
      ApplicationType,
      CountryName,
      Platform: `${DomainName}|${ApplicationType}|${CountryName}`,
      createdBy,
    });

    // 3️⃣ Add feed reference to project
    // project.Feeds.push(initialFeed._id);
    // await initialFeed.save();
    // project._updatedBy = createdBy; //activity middlewre  
    // await project.save(); 
    // ✅ Only saves the updated Feeds array

    // Log Feed creation
    await logHistory({
      modelName: "Feed",
      newDoc: initialFeed,
      userId: createdBy,
      projectId: project._id,
      feedId: initialFeed._id,
    });

    await Project.updateOne(
      { _id: project._id },
      {
        $push: { Feeds: initialFeed._id },
        $set: { _updatedBy: createdBy }
      }
    );
    res.status(201).json({
      success: true,
      data: { project, feed: initialFeed },
      message: "Project created with uploaded files and initial feed",
    });

  } catch (error) {
    console.error("Error creating project:", error);

    if (error.code === 11000) {
      if (error.keyPattern?.ProjectCode) {
        return res.status(400).json({
          success: false,
          message: "A project with this Project Code already exists."
        });
      }
      if (error.keyPattern?.ProjectName) {
        return res.status(400).json({
          success: false,
          message: "A project with this Project Name already exists."
        });
      }
      return res.status(400).json({
        success: false,
        message: "A project with this field already exists."
      });
    }


    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "A project with this Project Name already exists."
      });
    }

    res.status(500).json({
      success: false,
      message: "Unexpected server error while creating project. Please try again later."
    });
  }
};


// export const updateProject = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const userId = req.user?._id || null;

//     // Destructure fields from body
//     let {
//       ProjectName,
//       ProjectCode, // user-entered suffix
//       Frequency,
//       PMId,
//       BDEId,
//       Department,
//       Priority,
//       ProjectType,
//       IndustryType,
//       DeliveryType,
//       Timeline,
//       Description,
//     } = req.body;

//     // Prepend "ACT" prefix to ProjectCode
//     // if (ProjectCode) {
//     //   ProjectCode = `ACT${ProjectCode}`;
//     // }

//     // Fetch existing project
//     const project = await Project.findById(id)
//       // .populate("PMId", "_id name")   // 🔹 populate PM
//       // .populate("BDEId", "_id name");;
//     // if (ProjectCode) {
//     //   // Remove any existing ACT or ACT- prefix from user input
//     //   const suffix = ProjectCode.replace(/^ACT-?/, '');
//     //   ProjectCode = `[ACT-${suffix}]`;
//     // }
//     // project.ProjectCode = ProjectCode || project.ProjectCode;
//     if (!project) {
//       return res.status(404).json({ success: false, message: "Project not found" });
//     }


//     const oldProject = project.toObject(); // save for diffing


//     // Get newly uploaded files (if any)
//     // const BACKEND_URL = process.env.BACKEND_URL || "http://172.28.148.130:5000";
//     // const newSOW = req.files?.SOWFile
//     //   ? req.files.SOWFile.map(f => `${BACKEND_URL}/${f.path.replace(/\\/g, "/")}`)
//     //   : [];
//     // const newSamples = req.files?.SampleFiles
//     //   ? req.files?.SampleFiles.map(f => `${BACKEND_URL}/${f.path.replace(/\\/g, "/")}`)
//     //   : [];

//     // Convert new uploads to objects with metadata
//     const newSOW = req.files?.SOWFile
//       ? req.files.SOWFile.map(f => ({
//         fileName: `/uploads/projects/${f.filename}`,
//         uploadedBy: req.user._id, // assumes user is attached to req
//         uploadedAt: new Date()
//       }))
//       : [];

//     const newSamples = req.files?.SampleFiles
//       ? req.files.SampleFiles.map(f => ({
//         fileName: `/uploads/projects/${f.filename}`,
//         uploadedBy: req.user._id,
//         uploadedAt: new Date()
//       }))
//       : [];

//     // Merge with existing files
//     project.SOWFile = [...project.SOWFile, ...newSOW];
//     project.SampleFiles = [...project.SampleFiles, ...newSamples];

//     // Update fields
//     project.ProjectName = ProjectName || project.ProjectName;
//     project.ProjectCode = ProjectCode || project.ProjectCode; // now always has ACT prefix
//     project.PMId = PMId || project.PMId;
//     project.BDEId = BDEId || project.BDEId;
//     project.DepartmentId = Department || project.DepartmentId;
//     project.Frequency = Frequency || project.Frequency;
//     project.Priority = Priority || project.Priority;
//     project.ProjectType = ProjectType || project.ProjectType;
//     project.IndustryType = IndustryType || project.IndustryType;
//     project.DeliveryType = DeliveryType || project.DeliveryType;
//     project.Timeline = Timeline || project.Timeline;
//     project.Description = Description || project.Description;
//     // project.SOWFile = updatedSOW;
//     // project.SampleFiles = updatedSamples;

//     // const changedFields = [];

//     // // Compare old and new values for each field
//     // const fieldsToCheck = {
//     //   ProjectName,
//     //   ProjectCode,
//     //   Frequency,
//     //   PMId,
//     //   BDEId,
//     //   Department,
//     //   Priority,
//     //   ProjectType,
//     //   IndustryType,
//     //   DeliveryType,
//     //   Timeline,
//     //   Description,
//     // };

//     // for (const [key, newVal] of Object.entries(fieldsToCheck)) {
//     //   const oldVal = project[key];
//     //   if (newVal != null && newVal.toString() !== (oldVal?._id?.toString() || oldVal?.toString())) {
//     //     changedFields.push({
//     //       field: key,
//     //       oldValue: oldVal
//     //         ? typeof oldVal === "object" && oldVal._id
//     //           ? { _id: oldVal._id, refModel: oldVal.constructor.modelName, value: oldVal.name || oldVal.value || "" }
//     //           : { value: oldVal }
//     //         : null,
//     //       newValue: newVal
//     //         ? typeof newVal === "object" && newVal._id
//     //           ? { _id: newVal._id, refModel: newVal.constructor.modelName, value: newVal.name || newVal.value || "" }
//     //           : { value: newVal }
//     //         : null,
//     //     });
//     //   }
//     // }

//     // // Update project fields
//     // Object.assign(project, fieldsToCheck);
//     project._updatedBy = req.user?._id || null;
//     // await project.save();
//     // Log changes using logHistory
//     await logHistory({
//       modelName: "Project",
//       oldDoc: oldProject,
//       newDoc: project,
//       userId,
//       projectId: project._id,
//     });


//     res.status(200).json({
//       success: true,
//       project,
//       message: "Project updated successfully",
//     });
//   } catch (error) {
//     console.error("Error updating project:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || null;

    const project = await Project.findById(id);
    if (!project)
      return res.status(404).json({ success: false, message: "Project not found" });

    const oldProject = project.toObject(); // snapshot before changes

    // Handle file uploads
    const newSOW = req.files?.SOWFile?.map(f => ({
      fileName: `/uploads/projects/${f.filename}`,
      uploadedBy: userId,
      uploadedAt: new Date()
    })) || [];

    const newSamples = req.files?.SampleFiles?.map(f => ({
      fileName: `/uploads/projects/${f.filename}`,
      uploadedBy: userId,
      uploadedAt: new Date()
    })) || [];

    if (newSOW.length > 0) project.SOWFile = [...project.SOWFile, ...newSOW];
    if (newSamples.length > 0) project.SampleFiles = [...project.SampleFiles, ...newSamples];

    // List of updatable fields from payload
    const updatableFields = [
      "ProjectName",
      "Frequency",
      "PMId",
      "BDEId",
      "DepartmentId",
      "Priority",
      "ProjectType",
      "IndustryType",
      "DeliveryType",
      "Timeline",
      "Description",
      "FeedName",
      "DomainName",
      "ApplicationType",
      "CountryName"
    ];

    const changes = [];

    // Update only fields present in req.body
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        const oldVal = oldProject[field];
        const newVal = req.body[field];

        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          project[field] = newVal;
          changes.push({ field, oldValue: oldVal, newValue: newVal });
        }
      }
    });

    project._updatedBy = userId;
    await project.save();

    // Log history for all changed fields at once
    if (changes.length > 0) {
      await logHistory({
        modelName: "Project",
        oldDoc: oldProject,
        newDoc: project,
        userId,
        projectId: project._id
      });
    }

    res.status(200).json({
      success: true,
      project,
      message: changes.length > 0 ? "Project updated successfully" : "No changes detected"
    });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProjects = async (req, res) => {
  const objectId = (id) => new mongoose.Types.ObjectId(id);
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      search,
      qaid,
      CreatedDate,
      tab,
      statusTab,
    } = req.query;

    const userId = req.user._id.toString();
    const role = req.user.roleId?.name;
    const department = req.user.departmentId?.department;

    const matchStage = {};

    // Status
    if (status) {
      matchStage.Status = { $regex: `^${status}$`, $options: "i" };
    }

    // DeliveryType / tab
    if (tab) {
      matchStage.DeliveryType = { $regex: `^${tab}$`, $options: "i" };
    }

    // CreatedDate
    if (CreatedDate) {
      const start = new Date(CreatedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(CreatedDate);
      end.setHours(23, 59, 59, 999);
      matchStage.CreatedDate = { $gte: start, $lte: end };
    }
    // 🔹 Role-based filters
    if (!(role === "Superadmin")) {
      if (department === "Sales") {
        if (role === "Sales Manager") matchStage.CreatedBy = objectId(userId);
        if (role === "Business Development Executive") matchStage.BDEId = objectId(userId);
      } else {
        if (role === "Manager") matchStage.PMId = objectId(userId);
        if (role === "Team Lead") matchStage.TLId = objectId(userId);
        if (role === "Project Coordinator") matchStage.PCId = objectId(userId);
        if (role === "QA") matchStage.QAId = objectId(userId);
        if (role === "Developer") {
         
        }
      }

    }

    // 🔹 Build aggregation pipeline
    const pipeline = [
      { $match: matchStage },

       // 🔹 Lookup Feeds
  {
    $lookup: {
      from: "Feed-data",
      let: { feedIds: "$Feeds" },
      pipeline: [
        { $match: { $expr: { $in: ["$_id", "$$feedIds"] } } },
        {
          $lookup: {
            from: "User-data",
            localField: "DeveloperIds",
            foreignField: "_id",
            as: "DeveloperIds",
          },
        },
      ],
      as: "Feeds",
    },
  },

  // 🔹 Filter projects for Developer role after Feeds populated
  ...(role === "Developer"
    ? [
        {
          $match: {
            $or: [
              { DeveloperIds: objectId(userId) }, // project level
              { "Feeds.DeveloperIds._id": objectId(userId) }, // feed level
            ],
          },
        },
      ]
    : []),


      // 🔹 Lookup for PMId
      {
        $lookup: {
          from: "User-data",
          let: { pmId: "$PMId" }, // local field
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$pmId"] } } },
            { $project: { _id: 1, name: 1 } } // only include _id and name
          ],
          as: "PMId"
        }
      },
      { $unwind: { path: "$PMId", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "User-data",
          let: { id: "$BDEId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { _id: 1, name: 1 } }
          ],
          as: "BDEId"
        }
      },
      { $unwind: { path: "$BDEId", preserveNullAndEmptyArrays: true } },

      // 🔹 Lookup for CreatedBy
      {
        $lookup: {
          from: "User-data",
          let: { id: "$CreatedBy" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { _id: 1, name: 1 } }
          ],
          as: "CreatedBy"
        }
      },
      { $unwind: { path: "$CreatedBy", preserveNullAndEmptyArrays: true } },

      // 🔹 Lookup for TLId
      {
        $lookup: {
          from: "User-data",
          let: { id: "$TLId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { _id: 1, name: 1 } }
          ],
          as: "TLId"
        }
      },
      { $unwind: { path: "$TLId", preserveNullAndEmptyArrays: true } },

      // 🔹 Lookup for BAUPersonId
      {
        $lookup: {
          from: "User-data",
          let: { id: "$BAUPersonId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { _id: 1, name: 1 } }
          ],
          as: "BAUPersonId"
        }
      },
      { $unwind: { path: "$BAUPersonId", preserveNullAndEmptyArrays: true } },

      // 🔹 Lookup for PCId
      {
        $lookup: {
          from: "User-data",
          let: { id: "$PCId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { _id: 1, name: 1 } }
          ],
          as: "PCId"
        }
      },
      { $unwind: { path: "$PCId", preserveNullAndEmptyArrays: true } },

      // 🔹 Lookup for QAId
      {
        $lookup: {
          from: "User-data",
          let: { id: "$QAId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { _id: 1, name: 1 } }
          ],
          as: "QAId"
        }
      },
      { $unwind: { path: "$QAId", preserveNullAndEmptyArrays: true } },

      // 🔹 Optional search filter
      ...(search
        ? [
          {
            $match: {
              $or: [
                { ProjectName: { $regex: search, $options: "i" } },
                { ProjectCode: { $regex: search, $options: "i" } },
                { Frequency: { $regex: search, $options: "i" } },
                { IndustryType: { $regex: search, $options: "i" } },
                { ProjectType: { $regex: search, $options: "i" } },
                { "PMId.name": { $regex: search, $options: "i" } },
                { "TLId.name": { $regex: search, $options: "i" } },
                { "QAId.name": { $regex: search, $options: "i" } },
                { "CreatedBy.name": { $regex: search, $options: "i" } },
                { "BDEId.name": { $regex: search, $options: "i" } },
              ],
            },
          },
        ]
        : []),

      // 🔹 Sort by CreatedDate
      { $sort: { CreatedDate: -1 } },

      // 🔹 Pagination
      { $skip: (parseInt(page, 10) - 1) * parseInt(pageSize, 10) },
      { $limit: parseInt(pageSize, 10) },

      // 🔹 Optional: populate Feeds if needed
      // {
      //   $lookup: {
      //     from: "Feed-data",
      //     localField: "Feeds",
      //     foreignField: "_id",
      //     as: "Feeds",
      //   },
      // },

      // {
      //   $lookup: {
      //     from: "Feed-data",
      //     let: { feedIds: "$Feeds" },
      //     pipeline: [
      //       { $match: { $expr: { $in: ["$_id", "$$feedIds"] } } },
      //       // Lookup Developers inside each feed
      //       {
      //         $lookup: {
      //           from: "User-data",
      //           localField: "DeveloperIds",
      //           foreignField: "_id",
      //           as: "DeveloperIds"
      //         }
      //       }
      //     ],
      //     as: "Feeds"
      //   }
      // },
    ];

    // 🔹 Execute aggregation
    const projects = await Project.aggregate(pipeline);

    // 🔹 Get total count (for pagination)
    // const total = await Project.countDocuments(matchStage);
    const total = await Project.countDocuments();

    res.status(200).json({
      data: projects,
      total,
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
    });
  } catch (error) {
    console.error("Error in getProjects:", error);
    res.status(500).json({ message: error.message });
  }
};


// export const getProjectCounts = async (req, res) => {
//   try {
//     const { userId, role, department } = req.user; // assuming req.user has these

//     // Build filter based on role/department
//     const filter = {};

//     if (role === "Superadmin") {
//       // No filter, get all projects
//     } else if (department === "Sales") {
//       if (role === "Sales Head") {
//         // All Sales projects
//         // filter.department = "Sales"; // optional if you want to filter Sales only
//       } else if (role === "Sales Manager") {
//         filter.CreatedBy = userId;
//       } else if (role === "Business Development Executive") {
//         filter.BDEId = userId; // assuming single BDEId
//         // if it's an array, use: filter.BDEIds = userId;
//       }
//     } else {
//       // Other departments
//       if (role === "Manager") {
//         filter.PMId = userId;
//       } else if (role === "Team Lead") {
//         filter.TLId = userId;
//       } else {
//         filter.$or = [
//           { PMId: userId },
//           { PCId: userId },
//           { TLId: userId },
//           { DeveloperIds: userId },
//           { QAId: userId },
//           { BAUId: userId },
//           { BDEId: userId },
//         ];
//       }
//     }


//     const counts = await Project.aggregate([
//       { $match: filter },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: 1 },
//           bau: { $sum: { $cond: [{ $eq: ["$DeliveryType", "BAU"] }, 1, 0] } },
//           adhoc: { $sum: { $cond: [{ $eq: ["$DeliveryType", "Adhoc"] }, 1, 0] } },
//           onceOff: { $sum: { $cond: [{ $eq: ["$DeliveryType", "Once-Off"] }, 1, 0] } },
//           poc: { $sum: { $cond: [{ $eq: ["$DeliveryType", "POC"] }, 1, 0] } },
//           rnd: { $sum: { $cond: [{ $eq: ["$DeliveryType", "R&D"] }, 1, 0] } },
//           newStatus: { $sum: { $cond: [{ $eq: ["$Status", "New"] }, 1, 0] } },
//           underDevelopment: { $sum: { $cond: [{ $eq: ["$Status", "Under Development"] }, 1, 0] } },
//           onHold: { $sum: { $cond: [{ $eq: ["$Status", "On-Hold"] }, 1, 0] } },
//           devCompleted: { $sum: { $cond: [{ $eq: ["$Status", "Production"] }, 1, 0] } },
//           bauStarted: { $sum: { $cond: [{ $eq: ["$Status", "BAU-Started"] }, 1, 0] } },
//           closed: { $sum: { $cond: [{ $eq: ["$Status", "Closed"] }, 1, 0] } },
//           totalFeeds: { $sum: { $size: "$Feeds" } },
//         },
//       },
//     ]);

//     res.status(200).json(counts[0] || {}); // return the aggregated counts
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch project counts" });
//   }
// };

// export const getProjects = async (req, res) => {
//   try {
//     const {
//       page = 1,  
//       pageSize = 10,
//       status,
//       search,
//       date_range,
//       qaid,
//     } = req.query;

//     const userId = req.user._id.toString();
//     const role = req.user.roleId?.name; // "Superadmin", "Team Lead", "Developer", "QA", etc.
//     const department = req.user.departmentId?.department;

//     const filter = {};

//     // Status filter
//     if (status && status !== "All") {
//       filter.Status = { $regex: `^${status}$`, $options: "i" };
//     }

//     // Search filter
//     if (search) {
//       filter.ProjectName = { $regex: search, $options: "i" };
//     }

//     // QA filter
//     if (qaid) filter.QAId = qaid;

//     // Role-based project-level filtering
//     if (role !== "Superadmin") {
//       if (department === "Sales") {
//         if (role === "Sales Manager") filter.CreatedBy = userId;
//         if (role === "Business Development Executive") filter.BDEId = userId;
//       } else {
//         if (role === "Manager") filter.PMId = userId;
//       }
//     }

//     // Pagination
//     const parsedPage = parseInt(page, 10) || 1;
//     const parsedPageSize = parseInt(pageSize, 10) || 20;

//     // Prepare feed-level filter based on date_range
//     let feedMatch = {};
//     if (date_range) {
//       const now = new Date();
//       const today = new Date(now.setHours(0, 0, 0, 0));
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);

//       const targetDay = now.toLocaleString("en-US", { weekday: "long" }); // e.g., "Monday"
//       const targetDate = now.getDate();

//       if (date_range.toLowerCase() === "today") {
//         feedMatch = {
//           $or: [
//             { Frequency: "Daily" },
//             { $and: [{ Frequency: "Weekly" }, { TimelineDay: targetDay }] },
//             { $and: [{ Frequency: "Monthly" }, { TimelineDate: targetDate }] },
//           ],
//         };
//       } else if (date_range.toLowerCase() === "tomorrow") {
//         const tomorrowDay = tomorrow.toLocaleString("en-US", { weekday: "long" });
//         const tomorrowDate = tomorrow.getDate();

//         feedMatch = {
//           $or: [
//             { Frequency: "Daily" },
//             { $and: [{ Frequency: "Weekly" }, { TimelineDay: tomorrowDay }] },
//             { $and: [{ Frequency: "Monthly" }, { TimelineDate: tomorrowDate }] },
//           ],
//         };
//       }
//     }

//     // Fetch projects with feed population (including feed-level filter)
//     const total = await Project.countDocuments(filter);

//     const projects = await Project.find(filter)
//       .populate("PMId QAId BAUPersonId BDEId")
//       .populate("CreatedBy", "name")
//       .populate({
//         path: "Feeds",
//         match: feedMatch,
//         populate: [
//           { path: "TLId", select: "name roleId" },
//           { path: "DeveloperIds", select: "name roleId" },
//           { path: "QAId", select: "name roleId" },
//           { path: "BAUPersonId", select: "name roleId" },
//           { path: "createdBy", select: "name email" },
//         ],
//       })
//       .sort({ CreatedDate: -1 })
//       .skip((parsedPage - 1) * parsedPageSize)
//       .limit(parsedPageSize)
//       .lean();

//     // Feed-level filtering for TL, Developer, QA
//     const filteredProjects = projects.map(project => {
//       if (["Team Lead", "Developer", "QA"].includes(role)) {
//         const feeds = project.Feeds.filter(feed => {
//           if (role === "Team Lead") return feed.TLId?._id?.toString() === userId;
//           if (role === "Developer")
//             return feed.DeveloperIds.some(dev => dev._id?.toString() === userId);
//           if (role === "QA") return feed.QAId?._id?.toString() === userId;
//           return true;
//         });
//         return { ...project, Feeds: feeds };
//       }
//       return project;
//     });

//     res.status(200).json({
//       data: filteredProjects,
//       total,
//       page: parsedPage,
//       pageSize: parsedPageSize,
//     });
//   } catch (error) {
//     console.error("Error in getProjects:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

export const getProjectCounts = async (req, res) => {
  try {
    const userId = req.user._id; // ObjectId
    const role = req.user.roleId?.name; // e.g. "Sales Head"
    const department = req.user.departmentId?.department;

    let filter = {};

    const uid = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId; // fallback to string if not ObjectId

    if (role === "Superadmin" || role === "Sales Head") {
      filter = {}; // all projects
    } else if (department === "Sales") {
      if (role === "Sales Manager") {
        filter = { CreatedBy: uid };
      } else if (role === "Business Development Executive") {
        filter = { BDEId: uid };
      }
    } else {
      if (role === "Manager") {
        filter = { PMId: uid };
      } else if (role === "Team Lead") {
        filter = { TLId: uid };
      }
      else if (role === "Project Coordinator") {
        filter = { PCId: uid };
      }
      else if (role === "Developer") {
       filter = { "Feeds.DeveloperIds": uid };
      } else {
        // everyone else: PC, Developer, QA, BAU
        filter = {
          $or: [
            { PMId: uid },
            { PCId: uid },
            { TLId: uid },
            // { DeveloperIds: uid },
            { QAId: uid },
            { BAUId: uid },
            { BDEId: uid },
          ],
        };
      }
    }

    // 🔹 DEBUG: Log filter
    console.log("Filter applied:", filter);
const debug = await Project.find({
  Feeds: { $elemMatch: { DeveloperIds: uid } },
}).select("_id ProjectName Feeds.DeveloperIds");

console.log("Matched developer projects:", debug.length);

    // Aggregation to calculate counts
    const counts = await Project.aggregate([
      { $match: filter },

      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          bau: { $sum: { $cond: [{ $eq: ["$DeliveryType", "BAU"] }, 1, 0] } },
          adhoc: { $sum: { $cond: [{ $eq: ["$DeliveryType", "Adhoc"] }, 1, 0] } },
          onceOff: { $sum: { $cond: [{ $eq: ["$DeliveryType", "Once-off"] }, 1, 0] } },
          poc: { $sum: { $cond: [{ $eq: ["$DeliveryType", "POC"] }, 1, 0] } },
          newStatus: { $sum: { $cond: [{ $eq: ["$Status", "New"] }, 1, 0] } },
          underDevelopment: { $sum: { $cond: [{ $eq: ["$Status", "Under Development"] }, 1, 0] } },
          onHold: { $sum: { $cond: [{ $eq: ["$Status", "On-Hold"] }, 1, 0] } },
          devCompleted: { $sum: { $cond: [{ $eq: ["$Status", "Production"] }, 1, 0] } },
          bauStarted: { $sum: { $cond: [{ $eq: ["$Status", "BAU-Started"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$Status", "Closed"] }, 1, 0] } },
          totalFeeds: { $sum: { $size: { $ifNull: ["$Feeds", []] } } }
        },
      },
    ]);

    // Optional: If no projects matched, return zeros
    const result = counts[0] || {
      total: 0,
      bau: 0,
      adhoc: 0,
      onceOff: 0,
      poc: 0,
      rnd: 0,
      newStatus: 0,
      underDevelopment: 0,
      onHold: 0,
      devCompleted: 0,
      bauStarted: 0,
      closed: 0,
      totalFeeds: 0,
    };




    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getProjectCounts:", err);
    res.status(500).json({ message: "Failed to fetch project counts" });
  }
};


export const getProjectById = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid project ID" });
  }

  try {

    const {
      page = 1,
      pageSize = 10,
      status,
      search,
      // department,
      date_range,
      // qaStatus,
      qaid,
    } = req.query;
    
    const filter = {};
    const userId = req.user._id.toString();
    const role = req.user.roleId?.name;
    // if (qaStatus) filter.QAStatus = qaStatus;
    // Status filter
    if (status && status !== "All") filter.Status = { $regex: `^${status}$`, $options: "i" };

    // Search filter
    // if (search) {
    //   filter.Feeds = {
    //     $elemMatch: {
    //       $or: [
    //         { FeedName: { $regex: search, $options: "i" } },
    //         { FeedId: { $regex: search, $options: "i" } },
    //         { Frequency: { $regex: search, $options: "i" } },
    //       ],
    //     },
    //   };
    // }
    // Search filter for Feeds
    const feedSearchMatch = search
      ? {
          $or: [
            { FeedName: { $regex: search, $options: "i" } },
            { FeedId: { $regex: search, $options: "i" } },
            { Frequency: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const project = await Project.findById(id)
      .populate("PMId TLId PCId QAId BAUPersonId CreatedBy BDEId updateHistory.updatedBy", "name roleId")
      .populate("updateHistory.newValue", "name")
      .populate({
        path: "PMId TLId PCId QAId BAUPersonId CreatedBy BDEId", // user refs
        select: "name roleId", // fetch name and roleId
        populate: {
          path: "roleId",       // populate roleId inside each user
          select: "name",   // only bring roleName
        },
      })


      .populate("SOWFile.uploadedBy", "name")
      .populate("SampleFiles.uploadedBy", "name")
      .populate({
        path: "Feeds",
        // match: search
        //   ? {
        //     $or: [
        //       { FeedName: { $regex: search, $options: "i" } },
        //       { FeedId: { $regex: search, $options: "i" } },
        //       { Frequency: { $regex: search, $options: "i" } },
        //     ],
        //   }
        //   : {},
        match: role === "Developer"
          ? { DeveloperIds: userId, ...feedSearchMatch } // Only feeds assigned to developer
          : feedSearchMatch, // All feeds for other roles
        populate: [
          { path: "DeveloperIds", select: "name" },
          { path: "createdBy", select: "name" },
        ],

      })


    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ success: true, project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// export const updateProjectTeam = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { TLId, DeveloperIds } = req.body;

//     const project = await Project.findById(id);
//     if (!project) return res.status(404).json({ message: "Project not found" });

//     // update TL + Developers
//     if (TLId) project.TLId = TLId;
//     if (DeveloperIds) project.DeveloperIds = DeveloperIds;

//     await project.save();
//     res.json({ message: "Project team updated", project });
//   } catch (err) {
//     console.error("Error updating project team:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const updateProjectTeam = async (req, res) => {

//   try {
//     const { id } = req.params;
//     const { TLId, PCId, QAId, BAUPersonId,
//       //  DeveloperIds 
//     } = req.body;


//     const userRole = req.user.roleId?.name;
//     const updatedBy = req.user?._id || null;

//     // console.log("Request Body:", req.body); DEBUGGING

//     // const project = await Project.findById(id);
//     // if (!project) return res.status(404).json({ message: "Project not found" });

//     const project = await Project.findById(id)
//       .populate("TLId", "name")
//       .populate("PCId", "name")
//       .populate("QAId", "name")
//       .populate("BAUPersonId", "name");

//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     // const fieldsToCheck = ["TLId", "PCId", "QAId", "BAUPersonId"];
//     // const updateHistory = [];

//     // // ✅ Compare current vs new values for each team field
//     // for (const field of fieldsToCheck) {
//     //   const newValue = req.body[field];
//     //   const oldValue = project[field]?.toString();

//     //   if (newValue && newValue !== oldValue) {
//     //     updateHistory.push({
//     //       field,
//     //       oldValue: project[field] ? project[field].name || project[field].toString() : "Unassigned",
//     //       newValue: new mongoose.Types.ObjectId(newValue),
//     //       updatedBy,
//     //       updatedAt: new Date(),
//     //     });

//     //     // Assign new value
//     //     project[field] = new mongoose.Types.ObjectId(newValue);
//     //   }
//     // }

//     // ✅ Save who updated


//     // ✅ Push all changes into project history
//     // if (updateHistory.length > 0) {
//     //   if (!project.updateHistory) project.updateHistory = [];
//     //   project.updateHistory.push(...updateHistory);
//     // }



//     // Only Manager can assign TL, PC, QA
//     if (userRole === "Manager") {
//       if (TLId && mongoose.Types.ObjectId.isValid(TLId)) project.TLId = TLId;
//       if (PCId && mongoose.Types.ObjectId.isValid(PCId)) project.PCId = PCId;
//       if (QAId && mongoose.Types.ObjectId.isValid(QAId)) project.QAId = QAId;
//       if (BAUPersonId && mongoose.Types.ObjectId.isValid(BAUPersonId)) project.BAUPersonId = BAUPersonId;
//     }
//     // Initialize missing fields
//     if (!("TLId" in project)) project.TLId = null;
//     if (!("PCId" in project)) project.PCId = null;
//     if (!("QAId" in project)) project.QAId = null;
//     if (!("BAUPersonId" in project)) project.BAUPersonId = null;

//     // Only Manager can assign TL, PC, QA, BAU
//     // if (userRole === "Manager") {
//     //   if (TLId) project.TLId = TLId;
//     //   if (PCId) project.PCId = PCId;
//     //   if (QAId) project.QAId = QAId;
//     //   if (BAUPersonId) project.BAUPersonId = BAUPersonId;
//     // }
//     console.log("User Role:", userRole);

//     // TL or PC can update Developers
//     // if ((userRole === "Team Lead" || userRole === "Project Coordinator") && DeveloperIds) {
//     //   project.DeveloperIds = DeveloperIds;
//     // }

//     project._updatedBy = updatedBy;

//     await project.save();

//     // Populate for frontend display
//     const updatedProject = await Project.findById(project._id)
//       .populate("TLId", "name")
//       .populate("PCId", "name")
//       .populate("QAId", "name")
//       .populate("BAUPersonId", "name")
//       .populate("PMId", "name")       // <-- populate PM
//       .populate("BDEId", "name")      // <-- populate BDE
//       .populate("CreatedBy", "name")
//       .populate("UpdatedBy", "name");
//     // .populate("DeveloperIds", "name");

//     res.json({ message: "Project team updated", project: updatedProject });
//   } catch (err) {
//     console.error("Error updating project team:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


export const updateProjectTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { TLId, PCId, QAId, BAUPersonId } = req.body;
    // console.log("TLId:", TLId, "PCId:", PCId, "QAId:", QAId, "BAUPersonId:", BAUPersonId);
    const userRole = req.user.roleId?.name;
    const updatedBy = req.user?._id || null;
    const errors = {};
    // ✅ Step 1: Fetch project with names
    const project = await Project.findById(id)
      .populate("TLId", "name")
      .populate("PCId", "name")
      .populate("QAId", "name")
      .populate("BAUPersonId", "name");

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!TLId) errors.TLId = "Team Lead is required";
    if (!PCId) errors.PCId = "Project Coordinator is required";
    if (!QAId) errors.QAId = "QA Lead is required";
    if (!BAUPersonId) errors.BAUPersonId = "BAU Person is required";

    // ✅ If any errors exist, return them all together
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const projectName = project.ProjectName || "Unknown Project";

    // ✅ Step 2: Check which fields changed
    const fieldsToCheck = [
      { key: "TLId", label: "Team Lead" },
      { key: "PCId", label: "Project Coordinator" },
      { key: "QAId", label: "QA" },
      { key: "BAUPersonId", label: "BAU Person" },
    ];

    const changes = [];

    if (TLId && TLId !== project.TLId?.toString()) {
      const tlUser = await User.findById(TLId);
      changes.push(`Team Lead: ${tlUser.name}`);
    }

    if (PCId && PCId !== project.PCId?.toString()) {
      const pcUser = await User.findById(PCId);
      changes.push(`Project Coordinator: ${pcUser.name}`);
    }

    if (QAId && QAId !== project.QAId?.toString()) {
      const qaUser = await User.findById(QAId);
      changes.push(`QA: ${qaUser.name}`);
    }

    if (BAUPersonId && BAUPersonId !== project.BAUPersonId?.toString()) {
      const bauUser = await User.findById(BAUPersonId);
      changes.push(`BAU: ${bauUser.name}`);
    }

    for (const field of fieldsToCheck) {
      const newValue = req.body[field.key];
      if (!newValue || !mongoose.Types.ObjectId.isValid(newValue)) continue;

      const oldValue = project[field.key]?._id?.toString();
      const oldName = project[field.key]?.name || null;

      // Only record change if different
      if (oldValue !== newValue) {
        const newUser = await mongoose.model("User").findById(newValue, "name");

        let description;
        if (!oldValue) {
          // Newly assigned
          description = `${req.user.name} assigned ${newUser?.name || "Unknown"} (${field.label}) in ${projectName}`;
        } else {
          // Re-assigned
          description = `${req.user.name} updated ${field.label} from ${oldName || "Unassigned"} to ${newUser?.name || "Unknown"} in ${projectName}`;
        }

        // ✅ Add to activity logs
        await Activity.create({
          projectId: project._id,
          actionType: "Project Updated",
          description,
          performedBy: updatedBy,
          entityType: "project",
          field: field.key,
          oldValue: oldName || null,
          newValue: newUser?.name || null,
        });

        // ✅ Apply change to document
        project[field.key] = newValue;
        changes.push(field.key);
      }
    }

    // ✅ Save updatedBy and project if there were changes
    if (changes.length > 0) {
      if (project.TLId && project.PCId && project.QAId && project.BAUPersonId) {
        project.Status = "Under Development";
      }
      // project._updatedBy = updatedBy;
      await project.save();
    }

    // ✅ Populate updated values for frontend
    const updatedProject = await Project.findById(project._id)
      .populate("TLId", "name")
      .populate("PCId", "name")
      .populate("QAId", "name")
      .populate("BAUPersonId", "name")
      .populate("PMId", "name")
      .populate("BDEId", "name")
      .populate("CreatedBy", "name")
      .populate("UpdatedBy", "name");

    res.status(200).json({
      message:
        changes.length > 0
          ? "Project team updated successfully"
          : "No changes detected",
      project: updatedProject,
    });
  } catch (err) {
    console.error("Error updating project team:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const getAssignedToQAProjects = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, search = "", date_range, status } = req.query;

    // Filter for projects assigned to QA
    const filter = {
      Status: { $in: ["assigned_to_qa", "qa_open", "qa_failed", "qa_passed"] }, // matches your project Status field
      qaStatus: { $in: ["assigned_to_qa", "qa_open", "qa_failed", "qa_passed"] },
      // include all relevant QA statuses
    };


    if (status && status !== "All") {
      filter.Status = { $regex: `^${status}$`, $options: "i" };
    }


    // Search by ProjectName
    if (search) filter.ProjectName = { $regex: search, $options: "i" };

    // Optional date filter (StartDate or createdAt)
    if (date_range) {
      const now = new Date();
      let fromDate;

      if (date_range === "last_7_days") {
        fromDate = new Date();
        fromDate.setDate(now.getDate() - 7);
      }

      if (fromDate) filter.StartDate = { $gte: fromDate }; // adjust to your date field
    }

    //  Role based 
    const userId = req.user._id;
    const role = req.user.roleId?.name; // e.g., "superadmin", "PM", "TL", etc.

    // if (role !== "Superadmin") {
    //   filter.$or = [
    //     { PMId: userId },
    //     { TLId: userId },
    //     { DeveloperIds: userId },
    //     { QAId: userId },
    //     { BAUPersonId: userId },
    //   ];
    // }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .populate("PMId TLId DeveloperIds QAId BAUPersonId")
      .sort({ StartDate: -1 }) // sort by StartDate or createdAt
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pageSize: limit,
      data: projects,
    });

    // console.log("Assigned-to-QA projects:", projects);
  } catch (error) {
    console.error("Error fetching assigned-to-QA projects:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const transitionProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { to, comment = "", role, fileName, fileLink } = req.body;
    const userId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    let fromStatus;

    if (role === "Developer") {
      fromStatus = project.developerStatus;
      project.developerStatus = to;

      // Push assigned file if present
      if (fileName && fileLink) {
        project.assignedFiles.push({
          fileName,
          fileLink,
          assignedBy: userId,
          assignedAt: new Date(),
        });
      }

    } else if (role === "QA") {
      fromStatus = project.qaStatus;
      project.qaStatus = to;

      // Push QA report if present
      if (fileName && fileLink) {
        project.qaReports.push({
          comment,
          fileName,
          fileLink,
          uploadedBy: userId,
          uploadedAt: new Date(),
        });
      }

      // Optional QA cycle
      if (to === "in_qa") project.qaCycleTimes.push({ start: new Date() });
      if (to === "qa_passed") {
        const lastCycle = project.qaCycleTimes[project.qaCycleTimes.length - 1];
        if (lastCycle && !lastCycle.end) lastCycle.end = new Date();
      }
      if (to === "qa_rejected") project.reworkCount = (project.reworkCount || 0) + 1;
    }

    // Update global Status
    project.Status = to;
    project.qaStatus = to;

    // History log
    project.history.push({
      userId,
      fromStatus,
      toStatus: to,
      comment,
      date: new Date(),
    });
    // console.log(project);
    await project.save();
    res.status(200).json({ message: "Project status updated", project });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const QAReport = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const { comment, status, qaStatus } = req.body; // ✅ extract qaStatus
    const fileLink = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user.id;

    const fromStatus = project.qaStatus;

    // ✅ Maintain both fields
    project.qaStatus = qaStatus; // QA-specific status (qa_failed, qa_passed, etc.)
    project.Status = status;     // General project status

    // Generate persistent QA link only if not exists
    if (!project.qaReportLink) {
      project.qaReportLink = `/qa/${uuidv4()}`;
    }

    // Save QA report entry
    project.qaReports.push({
      comment,
      fileName: req.file?.originalname,
      fileLink,
      uploadedBy: userId,
      uploadedAt: new Date(),
      status,
      qaStatus,
    });

    // ✅ QA cycle logic
    if (qaStatus === "in_qa") {
      project.qaCycleTimes.push({ start: new Date() });
    }
    if (qaStatus === "qa_passed") {
      const lastCycle = project.qaCycleTimes[project.qaCycleTimes.length - 1];
      if (lastCycle && !lastCycle.end) lastCycle.end = new Date();
    }
    if (qaStatus === "qa_failed") {
      project.reworkCount = (project.reworkCount || 0) + 1; // ✅ increment correctly
    }

    // History log
    project.history.push({
      userId,
      fromStatus,
      toStatus: qaStatus, // ✅ better to track QA-specific transition
      comment,
      date: new Date(),
    });

    await project.save();
    res.json({
      message: "QA report submitted",
      qaReportLink: project.qaReportLink,
      reworkCount: project.reworkCount,
      qaStatus: project.qaStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



export const AssignToQa = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const { fileLink } = req.body;
    const fileName = req.file?.originalname || req.body.fileName;
    const userId = req.user.id;

    const fromStatus = project.developerStatus;
    project.developerStatus = "assigned_to_qa";
    project.Status = "assigned_to_qa"; // global status
    project.qaStatus = "assigned_to_qa";

    project.assignedFiles.push({
      fileName,
      fileLink: fileLink || (req.file ? `/uploads/${req.file.filename}` : null),
      assignedBy: userId,
      assignedAt: new Date(),
    });

    // History log
    project.history.push({
      userId,
      fromStatus,
      toStatus: "assigned_to_qa",
      comment: "File assigned to QA",
      date: new Date(),
    });

    await project.save();
    res.json({ message: "File assigned to QA" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// export const transitionProject = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const { to, comment, revert_subtasks = [] } = req.body;
//     const userId = req.user.id;

//     if (!comment) return res.status(400).json({ message: "Comment is required" });

//     const project = await Project.findById(projectId);
//     if (!project) return res.status(404).json({ message: "Project not found" });

//     const from = project.Status;

//     // Validate allowed transitions
//     const allowedTransitions = {
//       "New": ["in_development"],
//       "in_development": ["in_qa"],
//       "in_qa": ["qa_passed", "qa_rejected", "in_development"],
//       "qa_passed": ["completed"],
//       "qa_rejected": ["in_development"],
//       "completed": []
//     };

//     if (!allowedTransitions[from] || !allowedTransitions[from].includes(to)) {
//       return res.status(400).json({ message: `Invalid transition from ${from} to ${to}` });
//     }

//     // Handle specific transitions
//     if (from === "in_development" && to === "in_qa") {
//       // Entering QA, start cycle time
//       project.qaCycleTimes.push({ start: new Date() });
//       await sendNotification(project.QAId, project._id, `Project ${project.ProjectName} is ready for QA`);
//     }

//     if (from === "in_qa" && to === "qa_passed") {
//       // End last QA cycle
//       const lastCycle = project.qaCycleTimes[project.qaCycleTimes.length - 1];
//       if (lastCycle && !lastCycle.end) {
//         lastCycle.end = new Date();
//       }
//     }

//     if (from === "in_qa" && to === "qa_rejected") {
//       // Increment rework count
//       project.reworkCount = (project.reworkCount || 0) + 1;
//     }

//     if (from === "in_qa" && to === "in_development") {
//       // Revert, reopen tasks
//       for (const taskId of revert_subtasks) {
//         await Task.findByIdAndUpdate(taskId, { Status: "in_progress" });
//       }
//       project.reworkCount = (project.reworkCount || 0) + 1;
//     }

//     // Update status
//     project.Status = to;

//     // Add activity log
//     project.history.push({
//       userId,
//       fromStatus: from,
//       toStatus: to,
//       comment,
//       timestamp: new Date()
//     });

//     await project.save();
//     res.status(200).json({ message: "Project transitioned", project });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Project history
export const getProjectHistory = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("history.userId", "name");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json({ history: project.history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// // Utility for sending notifications
// const sendNotification = async (userId, projectId, message) => {
//   if (!userId) return;
//   const notif = new Notification({ userId, projectId, message });
//   await notif.save();
// };

// CREATE new project

// export const createProject = async (req, res) => {
//   try {
//     const {
//       ProjectCode,
//       ProjectName,
//       SOWFile,
//       SampleFiles,
//       // InputFile,
//       // OutputFile,
//       Frequency,
//       Platform,
//       RulesStatus,
//       PMId,
//       TLId,
//       DeveloperIds,
//       QAId,
//       BAUPersonId,
//       StartDate,
//       EndDate
//     } = req.body;

//     // const pmUser = PMId ? await User.findOne({ name: PMId }) : null;
//     const tlUser = TLId ? await User.findOne({ name: TLId }) : null;
//     // const qaUser = QAId ? await User.findOne({ name: QAId }) : null;
//     const bauUser = BAUPersonId ? await User.findOne({ name: BAUPersonId }) : null;

//     const developerUsers = DeveloperIds && DeveloperIds.length > 0
//       ? await User.find({ name: { $in: DeveloperIds } })
//       : [];

//     const newProject = new Project({
//       ProjectCode,
//       ProjectName,
//       SOWFile,
//       SampleFiles,
//       PMId,
//       InputFile,
//       OutputFile,
//       Frequency,
//       Platform,
//       RulesStatus,
//       TLId: tlUser?._id || null,
//       DeveloperIds: developerUsers.map(u => u._id),
//       QAId,
//       BAUPersonId: bauUser?._id || null,
//       StartDate: StartDate ? new Date(StartDate) : null,
//       EndDate: EndDate ? new Date(EndDate) : null,
//     });

//     const saved = await newProject.save();
//     res.status(201).json({ message: "Project created", project: saved });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
