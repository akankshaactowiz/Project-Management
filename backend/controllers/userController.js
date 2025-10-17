import User from '../models/User.js';
import Project from '../models/Projects.js';
import mongoose from 'mongoose';
import { roleHierarchy } from "../config/roleHierarchy.js";
import { authorize } from "../middlewares/rbacMiddleware.js";
import Role from "../models/Role.js";
import Department from "../models/Department.js";
import WorkReport from "../models/WorkReport.js";
import fs from "fs";
import path from "path";


export const getAllUsers = async (req, res) => {
  try {
    const { role, department, search, page = 1, limit = 10 } = req.query;

    // 1️⃣ Get current user
    const requestingUser = await User.findById(req.user._id).populate("roleId departmentId");
    if (!requestingUser) return res.status(404).json({ message: "User not found" });

    const requesterRole = requestingUser.roleId.name;
    const requesterDept = requestingUser.departmentId?.department || "";

    // 2️⃣ Get visible roles based on hierarchy
    const visibleRoles = roleHierarchy[requesterRole] || [];
    const roleDocs = visibleRoles.length > 0
      ? await Role.find({ name: { $in: visibleRoles } }).select("_id name")
      : [];

    // 3️⃣ Build query
    let query = {};
    const SuperadminRole = await Role.findOne({ name: "Superadmin" }).select("_id");

    if (requesterRole === "Superadmin") {
      query = {};
    } 
    // else if (requesterRole === "Sales Head") {
    //   // Sales Head sees all users in Sales department (excluding Superadmin)
    //   const salesDept = await Department.findOne({ department: "Sales" });
    //   if (salesDept) {
    //     query.departmentId = salesDept._id;
    //     if (SuperadminRole) query.roleId = { $ne: SuperadminRole._id };
    //   }
    // } 
    else if (requesterRole === "Sales Head") {
  // Sales Head sees all users in Sales department (excluding Superadmin and Sales Head)
  const salesDept = await Department.findOne({ department: "Sales" });
  if (salesDept) {
    query.departmentId = salesDept._id;

    // Exclude Superadmin and Sales Head
    const excludedRoles = await Role.find({
      name: { $in: ["Superadmin", "Sales Head"] }
    }).select("_id");

    if (excludedRoles.length > 0) {
      query.roleId = { $nin: excludedRoles.map(r => r._id) };
    }
  }
}
    // else {
    //   // Other roles: hierarchy + recursive subordinates
    //   query.roleId = { $in: roleDocs.map(r => r._id) };

    //   const getUserIds = async (managerId,) => {
    //     const directReports = await User.find({ managerId  }).select("_id");
    //     const ids = directReports.map(u => u._id);
    //     for (let dr of directReports) {
    //       ids.push(...(await getUserIds(dr._id)));
    //     }
    //     return ids;
    //   };

    //   const visibleUserIds = await getUserIds(requestingUser._id);
    //   query._id = { $in: visibleUserIds };

    //   // Exclude Superadmin
    //   if (SuperadminRole) {
    //     query.roleId = { ...query.roleId, $ne: SuperadminRole._id };
    //   }
    // }

    else {
  // Other roles: hierarchy + recursive subordinates
  query.roleId = { $in: roleDocs.map(r => r._id) };

  const getUserIds = async (managerOrLeadId) => {
    // Find users where managerId OR leadId matches
    const directReports = await User.find({
      $or: [{ managerId: managerOrLeadId }, { leadId: managerOrLeadId }]
    }).select("_id");

    const ids = directReports.map(u => u._id);

    // Recursively get subordinates of each direct report
    for (let dr of directReports) {
      ids.push(...(await getUserIds(dr._id)));
    }

    return ids;
  };

  const visibleUserIds = await getUserIds(requestingUser._id);
  query._id = { $in: visibleUserIds };

  // Exclude Superadmin
  if (SuperadminRole) {
    query.roleId = { ...query.roleId, $ne: SuperadminRole._id };
  }
}


    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { role: regex }];
    }

    // 4️⃣ Apply optional filters
    if (role) {
      const roleDoc = await Role.findOne({ name: { $regex: new RegExp(`^${role}$`, "i") } });
      if (roleDoc) query.roleId = roleDoc._id;
    }

    // Only apply department filter if not Sales Head
    if (department && requesterRole !== "Sales Head") {
      const deptDoc = await Department.findOne({
        department: { $regex: new RegExp(`^${department}$`, "i") },
      });
      if (deptDoc) query.departmentId = deptDoc._id;
    } else if (requesterRole !== "Superadmin" && requesterRole !== "Sales Head" && requesterDept) {
      // default department filter for non-superadmins (excluding Sales Head)
      const deptDoc = await Department.findOne({ department: requesterDept });
      if (deptDoc) query.departmentId = deptDoc._id;
    }

    // 5️⃣ Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalDocs = await User.countDocuments(query);

    const users = await User.find(query)
      .populate("roleId" )
      .populate("departmentId")
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit));

    // 6️⃣ Filter options
    let allowedRoles, allowedDepartments;

    if (requesterRole === "Superadmin") {
      allowedRoles = await Role.find();
      allowedDepartments = await Department.find();
    } else {
      allowedRoles = await Role.find({ _id: { $in: roleDocs.map(r => r._id) } });
      const allowedDeptIds = users.map(u => u.departmentId?._id).filter(Boolean);
      allowedDepartments = await Department.find({ _id: { $in: allowedDeptIds } });
    }

    allowedRoles = allowedRoles.filter(r => r.name !== "Superadmin");

    // 7️⃣ Response
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
};

