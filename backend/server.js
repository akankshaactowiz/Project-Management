import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import feedDataRoute from './routes/feedDataRoute.js';
import escalationRoute from './routes/escalationsRoute.js';
import QaRoute from './routes/QARoute.js';
import TaskRoute from "./routes/taskRoute.js";
import ticketRoute from './routes/ticketRoute.js';
import permissionsRoutes from './routes/permissions.js';
import roleRoutes from './routes/roleRoutes.js';
import { protect } from "./middlewares/authMiddleware.js";
import { authorize } from "./middlewares/rbacMiddleware.js";
import deparmentRoute from "./routes/departmentRoute.js";
import projectRoute from "./routes/projectRoute.js";
import reportRoute from "./routes/Reports.js";
import userRoutes from "./routes/userRoutes.js"
import workRoute from "./routes/workRoute.js"
// import { authorize } from "./middlewares/rbacMiddleware.js";
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/menu", protect, (req, res) => {
  res.json({ menu: req.user.permissions }); // modules + actions from JWT
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
// app.use("/uploads", express.static("uploads")); 
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


// API Routes
app.use("/api/auth", authRoutes);
// Dashboard / project management modules
app.use("/api/users",protect, 
  // authorize("Users", "view"),  
  userRoutes)
app.use("/api/feed",protect, feedDataRoute);
app.use("/api/escalations", protect, authorize("Escalation", "view"), escalationRoute);
app.use("/api/qa",protect, authorize("QA", "view"), QaRoute);
app.use("/api/tasks",protect, authorize("Tasks", "view"), TaskRoute);
app.use("/api/tickets",protect, authorize("Support", "view"), ticketRoute);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/department",deparmentRoute);
app.use("/api/projects", protect, authorize("Project", "view"), projectRoute); 
app.use("/api/work", protect, authorize("Work", "view"), workRoute)
app.use("/api/reports", protect, reportRoute)





app.listen(PORT, "0.0.0.0", (err) => {
  if (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1); 
  }
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
