import mongoose from "mongoose";
import WorkReport from "../models/WorkReport.js";

// export const addReport = async (req, res) => {
//     try {
//         const { project, feed, taskType, task, assignedBy, date, hours, minutes, description } = req.body;

//         const newReport = new WorkReport({
//             project,
//             feed,
//             taskType,
//             task,
//             assignedBy,
//             name: req.user._id,
//             roleId: req.user.roleId,
//             departmentId: req.user.departmentId,
//             date,
//             hours,
//             minutes,
//             description,
//         });

//         const savedReport = await newReport.save();
//         res.status(201).json(savedReport);
//     } catch (err) {
//         console.error("Error saving work report:", err);
//         res.status(500).json({ error: "Failed to add work report" });
//     }
// };

// export const getAllReports = async (req, res) => {
//     try {
//         const roleName = req.user.roleId?.name?.trim().toLowerCase();
//         const departmentId = req.user.departmentId?._id;
//         const userId = req.user._id;

//         let query = {};

//         if (roleName === "Superadmin") {
//             query = {};
//         } else if (roleName === "manager") {
//             const allowedRoles = await mongoose.model("Role").find({
//                 name: { $in: ["Team Lead", "Developer"] },
//             }).select("_id");

//             query = {
//                 departmentId: departmentId,
//                 roleId: { $in: allowedRoles.map((r) => r._id) },
//             };
//         } else if (roleName === "team lead" || roleName === "teamlead") {
//             const devRole = await mongoose.model("Role").findOne({ name: "Developer" });
//             query = {
//                 departmentId: departmentId,
//                 roleId: devRole?._id,
//             };
//         } else {
//             query = { name: userId };
//         }

//         const reports = await WorkReport.find(query)
//             .populate("name", "name email")
//             .populate("roleId", "name")
//             .populate("departmentId", "department")
//             .sort({ createdAt: -1 });

//         res.json(reports);
//     } catch (err) {
//         res.status(500).json({ error: "Failed to fetch hierarchy reports" });
//     }
// };

// export const getReportSummary = async (req, res) => {
//     try {
//         const filter = req.query.filter || "weekly";
//         const { search, fromDate, toDate } = req.query;

//         const today = new Date();
//         today.setHours(23, 59, 59, 999); // ✅ correct end-of-day

//         let baseStart;
//         if (filter === "daily") {
//             baseStart = new Date();
//             baseStart.setHours(0, 0, 0, 0);
//         } else if (filter === "weekly") {
//             baseStart = new Date();
//             baseStart.setDate(baseStart.getDate() - 6);
//             baseStart.setHours(0, 0, 0, 0);
//         }
//         // else {
//         //   baseStart = new Date(today.getFullYear(), today.getMonth(), 1);
//         //   baseStart.setHours(0, 0, 0, 0);
//         // }
//         else {
//             // last 30 days including today
//             baseStart = new Date();
//             baseStart.setDate(baseStart.getDate() - 29);
//             baseStart.setHours(0, 0, 0, 0);
//         }
//         // Apply optional single-date filter
//         let finalStart = baseStart;
//         let finalEnd = today;
//         if (fromDate) {
//             const fd = new Date(fromDate);
//             fd.setHours(0, 0, 0, 0);
//             finalStart = new Date(Math.max(baseStart.getTime(), fd.getTime()));
//         }
//         if (toDate) {
//             const td = new Date(toDate);
//             td.setHours(23, 59, 59, 999);
//             finalEnd = new Date(Math.min(today.getTime(), td.getTime()));
//         }

//         if (finalStart > finalEnd) return res.json({ dates: [], summary: [] });

//         const roleName = req.user.roleId?.name?.trim().toLowerCase();
//         const departmentId = req.user.departmentId?._id;
//         const userId = req.user._id;

//         let query = { date: { $gte: finalStart, $lte: finalEnd } };

