import FeedData from "../models/FeedData.js";
import mongoose from "mongoose";
import Project from "../models/Projects.js"
import Feed from "../models/FeedData.js";
import User from "../models/User.js";
import { generateFeedId } from "../utils/generateFeedId.js";
import {logHistory} from "../middlewares/logHistory.js";


export const createFeed = async (req, res) => {
  try {
    const {
      projectId,
      FeedName,
      DomainName,
      ApplicationType,
      CountryName,
      BAU,
      POC,
      TLId,
      DeveloperIds,
      BAUPersonId,
    } = req.body;

    // 1️⃣ Validate required fields
    const missingFields = [];
    if (!projectId) missingFields.push("projectId");
    if (!FeedName) missingFields.push("FeedName");
    if (!DomainName) missingFields.push("DomainName");
    if (!ApplicationType) missingFields.push("ApplicationType");
    if (!CountryName) missingFields.push("CountryName");
  

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // 2️⃣ Validate Project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }


    // 4️⃣ Build Platform string
    const Platform = `${DomainName}|${ApplicationType}|${CountryName}`;

    // 5️⃣ Create new feed
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
      // TLId,
      // DeveloperIds,
      // BAUPersonId,
      _updatedBy: req.user?._id || null,
      createdBy: req.user?._id || null,
    });

    await newFeed.save();

    // 6️⃣ Add feed to project's Feeds array
    // await Project.findByIdAndUpdate(projectId, { $push: { Feeds: newFeed._id } });

    // Push to project's Feeds array without triggering pre-save hook
await Project.updateOne(
  { _id: projectId },
  { $push: { Feeds: newFeed._id } }
);

// 6️⃣ Log history explicitly (pre-save hook removed to prevent duplicate)
    await logHistory({
      modelName: "Feed",
      newDoc: newFeed,
      userId: req.user?._id,
      projectId: projectId,
      feedId: newFeed._id,
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
export const getFeeds = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      search,
      qaid,
    } = req.query;

    const userId = new mongoose.Types.ObjectId(req.user._id);
    const role = req.user.roleId?.name;
    const department = req.user.departmentId?.department;

    const parsedPage = parseInt(page, 10) || 1;
    const parsedPageSize = parseInt(pageSize, 10) || 20;

    // Get today's date info
    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" }); // e.g., "Monday"
    const dateNum = today.getDate(); // e.g., 14
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Role-based filter
    let roleFilter = {};
    if (role !== "Superadmin") {
      if (department === "Sales") {
        if (role === "Sales Manager") {
          roleFilter = { "projectId.CreatedBy": userId };
        }
        if (role === "Business Development Executive") {
          roleFilter = { "projectId.BDEId": userId };
        }
      } else {
        roleFilter = {
          $or: [
            { "projectId.PMId": userId },
            { "projectId.PCId": userId },
            { "projectId.TLId": userId },
            { DeveloperIds: userId },
            { "projectId.QAId": userId },
            { "projectId.BAUId": userId },
            { "projectId.BDEId": userId },
            { "projectId.CreatedBy": userId },
          ],
        };
      }
    }

    const pipeline = [
      // Lookup project
      {
        $lookup: {
          from: "Projects_data",
          localField: "projectId",
          foreignField: "_id",
          as: "projectId",
        },
      },
      { $unwind: { path: "$projectId", preserveNullAndEmptyArrays: true } },

      // Role-based filter
      ...(role !== "Superadmin" ? [{ $match: roleFilter }] : []),

      // Status filter
      ...(status && status !== "All" ? [{ $match: { Status: status } }] : []),

      // QA filter
      ...(qaid ? [{ $match: { QAId: qaid } }] : []),

      // Search filter
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

      // Lookup PM
      {
        $lookup: {
          from: "User-data",
          let: { pmId: "$projectId.PMId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$pmId"] } } },
            { $project: { _id: 1, name: 1 } },
          ],
          as: "projectId.PMId",
        },
      },
      { $unwind: { path: "$projectId.PMId", preserveNullAndEmptyArrays: true } },

      // Populate DeveloperIds
      {
        $lookup: {
          from: "User-data",
          let: { devIds: "$DeveloperIds" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$devIds"] } } },
            { $project: { _id: 1, name: 1 } },
          ],
          as: "DeveloperIds",
        },
      },

      // Populate createdBy
      {
        $lookup: {
          from: "User-data",
          let: { createdById: "$createdBy" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$createdById"] } } },
            { $project: { _id: 1, name: 1 } },
          ],
          as: "createdBy",
        },
      },
      { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },

      // Filter feeds scheduled for today
      {
        $match: {
          $or: [
            { Frequency: "Daily" },
            { $and: [{ Frequency: "Weekly" }, { "Schedule.day": dayName }] },
            { $and: [{ Frequency: "Monthly" }, { "Schedule.date": dateNum }] },
            {
              $and: [
                { Frequency: "Once-off" },
                { "Schedule.datetime": { $gte: startOfDay, $lte: endOfDay } },
              ],
            },
            {
              $and: [
                { Frequency: "Custom" },
                { "Schedule.custom": { $elemMatch: { day: dayName } } },
              ],
            },
          ],
        },
      },

      // Sort & paginate
      { $sort: { CreatedDate: -1 } },
      { $skip: (parsedPage - 1) * parsedPageSize },
      { $limit: parsedPageSize },
    ];

    // Execute aggregation
    const feeds = await Feed.aggregate(pipeline);

    // Total count without pagination
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