// GET /api/team/available-users
export const getAvailableUsersForTeam = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).populate("roleId departmentId");
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const roleName = currentUser.roleId?.name;
    const deptId = currentUser.departmentId?._id;

    const allowedRoles = roleHierarchy[roleName] || [];

    if (allowedRoles.length === 0)
      return res.json({ users: [] }); // No roles to add

    // Fetch Role documents for allowed roles
    const roleDocs = await Role.find({ name: { $in: allowedRoles } }).select("_id name");

    // Build query
    const query = {
      roleId: { $in: roleDocs.map((r) => r._id) },
      departmentId: deptId, // limit to same department as current user
    };

    // Optional: exclude users already assigned to someone
    query.$or = [{ managerId: { $exists: false } }, { TLId: { $exists: false } }];

    const users = await User.find(query)
      .populate("roleId")
      .populate("departmentId")
      .select("-password")
      .lean();

    res.json({ users });
  } catch (err) {
    console.error("Available users fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getUserReports = async (req, res) => {
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
};

export const getPMAndQAUsers = async (req, res) => {
  try {
    // Find users with role=Manager + department in R&D/Operations
    const pmUsers = await User.find()
      .populate("roleId", "name")
      .populate("departmentId", "department")
      .where("roleId")
      .ne(null)
      .where("departmentId")
      .ne(null);

    const filteredPmUsers = pmUsers.filter(
      (u) =>
        u.roleId?.name === "Manager" &&
        ["R&D", "Operation"].includes(u.departmentId?.department)
    );

    // Find users with role=Manager + department=QA
    const qaUsers = pmUsers.filter(
      (u) => u.roleId?.name === "QA Lead" && u.departmentId?.department === "QA"
    );

    return res.status(200).json({
      pmUsers: filteredPmUsers.map((u) => ({ _id: u._id, name: u.name })),
      qaUsers: qaUsers.map((u) => ({ _id: u._id, name: u.name })),
    });
  } catch (err) {
    console.error("Error fetching PM & QA users:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getProjectsByUser =  async (req, res) => {
  try {
    const { page = 1, limit = 10, tabs = "All", search = "", filterDate, entries, summaryMonth } = req.query;
    
    // 1️⃣ Fetch the user
    const user = await User.findById(req.params.id).select('name');
      // .populate("roleId")
      // .populate("departmentId")
      // .select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    // 2️⃣ Build project query
    let projectQuery = {
      $or: [
        { PMId: user._id },
        { QAId: user._id },
        { PCId: user._id },
        { BAUPersonId: user._id },
        { BDEId: user._id },
        {CreatedBy: user._id },
        { TLId: user._id },
        { DeveloperIds: user._id },
      ],
    };

    

    // if (search) {
    //   const regex = new RegExp(search, "i");
    //   projectQuery.$and = [
    //     { $or: [{ ProjectName: regex }, { description: regex }] }
    //   ];
    // }
//     if (search) {
//   const regex = new RegExp(search, "i"); // case-insensitive

//   projectQuery.$and = [
//     {
//       $or: [
//         { ProjectName: regex },        // Project Name
//         { ProjectCode: regex },        // Project Code
//         { ProjectType: regex },        // Description
//         { "PMId.name": regex },        // Project Manager
//         { "BDEId.name": regex },       // BDE
//         { "PCId.name": regex },        // Project Coordinator
//         { "QAId.name": regex },        // QA
//         { "TLId.name": regex },        // Team Lead
//         { "BAUPersonId.name": regex }  // BAU person
//       ]
//     }
//   ];
// }
     
    // If summaryMonth is true, filter projects created this month
if (summaryMonth === "true") {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
  projectQuery.CreatedDate = { $gte: startOfMonth, $lte: endOfMonth };
}

     if (filterDate) {
      const startOfDay = new Date(filterDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filterDate);
      endOfDay.setHours(23, 59, 59, 999);

      projectQuery.CreatedDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (tabs && tabs !== "All") {
      
      if (tabs === "BAU") {
        projectQuery.DeliveryType = "BAU";
      } else if (tabs === "POC") {
        projectQuery.DeliveryType = "POC";
      } else if (tabs === "Adhoc") {
        projectQuery.DeliveryType = "Adhoc";
      }
      else if (tabs === "Once-off") {
        projectQuery.DeliveryType = "Once-off";
      }
    }


    // 3️⃣ Pagination setup
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 4️⃣ Count total projects
    const totalDocs = await Project.countDocuments(projectQuery);

    // 5️⃣ Fetch projects
    let projects = await Project.find(projectQuery)
      .populate({
        path: "PMId TLId QAId PCId BAUPersonId CreatedBy BDEId DeveloperIds",
        select: "name roleId departmentId",
        populate: [{ path: "roleId", select: "name" }, { path: "departmentId", select: "department" }]
      })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

      if (search) {
  const regex = new RegExp(search, "i");
  projects = projects.filter(project =>
    regex.test(project.ProjectName) ||
    regex.test(project.ProjectCode) ||
    regex.test(project.ProjectType) ||
    regex.test(project.DeliveryType) ||
    regex.test(project.IndustryType) ||
    (project.PMId?.name && regex.test(project.PMId.name)) ||
    (project.BDEId?.name && regex.test(project.BDEId.name)) ||
    (project.PCId?.name && regex.test(project.PCId.name)) ||
    (project.QAId?.name && regex.test(project.QAId.name)) ||
    (project.TLId?.name && regex.test(project.TLId.name)) ||
    (project.BAUPersonId?.name && regex.test(project.BAUPersonId.name))
  );
}


// if (req.query.summaryOnly === "true") {
//   const totalProjects = await Project.countDocuments(projectQuery);
//   const completed = await Project.countDocuments({ ...projectQuery, Status: "Production" });
//   const ongoing = await Project.countDocuments({ ...projectQuery, Status: "Under Development" });
//   const pending = await Project.countDocuments({ ...projectQuery, Status: "On-Hold" });

//   return res.json({ totalProjects, completed, ongoing, pending });
// }

    // 6️⃣ Response
    res.json({
      user,
      projects,
      // pagination: {
      //   totalDocs,
      //   totalPages: Math.ceil(totalDocs / parseInt(limit)),
      //   currentPage: parseInt(page),
      //   pageSize: parseInt(limit),
      // }
    });
  } catch (err) {
    console.error("User projects fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export const getUserProjectCounts = async (req, res) => {
  try {
    const { id } = req.params; // user ID
    const uid = mongoose.Types.ObjectId.isValid(id)
      ? new mongoose.Types.ObjectId(id)
      : id;

      // 🔹 Calculate start and end of this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    const counts = await Project.aggregate([
      { $match: { 
          $or: [
            { CreatedBy: uid },
            { PMId: uid },
            { PCId: uid },
            { TLId: uid },
            { DeveloperIds: uid },
            { QAId: uid },
            { BAUPersonId: uid },
            { BDEId: uid },
          ] 
      } },
      { $group: {
          _id: null,
          total: { $sum: 1 },
          bau: { $sum: { $cond: [{ $eq: ["$DeliveryType", "BAU"] }, 1, 0] } },
          adhoc: { $sum: { $cond: [{ $eq: ["$DeliveryType", "Adhoc"] }, 1, 0] } },
          poc: { $sum: { $cond: [{ $eq: ["$DeliveryType", "POC"] }, 1, 0] } },
          onceOff: { $sum: { $cond: [{ $eq: ["$DeliveryType", "Once-Off"] }, 1, 0] } },
          escalation: { $sum: { $cond: [{ $eq: ["$Status", "Escalated"] }, 1, 0] }
          },
          completed: { $sum: { $cond: [{ $eq: ["$Status", "Production"] }, 1, 0] } },
          ongoing: { $sum: { $cond: [{ $eq: ["$Status", "Under Development"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$Status", "On-Hold"] }, 1, 0] } },
          rework: { $sum: { $cond: [{ $eq: ["$Status", "Rework"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$Status", "Cancelled"] }, 1, 0] } },
          onHold: { $sum: { $cond: [{ $eq: ["$Status", "On-Hold"] }, 1, 0] } },
          newStatus: { $sum: { $cond: [{ $eq: ["$Status", "New"] }, 1, 0] } },
          underDevelopment: { $sum: { $cond: [{ $eq: ["$Status", "Under Development"] }, 1, 0] } },
          onHold: { $sum: { $cond: [{ $eq: ["$Status", "On-Hold"] }, 1, 0] } },
          devCompleted: { $sum: { $cond: [{ $eq: ["$Status", "Production"] }, 1, 0] } },
          bauStarted: { $sum: { $cond: [{ $eq: ["$Status", "BAU-Started"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$Status", "Closed"] }, 1, 0] } },
          totalFeeds: {
        $sum: { $size: { $ifNull: ["$Feeds", []] } }
      }

        }
      },

    ]);

     // 🔹 New aggregation for this month's counts
    const thisMonthCounts = await Project.aggregate([
      {
        $match: {
          $or: [
            { CreatedBy: uid },
            { PMId: uid },
            { PCId: uid },
            { TLId: uid },
            { DeveloperIds: uid },
            { QAId: uid },
            { BAUPersonId: uid },
            { BDEId: uid },
          ],
          CreatedDate: { $gte: startOfMonth, $lte: endOfMonth },
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$Status", "Production"] }, 1, 0] } },
          ongoing: { $sum: { $cond: [{ $eq: ["$Status", "Under Development"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$Status", "On-Hold"] }, 1, 0] } },
          
          // totalFeeds: { $sum: { $size: "$Feeds" } },
          
        }
      }
    ]);

    res.json({
      totalCounts: counts[0] || { total: 0, bau: 0, adhoc: 0, poc: 0 },
      thisMonthCounts: thisMonthCounts[0] || { total: 0, completed: 0, ongoing: 0, pending: 0, escalated: 0 }
    });


    // res.json(counts[0] || { total: 0, bau: 0, adhoc: 0, poc: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch project counts for user" });
  }
};


export const getBDE = async (req, res) => {
  try {
    // Find users with role=Manager + department in R&D/Operations
    const bdeUsers = await User.find()
      .populate("roleId", "name")
      .populate("departmentId", "department")
      .where("roleId")
      .ne(null)
      .where("departmentId")
      .ne(null);

    const filteredBDEUsers = bdeUsers.filter(
      (u) =>
        u.roleId?.name === "Business Development Executive" &&
        ["Sales"].includes(u.departmentId?.department)
    );

    // Find users with role=Manager + department=QA
    // const qaUsers = pmUsers.filter(
    //   (u) => u.roleId?.name === "Manager" && u.departmentId?.department === "QA"
    // );

    return res.status(200).json({
      bdeUsers: filteredBDEUsers.map((u) => ({ _id: u._id, name: u.name })),
      // qaUsers: qaUsers.map((u) => ({ _id: u._id, name: u.name })),
    });
  } catch (err) {
    console.error("Error fetching BDE:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPC = async (req, res) => {
  try {
    // Fetch all users with role and department populated
    const allUsers = await User.find()
      .populate("roleId", "name")
      .populate("departmentId", "department")
      .where("roleId")
      .ne(null)
      .where("departmentId")
      .ne(null);

    // Filter only Project Coordinators
    const filteredPCUsers = allUsers.filter(
      (u) => u.roleId?.name === "Project Coordinator"
    );

    return res.status(200).json({
      pcUsers: filteredPCUsers.map((u) => ({ _id: u._id, name: u.name })),
    });
  } catch (err) {
    console.error("Error fetching PC:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTLAndDevelopers = async (req, res) => {
  try {
    const userId = req.user._id; // Logged-in user

    // Get logged-in user's department
    const loggedInUser = await User.findById(userId)
      .populate("departmentId", "department");

    const userDeptId = loggedInUser?.departmentId?._id;

    // Populate role + department for filtering
    const users = await User.find()
      .populate("roleId", "name")
      .populate("departmentId", "department");

    // TL = role = "Team Lead" AND same department
    const tlUsers = users.filter(
      (u) => u.roleId?.name === "Team Lead" && u.departmentId?._id.equals(userDeptId)
    );

    // PC = role = "Project Coordinator" AND same department
    const pcUsers = users.filter(
      (u) => u.roleId?.name === "Project Coordinator" && u.departmentId?._id.equals(userDeptId)
    );

    // Developers = role = "Developer" AND same department
    const devUsers = users.filter(
      (u) => u.roleId?.name === "Developer" && u.departmentId?._id.equals(userDeptId)
    );

    // QA Lead (no department filter)
    const qaLead = users.filter((u) => u.roleId?.name === "QA Lead");

    // BAU Person (Manager in BAU dept, no user department filter)
    const bauPerson = users.filter(
      (u) => u.roleId?.name === "Manager" && u.departmentId?.department === "BAU"
    );

    return res.status(200).json({
      tlUsers: tlUsers.map((u) => ({ _id: u._id, name: u.name })),
      pcUsers: pcUsers.map((u) => ({ _id: u._id, name: u.name })),
      devUsers: devUsers.map((u) => ({ _id: u._id, name: u.name })),
      qaLead: qaLead.map((u) => ({ _id: u._id, name: u.name })),
      bauPerson: bauPerson.map((u) => ({ _id: u._id, name: u.name })),
    });
  } catch (err) {
    console.error("Error fetching TL & Developers:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const addMemberToTeam = async (req, res) => {
  try {
    const { userIdToAdd } = req.body; // user being added
    const currentUserId = req.user._id;

    // Get current user role
    const currentUser = await User.findById(currentUserId).populate("roleId");
    if (!currentUser) return res.status(404).json({ message: "Current user not found" });

    const roleName = currentUser.roleId?.name;

    // Find the user being added
    const member = await User.findById(userIdToAdd);
    if (!member) return res.status(404).json({ message: "User to add not found" });

    // Role-based assignment logic
    if (roleName === "Manager") {
      member.managerId = currentUserId;
    } else if (roleName === "Team Lead") {
      member.TLId = currentUserId;
    } else {
      return res.status(403).json({ message: "Not authorized to add members" });
    }

    await member.save();

    res.status(200).json({
      success: true,
      message: `${member.name} added to your team successfully`,
      data: member,
    });
  } catch (err) {
    console.error("Add member error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/users/:id/update-password
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newPassword } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update password if provided
    if (newPassword) {
      user.password = newPassword; // Will be hashed via pre('save')
    }

    // Update profile image if file uploaded
    if (req.file) {
      // Delete old image if exists
      if (user.profileImage) {
        const oldPath = path.join("uploads/profile", user.profileImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      user.profileImage = req.file.filename;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      profileImage: user.profileImage || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};