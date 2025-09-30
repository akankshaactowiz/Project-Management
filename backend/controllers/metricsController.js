import Project from "../models/Projects.js";

// QA Pass Rate (first attempt)
export const getQAPassRate = async (req, res) => {
  try {
    const projects = await Project.find();
    let total = 0, passedFirstTime = 0;
    projects.forEach(p => {
      if (p.qaCycleTimes.length > 0) {
        total++;
        const rejected = p.history.find(h => h.toStatus === "qa_rejected");
        if (!rejected) passedFirstTime++;
      }
    });
    const rate = total > 0 ? (passedFirstTime / total) * 100 : 0;
    res.json({ rate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Average time in QA
export const getAvgTimeInQA = async (req, res) => {
  try {
    const projects = await Project.find();
    let totalDuration = 0;
    let count = 0;
    projects.forEach(p => {
      p.qaCycleTimes.forEach(cycle => {
        if (cycle.start && cycle.end) {
          totalDuration += (new Date(cycle.end) - new Date(cycle.start));
          count++;
        }
      });
    });
    const avgTime = count > 0 ? totalDuration / count / 1000 / 60 : 0;
    res.json({ avgTimeInMinutes: avgTime.toFixed(2) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rework count
export const getReworkCount = async (req, res) => {
  try {
    const result = await Project.aggregate([
      { $group: { _id: null, totalRework: { $sum: "$reworkCount" } } }
    ]);
    res.json({ totalRework: result[0]?.totalRework || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Throughput per week (last 8 weeks)
export const getThroughput = async (req, res) => {
  try {
    const now = new Date();
    const pipeline = [
      { $match: { Status: "completed", updatedAt: { $gte: new Date(now.setDate(now.getDate() - 56)) } } },
      {
        $group: {
          _id: { $week: "$updatedAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ];
    const result = await Project.aggregate(pipeline);
    res.json({ throughput: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Overdue projects
export const getOverdue = async (req, res) => {
  try {
    const now = new Date();
    const overdueCount = await Project.countDocuments({ EndDate: { $lt: now }, Status: { $ne: "completed" } });
    const totalCount = await Project.countDocuments();
    const percentage = totalCount > 0 ? (overdueCount / totalCount) * 100 : 0;
    res.json({ overdueCount, percentage: percentage.toFixed(2) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
