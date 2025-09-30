import QAData from "../models/QaData.js";

export const getQAData = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, search, feedId } = req.query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    // Build query object
    let query = {};
    if (feedId) query.feedId = feedId;

    if (search) {
      query.$or = [
        { qaError: { $regex: search, $options: "i" } },
        
      ];
    }

    // Sorting
    let sortObj = {};
    if (sort) {
      const [field, order] = sort.split(":");
      sortObj[field] = order === "desc" ? -1 : 1;
    } else {
      sortObj = { createdAt: -1 }; // default
    }

    // Count total matching docs
    const total = await QAData.countDocuments(query);

    // Fetch data with pagination + populate
    const data = await QAData.find(query)
      .populate("feedId") // populate feed details
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
      data,
    });
  } catch (err) {
    console.error("Error fetching QA data:", err);
    res.status(500).json({ error: "Failed to fetch QA data" });
  }
};

// GET single QA entry
export const getSingleQA = async (req, res) => {
  try {
    const qa = await QAData.findById(req.params.id).populate("feedId");
    if (!qa) return res.status(404).json({ message: "QA entry not found" });
    res.status(200).json(qa);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch QA entry" });
  }
};
