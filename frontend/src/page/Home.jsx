import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import OverdueSummary from "../components/OverdueSummary.jsx";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);
import {
  Users,
  Activity,
  UserCog,
  Settings,
  FileText,
  User
} from "lucide-react";
import SalesSummaryDashboard from "../components/SalesSummaryView.jsx";

function Home() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [tasks, setTasks] = useState([]);

  // const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");


  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [projectCounts, setProjectCounts] = useState({});

  // Fetch tickets and tasks
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [ticketsRes, tasksRes] = await Promise.all([
  //         fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/tickets`),
  //         fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/tasks`)
  //       ]);

  //       const ticketsData = await ticketsRes.json();
  //       const tasksData = await tasksRes.json();

  //       setTickets(ticketsData);
  //       setTasks(tasksData);
  //     } catch (err) {
  //       console.error("Error fetching data:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, []);

  const totalTickets = tickets.length;
  const unresolvedTickets = tickets.filter(
    (t) => t.status?.toLowerCase() !== "resolved"
  ).length;

  const totalTasks = tasks.length;
  const assignedByMe = tasks.filter((t) => t.assignedBy === user?.name).length;
  const createdByMe = tasks.filter((t) => t.createdBy === user?.name).length;
  const completed = tasks.filter((t) => t.status?.toLowerCase() === "completed").length;
  const inProgress = tasks.filter((t) => t.status?.toLowerCase() === "in-progress").length;
  const terminated = tasks.filter((t) => t.status?.toLowerCase() === "terminated").length;
  const totalPending = tasks.filter((t) => t.status?.toLowerCase() === "pending").length;
  const pastPending = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return t.status?.toLowerCase() === "pending" && due < new Date();
  }).length;

  const taskCounts = [
    { label: "Total Task", count: totalTasks },
    { label: "Assigned by Me", count: assignedByMe },
    { label: "Completed", count: completed },
    { label: "In-progress", count: inProgress },
    { label: "Terminated", count: terminated },
    { label: "Created by Me", count: createdByMe },
    { label: "Total Pending", count: totalPending },
    { label: "Past Pending", count: pastPending },
  ];

  const feedRows = [
    "Total Feed",
    "Blocking Issue",
    "Crawl Yet to Start",
    "Crawl Running",
    "Crawl Finished",
    "Assigned to QA",
    "QA Running",
    "QA Failed",
    "QA Passed",
    "QA Rejected",
    "Delayed",
    "Delivered",
  ];


  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date() && t.status?.toLowerCase() !== "completed";
  });

  const overdueProjects = projects.filter((p) => {
    if (!p.dueDate) return false;
    return new Date(p.dueDate) < new Date() && p.status?.toLowerCase() !== "completed";
  });


  const data = {
    labels: ["On Time Delivery", "Delayed"],
    datasets: [
      {
        data: [65, 20], // example values, you can replace with API data
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EBcc", "#FF6384cc"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "70%", // makes it donut
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#333",
          font: { size: 14 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let value = context.raw;
            let total = context.dataset.data.reduce((a, b) => a + b, 0);
            let percentage = ((value / total) * 100).toFixed(1) + "%";
            return `${context.label}: ${value} (${percentage})`;
          },
        },
      },
    },
  };
  // if (userLoading || loading) return <div className="p-4">Loading...</div>;

  const fetchCounts = async () => {
    try {
      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/counts`,
        { credentials: "include" }
      );
      const data = await res.json();
      console.log("Fetched counts:", data);
      setProjectCounts(data);
    } catch (err) {
      console.error("Failed to fetch project counts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);


  useEffect(() => {
    fetchCounts();
  }, []);


  return (
    <div className="flex flex-col md:flex-row gap-4 bg-gray-50">
      {/* Left Profile Section */}
      {/* <aside className="bg-white p-6 rounded-md shadow-md flex flex-col items-center md:w-1/4">
        <img
          src={Img}
          alt="Profile"
          className="w-32 h-32 rounded-full mb-4 object-cover"
        />
        <h2 className="text-xl font-semibold mb-2">{user?.name || "No Name"}</h2>
        <p className="text-gray-600 mb-4"> {user?.email || "No Email"}</p>
        <p className="text-sm text-center text-gray-700 px-2">Role: {user?.roleName}</p>

        <p className="text-center text-gray-700 mb-6 px-2">Department: {user?.department}</p>

        <div className="bg-gray-100 px-5 py-3 rounded-lg shadow-sm w-full text-center">
          <p className="text-sm uppercase tracking-wide font-semibold mb-1">
            Total Projects
          </p>
          <p className="text-3xl font-bold">24</p>
        </div>
      </aside> */}

      {/* Superadmin Home Page */}
      {user?.roleName === "Superadmin" && (
        <main className="flex-1 bg-white overflow-auto p-6">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <Users className="w-10 h-10 text-blue-600 mr-4" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">12</h3>
                <p className="text-gray-600">Total Users</p>
              </div>
            </div>
            <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <User className="w-10 h-10 text-blue-600 mr-4" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">4</h3>
                <p className="text-gray-600">Managers</p>
              </div>
            </div>
            <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <Activity className="w-10 h-10 text-green-600 mr-4" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">3</h3>
                <p className="text-gray-600">Active Projects</p>
              </div>
            </div>
          </div>

          {/* Ticket Overview + Today's Delivery Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            {/* Today's Delivery Overview */}
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Today's Delivery Overview</h2>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between bg-green-100 p-3 rounded-md">
                  <span className="text-gray-700 font-medium">Total</span>
                  <span className="font-bold text-green-600">8</span>
                </div>
                <div className="flex justify-between bg-yellow-100 p-3 rounded-md">
                  <span className="text-gray-700 font-medium">Completed</span>
                  <span className="font-bold text-yellow-600">5</span>
                </div>
                <div className="flex justify-between bg-blue-100 p-3 rounded-md">
                  <span className="text-gray-700 font-medium">Pending</span>
                  <span className="font-bold text-blue-600">3</span>
                </div>
              </div>
            </div>

            {/* Ticket Overview */}
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Ticket Overview</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    <tr className="border-t border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-4 py-2 text-gray-700 font-semibold">Total</td>
                      <td className="px-4 py-2 text-center text-gray-900 font-semibold">7</td>
                    </tr>
                    <tr className="border-t border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-4 py-2 text-gray-700 font-semibold">Resolved</td>
                      <td className="px-4 py-2 text-center text-gray-900 font-semibold">5</td>
                    </tr>
                    <tr className="border-t border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-4 py-2 text-gray-700 font-semibold">Unresolved</td>
                      <td className="px-4 py-2 text-center text-gray-900 font-semibold">2</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <OverdueSummary tasks={tasks} projects={projects} />

            <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
              <h2 className="text-lg font-semibold mb-4">Escalations</h2>
              <div className="grid gap-3">
                {[
                  { label: "High Priority", count: 2, color: "red" },
                  { label: "Medium Priority", count: 5, color: "yellow" },
                  { label: "Low Priority", count: 3, color: "green" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between p-3 rounded-md bg-${item.color}-100`}
                  >
                    <span className="text-gray-700 font-medium">{item.label}</span>
                    <span className={`font-bold text-${item.color}-600`}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button className="flex items-center justify-center gap-2 bg-blue-400 text-white py-4 rounded-xl shadow hover:bg-blue-700 transition">
              <UserCog className="w-5 h-5" /> Manage Users
            </button>
            <button className="flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-xl shadow hover:bg-green-700 transition">
              <FileText className="w-5 h-5" /> View Reports
            </button>
            <button className="flex items-center justify-center gap-2 bg-purple-400 text-white py-4 rounded-xl shadow hover:bg-purple-700 transition">
              <Settings className="w-5 h-5" /> Manage Permissions
            </button>
          </div>
        </main>
      )
      }

      {user?.department === "Sales" && (
        <main className="flex-1 bg-white overflow-auto p-6">
          <div className="space-y-6 mb-8">
            {/* Row 1: Total Projects & Total Feeds */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Total Projects Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
                onClick={() => navigate("/project")}>
                <Activity className="w-8 h-8 text-blue-600 mb-4" />
                <p className="text-gray-600 text-base font-medium">Total Projects</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? "..." : projectCounts.total || 0}
                </h3>
              </div>

              {/* Total Feeds Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
                onClick={() => navigate("/project")}>
                <Activity className="w-8 h-8 text-blue-600 mb-4" />
                <p className="text-gray-600 text-base font-medium">Total Feeds</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? "..." : projectCounts.totalFeeds || 0}
                </h3>
              </div>
            </div>

            {/* Row 2: Other Project Types */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* BAU Projects */}
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
                onClick={() => navigate("/project")}>
                <Activity className="w-8 h-8 text-green-600 mb-4" />
                <p className="text-gray-600 text-base font-medium">BAU Projects</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? "..." : projectCounts.bau || 0}
                </h3>
              </div>

              {/* Adhoc Projects */}
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
                onClick={() => navigate("/project")}>
                <Activity className="w-8 h-8 text-yellow-500 mb-4" />
                <p className="text-gray-600 text-base font-medium">Adhoc Projects</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? "..." : projectCounts.adhoc || 0}
                </h3>
              </div>

              {/* Once-Off Projects */}
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
                onClick={() => navigate("/project")}>
                <Activity className="w-8 h-8 text-sky-500 mb-4" />
                <p className="text-gray-600 text-base font-medium">Once-Off Projects</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? "..." : projectCounts.onceOff || 0}
                </h3>
              </div>

              {/* POC Projects */}
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
                onClick={() => navigate("/project")}>
                <Activity className="w-8 h-8 text-purple-600 mb-4" />
                <p className="text-gray-600 text-base font-medium">POC Projects</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? "..." : projectCounts.poc || 0}
                </h3>
              </div>

              {/* R&D Projects */}
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
                onClick={() => navigate("/project")}>
                <Activity className="w-8 h-8 text-pink-600 mb-4" />
                <p className="text-gray-600 text-base font-medium">R&D Projects</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? "..." : projectCounts.rnd || 0}
                </h3>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
            {/* Project's Status Overview */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Project's Status Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* New */}
                <div className="flex items-center p-4 bg-green-50 rounded-xl"
                  onClick={() => navigate("/project")}>
                  <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-full mr-4">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">New</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? "..." : projectCounts.newStatus || 0}
                    </h3>
                  </div>
                </div>

                {/* Under Development */}
                <div className="flex items-center p-4 bg-blue-50 rounded-xl"
                  onClick={() => navigate("/project")}>
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mr-4">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Under Development</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? "..." : projectCounts.underDevelopment || 0}
                    </h3>
                  </div>
                </div>

                {/* On-Hold */}
                <div className="flex items-center p-4 bg-purple-50 rounded-xl"
                  onClick={() => navigate("/project")}>
                  <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-full mr-4">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">On-Hold</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? "..." : projectCounts.onHold || 0}
                    </h3>
                  </div>
                </div>

                {/* Development Completed */}
                <div className="flex items-center p-4 bg-yellow-50 rounded-xl"
                  onClick={() => navigate("/project")}>
                  <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 rounded-full mr-4">
                    <Activity className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Production</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? "..." : projectCounts.devCompleted || 0}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-orange-50 rounded-xl"
                  onClick={() => navigate("/project")}>
                  <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 rounded-full mr-4">
                    <Activity className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">BAU-Started</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? "..." : projectCounts.bauStarted || 0}
                    </h3>
                  </div>
                </div>
                {/* Closed */}
                <div className="flex items-center p-4 bg-pink-50 rounded-xl"
                  onClick={() => navigate("/project")}>
                  <div className="w-12 h-12 flex items-center justify-center bg-pink-100 rounded-full mr-4">
                    <Activity className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Closed</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? "..." : projectCounts.closed || 0}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        // demo view
        // <main className="flex-1 bg-white overflow-auto p-6">
        // <SalesSummaryDashboard />
        // </main>

      )}



      {/* Manager view */}

      {user?.roleName === "Manager" && (
        <>
          {user?.department === "QA" && (
            // <main className="flex-1 bg-white overflow-auto p-6">

            //   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            //     <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            //       <Users className="w-10 h-10 text-blue-600 mr-4" />
            //       <div>
            //         <h3 className="text-2xl font-bold text-gray-800">10</h3>
            //         <p className="text-gray-600">Total Projects</p>
            //       </div>
            //     </div>
            //     <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            //       <User className="w-10 h-10 text-blue-600 mr-4" />
            //       <div>
            //         <h3 className="text-2xl font-bold text-gray-800">22</h3>
            //         <p className="text-gray-600">Total Tasks</p>
            //       </div>
            //     </div>
            //     <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            //       <Activity className="w-10 h-10 text-green-600 mr-4" />
            //       <div>
            //         <h3 className="text-2xl font-bold text-gray-800">6</h3>
            //         <p className="text-gray-600">Active Projects</p>
            //       </div>
            //     </div>
            //   </div>

            //      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            //     {/* QA Overview */}
            //     <div className="bg-white p-4 rounded-md shadow-sm">
            //       <h2 className="text-lg font-semibold mb-4">QA Overview</h2>
            //       <div className="grid grid-cols-1 gap-3">
            //         <div className="flex justify-between bg-green-100 p-3 rounded-md">
            //           <span className="text-gray-700 font-medium">Assigned to QA</span>
            //           <span className="font-bold text-green-600">12</span>
            //         </div>
            //         <div className="flex justify-between bg-yellow-100 p-3 rounded-md">
            //           <span className="text-gray-700 font-medium">QA Running</span>
            //           <span className="font-bold text-yellow-600">5</span>
            //         </div>
            //         <div className="flex justify-between bg-yellow-100 p-3 rounded-md">
            //           <span className="text-gray-700 font-medium">QA Passed</span>
            //           <span className="font-bold text-yellow-600">5</span>
            //         </div>
            //         <div className="flex justify-between bg-yellow-100 p-3 rounded-md">
            //           <span className="text-gray-700 font-medium">QA Open</span>
            //           <span className="font-bold text-yellow-600">5</span>
            //         </div>
            //         <div className="flex justify-between bg-blue-100 p-3 rounded-md">
            //           <span className="text-gray-700 font-medium">QA Failed</span>
            //           <span className="font-bold text-blue-600">3</span>
            //         </div>
            //         <div className="flex justify-between bg-yellow-100 p-3 rounded-md">
            //           <span className="text-gray-700 font-medium">QA Rejected</span>
            //           <span className="font-bold text-yellow-600">5</span>
            //         </div>
            //       </div>
            //     </div>

            //     {/* Overview */}
            //     <div>
            //       <StatCardList
            //         title="Task Overview"

            //         items={[
            //           // { label: "Team Members", count: 8 },
            //           { label: "Active Tasks", count: 22 },
            //           { label: "Completed Tasks", count: 15 },
            //           { label: "Pending Tasks", count: 7 },
            //         ]}
            //       />
            //     </div>

            //     <OverdueSummary tasks={tasks} projects={projects} />
            //   </div>
            // </main>
            <main className="flex-1 bg-gray-50 overflow-auto p-6">
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <Users className="w-10 h-10 text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">10</h3>
                    <p className="text-gray-500">Total Projects</p>
                  </div>
                </div>
                <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <User className="w-10 h-10 text-indigo-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">22</h3>
                    <p className="text-gray-500">Total Tasks</p>
                  </div>
                </div>
                <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <Activity className="w-10 h-10 text-green-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">6</h3>
                    <p className="text-gray-500">Active Projects</p>
                  </div>
                </div>
              </div>

              {/* QA + Delivery + Escalations */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* QA Overview */}
                <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
                  <h2 className="text-lg font-semibold mb-4">QA Overview</h2>
                  <div className="grid gap-3">
                    {[
                      { label: "Assigned to QA", count: 8, color: "green" },
                      { label: "QA Running", count: 5, color: "yellow" },
                      { label: "QA Passed", count: 3, color: "green" },
                      // { label: "QA Open", count: 5, color: "yellow" },
                      { label: "QA Failed", count: 2, color: "red" },
                      { label: "QA Rejected", count: 0, color: "gray" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex justify-between p-3 rounded-md bg-${item.color}-100`}
                      >
                        <span className="text-gray-700 font-medium">{item.label}</span>
                        <span className={`font-bold text-${item.color}-600`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Delivery Status Overview */}
                <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
                  <h2 className="text-lg font-semibold mb-4">Today's Delivery Status</h2>
                  <div className="grid gap-3">
                    {[
                      { label: "Total", count: 3, color: "green" },
                      { label: "Done", count: 2, color: "red" },
                      { label: "Pending", count: 1, color: "yellow" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex justify-between p-3 rounded-md bg-${item.color}-100`}
                      >
                        <span className="text-gray-700 font-medium">{item.label}</span>
                        <span className={`font-bold text-${item.color}-600`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Overview */}
                <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
                  <h2 className="text-lg font-semibold mb-4">Task Overview</h2>
                  <div className="grid gap-3">
                    <div className="flex justify-between p-3 rounded-md bg-blue-50">
                      <span className="text-gray-700 font-medium">Active Tasks</span>
                      <span className="font-bold text-blue-600">20</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-md bg-green-50">
                      <span className="text-gray-700 font-medium">Completed Tasks</span>
                      <span className="font-bold text-green-600">15</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-md bg-yellow-50">
                      <span className="text-gray-700 font-medium">Pending Tasks</span>
                      <span className="font-bold text-yellow-600">5</span>
                    </div>
                  </div>
                </div>



                {/* Escalations */}
                <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
                  <h2 className="text-lg font-semibold mb-4">Escalations</h2>
                  <div className="grid gap-3">
                    {[
                      { label: "High Priority", count: 2, color: "red" },
                      { label: "Medium Priority", count: 5, color: "yellow" },
                      { label: "Low Priority", count: 3, color: "green" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex justify-between p-3 rounded-md bg-${item.color}-100`}
                      >
                        <span className="text-gray-700 font-medium">{item.label}</span>
                        <span className={`font-bold text-${item.color}-600`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overdue / Summaries Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <OverdueSummary tasks={tasks} projects={projects} />
                {/* Additional Summary Cards if needed */}
              </div>

            </main>

          )}

          {user?.department === "R&D" && (
            <main className="flex-1 bg-white overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <Users className="w-10 h-10 text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">15</h3>
                    <p className="text-gray-600">Team Leads</p>
                  </div>
                </div>
                <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <User className="w-10 h-10 text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">25</h3>
                    <p className="text-gray-600">Developers</p>
                  </div>
                </div>
                <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <Activity className="w-10 h-10 text-green-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">15</h3>
                    <p className="text-gray-600">Active Projects</p>
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Today's Delivery Overview */}
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Today's Delivery Overview</h2>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between bg-green-100 p-3 rounded-md">
                      <span className="text-gray-700 font-medium">Total</span>
                      <span className="font-bold text-green-600">12</span>
                    </div>
                    <div className="flex justify-between bg-yellow-100 p-3 rounded-md">
                      <span className="text-gray-700 font-medium">Completed</span>
                      <span className="font-bold text-yellow-600">5</span>
                    </div>
                    <div className="flex justify-between bg-blue-100 p-3 rounded-md">
                      <span className="text-gray-700 font-medium">Pending</span>
                      <span className="font-bold text-blue-600">3</span>
                    </div>
                  </div>
                </div>

                {/* Overview */}
                <div>
                  <StatCardList
                    title="Task Overview"
                    items={[
                      // { label: "Team Members", count: 8 },
                      { label: "Active Tasks", count: 25 },
                      { label: "Completed Tasks", count: 15 },
                      { label: "Pending Tasks", count: 7 },
                      { label: "Blocked Tasks", count: 3 },
                      { label: "Tasks Overdue", count: 2 },
                      { label: "Support Tickets", count: 5 },
                    ]}
                  />
                </div>

                <OverdueSummary tasks={tasks} projects={projects} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* QA Overview */}
                <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
                  <h2 className="text-lg font-semibold mb-4">QA Overview</h2>
                  <div className="grid gap-3">
                    {[
                      { label: "Assigned to QA", count: 8, color: "green" },
                      { label: "QA Running", count: 5, color: "yellow" },
                      { label: "QA Passed", count: 3, color: "green" },
                      // { label: "QA Open", count: 5, color: "yellow" },
                      { label: "QA Failed", count: 2, color: "red" },
                      { label: "QA Rejected", count: 0, color: "gray" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex justify-between p-3 rounded-md bg-${item.color}-100`}
                      >
                        <span className="text-gray-700 font-medium">{item.label}</span>
                        <span className={`font-bold text-${item.color}-600`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>






                {/* Escalations */}
                <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
                  <h2 className="text-lg font-semibold mb-4">Escalations</h2>
                  <div className="grid gap-3">
                    {[
                      { label: "High Priority", count: 2, color: "red" },
                      { label: "Medium Priority", count: 5, color: "yellow" },
                      { label: "Low Priority", count: 3, color: "green" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex justify-between p-3 rounded-md bg-${item.color}-100`}
                      >
                        <span className="text-gray-700 font-medium">{item.label}</span>
                        <span className={`font-bold text-${item.color}-600`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </main>
          )}

          {user?.department === "Operation" && (
            <main className="flex-1 bg-white overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <Users className="w-10 h-10 text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">15</h3>
                    <p className="text-gray-600">Team Leads</p>
                  </div>
                </div>
                <div className="fl                                                                                                                        ex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <User className="w-10 h-10 text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">25</h3>
                    <p className="text-gray-600">Developers</p>
                  </div>
                </div>
                <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <Activity className="w-10 h-10 text-green-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">15</h3>
                    <p className="text-gray-600">Active Projects</p>
                  </div>
                </div>

                {/* <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
          <Clock className="w-10 h-10 text-yellow-600 mr-4" />
          <div>
            <h3 className="text-2xl font-bold text-gray-800">12</h3>
            <p className="text-gray-600">Pending Tickets</p>
          </div>
        </div> */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Project Summary */}
                {/* Today's Delivery Overview */}
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Today's Delivery Overview</h2>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between bg-green-100 p-3 rounded-md">
                      <span className="text-gray-700 font-medium">Total</span>
                      <span className="font-bold text-green-600">12</span>
                    </div>
                    <div className="flex justify-between bg-yellow-100 p-3 rounded-md">
                      <span className="text-gray-700 font-medium">Completed</span>
                      <span className="font-bold text-yellow-600">5</span>
                    </div>
                    <div className="flex justify-between bg-blue-100 p-3 rounded-md">
                      <span className="text-gray-700 font-medium">Pending</span>
                      <span className="font-bold text-blue-600">3</span>
                    </div>
                  </div>
                </div>

                {/* Overview */}
                <div>
                  <StatCardList
                    title="Task Overview"
                    items={[
                      // { label: "Team Members", count: 8 },
                      { label: "Active Tasks", count: 25 },
                      { label: "Completed Tasks", count: 15 },
                      { label: "Pending Tasks", count: 7 },
                      { label: "Blocked Tasks", count: 3 },
                      { label: "Tasks Overdue", count: 2 },
                      { label: "Support Tickets", count: 5 },
                    ]}
                  />
                </div>

                <div className="bg-white p-4 rounded-md shadow-sm flex-1">
                  <h2 className="text-lg font-semibold mb-4">Overdue</h2>
                  <div className="flex gap-2 mb-4">
                    <button
                      // onClick={() => setActiveTab("tasks")}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === "tasks"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      Tasks
                    </button>
                    <button
                      // onClick={() => setActiveTab("projects")}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === "projects"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      Projects
                    </button>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-600">Name</th>
                        <th className="px-4 py-2 text-left text-gray-600">Due Date</th>
                        <th className="px-4 py-2 text-right text-gray-600">Overdue By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeTab === "tasks" ? overdueTasks : overdueProjects).map(
                        (item, idx) => {
                          const due = new Date(item.dueDate);
                          const diffDays = Math.ceil(
                            (new Date() - due) / (1000 * 60 * 60 * 24)
                          );
                          return (
                            <tr
                              key={idx}
                              className="border-t border-gray-200 hover:bg-gray-50"
                            >
                              <td className="px-4 py-2 text-blue-600 font-semibold">
                                {item.name || item.title}
                              </td>
                              <td className="px-4 py-2 text-gray-600">
                                {due.toDateString()}
                              </td>
                              <td className="px-4 py-2 text-right text-red-600 font-semibold">
                                {diffDays} {diffDays > 1 ? "Days" : "Day"}
                              </td>
                            </tr>
                          );
                        }
                      )}
                      {(activeTab === "tasks" ? overdueTasks : overdueProjects).length ===
                        0 && (
                          <tr>
                            <td colSpan="3" className="px-4 py-6 text-center text-gray-500">
                              No overdue {activeTab}.
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>


            </main>
          )}





        </>
      )}

      {user?.roleName === "Team Lead" && (
        <main className="flex-1 bg-white overflow-auto p-6">

          {/* <div className="bg-white p-4 rounded-md shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-4">Today's Delivery Overview</h2>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between bg-green-100 p-3 rounded-md">
                <span className="text-gray-700 font-medium">Completed</span>
                <span className="font-bold text-green-600">12</span>
              </div>
              <div className="flex justify-between bg-yellow-100 p-3 rounded-md">
                <span className="text-gray-700 font-medium">Pending</span>
                <span className="font-bold text-yellow-600">5</span>
              </div>
              <div className="flex justify-between bg-blue-100 p-3 rounded-md">
                <span className="text-gray-700 font-medium">Today Delivery</span>
                <span className="font-bold text-blue-600">3</span>
              </div>
            </div>
          </div> */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <User className="w-10 h-10 text-blue-600 mr-4" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">2</h3>
                <p className="text-gray-600">Developers</p>
              </div>
            </div>
            <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <Users className="w-10 h-10 text-blue-600 mr-4" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">10</h3>
                <p className="text-gray-600">Total Tasks</p>
              </div>
            </div>

            <div className="flex items-center bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <Activity className="w-10 h-10 text-green-600 mr-4" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">5</h3>
                <p className="text-gray-600">Active Projects</p>
              </div>
            </div>

          </div>

          <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition mb-4">
            <h2 className="text-lg font-semibold mb-4">Task Overview</h2>
            <div className="grid gap-3">
              <div className="flex justify-between p-3 rounded-md bg-blue-50">
                <span className="text-gray-700 font-medium">Active Tasks</span>
                <span className="font-bold text-blue-600">20</span>
              </div>
              <div className="flex justify-between p-3 rounded-md bg-green-50">
                <span className="text-gray-700 font-medium">Completed Tasks</span>
                <span className="font-bold text-green-600">15</span>
              </div>
              <div className="flex justify-between p-3 rounded-md bg-yellow-50">
                <span className="text-gray-700 font-medium">Pending Tasks</span>
                <span className="font-bold text-yellow-600">5</span>
              </div>
            </div>
          </div>
          {/* Team Overview + Task Distribution in same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Team Metrics */}
            <div>
              <StatCardList
                title="Team Overview"
                items={[
                  { label: "Team Members", count: 8 },
                  { label: "Active Tasks", count: 25 },
                  { label: "Completed Tasks", count: 15 },
                  { label: "Pending Tasks", count: 7 },
                  { label: "Blocked Tasks", count: 3 },
                  { label: "Tasks Overdue", count: 2 },
                  { label: "Support Tickets", count: 5 },
                ]}
              />
            </div>

            {/* Task Status Breakdown */}
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Task Distribution</h3>
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Member</th>
                    <th className="px-4 py-2 text-center">Assigned</th>
                    <th className="px-4 py-2 text-center">In Progress</th>
                    <th className="px-4 py-2 text-center">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2">Alice</td>
                    <td className="px-4 py-2 text-center">6</td>
                    <td className="px-4 py-2 text-center">3</td>
                    <td className="px-4 py-2 text-center">2</td>
                  </tr>
                  <tr className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2">Rahul</td>
                    <td className="px-4 py-2 text-center">5</td>
                    <td className="px-4 py-2 text-center">2</td>
                    <td className="px-4 py-2 text-center">2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>

      )}


      {/* Developer Home Page */}
      {user?.roleName === "Developer" && (
        <>
          {/* Feed Section */}
          <section className="bg-white p-4 rounded-md shadow-sm overflow-y-auto md:w-2/4">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Feed Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full rounded-md">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600">Feed Status</th>
                    <th className="px-4 py-2 text-left text-gray-600">Total</th>
                    <th className="px-4 py-2 text-left text-gray-600">Today</th>
                    <th className="px-4 py-2 text-left text-gray-600">Tomorrow</th>
                  </tr>
                </thead>
                <tbody>
                  {feedRows.map((feedName, index) => {
                    let textColorClass = "text-gray-900";
                    if (feedName === "QA Failed") textColorClass = "text-red-600 bg-red-100 font-semibold";
                    else if (feedName === "QA Rejected") textColorClass = "text-yellow-800 bg-yellow-100 font-semibold";
                    else if (feedName === "QA Passed") textColorClass = "text-green-600 bg-green-100 font-semibold";
                    else if (feedName === "Delayed") textColorClass = "text-amber-600 font-semibold";
                    else if (feedName === "Delivered") textColorClass = "text-teal-600 font-semibold";

                    return (
                      <tr key={index} className="hover:bg-gray-50 border-t border-gray-200">
                        <td className={`px-4 py-2 ${textColorClass}`}>{feedName}</td>
                        <td className={`px-4 py-2 ${textColorClass}`}>0</td>
                        <td className={`px-4 py-2 ${textColorClass}`}>0</td>
                        <td className={`px-4 py-2 ${textColorClass}`}>0</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Task + Support Section */}
          <section className="flex flex-col gap-4 md:w-1/4">
            <StatCardList title="Task Overview" items={taskCounts} />
            {/* <StatCardList title="Support Tickets" items={[
              { label: "Total", count: totalTickets },
              { label: "Unresolved", count: unresolvedTickets }
            ]} /> */}
          </section>
        </>
      )}




    </div>
  );
}

function StatCardList({ title, items }) {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm flex-1">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Type</th>
              <th className="px-4 py-2 text-center text-gray-600 font-medium">Count</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50 transition">
                <td className="px-4 py-2 text-gray-700">{item.label}</td>
                <td className="px-4 py-2 text-center text-gray-900 font-semibold">{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
