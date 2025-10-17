import express from "express";
// import { getAllUsers } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { getUsersByRoleAndDepartment } from "../controllers/authController.js";
import { getPMAndQAUsers, getTLAndDevelopers, getBDE, getPC, getUserProjectCounts, getProjectsByUser, getAllUsers, getUserReports, addMemberToTeam, getAvailableUsersForTeam, updateProfile } from "../controllers/userController.js";
import { uploadProfile } from "../middlewares/uploadFiles.js";
const router = express.Router();

router.get("/", getAllUsers);

router.get("/team/available-users", getAvailableUsersForTeam) 

router.post("/add-member",protect, addMemberToTeam);

router.post("/update-profile",protect, uploadProfile.single("profileImage"), updateProfile);

router.get("/by-role",protect, getUsersByRoleAndDepartment);

router.get("/bde", getBDE)

router.get("/pc", getPC)

router.get("/pm-qa", protect, getPMAndQAUsers);

router.get("/tl-dev", getTLAndDevelopers);

router.get("/:id/projects", getProjectsByUser);

router.get("/:id/project-count", protect, getUserProjectCounts)

router.get("/:id/report", protect, getUserReports );

export default router;
