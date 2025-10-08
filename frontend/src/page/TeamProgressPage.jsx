import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaProjectDiagram, FaCheckCircle, FaSpinner, FaHourglassHalf, FaBan, FaTasks,
  FaClock,
  FaRocket,
  FaCube,
  FaPlus,
  FaTools,
  FaPause,
  FaPlay,
  FaCheck,
  FaBusinessTime,
  FaFlask,
  FaLightbulb, FaRss
} from "react-icons/fa";
import Pagination from "../components/Pagination";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";




export default function TeamProgressPage() {

  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [filterDate, setFilterDate] = useState("");
  const { filter, memberName } = location.state || {};
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeTab, setActiveTab] = useState(filter || "All"); // single state for all users
  const [selectedDeliveryType, setSelectedDeliveryType] = useState(filter || null);
  const [summaryCounts, setSummaryCounts] = useState({
    totalCounts: {
      total: 0,
      bau: 0,
      poc: 0,
      onceoff: 0,
      // rnd: 0,
      // escalation: 0
    },
    thisMonthCounts: { total: 0, completed: 0, ongoing: 0, pending: 0, escalated: 0 },
  });
  const [projectCounts, setProjectCounts] = useState({
    total: 0,
    newStatus: 0,
    underDevelopment: 0,
    onHold: 0,
    devCompleted: 0,
    bauStarted: 0,
    closed: 0,
    bau: 0,
    adhoc: 0,
    onceOff: 0,
    poc: 0,
    rnd: 0,
    escalation: 0,
  });

  // Fetch projects for the selected user
  const fetchProjects = async () => {
    try {
      const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
      const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");
      const query = new URLSearchParams({
        page: currentPage,
        tab: activeTab !== "All" ? activeTab : "",
        limit: entries,
        search: search,
        filterDate: filterDate, // pass date filter
        filterDateStart: startOfMonth, // add start
        filterDateEnd: endOfMonth,
      }).toString();

      setLoading(true);
      setError("");
      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/${id}/projects?${query}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch projects");

      setUser(data.user);
      setProjects(data.projects);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryCounts = async () => {
    try {


      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/${id}/project-count`,
        { credentials: "include" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch summary counts");

      setSummaryCounts(data); // store summary counts in state
    } catch (err) {
      console.error("Failed to fetch this month counts:", err);
    }
  };


  useEffect(() => {
    fetchProjects();
    fetchSummaryCounts();
  }, [id, currentPage, pageSize, search, filterDate, entries, activeTab]);



  useEffect(() => {
    if (selectedDeliveryType) {
      setFilteredProjects(projects.filter(p => p.DeliveryType === selectedDeliveryType));
    } else {
      setFilteredProjects(projects);
    }
  }, [projects, selectedDeliveryType]);
  const statusCards = [
    {
      label: "New",
      value: summaryCounts?.totalCounts.newStatus,
      icon: FaPlus,
      color: "bg-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Under Development",
      value: summaryCounts?.totalCounts.underDevelopment,
      icon: FaTools,
      color: "bg-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "On-Hold",
      value: summaryCounts?.totalCounts.onHold,
      icon: FaPause,
      color: "bg-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      label: "Production",
      value: summaryCounts?.totalCounts.devCompleted,
      icon: FaRocket,
      color: "bg-green-500",
      bg: "bg-green-50",
    },
    {
      label: "BAU-Started",
      value: summaryCounts?.totalCounts.bauStarted,
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
      value: summaryCounts?.totalCounts?.bau,
      icon: FaBusinessTime,
      color: "bg-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Adhoc Projects",
      value: summaryCounts?.totalCounts?.adhoc,
      icon: FaTasks,
      color: "bg-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Once-Off Projects",
      value: summaryCounts?.totalCounts?.onceOff,
      icon: FaClock,
      color: "bg-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      label: "POC Projects",
      value: summaryCounts?.totalCounts?.poc,
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
      value: summaryCounts?.totalCounts.total,
      icon: FaProjectDiagram,
      color: "bg-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "This Month Projects",
      value: summaryCounts?.thisMonthCounts.total,
      icon: FaProjectDiagram,
      color: "bg-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Total Feeds",
      value: summaryCounts?.totalCounts.totalFeeds,
      icon: FaRss,
      color: "bg-orange-500",
      bg: "bg-orange-50",
    },
  ];

  const tabs = ["BAU", "POC", "Adhoc", "Once-off"];

  return (
    <>
      <div className="p-6 bg-white min-h-screen space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-500 pl-3">
            {user ? `${user.name}'s Projects` : "User's Projects"}
          </h2>
        </div>
        {/* Top Summary Cards */}


        {/* Row 1: Projects & Feeds Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_auto] gap-4 w-full">
          {/* Column 1: Projects & Feeds Overview */}
          <div className="bg-white shadow-md rounded-lg p-4 w-full">
            <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3 mb-4">
              Projects & Feeds Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {overviewCards.map((item, index) => {
                const Icon = item.icon;
                const isClickable = item.label === "Total Projects"; // Only this card is clickable

                return (
                  <div
                    key={index}
                    className={`flex items-center p-3 rounded-lg ${item.bg}`}
                  // onClick={isClickable ? () => navigate("/projects") : undefined}
                  >
                    {/* Icon */}
                    <div className={`p-2 rounded-full ${item.color} text-white mr-3 flex-shrink-0`}>
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
                <div className="bg-purple-500 text-white p-3 rounded-full">
                  <FaTasks size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Delivery</p>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
              </div>

              {/* Crawl Start */}
              <div className="flex items-center p-3 bg-blue-50 rounded-lg space-x-3">
                <div className="bg-blue-400 text-white p-3 rounded-full">
                  <FaRocket size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Crawl Start</p>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
              </div>

              {/* Delivered */}
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg space-x-3">
                <div className="bg-yellow-400 text-white p-3 rounded-full">
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
                <div className="bg-red-500 text-white p-3 rounded-full">
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
              Project's Delivery Status Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {typeCards.map((type, index) => {
                const Icon = type.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center p-3 ${type.bg}`}
                  // onClick={() => navigate("/projects")}
                  >
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-full ${type.color} text-white mr-3 flex-shrink-0`}
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
                    className={`flex items-center p-3 ${status.bg}`}
                    onClick={() => navigate("/projects")}
                  >
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-full ${status.color} text-white mr-3 flex-shrink-0`}
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

        {/* Charts */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Completion</h3>
              <div className="relative flex items-center justify-center">
                <div style={{ width: 240, height: 240 }}>
                  <Doughnut data={completionData} options={completionOptions} />
                </div>
                <div className="absolute text-center">
                  <h4 className="text-3xl font-bold text-gray-800">{Math.round((completedCount / totalProjects) * 100) || 0}%</h4>
                  <p className="text-sm text-gray-500 mt-1">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Overview</h3>
              <Bar data={barData} options={barOptions} />
            </div>
          </div> */}

        {/* Project List Table */}
        <div className="bg-white border border-gray-100 p-6 shadow-sm rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4 w-full">
            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-blue-500 pl-3 py-1">
              Project List
            </h3>

            {/* Filters */}
            <div className="flex items-center gap-3 w-full sm:w-auto">

              {/* Delivery Type */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 mb-1">
                  Delivery Type
                </label>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700"
                  value={selectedDeliveryType}
                  onChange={(e) => {
                    setSelectedDeliveryType(e.target.value);
                    setCurrentPage(1); // reset pagination
                  }}
                >
                  <option value="">All</option>
                  {tabs.map((tab) => (
                    <option key={tab} value={tab}>
                      {tab}
                    </option>
                  ))}
                </select>
              </div>
              {/* Search */}
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="border mt-6 border-gray-300 rounded-sm px-3 py-2 text-sm outline-none w-full sm:w-64"
              />

              {/* Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 mb-1">Date</label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 outline-none"
                    value={filterDate ? dayjs(filterDate, "YYYY/MM/DD") : null}
                    format="YYYY/MM/DD"
                    onChange={(newValue) => {
                      setFilterDate(newValue ? newValue.format("YYYY/MM/DD") : "");
                      setCurrentPage(1);
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: { "& .MuiInputBase-root": { fontSize: "0.875rem", paddingTop: "6px", paddingBottom: "6px" } },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
              {/* Clear Filters Button */}
              <div className="flex flex-col mt-6">
                <button
                  onClick={() => {
                    setSearch("");
                    setFilterDate("");
                    setCurrentPage(1);
                    setActiveTab("");
                    setSelectedDeliveryType(null);
                  }}
                  className="h-10 px-4 cursor-pointer bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-100">
                <thead className="bg-gray-100 text-gray-700 sticky top-0">
                  <tr>
                    <th className="px-6 py-3  font-semibold">No</th>
                    <th className="px-6 py-3 text-left  font-semibold whitespace-nowrap">Project</th>
                    <th className="px-6 py-3  font-semibold">Feeds</th>
                    <th className="px-6 py-3  font-semibold">Industry</th>
                    <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">Project Manager</th>
                    <th className="px-6 py-3 text-left font-semibold">BDE</th>
                    <th className="px-6 py-3  font-semibold whitespace-nowrap">Delivery Type</th>

                    <th className="px-6 py-3  font-semibold">Status</th>
                    <th className="px-6 py-3  font-semibold whitespace-nowrap">Attachments</th>
                    <th className="px-6 py-3  font-semibold whitespace-nowrap">Project Type</th>
                    <th className="px-6 py-3  font-semibold whitespace-nowrap">Created By</th>
                    <th className="px-6 py-3  font-semibold whitespace-nowrap">Created Date</th>

                    {/* <th className="px-6 py-3  font-semibold">TL</th> */}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="12" className="text-center py-6">
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5 text-blue-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                          </svg>
                          <span className="text-gray-500">Loading projects...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProjects.length > 0 ? (
                    filteredProjects.map((project, idx) => (
                      <tr key={project._id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-2 text-center">{(currentPage - 1) * pageSize + idx + 1}</td>
                        <td
                          className="px-3 py-2 whitespace-nowrap text-left text-blue-600 hover:underline cursor-pointer"
                          onClick={() => navigate(`/projects/${project._id}/details`)}
                        >
                          {project.ProjectCode ?? "-"} {project.ProjectName ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">{project.Feeds?.length ?? 0}</td>
                        <td className="px-3 py-2 text-left whitespace-nowrap">{project.IndustryType ?? "-"}</td>
                        <td className="px-3 py-2 text-left whitespace-nowrap">{project.PMId?.name ?? "-"}</td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">{project.BDEId?.name ?? "-"}</td>
                        <td className="px-3 py-2">
                          <div className="flex justify-center">
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-sm cursor-pointer ${project.DeliveryType === "BAU"
                                ? "bg-green-700 text-white"
                                : project.DeliveryType === "POC"
                                  ? "bg-orange-400 text-white"
                                  : project.DeliveryType === "R&D"
                                    ? "bg-pink-300 text-white"
                                    : project.DeliveryType === "Adhoc"
                                      ? "bg-yellow-400 text-white"
                                      : project.DeliveryType === "Once-off"
                                        ? "bg-pink-100 text-pink-800"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                              onClick={() => setSelectedDeliveryType(project.DeliveryType)}
                            >
                              {project.DeliveryType ?? "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${project.Status === "New"
                              ? "bg-blue-100 text-blue-800"
                              : project.Status === "Under Development"
                                ? "bg-yellow-100 text-yellow-800"
                                : project.Status === "On-Hold"
                                  ? "bg-gray-200 text-gray-800"
                                  : project.Status === "Production"
                                    ? "bg-green-100 text-green-800"
                                    : project.Status === "BAU-Started"
                                      ? "bg-indigo-100 text-indigo-800"
                                      : project.Status === "Closed"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {project.Status ?? "-"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => navigate(`/projects/${project._id}/attachments`)}
                            className="text-blue-600 hover:underline cursor-pointer"
                          >
                            View Files
                          </button>
                        </td>
                        <td className="px-3 py-2 text-left whitespace-nowrap">{project.ProjectType ?? "-"}</td>
                        <td className="px-3 py-2 text-left whitespace-nowrap">{project.CreatedBy?.name ?? "-"}</td>
                        <td className="px-3 py-2 text-center">
                          {project.CreatedDate ? dayjs(project.CreatedDate).format("YYYY/MM/DD") : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="text-center py-6 text-gray-500 italic">
                        No projects found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between m-4">
              <div className="flex items-center space-x-2 mt-4">
                <label htmlFor="entries" className="text-gray-700">Show</label>
                <select
                  id="entries"
                  value={entries}
                  onChange={(e) => {
                    setEntries(Number(e.target.value)); // update entries
                    setCurrentPage(1);                  // reset to first page
                  }}
                  className="border rounded px-2 py-1"
                >
                  {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
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

      </div>
    </>
  );
}
