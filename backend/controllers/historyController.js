import mongoose from "mongoose";
import ActivityHistory from "../models/ProjectHistory.js";
import Feed from "../models/FeedData.js";

export const getProjectFullHistory = async (req, res) => {
  try {
    const  id  = req.params.projectId; // project ID
    console.log("Project ID:", id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }

    const projectObjectId = new mongoose.Types.ObjectId(id);

    // 1️⃣ Fetch project history
    const projectHistory = await ActivityHistory.find({ projectId: projectObjectId })
      .populate("performedBy", "name")
      .sort({ performedAt: -1 })
      .lean();

    // 2️⃣ Fetch feed IDs
    const feeds = await Feed.find({ projectId: projectObjectId }).select("_id").lean();
    const feedIds = feeds.map(f => f._id);

    // 3️⃣ Fetch feed history
    const feedHistory = await ActivityHistory.find({ feedId: { $in: feedIds } })
      .populate("performedBy", "name")
      .sort({ performedAt: -1 })
      .lean();

    // 4️⃣ Normalize changedFields for frontend
 const normalizeHistory = (historyArray, type) =>
  historyArray.flatMap((h) => {
    if (!h.changedFields || h.changedFields.length === 0) {
      return [{
        entityType: type,
        field: null,
        oldValue: null,
        newValue: null,
        updatedAt: h.performedAt,
        updatedBy: h.performedBy,
        description: h.actionType === "Feed Created" ? `created feed` :
                     h.actionType === "Project Created" ? `created project` :
                     h.description || h.actionType,
        FeedName: h.FeedName || null,
        ProjectName: h.ProjectName || null
      }];
    }
    return h.changedFields.map(f => ({
      entityType: type,
      field: f.field,
      oldValue: f.oldValue?.value || null,
      newValue: f.newValue?.value || null,
      updatedAt: h.performedAt,
      updatedBy: h.performedBy,
      FeedName: h.FeedName || null,
      ProjectName: h.ProjectName || null
    }));
  });


    const combinedHistory = [
      ...normalizeHistory(projectHistory, "project"),
      ...normalizeHistory(feedHistory, "feed")
    ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.status(200).json({
      success: true,
      data: combinedHistory
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
