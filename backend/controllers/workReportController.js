import WorkReport from "../models/WorkReport.js";
export const addReport = async (req, res) => {
    try {
        const { project, feed, taskType, task, assignedBy, date, hours, minutes, description } = req.body;

        const newReport = new WorkReport({
            project,
            feed,
            taskType,
            task,
            assignedBy,
            name: req.user._id,
            roleId: req.user.roleId,
            departmentId: req.user.departmentId,
            date,
            hours,
            minutes,
            description,
        });

        const savedReport = await newReport.save();
        res.status(201).json(savedReport);
    } catch (err) {
        console.error("Error saving work report:", err);
        res.status(500).json({ error: "Failed to add work report" });
    }
};

export const getYourReports =  async (req, res) => {
  try {
    const reports = await WorkReport.find({ name: req.user._id })
      .populate("name", "name email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error("Error fetching personal reports:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};
