import User from "../models/User.js";
import Role from "../models/Role.js"; 
import Department from "../models/Department.js";
import generateToken from "../utils/generateToken.js";


// Utility: format user response
const UserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
});

const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = generateToken(res, user); // sets cookie and returns token
  // optionally include token in JSON if frontend wants it
  const resp = UserResponse(user);
  resp.token = token;
  return res.status(statusCode).json(resp);
};

// export const getUsersByRoleAndDepartment = async (req, res) => {
//   const { roleName, departmentId, department } = req.query;
  

//   try {
//     const role = await Role.findOne({ name: roleName });
//     if (!role) {
//       return res.status(400).json({ message: "Invalid role name" });
//     }

//     const department = await Department.findById(departmentId);
//     if (!department) {
//       console.log("Invalid department ID:", departmentId);
//       return res.status(400).json({ message: "Invalid department" });
      
//     }else if (department) {
//   department = await Department.findOne({ name: department });
//    }

//     const users = await User.find({
//       roleId: role._id,
//       departmentId: department._id
//     });

//     return res.json(users);
//   } catch (error) {
//     console.error("Error fetching users by role and department:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const getUsersByRoleAndDepartment = async (req, res) => {
  const { roleName, departmentId, departmentName } = req.query;

  try {
    // Find role
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(400).json({ message: "Invalid role name" });
    }

    let departmentDoc = null;

    if (departmentId) {
      departmentDoc = await Department.findById(departmentId);
    } else if (departmentName) {
      departmentDoc = await Department.findOne({ name: departmentName });
    }

    if (!departmentDoc) {
      console.log("Invalid department:", departmentId || departmentName);
      return res.status(400).json({ message: "Invalid department" });
    }

    // Fetch users
    const users = await User.find({
      roleId: role._id,
      departmentId: departmentDoc._id,
    });

    return res.json(users);
  } catch (error) {
    console.error("Error fetching users by role and department:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, roleId, departmentId, managerId, leadId } = req.body;

    // ✅ Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Validate roleId
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // ✅ Validate departmentId
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(400).json({ message: "Invalid department selected" });
    }

    // ✅ Conditional validation based on role
    if (role.name === "Team Lead") {
      if (!managerId) {
        return res.status(400).json({ message: "Manager is required for Team Lead" });
      }
    }
    
    if (role.name === "Developer") {
      if (!managerId || !leadId) {
        return res.status(400).json({ message: "Manager and Team Lead are required for Developer" });
      }
    }

    // if (role.name === "Business Development Executive") {
    //   if (!managerId) {
    //     return res.status(400).json({ message: "Manager is required for Business Development Executive" });
    //   }
    // }

    // ✅ Create user with managerId and teamLeadId if applicable
    let newUser = await User.create({
      name,
      email,
      password,
      roleId: role._id,
      departmentId: department._id,
      managerId: managerId || null,
      leadId: leadId || null,
    });

    // ✅ Populate references before sending response
    newUser = await User.findById(newUser._id)
      .populate("roleId")
      .populate("departmentId")
      .populate("managerId")
      .populate("leadId");

    return res.status(201).json({
      message: "User registered successfully. Please login to continue.",
      user: newUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Populate roleId to get permissions
    const user = await User.findOne({ email }).populate("roleId");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return sendAuthResponse(res, user);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Logout User
export const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: "Logged out successfully" });
};
