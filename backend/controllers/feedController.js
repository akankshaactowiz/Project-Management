import FeedData from "../models/FeedData.js";
import mongoose from "mongoose";
import Project from "../models/Projects.js"
import Feed from "../models/FeedData.js";
import { generateFeedId } from "../utils/generateFeedId.js";

// GET /api/table?status=Active&page=2&limit=5&sort=createdAt:desc&search=abc

// export const createFeed = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { FeedName } = req.body;
//     const { FeedId } = req.body;
//     const userId = req.user.id;

//     // Ensure project exists
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     const feed = new Feed({
//       projectId,
//       FeedName,
//       FeedId,
//       createdBy: userId,
//     });

//     await feed.save();

//     res.status(201).json({ message: "Feed created successfully", feed });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const createFeed = async (req, res) => {
  try {
    const {
      projectId,
      FeedName,
      // FeedId,
      DomainName,
      ApplicationType,
      CountryName,
      // Platform,
      BAU,
      POC,
      PCId,
      TLId,
      DeveloperIds,
      QAId,
      BAUPersonId,
    } = req.body;

    // Validate required fields
    // if (!projectId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Project,  and Feed ID are required.",
    //   });
    // }
 
   const Platform = `${DomainName}|${ApplicationType}|${CountryName}`;
    // Create new feed
    const newFeed = new Feed({
      projectId,
      FeedName,
      FeedId: generateFeedId(),
      DomainName,
      ApplicationType,
      CountryName,
      Platform,
      BAU,
      POC,
      PCId,
      TLId,
      DeveloperIds,
      QAId,
      BAUPersonId,
      createdBy: req.user?._id || null, // if you have auth middleware
    });
    

    await newFeed.save();

    // Add feed to project's Feeds array
    await Project.findByIdAndUpdate(projectId, {
      $push: { Feeds: newFeed._id },
    });


    res.status(201).json({
      success: true,
      message: "Feed created successfully.",
      data: newFeed,
    });
  } catch (error) {
    console.error("Error creating feed:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not create feed.",
      error: error.message,
    });
  }
};
// export const getFeeds = async (req, res) => {
//   try {
//     // Query params for pagination + search
//     const page = parseInt(req.query.page) || 1;          // current page (default 1)
//     const limit = parseInt(req.query.limit) || 10;       // docs per page (default 10)
//     const search = req.query.search || "";               // search query
    
//     const skip = (page - 1) * limit;

//     // Build filter for searching (case-insensitive, regex-based)
//     const filter = search
//       ? { feedName: { $regex: search, $options: "i" } }
//       : {};

 
 
//     const [data, total] = await Promise.all([
//       FeedData.find(filter).populate("projectId").populate({
//         path: "projectId",
//         populate: [
//           { path: "PMId", name :"name" },        // populate PM
//           { path: "TLId", name: "name" },        // populate TL
//           { path: "DeveloperIds", name: "name" } // populate multiple developers
//         ]
//       })
//       .populate("createdBy", "name").skip(skip).limit(limit).lean(), // lean() = faster, returns plain JS objects
//       FeedData.countDocuments(filter)
//     ]);

//     res.status(200).json({
//       total,
//       data,
//     });
//   } catch (err) {
//     console.error("Error fetching feeds:", err);
//     res.status(500).json({ error: "Failed to fetch feeds" });
//   }
// };


// GET single feed
// export const getFeeds = async (req, res) => {
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
//     } = req.query;

//     const filter = {};
//     // if (qaStatus) filter.QAStatus = qaStatus;
//     // Status filter
//     if (status && status !== "All") filter.Status = { $regex: `^${status}$`, $options: "i" };

//     // Search filter
//     if (search) {
//     filter.$or = [
//     { "projectId.ProjectName": { $regex: search, $options: "i" } },
//     { FeedName: { $regex: search, $options: "i" } },
//     { FeedId: { $regex: search, $options: "i" } }
//   ];
// }

//     // QA filter
//     if (qaid) filter.QAId = qaid;

  
//     // Role-based filtering
//     const userId = req.user._id;
//     const role = req.user.roleId?.name; // e.g., "superadmin", "PM", "TL", etc.
//     const department = req.user.departmentId?.department;
//     // if (role !== "Superadmin") {
//     //   filter.$or = [
//     //     // { PMId: userId },
//     //     // { TLId: userId },
//     //     { DeveloperIds: userId },
//     //     // { QAId: userId },
//     //     { BAUPersonId: userId },
//     //   ];
//     // }