//         if (roleName === "Superadmin") {
//         } else if (roleName === "manager") {
//             const allowedRoles = await mongoose.model("Role").find({
//                 name: { $in: ["Team Lead", "Developer"] },
//             }).select("_id");
//             query.departmentId = departmentId;
//             query.roleId = { $in: allowedRoles.map((r) => r._id) };
//         } else if (roleName === "team lead" || roleName === "teamlead") {
//             const devRole = await mongoose.model("Role").findOne({ name: "Developer" });
//             query.departmentId = departmentId;
//             query.roleId = devRole?._id;
//         } else {
//             query.name = userId;
//         }

//         if (search) {
//             query.$or = [
//                 { project: { $regex: search, $options: "i" } },
//                 { task: { $regex: search, $options: "i" } },
//                 { feed: { $regex: search, $options: "i" } },
//             ];
//         }

//         const reports = await WorkReport.find(query).populate("name", "name").populate("roleId", "name")

//         // Build summary
//         const summaryMap = {};
//         reports.forEach((r) => {
//             const userName = r.name?.name || "Unknown";
//             const dateStr = r.date.toLocaleDateString("en-CA"); // <-- use local date
//             if (!summaryMap[userName]) summaryMap[userName] = {};
//             if (!summaryMap[userName][dateStr]) summaryMap[userName][dateStr] = 0;
//             summaryMap[userName][dateStr] += r.hours + r.minutes / 60;
//         });
//         const dates = [];
//         const d = new Date(finalStart);
//         while (d <= finalEnd) {
//             dates.push(d.toLocaleDateString("en-CA"));
//             d.setDate(d.getDate() + 1);
//         }
//         const summary = Object.keys(summaryMap).map((user) => {
//     // const hoursPerDate = dates.map((date) => summaryMap[user][date] || 0);
//     const hoursPerDate = dates.map((date) => {
//   const totalHours = summaryMap[user][date] || 0;
//   const hrs = Math.floor(totalHours); // whole hours
//   const mins = Math.round((totalHours - hrs) * 60); // remaining minutes
//   return `${hrs} hrs ${mins} mins`;
// });

//     const userRole = reports.find(r => r.name?.name === user)?.roleId?.name || "Unknown";
//     return { user, userRole, hoursPerDate, }; // ✅ include userRole
// });

