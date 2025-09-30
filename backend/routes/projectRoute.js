import express from "express";
import multer from "multer";
import { protect } from "../middlewares/authMiddleware.js";
import {authorize} from "../middlewares/rbacMiddleware.js"
import { getProjects, createProject, transitionProject, 
    getProjectHistory,
    QAReport,
    AssignToQa,
    getAssignedToQAProjects,
    getProjectById,
    updateProjectTeam,
    updateProject,
    getProjectCounts
 } from "../controllers/projectsController.js";
 import { upload } from "../middlewares/uploadFiles.js";
 import Project from "../models/Projects.js";
import { getQAPassRate, getAvgTimeInQA, getReworkCount, getThroughput, getOverdue } from "../controllers/metricsController.js";
const router = express.Router();

// const upload = multer({ dest: "uploads/" });
// GET all projects
router.get("/", getProjects);

router.get("/counts", getProjectCounts);
router.get("/assigned-to-qa", getAssignedToQAProjects);
router.get("/:id", protect, getProjectById);

router.put(
  "/updates/:id",
  upload.fields([
    { name: "SOWFile", maxCount: 5 },
    { name: "SampleFiles", maxCount: 10 },
  ]),
  updateProject
);


// router.post("/",protect, authorize("Project", "create"), createProject);
router.post(
  "/",
  protect,
  authorize("Project", "create"),
  upload.fields([
    { name: "SOWFile", maxCount: 1 },
    { name: "SampleFiles", maxCount: 5 },
  ]),
  createProject
);

router.put("/:id/update-team", protect, authorize("Project", "update"), updateProjectTeam);

router.post("/:id/transition",protect, transitionProject);
router.get("/:id/history", protect, getProjectHistory);

router.post("/:id/qaReport", upload.single("file"), QAReport);


// Assign file to QA
router.post("/:id/assign-to-qa", upload.single("file"), protect, AssignToQa);

// Developer views QA report using uniqueId
router.get("/developer-report/:uniqueId", protect, async (req,res)=>{
  const report = await Project.findOne({"qaReports.uniqueId": req.params.uniqueId}, { "qaReports.$": 1 });
  if(!report) return res.status(404).json({ message: "Report not found" });
  res.json({ report: report.qaReports[0] });
});

// Developer can add comment on QA report
router.post("/developer-report/:uniqueId/comment", protect, async (req,res)=>{
  const { comment } = req.body;
  const project = await Project.findOne({ "qaReports.uniqueId": req.params.uniqueId });
  if(!project) return res.status(404).json({ message: "Report not found" });

  const report = project.qaReports.find(r=>r.uniqueId === req.params.uniqueId);
  report.developerComments = report.developerComments || [];
  report.developerComments.push({ comment, userId: req.user.id, date: new Date() });
  await project.save();
  res.json({ message: "Comment added" });
});


router.get("/qa/public-report/:uniqueId", async (req,res)=>{
  const project = await Project.findOne({"qaReports.uniqueId": req.params.uniqueId}, { "qaReports.$": 1 });
  if(!project) return res.status(404).json({ message: "Report not found" });
  res.json(project.qaReports[0]);
});



router.get("/metrics/qa-pass-rate", protect, getQAPassRate);
router.get("/metrics/avg-time-in-qa", protect, getAvgTimeInQA);
router.get("/metrics/rework-count", protect, getReworkCount);
router.get("/metrics/throughput", protect, getThroughput);
router.get("/metrics/overdue", protect, getOverdue);

export default router;
