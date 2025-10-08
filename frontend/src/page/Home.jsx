import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import {
  FaTasks,
  FaClock,
  FaRocket,
  FaCheckCircle,
  FaCube,
  FaPlus,
  FaTools,
  FaPause,
  FaPlay,
  FaCheck,
  FaBusinessTime,
  FaFlask,
  FaLightbulb,
  FaProjectDiagram,
  FaRss,
} from "react-icons/fa";

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
      // console.log("Fetched counts:", data);
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

  // useEffect(() => {
  //   const fetchFeeds = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await fetch(
  //         `http://${
  //           import.meta.env.VITE_BACKEND_NETWORK_ID
  //         }/api/feed?page=${currentPage}&pageSize=10&search=${encodeURIComponent(
  //           search
  //         )}`,
  //         { credentials: "include" }
  //       );

  //       if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

  //       const data = await res.json();
  //       setFeeds(data.data || []);
  //       setTotalPages(Math.ceil(data.total / entries));
  //     } catch (err) {
  //       console.error("Error fetching feed data:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchFeeds();
  // }, [currentPage, entries, search]);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed?page=${currentPage}&pageSize=${entries}&search=${encodeURIComponent(search)}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        projects.forEach((proj, idx) => {
          console.log(`Project ${idx + 1} (_id: ${proj._id}): Feeds count = ${proj.Feeds?.length || 0}`);
          console.log("Feeds array:", proj.Feeds);
        });
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
    {
      label: "New",
      value: projectCounts.newStatus,
      icon: FaPlus,
      color: "bg-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Under Development",
      value: projectCounts.underDevelopment,
      icon: FaTools,
      color: "bg-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "On-Hold",
      value: projectCounts.onHold,
      icon: FaPause,
      color: "bg-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      label: "Production",
      value: projectCounts.devCompleted,
      icon: FaRocket,
      color: "bg-green-500",
      bg: "bg-green-50",
    },
    {
      label: "BAU-Started",
      value: projectCounts.bauStarted,
      icon: FaPlay,
      color: "bg-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Closed",
      value: projectCounts.closed,
      icon: FaCheck,
      color: "bg-red-500",
      bg: "bg-red-50",
    },
  ];

  const typeCards = [
    {
      label: "BAU Projects",
      value: projectCounts.bau,
      icon: FaBusinessTime,
      color: "bg-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Adhoc Projects",
      value: projectCounts.adhoc,
      icon: FaTasks,
      color: "bg-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Once-Off Projects",
      value: projectCounts.onceOff,
      icon: FaClock,
      color: "bg-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      label: "POC Projects",
      value: projectCounts.poc,
      icon: FaFlask,
      color: "bg-green-500",
      bg: "bg-green-50",
    },
    // {
    //   label: "R&D Projects",
    //   value: projectCounts.rnd,
    //   icon: FaLightbulb,
    //   color: "bg-indigo-500",
    //   bg: "bg-indigo-50",
    // },
  ];

  const overviewCards = [
    {
      label: "Total Projects",
      value: projectCounts.total,
      icon: FaProjectDiagram,
      color: "bg-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Total Feeds",
      value: projectCounts.totalFeeds,
      icon: FaRss,
      color: "bg-orange-500",
      bg: "bg-orange-50",
    },
  ];

  return (
    <main className="flex-1 bg-white overflow-auto p-6">
      <div className=" mb-4">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Welcome back, {user.name}!!
        </h2>
        {/* <p>Track your project, feeds and task activities here</p> */}
      </div>
      <div className="space-y-4 mb-8">
        {/* Row 1: Projects & Feeds Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_auto] gap-4 w-full">
          {/* Column 1: Projects & Feeds Overview */}
          <div className="bg-white shadow-md rounded-lg p-4 w-full">
            <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3 mb-4">
              Projects & Feeds Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {overviewCards.map((item, index) => {
                const Icon = item.icon;
                const isClickable = item.label === "Total Projects"; // Only this card is clickable

                return (
                  <div
                    key={index}
                    className={`flex items-center p-3 rounded-lg ${item.bg} ${isClickable ? "cursor-pointer hover:shadow-md transition" : ""}`}
                    onClick={isClickable ? () => navigate("/projects") : undefined}
                  >
                    {/* Icon */}
                    <div className={`p-2 rounded-xl ${item.color} text-white mr-3 flex-shrink-0`}>
                      <Icon size={20} />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col">
                      <p className="text-gray-600 text-sm font-medium">{item.label}</p>
                      <h3 className="text-xl font-bold text-gray-900 mt-1">
                        {loading ? "..." : item.value || 0}
                      </h3>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Column 2: Today's Feed Delivery */}
          <div className="bg-white shadow-md rounded-lg p-4 w-full">
            <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3 mb-4">
              Today's Feed Delivery
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Delivery */}
              <div className="flex items-center p-3 bg-blue-50 rounded-lg space-x-3">
                <div className="bg-purple-500  text-white p-3 rounded-lg">
                  <FaTasks size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Delivery</p>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
              </div>

              {/* Crawl Start */}
              <div className="flex items-center p-3 bg-blue-50 rounded-lg space-x-3">
                <div className="bg-blue-400 text-white p-3 rounded-lg">
                  <FaRocket size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Crawl Start</p>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
              </div>

              {/* Delivered */}
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg space-x-3">
                <div className="bg-yellow-400 text-white p-3 rounded-lg">
                  <FaCheckCircle size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Delivered</p>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Escalation */}
          <div className="flex justify-center">
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-red-500 pl-3 mb-4">
                Escalation
              </h2>
              <div className="flex items-center p-3 bg-red-50 rounded-lg space-x-3">
                <div className="bg-red-500 text-white p-3 rounded-lg">
                  <FaCube size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Escalation</p>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          {/* Column 1: Project Types */}
          <div className="bg-white shadow-md rounded-lg p-4 w-full">
            <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-3 mb-4">
              Project's Delivery Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {typeCards.map((type, index) => {
                const Icon = type.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center p-3 cursor-pointer ${type.bg} hover:shadow-md transition`}
                    onClick={() => navigate("/projects")}
                  >
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-xl ${type.color} text-white mr-3 flex-shrink-0`}
                    >
                      <Icon size={18} />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col">
                      <p className="text-gray-600 text-sm font-medium">
                        {type.label}
                      </p>
                      <h3 className="text-xl font-bold text-gray-900">
                        {loading ? "..." : type.value || 0}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Project Status */}
          <div className="bg-white shadow-md rounded-lg p-4 w-full">
            <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-orange-500 pl-3 mb-4">
              Project's Status Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {statusCards.map((status, index) => {
                const Icon = status.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center p-3 cursor-pointer ${status.bg} hover:shadow-md transition`}
                    onClick={() => navigate("/projects")}
                  >
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-xl ${status.color} text-white mr-3 flex-shrink-0`}
                    >
                      <Icon size={18} />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col">
                      <p className="text-gray-600 text-sm font-medium">
                        {status.label}
                      </p>
                      <h3 className="text-xl font-bold text-gray-900">
                        {loading ? "..." : status.value || 0}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {(user?.roleName === "Manager" ||
          user?.roleName === "Team Lead" ||
          user?.roleName === "Project-Coordinator" ||
          user?.roleName === "Developer") && (
            <>
              {/* Crawl and QA summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2  gap-4 w-full">
                <div className="bg-white shadow-md rounded-lg p-5 w-full">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
                    Crawl Summary
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Tasks */}
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg space-x-2">
                      <div className="bg-purple-500 text-white p-2 rounded-full mr-3">
                        <FaTasks size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-500 text-sm">Scheduled</p>
                        <p className="text-2xl font-bold text-gray-800">0</p>
                      </div>
                    </div>

                    {/* Pending */}
                    <div className="flex items-center p-4 bg-red-50 rounded-lg space-x-3">
                      <div className="bg-red-500 text-white p-2 rounded-full mr-3 flex-shrink-0">
                        <FaClock size={18} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Crawl Running</p>
                        <p className="text-2xl font-bold text-gray-800">0</p>
                      </div>
                    </div>

                    {/* In Progress */}
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg space-x-3">
                      <div className="bg-blue-400 text-white p-2 rounded-full mr-3 flex-shrink-0">
                        <FaCheckCircle size={18} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Crawl Finished</p>
                        <p className="text-2xl font-bold text-gray-800">0</p>
                      </div>
                    </div>

                    {/* Completed */}
                    <div className="flex items-center p-4 bg-yellow-50 rounded-lg space-x-3">
                      <div className="bg-yellow-400 text-white p-2 rounded-full mr-3 flex-shrink-0">
                        <FaRocket size={18} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">
                          Crawl Yet To Start
                        </p>
                        <p className="text-2xl font-bold text-gray-800">0</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white  shadow-md rounded-lg p-5 w-full">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
                    QA Summary
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Tasks */}
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg space-x-3">
                      <div className="bg-purple-500 text-white p-2 rounded-full mr-3 flex-shrink-0">
                        <FaTasks size={18} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Assigned to QA</p>
                        <p className="text-2xl font-bold text-gray-800">0</p>
                      </div>
                    </div>

                    {/* Pending */}
                    <div className="flex items-center p-4 bg-red-50 rounded-lg space-x-3">
                      <div className="bg-red-500 text-white p-2 rounded-full mr-3 flex-shrink-0">
                        <FaClock size={18} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">QA Failed</p>
                        <p className="text-2xl font-bold text-gray-800">0</p>
                      </div>
                    </div>

                    {/* In Progress */}
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg space-x-3">
                      <div className="bg-blue-400 text-white p-2 rounded-full mr-3 flex-shrink-0">
                        <FaCheckCircle size={18} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">QA Rejected</p>
                        <p className="text-2xl font-bold text-gray-800">0</p>
                      </div>
                    </div>

                    {/* Completed */}
                    <div className="flex items-center p-4 bg-yellow-50 rounded-lg space-x-3">
                      <div className="bg-yellow-400 text-white p-2 rounded-full mr-3 flex-shrink-0">
                        <FaRocket size={18} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">QA Passed</p>
                        <p className="text-2xl font-bold text-gray-800">0</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </>
          )}
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
                  className="border border-gray-200 rounded-md px-4 py-2 pr-10 text-sm"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35M9 17a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
              </div>
            </div>

            <div className=" max-h-[500px] overflow-auto ">
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
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-2">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td
                        className="px-4 py-2  border-gray-200 text-blue-600 font-medium cursor-pointer hover:underline"
                        onClick={() =>
                          navigate(`/projects/${feed.projectId._id}/details`)
                        }
                      >
                        {feed.projectId.ProjectCode || feed.projectId?.ProjectName
                          ? `${feed.projectId.ProjectCode ?? "-"} ${feed.projectId.ProjectName ?? "-"
                          }`
                          : "-"}
                      </td>
                      <td className="px-4 py-2 ">{feed.FeedId || "-"}</td>
                      <td
                        className="px-4 py-2  text-blue-600 font-medium cursor-pointer hover:underline"
                        onClick={() => navigate(`/projects/feed/${feed._id}`)}
                      >
                        {feed.FeedName || "-"}
                      </td>
                      <td className="px-4 py-2 ">{feed.Platform || "-"}</td>
                      {/* <td className="px-4 py-2 border-b border-gray-200">
                          {feed.Frequency || "-"}
                        </td> */}
                      <td className="px-4 py-2 align-top">
                        <div className="flex flex-col gap-1">
                          {/* Frequency Badge */}
                          <span
                            className={`inline-block px-3 py-1 text-xs rounded-full w-fit
        ${feed.Frequency === "Daily"
                                ? "bg-green-100 text-green-700"
                                : feed.Frequency === "Weekly"
                                  ? "bg-blue-100 text-blue-700"
                                  : feed.Frequency === "Monthly"
                                    ? "bg-purple-100 text-purple-700"
                                    : feed.Frequency === "Once-off"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {feed.Frequency ?? "No schedule"}
                          </span>

                          {/* Schedule Badge */}
                          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 w-fit">
                            {(() => {
                              const { Frequency, Schedule } = feed;
                              if (!Schedule) return "No schedule";

                              switch (Frequency) {
                                case "Daily":
                                  // return `Every day at ${Schedule.time || "--:--"}`;
                                  return `Daily`;
                                case "Weekly":
                                  return `${Schedule.day || "—"} `;
                                case "Monthly":
                                  const day = Schedule.date; // e.g., 7
                                  // Add ordinal suffix
                                  const getOrdinal = (n) => {
                                    if (!n) return "";
                                    const s = ["th", "st", "nd", "rd"];
                                    const v = n % 100;
                                    return n + (s[(v - 20) % 10] || s[v] || s[0]);
                                  };
                                  return `${getOrdinal(day)} of every month`;

                                case "Once-off":
                                  return Schedule.datetime
                                    ? new Date(Schedule.datetime).toLocaleString(
                                      "en-GB",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                    : "No date";
                                case "Custom":
                                  return Schedule.custom &&
                                    Schedule.custom.length > 0
                                    ? Schedule.custom
                                      .map((c) => `${c.day} ${c.time}`)
                                      .join(", ")
                                    : "No custom schedule";
                                default:
                                  return "No schedule";
                              }
                            })()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 ">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${feed.Status === "New"
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
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center m-4 space-y-4 sm:space-y-0">
            {/* Show Entries */}
            <div className="flex items-center space-x-2">
              <label htmlFor="entries" className="text-gray-700">
                Show
              </label>
              <select
                id="entries"
                value={entries}
                onChange={(e) => {
                  setEntries(Number(e.target.value));
                  setCurrentPage(1);
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

            {/* Pagination */}
            <div className="flex justify-end">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
export default Home;
