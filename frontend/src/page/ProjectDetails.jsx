import { useEffect, useState, Fragment, useRef } from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";

import FeedModel from "../components/CreateFeed";
import { FaHistory } from "react-icons/fa";

// Bind modal to your app element (for accessibility)
Modal.setAppElement("#root");


import { useParams, useNavigate } from "react-router-dom";
import { FiEye } from "react-icons/fi";
import Select from "react-select";
import { useAuth } from "../hooks/useAuth";
import Pagination from "../components/Pagination"
import Breadcrumb from "../components/Breadcrumb";
import dayjs from "dayjs";

export default function ProjectDetails() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tlOptions, setTlOptions] = useState([]);
  const [devOptions, setDevOptions] = useState([]);
  const [qaOptions, setQaOptions] = useState([]);
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showPopover, setShowPopover] = useState(false);
  const [openPopoverFeedId, setOpenPopoverFeedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feeds, setFeeds] = useState([]);
  const [loadingFeeds, setLoadingFeeds] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [feedModalOpen, setFeedModalOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const [modalProject, setModalProject] = useState(null);
  const [modalHistory, setModalHistory] = useState([]);
  const [showFeedPopover, setShowFeedPopover] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef({}); // store refs per feed row

  const feedPopoverRef = useRef(null);
  const genericPopoverRef = useRef(null);
  const [refresh, setRefresh] = useState(false);

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    TLId: "",
    DeveloperIds: [],
    QAPersonIds: [],
  });


  const [activeTab, setActiveTab] = useState("Summary");
  const [selectedMembers, setSelectedMembers] = useState(null);


   const canCreateFeed = user?.permissions?.some(
    (perm) => perm.module === "Feed" && perm.actions.includes("create")
  );

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (
  //       popoverRef.current &&
  //       !popoverRef.current.contains(event.target) &&
  //       buttonRef.current &&
  //       !buttonRef.current.contains(event.target)
  //     ) {
  //       setOpenPopoverFeedId(false);
  //     }
  //   };

  //   if (showFeedPopover) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [openPopoverFeedId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close feed popovers
      if (
        openPopoverFeedId !== null &&
        feedPopoverRef.current &&
        !feedPopoverRef.current.contains(event.target) &&
        buttonRef.current &&
        !Object.values(buttonRef.current).some(btn => btn.contains(event.target))
      ) {
        setOpenPopoverFeedId(null);
      }

      // Close generic popover
      if (
        showPopover &&
        genericPopoverRef.current &&
        !genericPopoverRef.current.contains(event.target)
      ) {
        setShowPopover(false);
      }
    };

    if (openPopoverFeedId !== null || showPopover) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openPopoverFeedId, showPopover]);


  const handleToggle = (feedId) => {
    const button = buttonRef.current[feedId];
    if (button) {
      const rect = button.getBoundingClientRect();
      setPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
    setOpenPopoverFeedId(openPopoverFeedId === feedId ? null : feedId);
  };



  // ✅ Close popover on outside click
  // useEffect(() => {
  //   function handleClickOutside(event) {
  //     if (popoverRef.current && !popoverRef.current.contains(event.target)) {
  //       setShowPopover(false);
  //     }
  //   }
  //   if (showPopover) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   } else {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   }
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, [showPopover]);


  const handleShowAll = (members) => {
    setSelectedMembers(members);
  };

  const projectMembers = [
    project?.PMId,


  ].filter(Boolean);
  const columns = ["No.", "Feed ID", "Feed Name", "Frequency", "Platform", "Status", "BAU", "POC", "Team Members", "Assign"];

  // Fetch project + available users
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch project details

        const params = new URLSearchParams();
        if (search) params.append("search", search);
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID
          }/api/projects/${id}?${params.toString()}`,
          { credentials: "include" }
        );
        const data = await res.json();
  
        setProject(data.project);
        setForm({
          TLId: data.TLId?._id || "",
          DeveloperIds: data.DeveloperIds?.map((d) => d._id) || [],
          QAPersonIds: data.QAPersonIds?.map((d) => d._id) || [],
        });



        // setHistory(data.project?.updateHistory || []);

        // Fetch users for TL + Developers
        const userRes = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/tl-dev`,
          { credentials: "include" }
        );
        const userData = await userRes.json();
        setTlOptions(userData.tlUsers);
        setDevOptions(userData.devUsers);
        setQaOptions(userData.qaPerson);


      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [id, search, refresh]);

  useEffect(() => {
  const fetchFeeds = async () => {
    if (!id || activeTab !== "Feeds") return; // Ensure project ID is available

    setLoadingFeeds(true);
    // setFeedError(null);

    try {
      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${id}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch feeds");

      const result = await res.json();
      console.log(result);
      setFeeds(result.data || []); // Assuming response structure: { data: [...] }

    } catch (error) {
      console.error("Error fetching feeds:", error);
      // setFeedError(error.message);
    } finally {
      setLoadingFeeds(false);
    }
  };

  fetchFeeds();
}, [id, refresh, activeTab]);


  // Inside your component, after fetching `project` data
  const totalFeeds = project?.Feeds?.length || 0;
  const activeFeeds = project?.Feeds?.filter(f => f.Status === "Under Development").length || 0;
  const closedFeeds = project?.Feeds?.filter(f => f.Status === "Closed").length || 0;

  const BAUStarted = project?.Feeds?.filter(f => f.BAUStatus === "BAU-Started").length || 0;
  const BAUNotStarted = project?.Feeds?.filter(f => f.BAUStatus === "BAU-Not Yet Started").length || 0;
  const OnHold = project?.Feeds?.filter(f => f.Status === "On Hold").length || 0;

  const DailyCount = project?.Feeds?.filter(f => f.Frequency === "Daily").length || 0;
  const WeeklyCount = project?.Feeds?.filter(f => f.Frequency === "Weekly").length || 0;
  const MonthlyCount = project?.Feeds?.filter(f => f.Frequency === "Monthly").length || 0;



  // Handle update
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID
        }/api/projects/${id}/update-team`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Project team updated successfully");
        setProject(data.project);
        // setForm({ TLId: "", DeveloperIds: [] });
        navigate(`/project`);
      } else {
        alert(data.message || "Failed to update");
      }
    } catch (err) {
      console.error(err);
    }
  };



  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/history/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setModalHistory(data.data || []);   // <-- set normalized array directly
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
  }, [isOpen]);


  // const historySample = [
  //   {
  //     user: "Sunil Velueri",
  //     avatar: "https://i.pravatar.cc/40?img=1",
  //     action: "Created the Project ",
  //     // from: "Awaiting client approval",
  //     // to: "Closed",
  //     date: "September 29, 2025 9:19 PM",
  //   },
  //   {
  //     user: "Krushil Gajjar",
  //     avatar: "https://i.pravatar.cc/40?img=1",
  //     action: "added Project Coordinator and Team Lead",
  //     from: "Pruthak Acharya, Harsh K Patel",
  //     to: "Pruthak Acharya",
  //     date: "October 3, 2025 7:36 PM",
  //   },
  //   // {
  //   //   user: "Rohit Tiwari",
  //   //   avatar: "https://i.pravatar.cc/40?img=2",
  //   //   action: "changed the Project Status",
  //   //   from: "Production",
  //   //   to: "Awaiting client approval",
  //   //   date: "December 4, 2024 4:44 PM",
  //   // },
  // ];

  const formatISTDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);

    // Convert to IST manually
    const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

    // Extract parts
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, "0");
    const day = String(istDate.getDate()).padStart(2, "0");

    let hours = istDate.getHours();
    const minutes = String(istDate.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // convert 0 to 12 for 12-hour format

    return `${year}/${month}/${day} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  };



  if (!project) return <p>Loading...</p>;

  return (
    <>
      {/* <Breadcrumb projectId={project._id} /> */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          {/* Heading */}
          <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
            Project Details
          </h2>
        </div>
        {/* Project Title */}
        <h3 className="mb-4 text-lg font-bold">
          {project?.ProjectCode && project?.ProjectName
            ? `${project.ProjectCode} ${project.ProjectName}`
            : "Project Details"}
        </h3>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* LEFT SIDE (Tabs + Summary/Feeds) */}
          <div className="lg:col-span-3 min-w-0">
            {/* Tabs */}
            <div className="flex gap-2 mb-4 p-2 bg-gray-50 rounded">
              <button
                className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium ${activeTab === "Summary"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700"
                  }`}
                onClick={() => setActiveTab("Summary")}
              >
                Summary
              </button>
              <button
                className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium ${activeTab === "Feeds"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700"
                  }`}
                onClick={() => setActiveTab("Feeds")}
              >
                Feeds
              </button>
            </div>

            {/* SUMMARY TAB */}
            {activeTab === "Summary" && (
              <div className="space-y-6">
                {/* Top Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Feeds List */}
                  <div className="bg-white cursor-pointer border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md transition"
                    onClick={() => setActiveTab("Feeds")}>
                    <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-5 bg-blue-500 rounded"></span>
                      Feeds List
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between text-gray-600">
                        <span>Total Feeds</span>
                        <span className="font-semibold text-green-600">
                          {totalFeeds}
                        </span>
                      </p>
                      <p className="flex justify-between text-gray-600">
                        <span>Active Feeds</span>
                        <span className="font-semibold text-green-600">
                          {activeFeeds}
                        </span>
                      </p>
                      <p className="flex justify-between text-gray-600">
                        <span>Closed Feeds</span>
                        <span className="font-semibold text-red-500">
                          {closedFeeds}
                        </span>
                      </p>
                      {/* <p className="flex justify-between text-gray-600">
                        <span>Frequency</span>
                        <span className="font-semibold text-blue-600">
                          {project?.FrequencyCount || 0}
                        </span>
                      </p>
                      <p className="flex justify-between text-gray-600">
                        <span>Status</span>
                        <span className="font-semibold text-purple-600">
                          {project?.StatusCount || 0}
                        </span>
                      </p> */}
                    </div>
                  </div>

                  {/* Status Types */}
                  <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md transition"
                  >
                    <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-5 bg-blue-500 rounded"></span>
                      Status Types
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between text-gray-600">
                        <span>BAU-Started</span>
                        <span className="font-semibold text-green-600">
                          {BAUStarted}
                        </span>
                      </p>
                      <p className="flex justify-between text-gray-600">
                        <span>BAU - Not Yet Started</span>
                        <span className="font-semibold text-yellow-600">
                          {BAUNotStarted}
                        </span>
                      </p>
                      <p className="flex justify-between text-gray-600">
                        <span>On Hold</span>
                        <span className="font-semibold text-red-500">
                          {OnHold}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Frequency Options */}
                  <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md transition"
                  >
                    <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-5 bg-blue-500 rounded"></span>
                      Frequency Options
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between text-gray-600">
                        <span>Daily</span>
                        <span className="font-semibold text-blue-600">
                          {DailyCount || 0}
                        </span>
                      </p>
                      <p className="flex justify-between text-gray-600">
                        <span>Weekly</span>
                        <span className="font-semibold text-indigo-600">
                          {WeeklyCount || 0}
                        </span>
                      </p>
                      <p className="flex justify-between text-gray-600">
                        <span>Monthly</span>
                        <span className="font-semibold text-purple-600">
                          {MonthlyCount || 0}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assigned Info */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Assigned By</p>
                      <p className="font-semibold text-gray-800">
                        {project?.CreatedBy?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Assigned Date</p>
                      <p className="font-semibold text-gray-800">
                        {project?.CreatedDate
                          ? dayjs(project.CreatedDate).format("YYYY/MM/DD")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Overdue Date</p>
                      <p className="font-semibold text-gray-800">
                        {project?.DueDate || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Efforts</p>
                      <p className="font-semibold text-gray-800">
                        {project?.Efforts || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

{feedModalOpen && project && (  // <-- wait until project is loaded
  <FeedModel
    isOpen={feedModalOpen}
    onClose={() => setFeedModalOpen(false)}
    // existingProjectId={project.ProjectId}  // now it exists
      existingProjectId={project._id}
    onSuccess={() => setRefresh((prev) => !prev)}
  />
)}
              

            {/* FEEDS TAB */}
            {activeTab === "Feeds" && (
              // <div className="flex flex-col">
              <div>
                <div className="bg-white p-6 border rounded-sm shadow-sm border-gray-100 overflow-x-auto">

                  <div className="flex items-center justify-between mb-6">
                    {/* Heading */}
                    <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
                      Feeds
                    </h2>

                    <div className="flex items-center space-x-3">
                      {/* Search Box */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search by Feed..."
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm "
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
                      {canCreateFeed && (
              <button
                className="bg-purple-600 hover:bg-purple-700 cursor-pointer text-white text-sm font-semibold px-4 py-2 rounded transition"
                onClick={() => setFeedModalOpen(true)}
              >
                + Add Feed
              </button>
            )}

                      {/* Add Feed Button */}
                      {/* <button
        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm"
        onClick={() => {
          // Add your logic here
          // console.log("Add Feed clicked");
        }}
      >
        Add Feed
      </button> */}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 overflow-hidden">
                      <thead className="bg-gray-100 text-gray-700 sticky top-0">
                        <tr>
                          {columns.map((col) => (
                            <th
                              key={col}
                              className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      {/* <tbody>
                    {(project?.Feeds || []).map((feed, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{feed.name}</td>
                        <td className="px-4 py-2">{feed.status}</td>
                        <td className="px-4 py-2">{feed.frequency}</td>
                      </tr>
                    ))}
                  </tbody> */}
                      <tbody>
                        {project?.Feeds && project.Feeds.length > 0 ? (
                          project.Feeds.map((feed, idx) => {
                            const getNormalizedMember = (m, defaultRole = "Unknown") => ({
                              _id: m._id,
                              name: m.name || "Unknown",
                              avatar: m.avatar || null,
                              roleName: m.roleName || (m.roleId && m.roleId.name) || defaultRole,
                            });

                            // Project members
                            const projectMembers = [
                              ...(project.PMId ? [project.PMId] : []),
                              ...(project.TLId ? [project.TLId] : []),
                              ...(project.PCId ? [project.PCId] : []),
                              ...(project.QAId ? [project.QAId] : []),
                              ...(project.BAUPersonId ? [project.BAUPersonId] : []),
                            ].map((m) => getNormalizedMember(m, "Manager"));

                            // Feed developers
                            const devMembers = (feed.DeveloperIds || []).map((dev) =>
                              getNormalizedMember(dev, "Developer")
                            );

                            // Combine all
                            const combinedMembers = [...devMembers, ...projectMembers];
                            const visible = combinedMembers.slice(0, 3);
                            const extraCount = combinedMembers.length - visible.length;

                            return (
                              <tr key={idx} className="">
                                <td className="px-4 py-2">{idx + 1}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{feed.FeedId}</td>
                                <td
                                  className="px-4 py-2 text-blue-600 cursor-pointer hover:underline whitespace-nowrap"
                                  onClick={() => navigate(`/projects/feed/${feed._id}`)}
                                // onClick={() => navigate(`/projects/${feed.projectId}/details/feed/${feed._id}`)}
                                >
                                  {feed.FeedName}
                                </td>
                                <td className="px-4 py-2 align-top whitespace-nowrap">
                                  <div className="flex flex-col gap-1">
                                    <span
                                      className={`inline-block px-3 py-1 text-xs rounded-full w-fit ${feed.Frequency === "Daily"
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

                                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 w-fit">
                                      {/* Schedule logic */}
                                      {(() => {
                                        const { Frequency, Schedule } = feed;
                                        if (!Schedule) return "No schedule";
                                        switch (Frequency) {
                                          case "Daily":
                                            return "Daily";
                                          case "Weekly":
                                            return `${Schedule.day || "—"}`;
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
                                              ? new Date(Schedule.datetime).toLocaleString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })
                                              : "No date";
                                          case "Custom":
                                            return Schedule.custom && Schedule.custom.length > 0
                                              ? Schedule.custom.map((c) => `${c.day} ${c.time}`).join(", ")
                                              : "No custom schedule";
                                          default:
                                            return "No schedule";
                                        }
                                      })()}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-4 py-2 whitespace-nowrap">{feed.Platform ?? "-"}</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${feed.Status === "New" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                                      }`}
                                  >
                                    {feed.Status}
                                  </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">{feed.BAUStatus ?? "-"}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{feed.POC ?? "-"}</td>

                                <td className="px-4 py-2">
                                  {combinedMembers.length === 0 ? (
                                    <span className="text-gray-400">-</span>
                                  ) : (
                                    <div className="flex items-center -space-x-2 relative">
                                      {visible.map((m, i) => (
                                        <div key={i} className="relative group" title={`${m.name || "Unknown"}${m.roleName ? " - " + m.roleName : ""}`}>
                                          <img
                                            src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || "U")}&background=random`}
                                            alt={m.name}
                                            className="w-8 h-8 rounded-full shadow-sm cursor-pointer hover:scale-105 transition"
                                            ref={(el) => (buttonRef.current[feed._id] = el)}
                                            onClick={() => handleToggle(feed._id)}
                                          />
                                        </div>
                                      ))}

                                      {extraCount > 0 && (
                                        <button
                                          ref={(el) => (buttonRef.current[feed._id] = el)}
                                          onClick={() => handleToggle(feed._id)}
                                          className="cursor-pointer w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-medium flex items-center justify-center  shadow-sm hover:bg-purple-700 transition"
                                        >
                                          +{extraCount}
                                        </button>
                                      )}

                                      {openPopoverFeedId === feed._id &&
                                        ReactDOM.createPortal(
                                          <div
                                            ref={feedPopoverRef}
                                            className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 z-50"
                                            style={{ top: position.top, left: position.left }}
                                          >
                                            <h3 className="text-sm font-semibold text-gray-700 mb-2">All Assignees</h3>
                                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                                              {combinedMembers.map((m, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                  <img
                                                    src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || "U")}&background=random`}
                                                    alt={m.name}
                                                    className="w-6 h-6 rounded-full border"
                                                  />
                                                  <span className="text-sm text-gray-700">
                                                    {m.name} <span className="text-gray-400 text-xs">({m.roleName})</span>
                                                  </span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>,
                                          document.body
                                        )}

                                    </div>
                                  )}
                                </td>

                                <td className="px-4 py-2 whitespace-nowrap">
                                  <button className = "bg-blue-600 text-white p-2 rounded-md">Assign To Developer</button></td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td className="px-4 py-6 text-center text-gray-500" colSpan={columns.length}>
                              No Data Found
                            </td>
                          </tr>
                        )}
                      </tbody>

                    </table>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2 mt-4">
                      <label htmlFor="entries" className="text-gray-700">Show</label>
                      <select
                        id="entries"
                        value={entries}
                        onChange={(e) => {
                          setEntries(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border rounded px-2 py-1"
                      >
                        {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <span className="text-gray-700">entries</span>
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>


                </div>
                {/* Assigned Info */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Assigned By</p>
                      <p className="font-semibold text-gray-800">
                        {project?.CreatedBy?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Assigned Date</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(project.CreatedDate).toLocaleDateString() ??
                          "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Overdue Date</p>
                      <p className="font-semibold text-gray-800">
                        {project?.DueDate || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Efforts</p>
                      <p className="font-semibold text-gray-800">
                        {project?.Efforts || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE (Always visible Project Details) */}
          <div className="lg:col-span-1 min-w-0 flex flex-col gap-6">
            <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded"></span>
                Project Details
              </h4>


              <hr className="border-gray-200 mb-4" />

              <div className="space-y-3 text-sm">
                <p className="flex justify-between ">
                  <span className="text-gray-500">Project ID</span>
                  <span className="font-semibold text-gray-800">
                    {project?.ProjectCode}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Project Name</span>
                  <span className="font-semibold text-gray-800">
                    {project?.ProjectName}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Delivery Type</span>
                  <span className="font-semibold text-gray-800">
                    {project?.DeliveryType}
                  </span>
                </p>

                {/* ✅ Show Expected Delivery Date if available */}
                {(project?.DeliveryType === "Adhoc" || project?.DeliveryType === "Once-off") &&
                  project?.ExpectedDeliveryDate && (
                    <p className="flex justify-between">
                      <span className="text-gray-500">Expected Delivery Date</span>
                      <span className="font-semibold text-gray-800">
                        {project.ExpectedDeliveryDate}
                      </span>
                    </p>
                  )}


                <p className="flex justify-between">
                  <span className="text-gray-500">Project Type</span>
                  <span className="font-semibold text-gray-800">
                    {project?.ProjectType}
                  </span>
                </p>


                <p className="flex justify-between">
                  <span className="text-gray-500">Project Status</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${project?.Status === "New"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-yellow-100 text-yellow-600"
                      }`}
                  >
                    {project?.Status}
                  </span>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-500">Industry</span>
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-600">
                    {project?.IndustryType || "N/A"}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">BDE</span>
                  <span className="font-semibold text-gray-800">
                    {project?.BDEId?.name || "N/A"}
                  </span>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-500">Assigned To</span>
                  {(() => {
                    // Combine all members from project and feeds
                    const combinedMembers = [
                      project.PMId && { name: project.PMId.name, roleName: "Manager", avatar: project.PMId.avatar },
                      project.TLId && { name: project.TLId.name, roleName: "Team Lead", avatar: project.TLId.avatar },
                      project.QAId && { name: project.QAId.name, roleName: "QA Lead", avatar: project.QAId.avatar },
                      project.PCId && { name: project.PCId.name, roleName: "Project Coordinator", avatar: project.PCId.avatar },
                      project.BAUPersonId && { name: project.BAUPersonId.name, roleName: "BAU Manager", avatar: project.BAUPersonId.avatar },
                      ...(project.Feeds?.flatMap(feed => [
                        ...(feed.DeveloperIds?.map(dev => ({ name: dev.name, roleName: "Developer", avatar: dev.avatar })) || []),
                        feed.BAUId && { name: feed.BAUId.name, roleName: "BAU", avatar: feed.BAUId.avatar },
                      ]) || [])
                    ].filter(Boolean);

                    // Remove duplicates by name
                    const uniqueMembers = combinedMembers.filter(
                      (member, index, self) =>
                        index === self.findIndex(m => m.name === member.name)
                    );

                    const maxVisible = 3; // how many avatars to show
                    const visible = uniqueMembers.slice(0, maxVisible);
                    const extraCount = uniqueMembers.length - visible.length;

                    return uniqueMembers.length === 0 ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <div className="flex items-center -space-x-2 relative">
                        {visible.map((m, i) => (
                          <div
                            key={i}
                            className="relative group"
                            title={`${m.name || "Unknown"}${m.roleName ? " - " + m.roleName : ""}`}
                          >
                            <img
                              src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || "U")}&background=random`}
                              alt={m.name}
                              className="w-8 h-8 rounded-full border-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setShowPopover(!showPopover)}
                            />
                          </div>
                        ))}

                        {extraCount > 0 && (
                          <button
                            onClick={() => setShowPopover(!showPopover)}
                            className="w-8 h-8 rounded-full cursor-pointer bg-purple-600 text-white text-xs font-medium flex items-center justify-center hover:bg-purple-700 transition"
                          >
                            +{extraCount}
                          </button>
                        )}

                        {/* Popover */}
                        {showPopover && (
                          <div ref={genericPopoverRef} className="absolute top-10 right-0 bg-white rounded-lg shadow-lg p-3 w-64 z-50 border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                              All Assignees
                            </h3>
                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                              {uniqueMembers.map((m, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <img
                                    src={
                                      m.avatar ||
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || "U")}&background=random`
                                    }
                                    alt={m.name}
                                    className="w-6 h-6 rounded-full border"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {m.name}{" "}
                                    <span className="text-gray-400 text-xs">
                                      ({m.roleName})
                                    </span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}



                </p>


                <p className="flex justify-between">
                  <span className="text-gray-500">History</span>
                  <span className="font-semibold text-left text-gray-700 cursor-pointer hover:text-purple-700">
                    <FaHistory  size={20} className="" onClick={openModal} title="See History" />
                  </span>
                </p>

                <Modal
                  isOpen={isOpen}
                  onRequestClose={() => setIsOpen(false)}
                  contentLabel="Project History"
                  className="max-w-2xl mx-auto mt-20 bg-white rounded-lg shadow-lg outline-none p-6 relative"
                  overlayClassName="fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-start z-50"
                >
                  <h2 className="text-xl font-semibold mb-4">Project History</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
  {modalHistory.length > 0 ? (
    [...new Map(
      modalHistory.map(item => {
        const key = item.feedId || item.projectId || item.updatedAt;
        return [key + item.actionType, item];
      })
    ).values()].map((item, index) => {
      const feed = item.FeedName?.trim();
      const project = item.ProjectName?.trim();

      return (
        <div key={index} className="flex gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {item.updatedBy?.name
              ?.split(" ")
              ?.map((n) => n[0])
              ?.join("")
              ?.toUpperCase() || "?"}
          </div>

          {/* Activity details */}
          <div className="flex-1">
            <p className="text-gray-800">
              <span className="font-semibold">{item.updatedBy?.name}</span>{" "}
              {item.actionType === "Feed Created" ? (
                <>
                  created feed{" "}
                  {feed && <span className="font-semibold text-blue-600">“{feed}”</span>}
                  {project && (
                    <>
                      {" "}for project{" "}
                      <span className="font-semibold text-purple-600">“{project}”</span>
                    </>
                  )}
                </>
              ) : item.description ? (
                item.description
              ) : (
                <>
                  updated {item.entityType}{" "}
                  <span className="font-semibold">{item.field}</span> from{" "}
                  <span className="bg-gray-200 px-2 py-1 rounded text-sm">
                    {item.oldValue || "—"}
                  </span>{" "}
                  to{" "}
                  <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm">
                    {item.newValue || "—"}
                  </span>
                </>
              )}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {formatISTDate(item.updatedAt)}
            </p>
          </div>
        </div>
      );
    })
  ) : (
    <p className="text-gray-400 text-center">No history found.</p>
  )}
</div>

                </Modal>  
              </div>
            </div>
            <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-green-500 rounded"></span>
                Attachments
              </h4>

              <div className="space-y-2 text-sm">

                <button className="cursor-pointer bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm"
                  onClick={() => navigate(`/projects/${project._id}/attachments`)}>
                  <a href="">View</a>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