//         if (role === "Superadmin") {
//       // No filter, get all projects
//     } else if (department === "Sales") {
//       if (role === "Sales Head" || role === "Sales Operations Sales Manager") {
//         // All Sales projects
//         // filter.department = "Sales";
//       // } else if (role === "Sales Manager") {
//       //   // Projects created by him/her
//       //   filter.CreatedBy = userId;
//       // } else if (role === "Business Development Executive") {
//       //   // Projects where BDE is involved
//       //   filter.BDEId = userId; // assuming project has BDEIds array
//       // }
//     }else if (role === "Business Development Executive") {
     
//         filter.DeveloperIds = userId; 
//       }
//      else {
//     // Other roles: assigned to them in any capacity
//     filter.$or = [
//       { "projectId.PMId._id": userId },
//       { "projectId.PCId": userId },
//       { "projectId.TLId": userId },
//       { "projectId.DeveloperIds": userId },
//       { "projectId.QAId": userId },
//       { "projectId.BAUId": userId },
//       { "projectId.BDEId": userId },
//     ];
//   }
//     }
//     if (search) {
//       filter.$or = [
//         { "projectId.ProjectName": { $regex: search, $options: "i" } },
//         { FeedName: { $regex: search, $options: "i" } },
//         { FeedId: { $regex: search, $options: "i" } },
//         { Frequency: { $regex: search, $options: "i" } },
//         // { FeedType: { $regex: search, $options: "i" } },
//       ];
//     }
//   console.log("Applied filter:", filter);

//     // Pagination
//     const parsedPage = parseInt(page, 10) || 1;
//     const parsedPageSize = parseInt(pageSize, 10) || 20;

//     // Query database
//     const total = await Feed.countDocuments(filter);
//     const feeds = await Feed.find(filter)
//     .populate("projectId", "ProjectName")  
//     .populate({
//       path: "projectId",
//       populate: [
//         { path: "PMId", select: "name" }, // ✅ populate PM inside project
//       ]
//     })
//     // .populate("TLId", "name email")    
//     // .populate("QAId", "name email")  
//     .populate("DeveloperIds", "name")  
//       // .populate("projectId TLId DeveloperIds QAId BAUPersonId")
//       // .populate("projectId.PMId", "name")
//       .populate("createdBy", "name")

//       .sort({ CreatedDate: -1 })
//       .skip((parsedPage - 1) * parsedPageSize)
//       .limit(parsedPageSize);

//     // Send response
//     res.status(200).json({
//       data: feeds,
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


export const getFeeds = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      search,
      date_range,
      qaid,
    } = req.query;

    const userId = req.user._id;
    const role = req.user.roleId?.name;
    const department = req.user.departmentId?.department;

    const parsedPage = parseInt(page, 10) || 1;
    const parsedPageSize = parseInt(pageSize, 10) || 20;

    // Build match conditions
    const matchConditions = [];

    // Status filter
    if (status && status !== "All") {
      matchConditions.push({ Status: { $regex: `^${status}$`, $options: "i" } });
    }

    // QA filter
    if (qaid) matchConditions.push({ QAId: qaid });

    // Role-based filter
    if (role !== "Superadmin") {
      if (department === "Sales") {
        if (role === "Business Development Executive") {
          matchConditions.push({ DeveloperIds: userId });
        }
        // Add other Sales role conditions if needed
      } else {
        matchConditions.push({
          $or: [
            { "projectId.PMId": userId },
            { "projectId.PCId": userId },
            { "projectId.TLId": userId },
            { "projectId.DeveloperIds": userId },
            { "projectId.QAId": userId },
            { "projectId.BAUId": userId },
            { "projectId.BDEId": userId },
          ],
        });
      }
    }

    // Search filter
    if (search) {
      matchConditions.push({
        $or: [
          { FeedName: { $regex: search, $options: "i" } },
          { FeedId: { $regex: search, $options: "i" } },
          { Frequency: { $regex: search, $options: "i" } },
          { "project.ProjectName": { $regex: search, $options: "i" } },
          { "project.ProjectCode": { $regex: search, $options: "i" } },
        ],
      });
    }

