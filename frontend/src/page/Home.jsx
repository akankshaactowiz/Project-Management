import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import { FaTasks, FaClock, FaRocket, FaCheckCircle, FaCube, FaPlus, FaTools, FaPause,  FaPlay, FaCheck,FaBusinessTime, FaFlask, FaLightbulb,FaProjectDiagram, FaRss } from "react-icons/fa";


import OverdueSummary from "../components/OverdueSummary.jsx";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";


ChartJS.register(ArcElement, Tooltip, Legend);
import {
  Users,
  Activity,
  UserCog,
  Settings,
  FileText,
  User,
} from "lucide-react";
// import SalesSummaryDashboard from "../components/SalesSummaryView.jsx";

import Pagination from "../components/Pagination.jsx";

function Home() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [tasks, setTasks] = useState([]);

  // const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [feeds, setFeeds] = useState([]);
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  // const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default 10
  const [search, setSearch] = useState("");


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
  const completed = tasks.filter(
    (t) => t.status?.toLowerCase() === "completed"
  ).length;
  const inProgress = tasks.filter(
    (t) => t.status?.toLowerCase() === "in-progress"
  ).length;
  const terminated = tasks.filter(
    (t) => t.status?.toLowerCase() === "terminated"
  ).length;
  const totalPending = tasks.filter(
    (t) => t.status?.toLowerCase() === "pending"
  ).length;
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
    return (
      new Date(t.dueDate) < new Date() &&
      t.status?.toLowerCase() !== "completed"
    );
  });

  const overdueProjects = projects.filter((p) => {
    if (!p.dueDate) return false;
    return (
      new Date(p.dueDate) < new Date() &&
      p.status?.toLowerCase() !== "completed"
    );
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
  const columns = [
    "No.",
    "Project",
    "Feed ID",
    "Feed Name",
    "Platform",
    "Frequency",
    "Status",
  ];

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

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        setLoading(true);
        const res = await fetch(
  `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed?page=${currentPage}&pageSize=10&search=${encodeURIComponent(search)}`,
  { credentials: "include" }
);


        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        setFeeds(data.data || []);
        setTotalPages(Math.ceil(data.total / entries)); 
      } catch (err) {
        console.error("Error fetching feed data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, [currentPage, entries, search]);

const statusCards = [
    { label: "New", value: projectCounts.newStatus, icon: FaPlus, color: "bg-purple-500", bg: "bg-purple-50" },
    { label: "Under Development", value: projectCounts.underDevelopment, icon: FaTools, color: "bg-blue-500", bg: "bg-blue-50" },
    { label: "On-Hold", value: projectCounts.onHold, icon: FaPause, color: "bg-yellow-500", bg: "bg-yellow-50" },
    { label: "Production", value: projectCounts.devCompleted, icon: FaRocket, color: "bg-green-500", bg: "bg-green-50" },
    { label: "BAU-Started", value: projectCounts.bauStarted, icon: FaPlay, color: "bg-indigo-500", bg: "bg-indigo-50" },
    { label: "Closed", value: projectCounts.closed, icon: FaCheck, color: "bg-red-500", bg: "bg-red-50" },
  ];

const typeCards = [
    { label: "BAU Projects", value: projectCounts.bau, icon: FaBusinessTime, color: "bg-purple-500", bg: "bg-purple-50" },
    { label: "Adhoc Projects", value: projectCounts.adhoc, icon: FaTasks, color: "bg-blue-500", bg: "bg-blue-50" },
    { label: "Once-Off Projects", value: projectCounts.onceOff, icon: FaClock, color: "bg-yellow-500", bg: "bg-yellow-50" },
    { label: "POC Projects", value: projectCounts.poc, icon: FaFlask, color: "bg-green-500", bg: "bg-green-50" },
    { label: "R&D Projects", value: projectCounts.rnd, icon: FaLightbulb, color: "bg-indigo-500", bg: "bg-indigo-50" },
  ];

const overviewCards = [
    { label: "Total Projects", value: projectCounts.total, icon: FaProjectDiagram, color: "bg-blue-500", },
    { label: "Total Feeds", value: projectCounts.totalFeeds, icon: FaRss, color: "bg-orange-500", },
  ];


  return (
    <div className="flex flex-col md:flex-row gap-4 bg-gray-50">
      
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
              <h2 className="text-lg font-semibold mb-4">
                Today's Delivery Overview
              </h2>
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
                      <td className="px-4 py-2 text-gray-700 font-semibold">
                        Total
                      </td>
                      <td className="px-4 py-2 text-center text-gray-900 font-semibold">
                        7
                      </td>
                    </tr>
                    <tr className="border-t border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-4 py-2 text-gray-700 font-semibold">
                        Resolved
                      </td>
                      <td className="px-4 py-2 text-center text-gray-900 font-semibold">
                        5
                      </td>
                    </tr>
                    <tr className="border-t border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-4 py-2 text-gray-700 font-semibold">
                        Unresolved
                      </td>
                      <td className="px-4 py-2 text-center text-gray-900 font-semibold">
                        2
                      </td>
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
                    <span className="text-gray-700 font-medium">
                      {item.label}
                    </span>
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
      )}

      {user?.department === "Sales" && (
        <main className="flex-1 bg-white overflow-auto p-6">
          <div className=" mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Welcome back, {user.name}!!
            </h2>
            {/* <p>Track your project, feeds and task activities here</p> */}
          </div>
          <div className="space-y-10 mb-8">
            {/* Row 1: Projects & Feeds Overview */}
           <div className="bg-white shadow-md rounded-lg p-5 w-full">
      <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3 mb-6">
        Projects & Feeds Overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {overviewCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center p-6 border  border-gray-200 cursor-pointer "
              onClick={() => navigate("/project")}
            >
              <div className={`p-3 rounded-full ${item.color} text-white mb-2`}>
                <Icon size={24} />
              </div>
              <p className="text-gray-600 text-sm font-medium text-center">{item.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? "..." : item.value || 0}
              </h3>
            </div>
          );
        })}
      </div>
    </div>

            {/* Row 2: Project Types */}
            <div className="bg-white shadow-md rounded-lg p-5 w-full">
      <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-3 mb-6">
        Project Types
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {typeCards.map((type, index) => {
          const Icon = type.icon;
          return (
            <div
              key={index}
              className={`flex flex-col items-center p-4 cursor-pointer  ${type.bg}`}
              onClick={() => navigate("/project")}
            >
              <div className={`p-3 rounded-full ${type.color} text-white mb-2`}>
                <Icon size={20} />
              </div>
              <p className="text-gray-600 text-sm font-medium text-center">{type.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {loading ? "..." : type.value || 0}
              </h3>
            </div>
          );
        })}
      </div>
    </div>

            {/* Row 3: Project's Status Overview */}
             <div className="bg-white shadow-md rounded-lg p-5 w-full">
      <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-orange-500 pl-3 mb-6">
        Project's Status Overview
      </h2>
      <div className="grid grid-cols-3 rounded-lg  sm:grid-cols-2 md:grid-cols-6 gap-6">
        {statusCards.map((status, index) => {
          const Icon = status.icon;
          return (
            <div
              key={index}
              className={`flex flex-col items-center p-4 cursor-pointer  ${status.bg}`}
              onClick={() => navigate("/project")}
            >
              <div className={`p-3 rounded-full ${status.color} text-white mb-2`}>
                <Icon size={20} />
              </div>
              <p className="text-gray-600 text-sm font-medium text-center">{status.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {loading ? "..." : status.value || 0}
              </h3>
            </div>
          );
        })}
      </div>
    </div>

            <div>
              {/* Feeds Table */}
              <div className="bg-white p-6 border rounded-sm shadow-sm border-gray-100 overflow-x-auto">
               <div className="flex items-center justify-between mb-6">
  {/* Heading */}
  <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
    Total Feeds
  </h2>

  {/* Search Box */}
  <div className="relative">
    <input
      type="text"
      placeholder="Search..."
      value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
      className="border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M9 17a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  </div>
</div>

                <div className="overflow-x-auto max-h-[500px] overflow-y-auto"></div>
                <table className="min-w-full border border-gray-200 text-gray-700 text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {(feeds || []).map((feed, idx) => (
                      <tr
                        key={feed._id || idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2 border-b border-gray-200">
                          {(currentPage - 1) * pageSize + idx + 1}

                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          {feed.projectId?.ProjectName || "-"}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          {feed.FeedId || "-"}
                        </td>
                        <td
                          className="px-4 py-2 border-b border-gray-200 text-blue-600 font-medium cursor-pointer hover:underline"
                          onClick={() => navigate(`/project/feed/${feed._id}`)}
                        >
                          {feed.FeedName || "-"}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          {feed.Platform || "-"}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          {feed.Frequency || "-"}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              feed.Status === "New"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {feed.Status || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              
              <div className="flex justify-between m-4">
                <div className="flex items-center space-x-2 mt-4">
                  <label htmlFor="entries" className="text-gray-700">
                    Show
                  </label>
                  <select
                    id="entries"
                    value={entries}
                    onChange={(e) => {
                      setEntries(Number(e.target.value));
                      // setCurrentPage(1);
                    }}
                    className="border rounded px-2 py-1"
                  >
                    {[10, 25, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-700">entries</span>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </main>

      )}

      {/* Manager view */}

      {user?.roleName === "Manager" && (
         <main className="flex-1 bg-white overflow-auto p-6">
          <div className=" mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Welcome back, {user.name}!!
            </h2>
            {/* <p>Track your project, feeds and task activities here</p> */}
          </div>
          <div className="space-y-10 mb-8">
            {/* Row 1: Projects & Feeds Overview */}
           <div className="bg-white shadow-md rounded-lg p-5 w-full">
      <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3 mb-6">
        Projects & Feeds Overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {overviewCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center p-6 border  border-gray-200 cursor-pointer "
              onClick={() => navigate("/project")}
            >
              <div className={`p-3 rounded-full ${item.color} text-white mb-2`}>
                <Icon size={24} />
              </div>
              <p className="text-gray-600 text-sm font-medium text-center">{item.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? "..." : item.value || 0}
              </h3>
            </div>
          );
        })}
      </div>
    </div>

            {/* Row 2: Project Types */}
            <div className="bg-white shadow-md rounded-lg p-5 w-full">
      <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-3 mb-6">
        Project Types
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {typeCards.map((type, index) => {
          const Icon = type.icon;
          return (
            <div
              key={index}
              className={`flex flex-col items-center p-4 cursor-pointer  ${type.bg}`}
              onClick={() => navigate("/project")}
            >
              <div className={`p-3 rounded-full ${type.color} text-white mb-2`}>
                <Icon size={20} />
              </div>
              <p className="text-gray-600 text-sm font-medium text-center">{type.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {loading ? "..." : type.value || 0}
              </h3>
            </div>
          );
        })}
      </div>
    </div>

            {/* Row 3: Project's Status Overview */}
             <div className="bg-white shadow-md rounded-lg p-5 w-full">
      <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-orange-500 pl-3 mb-6">
        Project's Status Overview
      </h2>
      <div className="grid grid-cols-3 rounded-lg  sm:grid-cols-2 md:grid-cols-6 gap-6">
        {statusCards.map((status, index) => {
          const Icon = status.icon;
          return (
            <div
              key={index}
              className={`flex flex-col items-center p-4 cursor-pointer  ${status.bg}`}
              onClick={() => navigate("/project")}
            >
              <div className={`p-3 rounded-full ${status.color} text-white mb-2`}>
                <Icon size={20} />
              </div>
              <p className="text-gray-600 text-sm font-medium text-center">{status.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {loading ? "..." : status.value || 0}
              </h3>
            </div>
          );
        })}
      </div>
    </div>

            

            {/* ROW 4 */}
            <div className="flex flex-col lg:flex-row gap-6">
     <div className="bg-white shadow-md rounded-lg p-5 w-full max-w-4xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
          Today's Feed Delivery
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Total Tasks */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg space-x-3">
            <div className="bg-purple-500 text-white p-3 rounded-full">
              <FaTasks size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Delivery</p>
            </div>
          </div>

          {/* Pending */}
          {/* <div className="flex items-center p-4 bg-red-50 rounded-lg space-x-3">
            <div className="bg-red-500 text-white p-3 rounded-full">
              <FaClock size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Pending</p>
            </div>
          </div> */}

          {/* In Progress */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg space-x-3">
            <div className="bg-blue-400 text-white p-3 rounded-full">
              <FaRocket size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Crawl Start</p>
            </div>
          </div>

          {/* Completed */}
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg space-x-3">
            <div className="bg-yellow-400 text-white p-3 rounded-full">
              <FaCheckCircle size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Card */}
      <div className="bg-white shadow-md rounded-lg p-5 w-64 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-red-500 pl-3">
          Escalation
        </h2>
        <div className="flex items-center p-4 bg-red-50 rounded-lg space-x-3">
          <div className="bg-red-500 text-white p-3 rounded-full">
            <FaCube size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="text-gray-500 text-sm">Escalation</p>
          </div>
        </div>
      </div>
</div>
            <div>
              {/* Feeds Table */}
              <div className="bg-white p-6 border rounded-sm shadow-sm border-gray-100 overflow-x-auto">
               <div className="flex items-center justify-between mb-6">
  {/* Heading */}
  <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
    Total Feeds
  </h2>

  {/* Search Box */}
  <div className="relative">
    <input
      type="text"
      placeholder="Search..."
      value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
      className="border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M9 17a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  </div>
</div>

                <div className="overflow-x-auto max-h-[500px] overflow-y-auto"></div>
                <table className="min-w-full border border-gray-200 text-gray-700 text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {(feeds || []).map((feed, idx) => (
                      <tr
                        key={feed._id || idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2 border-b border-gray-200">
                          {(currentPage - 1) * pageSize + idx + 1}

                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          {feed.projectId?.ProjectName || "-"}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          {feed.FeedId || "-"}
                        </td>
                        <td
                          className="px-4 py-2 border-b border-gray-200 text-blue-600 font-medium cursor-pointer hover:underline"
                          onClick={() => navigate(`/project/feed/${feed._id}`)}
                        >
                          {feed.FeedName || "-"}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          {feed.Platform || "-"}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          {feed.Frequency || "-"}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              feed.Status === "New"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {feed.Status || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              
              <div className="flex justify-between m-4">
                <div className="flex items-center space-x-2 mt-4">
                  <label htmlFor="entries" className="text-gray-700">
                    Show
                  </label>
                  <select
                    id="entries"
                    value={entries}
                    onChange={(e) => {
                      setEntries(Number(e.target.value));
                      // setCurrentPage(1);
                    }}
                    className="border rounded px-2 py-1"
                  >
                    {[10, 25, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-700">entries</span>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </main>


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
                <span className="text-gray-700 font-medium">
                  Completed Tasks
                </span>
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
        <main className="flex-1 bg-white overflow-auto p-6">
          <div className=" mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Welcome back, {user.name}!!
            </h2>
            {/* <p>Track your project, feeds and task activities here</p> */}
          </div>
          <div className="space-y-10 mb-8">
            {/* Row 1: Projects & Feeds Overview */}
        <div className="flex flex-col lg:flex-row gap-6">
     <div className="bg-white shadow-md rounded-lg p-5 w-full max-w-4xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
          Today's Feed Delivery
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Total Tasks */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg space-x-3">
            <div className="bg-purple-500 text-white p-3 rounded-full">
              <FaTasks size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Delivery</p>
            </div>
          </div>

          {/* Pending */}
          {/* <div className="flex items-center p-4 bg-red-50 rounded-lg space-x-3">
            <div className="bg-red-500 text-white p-3 rounded-full">
              <FaClock size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Pending</p>
            </div>
          </div> */}

          {/* In Progress */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg space-x-3">
            <div className="bg-blue-400 text-white p-3 rounded-full">
              <FaRocket size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Crawl Start</p>
            </div>
          </div>

          {/* Completed */}
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg space-x-3">
            <div className="bg-yellow-400 text-white p-3 rounded-full">
              <FaCheckCircle size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Card */}
      <div className="bg-white shadow-md rounded-lg p-5 w-64 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-red-500 pl-3">
          Escalation
        </h2>
        <div className="flex items-center p-4 bg-red-50 rounded-lg space-x-3">
          <div className="bg-red-500 text-white p-3 rounded-full">
            <FaCube size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="text-gray-500 text-sm">Escalation</p>
          </div>
        </div>
      </div>
</div>

            {/* Row 2: Project Types */}
                                 <div className="flex flex-col lg:flex-row gap-6">
     <div className="bg-white shadow-md rounded-lg p-5 w-full">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
          Crawl Summary
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {/* Total Tasks */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg space-x-3">
            <div className="bg-purple-500 text-white p-3 rounded-full">
              <FaTasks size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Scheduled</p>
            </div>
          </div>

          {/* Pending */}
          <div className="flex items-center p-4 bg-red-50 rounded-lg space-x-3">
            <div className="bg-red-500 text-white p-3 rounded-full">
              <FaClock size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Crawl Running</p>
            </div>
          </div>

          {/* In Progress */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg space-x-3">
            <div className="bg-blue-400 text-white p-3 rounded-full">
              
              <FaCheckCircle size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Crawl Finished</p>
            </div>
          </div>

          {/* Completed */}
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg space-x-3">
            <div className="bg-yellow-400 text-white p-3 rounded-full">
              <FaRocket size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">20</p>
              <p className="text-gray-500 text-sm">Crawl Yet To Start</p>
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Card */}
      <div className="bg-white shadow-md rounded-lg p-5 w-64 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-red-500 pl-3">
          Escalation
        </h2>
        <div className="flex items-center p-4 bg-red-50 rounded-lg space-x-3">
          <div className="bg-red-500 text-white p-3 rounded-full">
            <FaCube size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="text-gray-500 text-sm">Escalation</p>
          </div>
        </div>
      </div>
</div>

            {/* Row 3: Crawl Status Overview */}
                      <div className="flex flex-col lg:flex-row gap-6">
     <div className="bg-white shadow-md rounded-lg p-5 w-full">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
          Crawl Summary
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {/* Total Tasks */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg space-x-3">
            <div className="bg-purple-500 text-white p-3 rounded-full">
              <FaTasks size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Scheduled</p>
            </div>
          </div>

          {/* Pending */}
          <div className="flex items-center p-4 bg-red-50 rounded-lg space-x-3">
            <div className="bg-red-500 text-white p-3 rounded-full">
              <FaClock size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Crawl Running</p>
            </div>
          </div>

          {/* In Progress */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg space-x-3">
            <div className="bg-blue-400 text-white p-3 rounded-full">
              
              <FaCheckCircle size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Crawl Finished</p>
            </div>
          </div>

          {/* Completed */}
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg space-x-3">
            <div className="bg-yellow-400 text-white p-3 rounded-full">
              <FaRocket size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">20</p>
              <p className="text-gray-500 text-sm">Crawl Yet To Start</p>
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Card */}
      <div className="bg-white shadow-md rounded-lg p-5 w-64 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-red-500 pl-3">
          Escalation
        </h2>
        <div className="flex items-center p-4 bg-red-50 rounded-lg space-x-3">
          <div className="bg-red-500 text-white p-3 rounded-full">
            <FaCube size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="text-gray-500 text-sm">Escalation</p>
          </div>
        </div>
      </div>
</div>

            

            {/* ROW 4 */}
            <div className="flex flex-col lg:flex-row gap-6">
     <div className="bg-white shadow-md rounded-lg p-5 w-full max-w-4xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
          Tasks Summary
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {/* Total Tasks */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg space-x-3">
            <div className="bg-purple-500 text-white p-3 rounded-full">
              <FaTasks size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">20</p>
              <p className="text-gray-500 text-sm">Total Tasks</p>
            </div>
          </div>

          {/* Pending */}
          <div className="flex items-center p-4 bg-red-50 rounded-lg space-x-3">
            <div className="bg-red-500 text-white p-3 rounded-full">
              <FaClock size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Pending</p>
            </div>
          </div>

          {/* In Progress */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg space-x-3">
            <div className="bg-blue-400 text-white p-3 rounded-full">
              <FaRocket size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">In Progress</p>
            </div>
          </div>

          {/* Completed */}
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg space-x-3">
            <div className="bg-yellow-400 text-white p-3 rounded-full">
              <FaCheckCircle size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">20</p>
              <p className="text-gray-500 text-sm">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Card */}
      <div className="bg-white shadow-md rounded-lg p-5 w-64 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-red-500 pl-3">
          Escalation
        </h2>
        <div className="flex items-center p-4 bg-red-50 rounded-lg space-x-3">
          <div className="bg-red-500 text-white p-3 rounded-full">
            <FaCube size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="text-gray-500 text-sm">Escalation</p>
          </div>
        </div>
      </div>
</div>
            <div>
              {/* Feeds Table */}
              <div className="bg-white p-6 border rounded-sm shadow-sm border-gray-100 overflow-x-auto">
               <div className="flex items-center justify-between mb-6">
  {/* Heading */}
  <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
    Total Feeds
  </h2>

  {/* Search Box */}
  <div className="relative">
    <input
      type="text"
      placeholder="Search..."
      value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
      className="border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M9 17a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  </div>
</div>

                <div className="overflow-x-auto max-h-[500px] overflow-y-auto"></div>
                <table className="min-w-full border border-gray-200 text-gray-700 text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {(feeds || []).map((feed, idx) => (
                      <tr
                        key={feed._id || idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2 border-b border-gray-200">
                          {(currentPage - 1) * pageSize + idx + 1}

                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          {feed.projectId?.ProjectName || "-"}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          {feed.FeedId || "-"}
                        </td>
                        <td
                          className="px-4 py-2 border-b border-gray-200 text-blue-600 font-medium cursor-pointer hover:underline"
                          onClick={() => navigate(`/project/feed/${feed._id}`)}
                        >
                          {feed.FeedName || "-"}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          {feed.Platform || "-"}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          {feed.Frequency || "-"}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              feed.Status === "New"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {feed.Status || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              
              <div className="flex justify-between m-4">
                <div className="flex items-center space-x-2 mt-4">
                  <label htmlFor="entries" className="text-gray-700">
                    Show
                  </label>
                  <select
                    id="entries"
                    value={entries}
                    onChange={(e) => {
                      setEntries(Number(e.target.value));
                      // setCurrentPage(1);
                    }}
                    className="border rounded px-2 py-1"
                  >
                    {[10, 25, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-700">entries</span>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </main>
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
              <th className="px-4 py-2 text-left text-gray-600 font-medium">
                Type
              </th>
              <th className="px-4 py-2 text-center text-gray-600 font-medium">
                Count
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={idx}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-2 text-gray-700">{item.label}</td>
                <td className="px-4 py-2 text-center text-gray-900 font-semibold">
                  {item.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
