import express from "express";
// import { getAllUsers } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Department from "../models/Department.js";
import Project from "../models/Projects.js";
import WorkReport from "../models/WorkReport.js";
import { roleHierarchy } from "../config/roleHierarchy.js";
import { getUsersByRoleAndDepartment } from "../controllers/authController.js";
import { getSearchUsers, getPMAndQAUsers, getTLAndDevelopers, getBDE, getPC } from "../controllers/userController.js";
const router = express.Router();

// router.get("/", protect, authorize("users", "read"), async (req, res) => {
//   try {
//     const { role, department, page = 1, limit = 10 } = req.query;

//     // 1️⃣ Get requesting user's info
//     const requestingUser = await User.findById(req.user._id).populate("roleId");
//     if (!requestingUser) return res.status(404).json({ message: "User not found" });

//     const requesterRole = requestingUser.roleId.name;

//     // 2️⃣ Build visible roles for this user
//     const visibleRoles = roleHierarchy[requesterRole] || [];

//     // 3️⃣ Find role IDs for visible roles
//     const roleDocs = visibleRoles.length > 0
//       ? await Role.find({ name: { $in: visibleRoles } }).select("_id")
//       : [];

//     // 4️⃣ Build main query
//     let query = {};
//     if (requesterRole !== "Superadmin") {
//       // Only fetch users within visible roles
//       query.roleId = { $in: roleDocs.map(r => r._id) };

//       // Include only direct or hierarchical reports
//       const getUserIds = async (managerId) => {
//         const directReports = await User.find({ managerId }).select("_id");
//         const ids = directReports.map(u => u._id);
//         for (let dr of directReports) {
//           ids.push(...(await getUserIds(dr._id)));
//         }
//         return ids;
//       };

//       const visibleUserIds = await getUserIds(requestingUser._id);
//       query._id = { $in: visibleUserIds };
//     }

       //pagination 
    //     const skip = (parseInt(page) - 1) * parseInt(limit);
    // const totalDocs = await User.countDocuments(query);
    // const users = await User.find(query)
    //   .populate("roleId")
    //   .populate("departmentId")
    //   .select("-password")
    //   .skip(skip)
    //   .limit(parseInt(limit));

//     // 5️⃣ Apply optional filters
//     if (role) {
//       const roleDoc = await Role.findOne({ name: { $regex: new RegExp(`^${role}$`, "i") } });
//       if (roleDoc) query.roleId = roleDoc._id;
//     }
//     if (department) {
//       const deptDoc = await Department.findOne({ department: { $regex: new RegExp(`^${department}$`, "i") } });
//       if (deptDoc) query.departmentId = deptDoc._id;
//     }

//     // 6️⃣ Fetch users
//     const users = await User.find(query)
//       .populate("roleId")
//       .populate("departmentId")
//       .select("-password");

//     // 7️⃣ Fetch allowed roles & departments for filters
//     let allowedRoles;
//     let allowedDepartments;

//     if (requesterRole === "Superadmin") {
//       // Superadmin sees all roles & departments
//       allowedRoles = await Role.find();
//       allowedDepartments = await Department.find();
//     } else {
//       allowedRoles = await Role.find({ _id: { $in: roleDocs.map(r => r._id) } });
//       const allowedDeptIds = users.map(u => u.departmentId?._id).filter(Boolean);
//       allowedDepartments = await Department.find({ _id: { $in: allowedDeptIds } });
//     }
//    allowedRoles = allowedRoles.filter(role => role.name !== "Superadmin");
//     // 8️⃣ Send response with currentUserRole for frontend
//     res.json({
//       users,
//       allowedRoles,
//       allowedDepartments,
//       currentUserRole: requesterRole
    //      pagination: {
    //     totalDocs,
    //     totalPages: Math.ceil(totalDocs / parseInt(limit)),
    //     currentPage: parseInt(page),
    //     pageSize: parseInt(limit),
    //   }
//     });
//   } catch (err) {
//     console.error("Users fetch error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