const pipeline = [
  // Lookup project and replace projectId
  {
    $lookup: {
      from: "Projects_data",
      localField: "projectId",
      foreignField: "_id",
      as: "projectId",
    },
  },
  { $unwind: { path: "$projectId", preserveNullAndEmptyArrays: true } },

  // Role-based + status filters (if any)
  ...(status && status !== "All" ? [{ $match: { Status: { $regex: `^${status}$`, $options: "i" } } }] : []),
  ...(qaid ? [{ $match: { QAId: qaid } }] : []),

  // Search filter on FeedName, FeedId, Frequency AND project fields
  ...(search
    ? [
        {
          $match: {
            $or: [
              { FeedName: { $regex: search, $options: "i" } },
              { FeedId: { $regex: search, $options: "i" } },
              { Frequency: { $regex: search, $options: "i" } },
              { "projectId.ProjectName": { $regex: search, $options: "i" } },
              { "projectId.ProjectCode": { $regex: search, $options: "i" } },
            ],
          },
        },
      ]
    : []),

  // Populate PMId inside projectId
  {
    $lookup: {
      from: "User-data",
      localField: "projectId.PMId",
      foreignField: "_id",
      as: "projectId.PMId",
    },
  },
  { $unwind: { path: "$projectId.PMId", preserveNullAndEmptyArrays: true } },

  // Populate DeveloperIds
  {
    $lookup: {
      from: "User-data",
      localField: "DeveloperIds",
      foreignField: "_id",
      as: "DeveloperIds",
    },
  },

  // Populate createdBy
  {
    $lookup: {
      from: "User-data",
      localField: "createdBy",
      foreignField: "_id",
      as: "createdBy",
    },
  },
  { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },

  // Sort and pagination
  { $sort: { CreatedDate: -1 } },
  { $skip: (parsedPage - 1) * parsedPageSize },
  { $limit: parsedPageSize },
];



    // Execute aggregation
    const feeds = await Feed.aggregate(pipeline);

    // Count total (without pagination)
    const totalPipeline = [...pipeline];
    totalPipeline.pop(); // remove $limit
    totalPipeline.pop(); // remove $skip
    totalPipeline.push({ $count: "total" });
    const totalResult = await Feed.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    res.status(200).json({
      data: feeds,
      total,
      page: parsedPage,
      pageSize: parsedPageSize,
    });
  } catch (error) {
    console.error("Error in getFeeds:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getFeedById = async (req, res) => {
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
    filter.$or = [
    // { "projectId.ProjectName": { $regex: search, $options: "i" } },
    { FeedName: { $regex: search, $options: "i" } },
    { FeedId: { $regex: search, $options: "i" } },
    { Frequency: { $regex: search, $options: "i" } },
    { FeedType: { $regex: search, $options: "i" } },
  ];
}
    const feed = await FeedData.findById(req.params.id).populate("projectId").populate("QARules.createdBy", "name"); 
    // .populate("TLId", "name");
    if (!feed) return res.status(404).json({ message: "Feed not found" });
    res.status(200).json(feed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};

// Update feed details
// export const updateFeedById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid feed ID" });
//     }

//     console.log("Update ID:", id);
//     console.log("Update body:", req.body);

//     const updatedFeed = await FeedData.findOneAndUpdate(
//       { _id: id },
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );

//     if (!updatedFeed) {
//       return res.status(404).json({ message: "Feed not found" });
//     }

//     res.status(200).json(updatedFeed);
//   } catch (err) {
//     console.error("Error updating feed:", err);
//     res.status(500).json({ error: "Failed to update feed" });
//   }
// };

// export const updateFeedById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid feed ID" });
//     }

//     const {
//       Frequency,
//       TimelineTime,
//       TimelineDay,
//       TimelineDate,
//       ...otherFields
//     } = req.body;

//     // Validate frequency-related fields
//     const updateData = { ...otherFields };
//     if (Frequency) {
//       updateData.Frequency = Frequency;