//         res.json({ dates, summary });
//     } catch (err) {
//         console.error("Error fetching role-based summary:", err);
//         res.status(500).json({ message: "Server error" });
//     }
// };
export const getUserReport =  async (req, res) => {
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
export const getReportsWithSummary = async (req, res) => {
    try {
        const filter = req.query.filter || "weekly";
        const { search, fromDate, toDate } = req.query;

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        let baseStart;
        if (filter === "daily") {
            baseStart = new Date();
            baseStart.setHours(0, 0, 0, 0);
        } else if (filter === "weekly") {
            baseStart = new Date();
            baseStart.setDate(baseStart.getDate() - 6);
            baseStart.setHours(0, 0, 0, 0);
        } else {
            baseStart = new Date();
            baseStart.setDate(baseStart.getDate() - 29);
            baseStart.setHours(0, 0, 0, 0);
        }

        let finalStart = baseStart;
        let finalEnd = today;
        if (fromDate) {
            const fd = new Date(fromDate);
            fd.setHours(0, 0, 0, 0);
            finalStart = new Date(Math.max(baseStart.getTime(), fd.getTime()));
        }
        if (toDate) {
            const td = new Date(toDate);
            td.setHours(23, 59, 59, 999);
            finalEnd = new Date(Math.min(today.getTime(), td.getTime()));
        }

        if (finalStart > finalEnd) {
            return res.json({ dates: [], summary: [], reports: [] });
        }

        const roleName = req.user.roleId?.name?.trim().toLowerCase();
        const departmentId = req.user.departmentId?._id;
        const userId = req.user._id;
           

        let query = { date: { $gte: finalStart, $lte: finalEnd } };

        if (roleName === "superadmin") {
            // no additional filter
        } else if (roleName === "manager") {
            const allowedRoles = await mongoose.model("Role").find({
                name: { $in: ["Team Lead", "Developer"] },
            }).select("_id");
            query.departmentId = departmentId;
            query.roleId = { $in: allowedRoles.map((r) => r._id) };
        } else if (roleName === "team lead" || roleName === "teamlead") {
            const devRole = await mongoose.model("Role").findOne({ name: "Developer" });
            query.departmentId = departmentId;
            query.roleId = devRole?._id;
        } else {
            query.name = userId;
        }

        if (search) {
            query.$or = [
                { project: { $regex: search, $options: "i" } },
                { task: { $regex: search, $options: "i" } },
                { feed: { $regex: search, $options: "i" } },
            ];
        }
        // console.log("Query:", query); //Debugging
const reports = await WorkReport.find(query)
    .populate("name", "_id name") // name stays for display
    .populate("roleId", "name")
    .populate("departmentId", "department")
    .sort({ createdAt: -1 });

// Build summary including userId
const summaryMap = {};

reports.forEach((r) => {
    const userName = r.name?.name || "Unknown";
    const userId = r.name?._id?.toString(); // store userId
    const dateStr = r.date.toLocaleDateString("en-CA");

    if (!summaryMap[userName]) summaryMap[userName] = { userId }; // attach userId
    if (!summaryMap[userName][dateStr]) summaryMap[userName][dateStr] = 0;
    summaryMap[userName][dateStr] += r.hours + r.minutes / 60;
});

const dates = [];
const d = new Date(finalStart);
while (d <= finalEnd) {
    dates.push(d.toLocaleDateString("en-CA"));
    d.setDate(d.getDate() + 1);
}

const summary = Object.keys(summaryMap).map((user) => {
    const hoursPerDate = dates.map((date) => {
        const firstReport = reports.find(r => r.name?.name === user);
    const userId = firstReport?.name?._id?.toString() || null;
        const totalHours = summaryMap[user][date] || 0;
        const hrs = Math.floor(totalHours);
        const mins = Math.round((totalHours - hrs) * 60);
        return `${hrs} hrs ${mins} mins`;
    });

    
    const userRole = reports.find(r => r.name?.name === user)?.roleId?.name || "Unknown";

    return { user, userId, userRole, hoursPerDate };
});

res.json({
    dates,
    summary,
    reports // reports still unchanged
});

        // const reports = await WorkReport.find(query)
        //     .populate("name", "name")
        //     .populate("roleId", "name")
        //     .populate("departmentId", "department")
        //     .sort({ createdAt: -1 });
        // //  console.log("Reports:", reports);
        // // Build summary
        // const summaryMap = {};
        // reports.forEach((r) => {
        //     const userName = r.name?.name || "Unknown";
        //     const userId = r.name?._id?.toString();
        //     const dateStr = r.date.toLocaleDateString("en-CA");
        //     if (!summaryMap[userName]) summaryMap[userName] = {};
        //     if (!summaryMap[userName][dateStr]) summaryMap[userName][dateStr] = 0;
        //     summaryMap[userName][dateStr] += r.hours + r.minutes / 60;
        // });

        // const dates = [];
        // const d = new Date(finalStart);
        // while (d <= finalEnd) {
        //     dates.push(d.toLocaleDateString("en-CA"));
        //     d.setDate(d.getDate() + 1);
        // }

        // const summary = Object.keys(summaryMap).map((user) => {
        //         const hoursPerDate = dates.map((date) => {
        //         const totalHours = summaryMap[user][date] || 0;
        //         const hrs = Math.floor(totalHours);
        //         const mins = Math.round((totalHours - hrs) * 60);
        //         return `${hrs} hrs ${mins} mins`;
        //     });
        //     const userId = summaryMap[user].userId;
        //     const userRole = reports.find(r => r.name?.name === user)?.roleId?.name || "Unknown";
        //     return { user, userId, userRole, hoursPerDate };
        // });
        // console.log(summary);

        // res.json({
        //     dates,
        //     summary,
        //     reports // ✅ include the reports data unchanged
        // });
    } catch (err) {
        console.error("Error fetching reports with summary:", err);
        res.status(500).json({ message: "Server error" });
    }
};