router.get("/", async (req, res) => {
  try {
    const { role, department, page = 1, limit = 10 } = req.query;

    // 1️⃣ Get requesting user's info
    const requestingUser = await User.findById(req.user._id).populate("roleId");
    if (!requestingUser) return res.status(404).json({ message: "User not found" });

    const requesterRole = requestingUser.roleId.name;

    // 2️⃣ Build visible roles for this user
    const visibleRoles = roleHierarchy[requesterRole] || [];

    // 3️⃣ Find role IDs for visible roles
    const roleDocs = visibleRoles.length > 0
      ? await Role.find({ name: { $in: visibleRoles } }).select("_id")
      : [];

    // 4️⃣ Build main query
     let query = {};

    if (requesterRole !== "Superadmin") {
      query.roleId = { $in: roleDocs.map(r => r._id) };

      const getUserIds = async (managerId) => {
        const directReports = await User.find({ managerId }).select("_id");
        const ids = directReports.map(u => u._id);
        for (let dr of directReports) {
          ids.push(...(await getUserIds(dr._id)));
        }
        return ids;
      };

      const visibleUserIds = await getUserIds(requestingUser._id);
      query._id = { $in: visibleUserIds };
    }

    const SuperadminRole = await Role.findOne({ name: "Superadmin" }).select("_id");
    if (SuperadminRole) {
      query.roleId = query.roleId
        ? { ...query.roleId, $ne: SuperadminRole._id }
        : { $ne: SuperadminRole._id };
    }

    // 5️⃣ Apply optional filters
    if (role) {
      const roleDoc = await Role.findOne({ name: { $regex: new RegExp(`^${role}$`, "i") } });
      if (roleDoc) query.roleId = roleDoc._id;
    }
    if (department) {
      const deptDoc = await Department.findOne({ department: { $regex: new RegExp(`^${department}$`, "i") } });
      if (deptDoc) query.departmentId = deptDoc._id;
    }

    // 6️⃣ Pagination setup
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalDocs = await User.countDocuments(query);

    const users = await User.find(query)
      .populate("roleId")
      .populate("departmentId")
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit));

    // 7️⃣ Fetch allowed roles & departments for filters
    let allowedRoles;
    let allowedDepartments;

    if (requesterRole === "Superadmin") {
      allowedRoles = await Role.find();
      allowedDepartments = await Department.find();
    } else {
      allowedRoles = await Role.find({ _id: { $in: roleDocs.map(r => r._id) } });
      const allowedDeptIds = users.map(u => u.departmentId?._id).filter(Boolean);
      allowedDepartments = await Department.find({ _id: { $in: allowedDeptIds } });
    }
    allowedRoles = allowedRoles.filter(role => role.name !== "Superadmin");

    // 8️⃣ Send paginated response
    res.json({
      users,
      allowedRoles,
      allowedDepartments,
      currentUserRole: requesterRole,
      pagination: {
        totalDocs,
        totalPages: Math.ceil(totalDocs / parseInt(limit)),
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
      }
    });
  } catch (err) {
    console.error("Users fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Watcher user routes
router.get("/search", getSearchUsers);

router.get("/by-role",protect, getUsersByRoleAndDepartment);

router.get("/bde", getBDE)

router.get("/pc", getPC)

router.get("/pm-qa", protect, getPMAndQAUsers);

router.get("/tl-dev", getTLAndDevelopers);

router.get("/:id/projects",authorize("Reports", "view"), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Fetch the user
    const user = await User.findById(req.params.id)
      .populate("roleId")
      .populate("departmentId")
      .select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Pagination setup
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Count total projects for this user
    const totalDocs = await Project.countDocuments({
      $or: [
        { PMId: user._id },
        { TLId: user._id },
        { DeveloperIds: user._id },
      ],
    });

    // Fetch paginated projects where user is involved
    const projects = await Project.find({
      $or: [
        { PMId: user._id },
        { TLId: user._id },
        { DeveloperIds: user._id },
      ],
    })
      .populate("PMId TLId DeveloperIds")
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      user,
      projects,
      pagination: {
        totalDocs,
        totalPages: Math.ceil(totalDocs / parseInt(limit)),
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
      }
    });
  } catch (err) {
    console.error("User details fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/:id/report", protect, 
  async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const query = { name: id }; // `name` holds userId in your schema

    const reports = await WorkReport.find(query)
      .populate("name", "name email") // populate developer info
      .populate("roleId", "name")
      .populate("departmentId", "department")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ date: -1 }); // newest first

    const totalDocs = await WorkReport.countDocuments(query);

    res.json({
      reports,
      pagination: {
        totalDocs,
        totalPages: Math.ceil(totalDocs / limit),
        currentPage: Number(page),
        pageSize: Number(limit),
      },
    });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});

export default router;

// router.get("/:id/details", protect, authorize("users", "read"), async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const user = await User.findById(userId).populate("roleId departmentId");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     let projects = [];

//     // Determine user role
//     const roleName = user.roleId.name;

//     if (roleName === "Manager") {
//       // Projects managed by this Manager
//       projects = await Project.find({ PMId: user._id })
//         .populate("PMId TLId DeveloperIds QAId PCId");
//     } else if (roleName === "Team Lead") {
//       // Projects where this user is TL
//       projects = await Project.find({ TLId: user._id })
//         .populate("PMId TLId DeveloperIds QAId PCId");
//     } else if (roleName === "Developer") {
//       // Projects where this user is a Developer
//       projects = await Project.find({ DeveloperIds: user._id })
//         .populate("PMId TLId DeveloperIds QAId PCId");
//     }

//     res.json({
//       user,
//       projects,
//     });
//   } catch (err) {
//     console.error("Error fetching user details:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

    