//       if (Frequency === "Daily") {
//         updateData.TimelineTime = TimelineTime || null;
//         updateData.TimelineDay = null;
//         updateData.TimelineDate = null;
//       } else if (Frequency === "Weekly") {
//         if (!TimelineDay) {
//           return res.status(400).json({ message: "TimelineDay is required for Weekly frequency" });
//         }
//         updateData.TimelineDay = TimelineDay;
//         updateData.TimelineTime = TimelineTime || null;
//         updateData.TimelineDate = null;
//       } else if (Frequency === "Monthly") {
//         if (!TimelineDate) {
//           return res.status(400).json({ message: "TimelineDate is required for Monthly frequency" });
//         }
//         updateData.TimelineDate = TimelineDate;
//         updateData.TimelineTime = TimelineTime || null;
//         updateData.TimelineDay = null;
//       }
//     }

//     console.log("Update ID:", id);
//     console.log("Update data:", updateData);

//     const updatedFeed = await FeedData.findOneAndUpdate(
//       { _id: id },
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     if (!updatedFeed) {
//       return res.status(404).json({ message: "Feed not found" });
//     }

//     res.status(200).json(updatedFeed);
//   } catch (err) {
//     console.error("Error updating feed:", err);
//     res.status(500).json({ error: "Failed to update feed" });
//   }
// };

export const updateFeedById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid Feed ID' });

    const {
      projectId,
      FeedName,
      Status,
      BAUStatus,
      ApproxInputListing,
      ApproxOutputListing,
      Threads,
      Platform,
      FrameworkType,
      QAProcess,
      ManageBy,
      POC,
      DeveloperIds,
      QAId,
      BAUId,
      Remark,
      Frequency,
      Schedule,
      DatabaseSettings,
      QARules
    } = req.body;


    const rulesWithUser = (QARules || []).map(rule => ({
      ...rule,
      createdBy: rule.createdBy || req.user._id, // <-- use current user if missing
      createdAt: rule.createdAt || new Date()
    }));
    const updatedFeed = await Feed.findByIdAndUpdate(
      id,
      {
        projectId,
        FeedName,
        Status,
        BAUStatus,
        ApproxInputListing,
        ApproxOutputListing,
        Threads,
        Platform,
        FrameworkType,
        QAProcess,
        ManageBy,
        POC,
        DeveloperIds,
        QAId,
        BAUId,
        Remark,
        Frequency,
        Schedule,
        DatabaseSettings,
        QARules: rulesWithUser
      },
      { new: true, runValidators: true }
    )

    if (!updatedFeed) return res.status(404).json({ message: 'Feed not found' });

    res.status(200).json({ message: 'Feed updated successfully', data: updatedFeed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error });
  }
}
export const updateFeedTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { DeveloperIds } = req.body;
    const userRole = req.user.roleId?.name;

    if (!(userRole === "Team Lead" || userRole === "Project Coordinator")) {
      return res.status(403).json({ message: "Not authorized to update developers" });
    }

    const feed = await Feed.findById(id);
    if (!feed) return res.status(404).json({ message: "Feed not found" });

    feed.DeveloperIds = DeveloperIds || [];
    await feed.save();

    const updatedFeed = await Feed.findById(feed._id).populate("DeveloperIds", "name");

    res.json({ message: "Feed developers updated", feed: updatedFeed });
  } catch (err) {
    console.error("Error updating feed team:", err);
    res.status(500).json({ message: "Server error" });
  }
};







// GET feed logs with pagination
// export const getFeedLogs = async (req, res) => {
//   try {
//     const { page = 1, limit = 25, search, sort } = req.query;
//     const pageNumber = parseInt(page, 10);
//     const pageSize = parseInt(limit, 10);
//     const skip = (pageNumber - 1) * pageSize;

//     const query = { feedId: req.params.id };
//     if (search) {
//       query.$or = [
//         { message: { $regex: search, $options: "i" } },
//         { status: { $regex: search, $options: "i" } },
//       ];
//     }

//     const total = await FeedLog.countDocuments(query);
//     const logs = await FeedLog.find(query)
//       .sort(sort ? JSON.parse(sort) : { createdAt: -1 })
//       .skip(skip)
//       .limit(pageSize);

//     res.status(200).json({
//       data: logs,
//       totalItems: total,
//       page: pageNumber,
//       totalPages: Math.ceil(total / pageSize),
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch logs" });
//   }
// };
