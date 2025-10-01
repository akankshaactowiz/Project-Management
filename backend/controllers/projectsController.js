import Project from "../models/Projects.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from 'uuid';
import Task from "../models/TaskData.js";
import Notification from "../models/Notification.js";
import Feed from "../models/FeedData.js";
import { generateFeedId } from "../utils/generateFeedId.js";
import mongoose from "mongoose";



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
      Timeline,
      Description,
      DomainName,
      ApplicationType,
      CountryName,
    } = req.body;

    const createdBy = req.user?._id || null;

    const BACKEND_URL = process.env.BACKEND_URL || "http://172.28.148.111/:5000";

    const SOWFile = req.files?.SOWFile?.map(f => ({
      fileName: `${BACKEND_URL}/${f.path.replace(/\\/g, "/")}`,
      uploadedBy: createdBy,
      uploadedAt: new Date(),
    })) || [];

    const SampleFiles = req.files?.SampleFiles?.map(f => ({
      fileName: `${BACKEND_URL}/${f.path.replace(/\\/g, "/")}`,
      uploadedBy: createdBy,
      uploadedAt: new Date(),
    })) || [];

    // Prepend ACT prefix
    const finalProjectCode = `[ACT-${ProjectCode}]`;

    // 1️⃣ Create Project
    // 1️⃣ Create Project
    const project = await Project.create({
      ProjectCode: finalProjectCode,
      ProjectName,
      SOWFile,
      SampleFiles,
      PMId,
      BDEId,
      DepartmentId: Department,
      Frequency,
      ProjectType,
      IndustryType,
      DeliveryType,
      Priority,
      Timeline: Timeline || "",
      Description: Description || "",
      CreatedBy: createdBy,
      TLId: null,
      PCId: null,
      QAId: null,
    });

    // 2️⃣ Create initial Feed linked to project
    const FeedId = generateFeedId();

    const initialFeed = await Feed.create({
      projectId: project._id,
      FeedId,
      FeedName,
      DomainName,
      ApplicationType,
      CountryName,
      createdBy,
    });

    // 3️⃣ Add feed reference to project
    project.Feeds.push(initialFeed._id);
    await project.save(); // ✅ Only saves the updated Feeds array


    res.status(201).json({
      success: true,
      data: { project, feed: initialFeed },
      message: "Project created with uploaded files and initial feed",
    });

  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Destructure fields from body
    let {
      ProjectName,
      ProjectCode, // user-entered suffix
      Frequency,
      PMId,
      BDEId,
      Department,
      Priority,
      ProjectType,
      IndustryType,
      DeliveryType,
      Timeline,
      Description,
    } = req.body;

    // Prepend "ACT" prefix to ProjectCode
    // if (ProjectCode) {
    //   ProjectCode = `ACT${ProjectCode}`;
    // }

    // Fetch existing project
    const project = await Project.findById(id);
    if (ProjectCode) {
      // Remove any existing ACT or ACT- prefix from user input
      const suffix = ProjectCode.replace(/^ACT-?/, '');
      ProjectCode = `[ACT-${suffix}]`;
    }
    project.ProjectCode = ProjectCode || project.ProjectCode;
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Get newly uploaded files (if any)
    const BACKEND_URL = process.env.BACKEND_URL || "http://172.28.148.130:5000";
    // const newSOW = req.files?.SOWFile
    //   ? req.files.SOWFile.map(f => `${BACKEND_URL}/${f.path.replace(/\\/g, "/")}`)
    //   : [];
    // const newSamples = req.files?.SampleFiles
    //   ? req.files?.SampleFiles.map(f => `${BACKEND_URL}/${f.path.replace(/\\/g, "/")}`)
    //   : [];

    // Convert new uploads to objects with metadata
    const newSOW = req.files?.SOWFile
      ? req.files.SOWFile.map(f => ({
        fileName: `${BACKEND_URL}/${f.path.replace(/\\/g, "/")}`,
        uploadedBy: req.user._id, // assumes user is attached to req
        uploadedAt: new Date()
      }))
      : [];

    const newSamples = req.files?.SampleFiles
      ? req.files.SampleFiles.map(f => ({
        fileName: `${BACKEND_URL}/${f.path.replace(/\\/g, "/")}`,
        uploadedBy: req.user._id,
        uploadedAt: new Date()
      }))
      : [];

    // Merge with existing files
    project.SOWFile = [...project.SOWFile, ...newSOW];
    project.SampleFiles = [...project.SampleFiles, ...newSamples];

    // Update fields
    project.ProjectName = ProjectName || project.ProjectName;
    project.ProjectCode = ProjectCode || project.ProjectCode; // now always has ACT prefix
    project.PMId = PMId || project.PMId;
    project.BDEId = BDEId || project.BDEId;
    project.DepartmentId = Department || project.DepartmentId;
    project.Frequency = Frequency || project.Frequency;
    project.Priority = Priority || project.Priority;
    project.ProjectType = ProjectType || project.ProjectType;
    project.IndustryType = IndustryType || project.IndustryType;
    project.DeliveryType = DeliveryType || project.DeliveryType;
    project.Timeline = Timeline || project.Timeline;
    project.Description = Description || project.Description;
    // project.SOWFile = updatedSOW;
    // project.SampleFiles = updatedSamples;

    await project.save();

    res.status(200).json({
      success: true,
      project,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// export const getProjects = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       pageSize = 10,
//       status,
//       search,
//       // department,
//       date_range,
//       // qaStatus,
//       qaid,
//       CreatedDate
//     } = req.query;



//     const filter = {};
//     // if (qaStatus) filter.QAStatus = qaStatus;
//     // Status filter


//     if (status && status !== "All") filter.Status = { $regex: `^${status}$`, $options: "i" };

//     // Search filter
//     // if (search) filter.ProjectName = { $regex: search, $options: "i" };
//     if (search) {
//       const regex = { $regex: search, $options: "i" };
//       filter.$or = [
//         { ProjectName: regex },
//         { ProjectCode: regex },
//         { Frequency: regex },
//         // { "PMId.name": regex } // nested field for populated PM
//       ];
//     }

//     // if(CreatedDate) filter.CreatedDate = { $gte: new Date(CreatedDate) };
//     if (CreatedDate) {
//       const start = new Date(CreatedDate);        // start of day
//       const end = new Date(CreatedDate);
//       end.setHours(23, 59, 59, 999);             // end of day

//       filter.CreatedDate = { $gte: start, $lte: end };
//     }

//     // QA filter
//     if (qaid) filter.QAId = qaid;
//     // Role-based filtering
//     const userId = req.user._id;
//     const role = req.user.roleId?.name; // e.g., "Superadmin", "Sales Head", "Sales Manager", "BDE"
//     const department = req.user.departmentId?.department;
//     // --- Sales Tab Filter ---
//     const salesTabs = ["All", "BAU", "POC", "R&D", "Adhoc", "Once-off"];
//     const { tab } = req.query;
//     if (department === "Sales" && tab && tab !== "All" && salesTabs.includes(tab)) {
//       filter.DeliveryType = tab;
//     }

//     const salesStatusTab = ["All", "New", "Under Development", "Closed", "On-Hold", "Production", "BAU-Started"];
//     const { statusTab } = req.query;
//     if (department === "Sales" && statusTab && statusTab !== "All" && salesStatusTab.includes(statusTab)) {
//       filter.Status = statusTab;
//     }
//     // Role-based filtering


//     if (role === "Superadmin") {
//       // No filter, get all projects
//     } else if (department === "Sales") {
//       if (role === "Sales Head") {
//         // All Sales projects
//         // filter.department = "Sales";
//       } else if (role === "Sales Manager") {
//         // Projects created by him/her
//         filter.CreatedBy = userId;
//       } else if (role === "Business Development Executive") {
//         // Projects where BDE is involved
//         filter.BDEId = userId; // assuming project has BDEIds array
//       }
//     } else {
//       // Other departments
//       if (role === "Manager") {
//         // Projects where manager is involved
//         filter.PMId = userId; // assuming project has ManagerIds array
//       }
//       if (role === "Team Lead") {
//         // Projects where TL is involved
//         filter.TLId = userId; // assuming project has TLIds array
//       }
//       else {
//         // Other roles: get projects assigned to them
//         filter.$or = [
//           { PMId: userId },
//           {PCId: userId},
//           { TLId: userId },
//           { DeveloperIds: userId },
//           { QAId: userId },
//           { BAUId: userId },
//           { BDEId: userId },
//         ];
//       }
//     }

   



//     // Pagination
//     const parsedPage = parseInt(page, 10) || 1;
//     const parsedPageSize = parseInt(pageSize, 10) || 20;

//     // Query database
//     const total = await Project.countDocuments(filter);

   

//     const projects = await Project.find(filter)
//       .populate("PMId PCId TLId QAId BAUPersonId BDEId", "name")
//       .populate("DepartmentId", "department")
//       .populate("CreatedBy", "name")
//       .populate({
//         path: "SOWFile",
//         model: "File",
//         match: { fileType: "SOW" },
//       })
//       .populate({
//         path: "SampleFiles",
//         model: "File",
//         match: { fileType: "Sample" },
//       })
//       .populate("Feeds")
//       .populate({
//         path: "Feeds",

//         populate: [
//           // { path: "TLId", select: "name email roleId" },
//           { path: "DeveloperIds", select: "name email roleId" },
          
//           // { path: "QAId", select: "name email roleId" },
//           { path: "BAUId", select: "name email roleId" },
//           { path: "createdBy", select: "name email" },

//         ],
//       })
//       .populate({
//         path: "SOWFile",
//         populate: [
//           { path: "uploadedBy", select: "name" },
//         ]
//       })
//       .populate({
//         path: "SampleFiles",
//         populate: [
//           { path: "uploadedBy", select: "name" },
//         ]
//       })

//       .sort({ CreatedDate: -1 })



     

//       .skip((parsedPage - 1) * parsedPageSize)
//       .limit(parsedPageSize);

//       const projectsFilterByFeed = req.query.filterByFeedUser === 'true'; // You would need a query parameter to enable this
    
//     if (projectsFilterByFeed) {
//         projects = projects.filter(project => {
//             if (!project.Feeds || project.Feeds.length === 0) return false;

//             return project.Feeds.some(feed => {
//                 // Check if userId is in DeveloperIds array in the feed
//                 const isDeveloper = feed.DeveloperIds && feed.DeveloperIds.some(dev => dev && dev._id && dev._id.toString() === userId);
                
//                 // Check if userId is the createdBy user of the feed
//                 const isCreator = feed.createdBy && feed.createdBy._id && feed.createdBy._id.toString() === userId.toString();

//                 return isDeveloper || isCreator;
//             });
//         });
//     }
     


//     // Send response
//     res.status(200).json({
//       data: projects,
//       total,
//       page: parsedPage,
//       pageSize: parsedPageSize,
//     });
//     // console.log("Role:", role, "Filter:", filter); Debugging
//   } catch (error) {
//     console.error("Error in getProjects:", error);
//     res.status(500).json({ message: error.message });
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
//       CreatedDate,
//     } = req.query;

//     const filter = {};

//     // 🔹 Status filter
//     if (status && status !== "All") {
//       filter.Status = { $regex: `^${status}$`, $options: "i" };
//     }

//     // 🔹 Search filter
//     if (search) {
//       const regex = { $regex: search, $options: "i" };
//       filter.$or = [
//         { ProjectName: regex },
//         { ProjectCode: regex },
//         { Frequency: regex },
//         { IndustryType: regex, },
        
       
    
//       ];
//     }

//     // 🔹 Created date filter
//     if (CreatedDate) {
//       const start = new Date(CreatedDate);
//       const end = new Date(CreatedDate);
//       end.setHours(23, 59, 59, 999);
//       filter.CreatedDate = { $gte: start, $lte: end };
//     }

//     // 🔹 QA filter
//     if (qaid) filter.QAId = qaid;

//     // 🔹 Role-based filtering
//     const userId = req.user._id.toString();
//     const role = req.user.roleId?.name;
//     const department = req.user.departmentId?.department;

//     // Sales Tab filter
//     const { tab, statusTab } = req.query;
//     const salesTabs = ["All", "BAU", "POC", "R&D", "Adhoc", "Once-off"];
//     if (department === "Sales" && tab && tab !== "All" && salesTabs.includes(tab)) {
//       filter.DeliveryType = tab;
//     }

//     const salesStatusTab = ["All", "New", "Under Development", "Closed", "On-Hold", "Production", "BAU-Started"];
//     if (department === "Sales" && statusTab && statusTab !== "All" && salesStatusTab.includes(statusTab)) {
//       filter.Status = statusTab;
//     }

//     // 🔹 Apply user-based filters
//     if (role === "Superadmin") {
//       // No filter — get all projects
//     } else if (department === "Sales") {
//       if (role === "Sales Head") {
//         // All Sales projects
//       } else if (role === "Sales Manager") {
//         filter.CreatedBy = userId;
//       } else if (role === "Business Development Executive") {
//         filter.BDEId = userId;
//       }
//     } else {
//       if (role === "Manager") {
//         filter.PMId = userId;
//       } else if (role === "Team Lead") {
//         filter.TLId = userId;
//       } 
//       // else {
//       //   // 🔹 For Developer/QA/BAU etc.
//       //   filter.$or = [
//       //     { PMId: userId },
//       //     { PCId: userId },
//       //     { TLId: userId },
//       //     // { DeveloperIds: userId },
//       //     { QAId: userId },
//       //     { BAUId: userId },
//       //     { BDEId: userId },
//       //   ];
//       // }
//     }

//     // 🔹 Pagination setup
//     const parsedPage = parseInt(page, 10) || 1;
//     const parsedPageSize = parseInt(pageSize, 10) || 20;

//     // 🔹 Get total before filtering feeds (for reference)
//     const totalBeforeFeedFilter = await Project.countDocuments(filter);

//     // 🔹 Query projects with all necessary population
//     let projects = await Project.find(filter)
//       .populate("PMId PCId TLId QAId BAUPersonId BDEId", "name")
//       .populate("DepartmentId", "department")
//       .populate("CreatedBy", "name")
//       .populate({
//         path: "SOWFile",
//         model: "File",
//         match: { fileType: "SOW" },
//         populate: { path: "uploadedBy", select: "name" },
//       })
//       .populate({
//         path: "SampleFiles",
//         model: "File",
//         match: { fileType: "Sample" },
//         populate: { path: "uploadedBy", select: "name" },
//       })
//       .populate({
//         path: "Feeds",
//         populate: [
//           { path: "DeveloperIds", select: "name email roleId" },
//           { path: "BAUId", select: "name email roleId" },
//           { path: "createdBy", select: "name email" },
//         ],
//       })
//       .sort({ CreatedDate: -1 })
//       .skip((parsedPage - 1) * parsedPageSize)
//       .limit(parsedPageSize);
     

//       if (search) {
//   const lowerSearch = search.toLowerCase();
//   projects = projects.filter((p) => {
//     return (
     
//       p.PMId?.name?.toLowerCase().includes(lowerSearch) ||
//       p.TLId?.name?.toLowerCase().includes(lowerSearch) ||
//       p.QAId?.name?.toLowerCase().includes(lowerSearch) ||
//       p.BDEId?.name?.toLowerCase().includes(lowerSearch) ||
//       p.CreatedBy?.name?.toLowerCase().includes(lowerSearch)
//     );
//   });
// }



//     // 🔹 Feed-based user filtering
//     const projectsFilterByFeed = req.query.filterByFeedUser === "true";
//     if (projectsFilterByFeed) {
//       projects = projects.filter((project) => {
//         if (!project.Feeds || project.Feeds.length === 0) return false;

//         return project.Feeds.some((feed) => {
//           const isDeveloper =
//             feed.DeveloperIds &&
//             feed.DeveloperIds.some(
//               (dev) => dev && dev._id && dev._id.toString() === userId
//             );

//           const isCreator =
//             feed.createdBy &&
//             feed.createdBy._id &&
//             feed.createdBy._id.toString() === userId;

//           const isBAU =
//             feed.BAUId &&
//             feed.BAUId._id &&
//             feed.BAUId._id.toString() === userId;

//           return isDeveloper || isCreator || isBAU;
//         });
//       });
//     }

//     // 🔹 Update total after feed-based filtering
//     const total = projects.length;

//     // 🔹 Send response
//     res.status(200).json({
//       data: projects,
//       total,
//       totalBeforeFeedFilter,
//       page: parsedPage,
//       pageSize: parsedPageSize,
//     });

//   } catch (error) {
//     console.error("Error in getProjects:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

export const getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      search,
      date_range,
      qaid,
      CreatedDate,
      tab,
      statusTab,
    } = req.query;

    const userId = req.user._id.toString();
    const role = req.user.roleId?.name;
    const department = req.user.departmentId?.department;

    const matchStage = {};

    // 🔹 Status filter
    if (status && status !== "All") {
      matchStage.Status = { $regex: `^${status}$`, $options: "i" };
    }

    // 🔹 Created date filter
    if (CreatedDate) {
      const start = new Date(CreatedDate);
      const end = new Date(CreatedDate);
      end.setHours(23, 59, 59, 999);
      matchStage.CreatedDate = { $gte: start, $lte: end };
    }

    // 🔹 QA filter
    if (qaid) matchStage.QAId = qaid;

    // 🔹 Sales Tab filters
    const salesTabs = ["All", "BAU", "POC", "R&D", "Adhoc", "Once-off"];
    if (department === "Sales" && tab && tab !== "All" && salesTabs.includes(tab)) {
      matchStage.DeliveryType = tab;
    }

    const salesStatusTab = ["All", "New", "Under Development", "Closed", "On-Hold", "Production", "BAU-Started"];
    if (department === "Sales" && statusTab && statusTab !== "All" && salesStatusTab.includes(statusTab)) {
      matchStage.Status = statusTab;
    }

    // 🔹 Role-based filters
    if (!(role === "Superadmin")) {
      if (department === "Sales") {
        if (role === "Sales Manager") matchStage.CreatedBy = userId;
        if (role === "Business Development Executive") matchStage.BDEId = userId;
      } else {
        if (role === "Manager") matchStage.PMId = userId;
        if (role === "Team Lead") matchStage.TLId = userId;
      }
    }

    // 🔹 Build aggregation pipeline
    const pipeline = [
      { $match: matchStage },

      // 🔹 Lookup for PMId
      {
        $lookup: {
          from: "User-data",
          localField: "PMId",
          foreignField: "_id",
          as: "PMId",
        },
      },
      { $unwind: { path: "$PMId", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "User-data",
          localField: "BDEId",
          foreignField: "_id",
          as: "BDEId",
        },
      },
      { $unwind: { path: "$PMId", preserveNullAndEmptyArrays: true } },

      // 🔹 Lookup for CreatedBy
      {
        $lookup: {
          from: "User-data",
          localField: "CreatedBy",
          foreignField: "_id",
          as: "CreatedBy",
        },
      },
      { $unwind: { path: "$CreatedBy", preserveNullAndEmptyArrays: true } },

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
                  { "PMId.name": { $regex: search, $options: "i" } },
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
      {
        $lookup: {
          from: "Feed-data",
          localField: "Feeds",
          foreignField: "_id",
          as: "Feeds",
        },
      },
    ];

    // 🔹 Execute aggregation
    const projects = await Project.aggregate(pipeline);

    // 🔹 Get total count (for pagination)
    const total = await Project.countDocuments(matchStage);

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


export const getProjectCounts = async (req, res) => {
  try {
     const { userId, role, department } = req.user; // assuming req.user has these

    // Build filter based on role/department
    const filter = {};

    if (role === "Superadmin") {
      // No filter, get all projects
    } else if (department === "Sales") {
      if (role === "Sales Head") {
        // All Sales projects
        // filter.department = "Sales"; // optional if you want to filter Sales only
      } else if (role === "Sales Manager") {
        filter.CreatedBy = userId;
      } else if (role === "Business Development Executive") {
        filter.BDEId = userId; // assuming single BDEId
        // if it's an array, use: filter.BDEIds = userId;
      }
    } else {
      // Other departments
      if (role === "Manager") {
        filter.PMId = userId;
      } else if (role === "Team Lead") {
        filter.TLId = userId;
      } else {
        filter.$or = [
          { PMId: userId },
          { PCId: userId },
          { TLId: userId },
          { DeveloperIds: userId },
          { QAId: userId },
          { BAUId: userId },
          { BDEId: userId },
        ];
      }
    }

   
    const counts = await Project.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          bau: { $sum: { $cond: [{ $eq: ["$DeliveryType", "BAU"] }, 1, 0] } },
          adhoc: { $sum: { $cond: [{ $eq: ["$DeliveryType", "Adhoc"] }, 1, 0] } },
          onceOff: { $sum: { $cond: [{ $eq: ["$DeliveryType", "Once-Off"] }, 1, 0] } },
          poc: { $sum: { $cond: [{ $eq: ["$DeliveryType", "POC"] }, 1, 0] } },
          rnd: { $sum: { $cond: [{ $eq: ["$DeliveryType", "R&D"] }, 1, 0] } },
          newStatus: { $sum: { $cond: [{ $eq: ["$Status", "New"] }, 1, 0] } },
          underDevelopment: { $sum: { $cond: [{ $eq: ["$Status", "Under Development"] }, 1, 0] } },
          onHold: { $sum: { $cond: [{ $eq: ["$Status", "On-Hold"] }, 1, 0] } },
          devCompleted: { $sum: { $cond: [{ $eq: ["$Status", "Production"] }, 1, 0] } },
          bauStarted: { $sum: { $cond: [{ $eq: ["$Status", "BAU-Started"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$Status", "Closed"] }, 1, 0] } },
          totalFeeds: { $sum: { $size: "$Feeds" } },
        },
      },
    ]);

    res.status(200).json(counts[0] || {}); // return the aggregated counts
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch project counts" });
  }
};

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
    // if (qaStatus) filter.QAStatus = qaStatus;
    // Status filter
    if (status && status !== "All") filter.Status = { $regex: `^${status}$`, $options: "i" };

    // Search filter
    if (search) {
  filter.Feeds = {
    $elemMatch: {
      $or: [
        { FeedName: { $regex: search, $options: "i" } },
        { FeedId: { $regex: search, $options: "i" } },
        { Frequency: { $regex: search, $options: "i" } },
      ],
    },
  };
}
   
    const project = await Project.findById(id)
      .populate("PMId TLId PCId QAId BAUPersonId CreatedBy BDEId", "name")

      .populate("SOWFile.uploadedBy", "name")
      .populate("SampleFiles.uploadedBy", "name")
      .populate({
        path: "Feeds",
        match: search
      ? {
          $or: [
            { FeedName: { $regex: search, $options: "i" } },
            { FeedId: { $regex: search, $options: "i" } },
            { Frequency: { $regex: search, $options: "i" } },
          ],
        }
      : {},

        populate: [
          // { path: "TLId", select: "name email roleId" },
          { path: "DeveloperIds", select: "name email roleId" },
          // { path: "QAId", select: "name email roleId" },
          // { path: "BAUPersonId", select: "name email roleId" },
          { path: "createdBy", select: "name email" },

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

export const updateProjectTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { TLId, PCId, QAId, DeveloperIds } = req.body;
    const userRole = req.user.role;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Initialize missing fields
    if (!("TLId" in project)) project.TLId = null;
    if (!("PCId" in project)) project.PCId = null;
    if (!("QAId" in project)) project.QAId = null;

    // Only Manager can assign TL, PC, QA
    if (userRole === "Manager") {
      if (TLId) project.TLId = TLId;
      if (PCId) project.PCId = PCId;
      if (QAId) project.QAId = QAId;
    }

    // TL or PC can update Developers
    if ((userRole === "Team Lead" || userRole === "Project Coordinator") && DeveloperIds) {
      project.DeveloperIds = DeveloperIds;
    }

    await project.save();

    // Populate for frontend display
    const updatedProject = await Project.findById(project._id)
      .populate("TLId", "name")
      .populate("PCId", "name")
      .populate("QAId", "name")
      .populate("DeveloperIds", "name");

    res.json({ message: "Project team updated", project: updatedProject });
  } catch (err) {
    console.error("Error updating project team:", err);
    res.status(500).json({ message: "Server error" });
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


// project transition
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