export const getFeedsByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, pageSize = 10 } = req.query; // Pagination query params

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // Pagination calculation
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    // Fetch feeds with pagination
    const feeds = await Feed.find({ projectId })
      .populate({
        path: "projectId",
        select: "ProjectName PMId TLId PCId QAId BAUPersonId",
        populate: [
          { path: "PMId", select: "name _id" },
          { path: "TLId", select: "name _id" },
          { path: "PCId", select: "name _id" },
          { path: "QAId", select: "name _id" },
          { path: "BAUPersonId", select: "name _id" },
        ],
      })
      .populate("DeveloperIds", "name")
      .populate("createdBy", "name")
      .sort({ CreatedDate: -1 })
      .skip(skip)
      .limit(parseInt(pageSize));

    // Optional: total count for frontend pagination
    const totalFeeds = await Feed.countDocuments({ projectId });

    res.status(200).json({
      data: feeds,
      total: totalFeeds,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error("Error fetching feeds by project ID:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getFeedById = async (req, res) => {
  try {
    const feedId = req.params.id;

    const feed = await FeedData.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(feedId) } },

      // Lookup project info
      {
        $lookup: {
          from: "Projects_data",
          localField: "projectId",
          foreignField: "_id",
          as: "projectId",
        },
      },
      { $unwind: { path: "$projectId", preserveNullAndEmptyArrays: true } },

      // Populate DeveloperIds
      {
        $lookup: {
          from: "User-data",
          localField: "DeveloperIds",
          foreignField: "_id",
          as: "DeveloperIds",
        },
      },

      {
        $lookup: {
          from: "User-data",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },

      // Populate project PM, TL, PC
      {
        $lookup: {
          from: "User-data",
          localField: "projectId.PMId",
          foreignField: "_id",
          as: "projectId.PMId",
        },
      },
      { $unwind: { path: "$projectId.PMId", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "User-data",
          localField: "projectId.TLId",
          foreignField: "_id",
          as: "projectId.TLId",
        },
      },
      { $unwind: { path: "$projectId.TLId", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "User-data",
          localField: "projectId.PCId",
          foreignField: "_id",
          as: "projectId.PCId",
        },
      },
      { $unwind: { path: "$projectId.PCId", preserveNullAndEmptyArrays: true } },

      // Populate feed-level QA and BAU
      {
        $lookup: {
          from: "User-data",
          localField: "QAId",
          foreignField: "_id",
          as: "QAId",
        },
      },
      { $unwind: { path: "$QAId", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "User-data",
          localField: "BAUPersonId",
          foreignField: "_id",
          as: "BAUPersonId",
        },
      },
      { $unwind: { path: "$BAUPersonId", preserveNullAndEmptyArrays: true } },

      // Populate QARules createdBy
      {
        $lookup: {
          from: "User-data",
          localField: "QARules.createdBy",
          foreignField: "_id",
          as: "QARules.createdBy",
        },
      },

      // Project team: create assignedTo array
      {
        $addFields: {
          assignedTo: {
            $filter: {
              input: [
                { $cond: ["$projectId.PMId.name", { name: "$projectId.PMId.name", role: "Project Manager" }, "$$REMOVE"] },
                { $cond: ["$projectId.TLId.name", { name: "$projectId.TLId.name", role: "Team Lead" }, "$$REMOVE"] },
                { $cond: ["$projectId.PCId.name", { name: "$projectId.PCId.name", role: "Project Coordinator" }, "$$REMOVE"] },
                { $cond: ["$QAId.name", { name: "$QAId.name", role: "QA Lead" }, "$$REMOVE"] },
                { $cond: ["$BAUPersonId.name", { name: "$BAUPersonId.name", role: "BAU" }, "$$REMOVE"] },
              ],
              as: "member",
              cond: { $ne: ["$$member", "$$REMOVE"] },
            },
          },
        },
      },
    ]);

    if (!feed || feed.length === 0)
      return res.status(404).json({ message: "Feed not found" });

    res.status(200).json(feed[0]);
  } catch (err) {
    console.error("Error in getFeedById:", err);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};

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
        QARules: rulesWithUser,
        _updatedBy: req.user?._id || null,
      },
      // { new: true, runValidators: true }
    )
    await updatedFeed.save(); // ✅ Activity log automatically created
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
    feed._updatedBy = req.user?._id || null; // 🔹 Middleware will log developer changes
  
    if (feed.DeveloperIds.length > 0 ) {
      feed.Status = "Assign to developer";
     }
    // await feed.save(); // ✅ Activity log automatically created
    await feed.save();

    const updatedFeed = await Feed.findById(feed._id).populate("DeveloperIds", "name");

    res.json({ message: "Feed developers updated", feed: updatedFeed });
  } catch (err) {
    console.error("Error updating feed team:", err);
    res.status(500).json({ message: "Server error" });
  }
};

