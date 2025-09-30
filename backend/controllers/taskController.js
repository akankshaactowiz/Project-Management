
import TaskData from '../models/TaskData.js'
export const addTask = async (req, res) => {

    try {
      const task = new TaskData({
        title: req.body.title,
        department: req.body.department,
        relatedTo: req.body.relatedTo,
        taskType: req.body.taskType,
        taskPriority: req.body.taskPriority,
        taskStatus: req.body.taskStatus,
        project: req.body.project,
        feed: req.body.feed,
        assignedTo: req.body.assignedTo,
        assignedBy: req.body.assignedBy,
        estimateStartDate: req.body.estimateStartDate,
        estimateEndDate: req.body.estimateEndDate,
        watcher: req.body.watcher
      });

      const savedTask = await task.save();
      res.status(201).json(savedTask);
    } catch (error) {
      console.error('Error saving task:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
export const getTasks =  async (req, res) => {
    try {
    const tasks = await TaskData.find();
   

    res.status(200).json(tasks);
    // console.log("Fetched Tasks:", tasks); // ✅ Debugging
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
}