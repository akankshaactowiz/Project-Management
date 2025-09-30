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
export const getFeeds = async (req, res) => {
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
    if (search) filter.ProjectName = { $regex: search, $options: "i" };

    // QA filter
    if (qaid) filter.QAId = qaid;

    // Date range filter
    if (date_range) {
      const now = new Date();
      let startDate, endDate;

      switch (date_range.toLowerCase()) {
        case "today":
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "yesterday":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setDate(endDate.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "this_week":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - startDate.getDay());
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        case "last_week":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - startDate.getDay() - 7);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setDate(endDate.getDate() - endDate.getDay());
          endDate.setHours(0, 0, 0, 0);
          break;
        case "this_month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        case "last_month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate.setHours(0, 0, 0, 0);
          break;
        default:
          startDate = null;
          endDate = null;
          break;
      }

      if (startDate && endDate) {
        filter.CreatedDate = { $gte: startDate, $lt: endDate };
      }
    }

    // Role-based filtering
    const userId = req.user._id;
    const role = req.user.roleId?.name; // e.g., "superadmin", "PM", "TL", etc.

    if (role !== "Superadmin") {
      filter.$or = [
        // { PMId: userId },
        // { TLId: userId },
        { DeveloperIds: userId },
        // { QAId: userId },
        { BAUPersonId: userId },
      ];
    }

    // Pagination
    const parsedPage = parseInt(page, 10) || 1;
    const parsedPageSize = parseInt(pageSize, 10) || 20;

    // Query database
    const total = await Feed.countDocuments(filter);
    const feeds = await Feed.find()
      .populate({
      path: "projectId",
      populate: [
        { path: "PMId", select: "name email" }, // ✅ populate PM inside project
      ]
    })
    // .populate("TLId", "name email")    
    .populate("QAId", "name email")  
    .populate("DeveloperIds", "name")  
      // .populate("projectId TLId DeveloperIds QAId BAUPersonId")
      // .populate("projectId.PMId", "name")
      .populate("createdBy", "name")

      .sort({ CreatedDate: -1 })
      .skip((parsedPage - 1) * parsedPageSize)
      .limit(parsedPageSize);

    // Send response
    res.status(200).json({
      data: feeds,
      total,
      page: parsedPage,
      pageSize: parsedPageSize,
    });
    // console.log("Role:", role, "Filter:", filter); Debugging
  } catch (error) {
    console.error("Error in getProjects:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getFeedById = async (req, res) => {
  try {
    const feed = await FeedData.findById(req.params.id).populate("projectId")
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
        QARules
      },
      { new: true, runValidators: true }
    );

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
