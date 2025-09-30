import User from '../models/User.js';

export const getSearchUsers = async (req, res) => {
    try {
    const query = req.query.query || "";

    if (!query) {
      return res.json([]);
    }

    // Find users whose name starts with or contains the query (case insensitive)
    const users = await User.find({
      name: { $regex: query, $options: "i" }
    })
      .limit(5)
      .select("name"); // only send name field

    res.json(users.map(user => user.name));
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Server error" });
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
      (u) => u.roleId?.name === "Manager" && u.departmentId?.department === "QA"
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
    // Find users with role=Manager + department in R&D/Operations
    const bdeUsers = await User.find()
      .populate("roleId", "name")
      .populate("departmentId", "department")
      .where("roleId")
      .ne(null)
      .where("departmentId")
      .ne(null);

    const filteredPCUsers = pcUsers.filter(
      (u) =>
        u.roleId?.name === "Project Coordinator" 
    );

    return res.status(200).json({
      pcUsers: filteredPCUsers.map((u) => ({ _id: u._id, name: u.name })),

    });
  } catch (err) {
    console.error("Error fetching BDE:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTLAndDevelopers = async (req, res) => {
  try {
    // Populate role + department for filtering
    const users = await User.find()
      .populate("roleId", "name")
      .populate("departmentId", "department");

    // TL = role = "Team Lead"
    const tlUsers = users.filter((u) => u.roleId?.name === "Team Lead");

    // PC = role = "Project Coordinator"
    const pcUsers = users.filter((u) => u.roleId?.name === "Project Coordinator");

    // Developers = role = "Developer"
    const devUsers = users.filter((u) => u.roleId?.name === "Developer");

    const qaLead = users.filter((u) => u.roleId?.name === "QA Lead");

    return res.status(200).json({
      tlUsers: tlUsers.map((u) => ({ _id: u._id, name: u.name })),
      pcUsers: pcUsers.map((u) => ({ _id: u._id, name: u.name })),
      // devUsers: devUsers.map((u) => ({ _id: u._id, name: u.name })),
      qaLead: qaLead.map((u) => ({ _id: u._id, name: u.name })),
    });
  } catch (err) {
    console.error("Error fetching TL & Developers:", err);
    return res.status(500).json({ message: "Server error" });
  }
};