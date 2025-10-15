import { useState, useEffect, useRef, Fragment } from "react";
import { useLocation } from "react-router-dom";
import Modal from "react-modal";
import { toast } from "react-hot-toast";
import Select from "react-select";



Modal.setAppElement("#root");
import { Dialog, Transition } from "@headlessui/react";
import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { FaFileExcel, FaFileCsv, FaFileCode, FaChevronDown, FaFileExport } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";

import Pagination from "../components/Pagination";
import Img from "../assets/no-data-found.svg";
import { exportData } from "../utils/exportUtils";
import { useAuth } from "../hooks/useAuth";
import Model from "../components/CreateProject";
import UpdateProjectModal from "../components/UpdateProjectModel";


// import { set } from "mongoose";

// import QaActionsModal from "../components/QAActionModel";
export default function Projects() {
  //  const location = useLocation();
  const navigate = useNavigate();
  // const { fromUpdateModal, projectId: projectIdFromState } = location.state || {};
  // const {  openProjectId, openModal, closeModal } = useModal();
  const location = useLocation();
  const deliveryTypeFilter = location.state?.deliveryType;
  const statusFilter = location.state?.status;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(deliveryTypeFilter || "All");
  const [salesActiveStatusTabs, setSalesActiveStatusTabs] = useState("All");
  const [activeSalesTab, setActiveSalesTab] = useState("All");
  const [search, setSearch] = useState("");

  const [filterDate, setFilterDate] = useState("");

  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState(statusFilter || "All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qaData, setQaData] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [feedModalOpen, setFeedModalOpen] = useState(false);
  const [feeds, setFeeds] = useState([]);
  const [status, setStatus] = useState("All");
  // const [qaModalOpen, setQaModalOpen] = useState(false);

  const [openRow, setOpenRow] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  //  const [projects, setProjects] = useState([]);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [feedOptions, setFeedOptions] = useState([]);
  const [selectedFeed, setSelectedFeed] = useState(null);

  const [refresh, setRefresh] = useState(false);
  const [open, setOpen] = useState(false);

  // const canCreateProject = user?.permissions?.some(
  //   (perm) => perm.module === "Project" && perm.actions.includes("create")
  // );

  // const tableRef = useRef(null);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTL, setSelectedTL] = useState("");
  const [selectedPC, setSelectedPC] = useState("");
  const [selectedQA, setSelectedQA] = useState("");
  const [selectedBauPerson, setSelectedBauPerson] = useState("");
  console.log("selectedBauPerson:", selectedBauPerson);
  const [selectedDevelopers, setSelectedDevelopers] = useState([]);

  const [tlOptions, setTlOptions] = useState([]);
  const [pcOptions, setPcOptions] = useState([]);
  const [qaOptions, setQaOptions] = useState([]);
  const [bauPersonOptions, setBauPersonOptions] = useState([]);
  const [developerOptions, setDeveloperOptions] = useState([]);
  const devOptionsRS = developerOptions.map((dev) => ({
    value: dev._id,
    label: dev.name,
  }));




  // const tabs = [
  //   "All Deliveries",
  //   "Today",
  //   "Tomorrow",
  //   "Yesterday",
  //   "This Week",
  //   "Last Week",
  //   "Next Week",
  //   "This Month",
  //   "Next Month",
  //   "Last Month",
  //   "Delayed",
  //   "Escalated",
  //   // "Date",
  // ];

  // sales tab filters
  const tabs = ["All", "BAU", "POC", "Adhoc", "Once-off"];

  const statusTabs = [
    "All",
    "New",
    "Under Development",
    "On-Hold",
    "Production",
    "BAU-Started",
    "Closed",
  ];

  //Validation errors
  const [errors, setErrors] = useState({});

  // const statusTabs = ["All", "New", "Under Development", "assigned_to_qa", "qa_passed", "qa_failed", "Completed"];
  // const statusTabs = [
  //   { key: "All Projects", label: "All Projects" },
  //   { key: "New", label: "New" },
  //   { key: "Under Development", label: "Under Development" },
  //   { key: "assigned_to_qa", label: "Assigned to QA" },
  //   { key: "qa_passed", label: "QA Passed" },
  //   { key: "qa_failed", label: "QA Failed" },
  //   { key: "Completed", label: "Completed" },
  // ];

  const canCreateProject =
    user?.permissions?.some(
      (perm) => perm.module === "Projects" && perm.actions.includes("create")
    ) && !(user?.department === "QA" && user?.roleName === "Manager");

  // const canCreateFeed = user?.permissions?.some(
  //   (perm) => perm.module === "Feed" && perm.actions.includes("create")
  // );

  const canAssignProject =
    user?.permissions?.some(
      (perm) => perm.module === "Projects" && perm.actions.includes("assign")
    ) && !(user?.department === "QA" && user?.roleName === "Manager");

  // Fetch projects using filters

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        status: activeStatus !== "All" ? activeStatus : "",
        tab: activeTab !== "All" ? activeTab : "",
        date_range: activeTab.toLowerCase().replace(" ", "_"),
        page: currentPage.toString(),
        pageSize: entries.toString(),
        search: search || "",
        department: user.department || "",
        CreatedDate: filterDate
          ? dayjs(filterDate, "YYYY/MM/DD").format("YYYY/MM/DD")
          : "",
      });

      const response = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID
        }/api/projects?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      const result = await response.json();
      if (response.ok) {
        setData(result.data || []);
        setPageSize(result.pageSize);
        setCurrentPage(result.page || 1);
        setTotalPages(Math.ceil(result.total / result.pageSize) || 1);
        setTotalDocs(result.total || 0);

        console.log("Fetched Projects:", result.data);

        //  if (fromUpdateModal && projectIdFromState) {
        //   const project = (result.data || []).find(p => p._id === projectIdFromState);
        //   if (project) openModal(project._id);
        // }
      } else {
        console.error("Failed to fetch projects:", result.message);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [
    activeTab,
    activeSalesTab,
    salesActiveStatusTabs,
    activeStatus,
    entries,
    pageSize,
    currentPage,
    search,
    filterDate,
    refresh,
  ]);

  useEffect(() => {
    if (deliveryTypeFilter) {
      setActiveTab(deliveryTypeFilter);
      setCurrentPage(1);
    }
  }, [deliveryTypeFilter]);
  useEffect(() => {
    if (statusFilter) {
      setActiveStatus(statusFilter);
      setCurrentPage(1);
    }
  }, [statusFilter]);

  //   useEffect(() => {
  //   if (openProjectId) {
  //     const project = data.find(p => p._id === openProjectId);
  //     if (project) {
  //       setSelectedProject(project);
  //       setIsUpdateModalOpen(true);
  //     }
  //   }
  // }, [openProjectId, data]);

  // useEffect(() => {
  //   if (!data.length) return;

  //   // Check if navigated back from attachments
  //   if (location.state?.fromUpdateModal && location.state.projectId) {
  //     const project = data.find(p => p._id === location.state.projectId);
  //     if (project) {
  //       setSelectedProject(project);
  //       setIsUpdateModalOpen(true);

  //       // Clear state so modal doesn't reopen on future reloads
  //       navigate(location.pathname, { replace: true });
  //     }
  //   }
  // }, [data]);

  // useEffect(() => {
  //   if (!isAssignOpen) return;

  //   (async () => {
  //     try {
  //       const res = await fetch(
  //         `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/tl-dev`,
  //         { credentials: "include" }
  //       );

  //       if (!res.ok) throw new Error("Failed to fetch");

  //       const data = await res.json();

  //       setTlOptions(data.tlUsers || []);
  //       setPcOptions(data.pcUsers || []);
  //       setBauPersonOptions(data.bauPerson || []);
  //       setDeveloperOptions(data.devUsers || []);
  //       setQaOptions(data.qaLead || []);
  //     } catch (err) {
  //       console.error("Failed to load TL/Dev list:", err);
  //       setTlOptions([]);
  //       setPcOptions([]);
  //       // setDevOptions([]);
  //       setQaOptions([]);
  //     }
  //   })();
  // }, [isAssignOpen]);
  useEffect(() => {
    if (!isAssignOpen || !selectedProject) return;

    (async () => {
      try {
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/tl-dev`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("Failed to fetch user lists");

        const data = await res.json();

        setTlOptions(data.tlUsers || []);
        setPcOptions(data.pcUsers || []);
        setBauPersonOptions(data.bauPerson || []);
        setDeveloperOptions(data.devUsers || []);
        setQaOptions(data.qaLead || []);

        // ✅ After fetching, prefill previous assigned values
        // Handle both string IDs and populated objects (with _id)
        setSelectedTL(selectedProject.TLId?._id || selectedProject.TLId || "");
        setSelectedPC(selectedProject.PCId?._id || selectedProject.PCId || "");
        setSelectedQA(selectedProject.QAId?._id || selectedProject.QAId || "");
        setSelectedBauPerson(
          selectedProject.BAUPersonId?._id || selectedProject.BAUPersonId || ""
        );
      } catch (err) {
        console.error("Failed to load TL/Dev list:", err);
        setTlOptions([]);
        setPcOptions([]);
        setQaOptions([]);
        setBauPersonOptions([]);
      }
    })();
  }, [isAssignOpen, selectedProject]);

  //   console.log("Selected TL:", selectedTL);
  // console.log("Selected PC:", selectedPC);
  // console.log("Selected QA:", selectedQA);

  // const handleAssign = () => {
  //   if (!selectedTL || !selectedPC) return alert("Select TL and PC");
  //   onAssign(project._id, selectedTL, selectedPC);
  //   setIsAssignOpen(false);
  // };
  // const handleAssign = async () => {
  //   if (!selectedProject) return;

  //   try {
  //     if(user.roleName === "Manager") {

  //       const res = await fetch(
  //         `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projectss/${selectedProject._id}/update-team`,
  //         {
  //           method: "PUT",
  //           headers: { "Content-Type": "application/json" },
  //           credentials: "include",
  //           body: JSON.stringify({
  //             TLId: selectedTL,
  //             PCId: selectedPC,
  //             QAId: selectedQA,
  //             // DeveloperIds: only TL/PC can update
  //           }),
  //         }
  //       );
  //     }

  //     const data = await res.json();

  //     console.log("Updated Project Data:", data);

  //     if (!res.ok || !data.project) {
  //       console.error("Failed to update project:", data);
  //       toast.error(data.message || "Failed to update project");
  //       return;
  //     }

  //     // update modal selected project
  //     setSelectedProject(data.project);

  //     // update main projects table
  //     setData((prev = []) =>
  //       prev.map((p) => (p._id === data.project._id ? data.project : p))
  //     );

  //     toast.success("Project team updated successfully");
  //     setIsAssignOpen(false);
  //   } catch (err) {
  //     console.error("Error updating project:", err);
  //     toast.error("Failed to update project");
  //   }
  // };

  const handleAssign = async () => {
    if (!selectedProject) return;
    setErrors({}); // clear previous errors
    try {
      let res;

      // Manager: update TL, PC, QA
      if (user.roleName === "Manager") {
        res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${selectedProject._id
          }/update-team`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              TLId: selectedTL,
              PCId: selectedPC,
              QAId: selectedQA,
              BAUPersonId: selectedBauPerson,
            }),
          }
        );
      }

      // TL / PC: update developers for feed
      if (
        (user.roleName === "Team Lead" ||
          user.roleName === "Project Coordinator") &&
        selectedFeed
      ) {
        res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${selectedFeed.value
          }/update-team`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              DeveloperIds: selectedDevelopers.map((d) => d.value),
            }),
          }
        );
      }

      const data = await res.json();
      // console.log("Updated Data:", data);

      if (data.errors) {
        setErrors(data.errors);
        // toast.error("Please fill all required fields");
        return;
      }

      if (!res.ok || (!data.project && !data.feed)) {
        console.error("Failed to update:", data);
        toast.error(data.message || "Failed to update assignment");
        return;
      }

      // Update modal and main table for project
      if (data.project) {
        setSelectedProject(data.project);
        setData((prev = []) =>
          prev.map((p) => (p._id === data.project._id ? data.project : p))
        );
        toast.success("Project team updated successfully");
      }

      // Optionally update feed state if you have a feed table/list
      if (data.feed) {
        toast.success("Developers assigned successfully");
        // updateFeedState(data.feed); // implement if needed
      }

      setIsAssignOpen(false);
    } catch (err) {
      console.error("Error updating assignment:", err);
      toast.error("Failed to update assignment");
    }
  };

  const role = user?.roleName;
  const baseColumns = ["No"];

  const roleColumns = {
    "Sales Head": [
      "Project",
      "Feeds",
      "Industry",
      "Project Manager",
      "BDE",
      "Delivery Type",
      // "Frequency",
      "Status",
      "Attachments",
      "Project Type",
      "Created By",
      "Created Date",
      "Action",
    ],
    "Sales Manager": [
      "Project",
      "Feeds",
      "Industry",
      "Project Manager",
      "BDE",
      "Delivery Type",
      // "Frequency",
      "Status",
      "Attachments",
      "Project Type",
      "Created By",
      "Created Date",
      "Action",
    ],
    "Business Development Executive": [
      "Project",
      "Feeds",
      "Industry",
      "Project Manager",
      "BDE",
      "Delivery Type",
      // "Frequency",
      "Status",
      "Attachments",
      "Project Type",
      "Created By",
      "Created Date",
    ],
    Superadmin: [
      "Frequency",
      "Platform",
      "BAU",
      "POC",
      "PM",
      "PC",
      "TL",
      "Developer",
      "QA",
      "BAU Person",
      "Feed ID",
      "Framework type",
      "QA Report Count",
      "Manage By",
      "QA Rules",
      "DB Status",
      "DB Type",
      "Created By",
    ],
    Manager: [
      "Project",
      "Feeds",
      "Industry",
      "Project Manager",
      "BDE",
      "Delivery Type",
      // "Frequency",
      "Status",
      "Attachments",
      "Project Type",
      "Created By",
      "Created Date",
      "Action",
    ],
    "Team Lead": [
      "Project",
      "Feeds",
      "Industry",
      "Project Manager",
      "BDE",
      "Delivery Type",
      // "Frequency",
      "Status",
      "Attachments",
      "Project Type",
      "Created By",
      "Created Date",
      // "Action",
    ],
    "Project Coordinator": [
      "Project",
      "Feeds",
      "Industry",
      "Project Manager",
      "BDE",
      "Delivery Type",
      // "Frequency",
      "Status",
      "Attachments",
      "Project Type",
      "Created By",
      "Created Date",
      // "Action",
    ],
    QA: ["QA Report Count", "QA Rules"],
    Developer: [
      "Project",
      "Feeds",
      "Industry",
      "Project Manager",
      "BDE",
      "Delivery Type",
      // "Frequency",
      "Status",
      "Attachments",
      "Project Type",
      "Created By",
      "Created Date",
    ],
  };

  const columns = [...baseColumns, ...(roleColumns[role] || [])];

  const handleUpdateProject = async (updatedData) => {
    // TODO: Send updatedData to API with project ID (selectedProject._id)
    console.log("Updated Project Data:", updatedData);
    setIsUpdateModalOpen(false);
  };

  //   const isAssigned = (project) => {
  //   if (!project) return false;

  //   if (user.roleName === "Manager") {
  //     // Check either project object OR selected values
  //     return Boolean(
  //       project.TLId || selectedTL
  //     ) && Boolean(
  //       project.PCId || selectedPC
  //     ) && Boolean(
  //       project.QAId || selectedQA
  //     ) && Boolean(
  //       project.BAUPersonId || selectedBauPerson
  //     );
  //   } else if (user.roleName === "Team Lead" || user.roleName === "Project Coordinator") {
  //     // TL/PC: all feeds assigned
  //     return Boolean(
  //       project.Feeds?.every((feed) => feed.DeveloperIds?.length > 0)
  //     );
  //   }

  //   return false;
  // };
  const isAssigned = (project) => {
    if (!project) return false;

    if (user.roleName === "Manager") {
      // Manager: all roles must be assigned
      return (
        Boolean(project.TLId?._id) &&
        Boolean(project.PCId?._id) &&
        Boolean(project.QAId?._id)
      );
      //  Boolean(project.BAUPersonId?._id);
    } else if (
      user.roleName === "Team Lead" ||
      user.roleName === "Project Coordinator"
    ) {
      // TL/PC: all feeds must have at least one developer
      return (
        project.Feeds?.length > 0 &&
        project.Feeds.every((feed) => feed.DeveloperIds?.length > 0)
      );
    }

    return false;
  };

  const filteredData = data.filter((project) => {
    switch (user?.roleName) {
      case "Sales Head":
        return true; // Show all projects
      case "Sales Manager":
        return true; // Or some custom logic for manager
      case "Business Development Executive":
        // Show only projects assigned to this BDE
        return true;
      case "Manager":
        return true;

      case "Team Lead":
        return true;
      case "Project Coordinator":
        return true;

      case "Developer":
        return true;
      default:
        return false;
    }
  });

  // useEffect(() => {
  //     if (location.state?.fromUpdateModal && selectedProject) {
  //       setIsUpdateModalOpen(true);

  //       // Optional: clear the state so modal doesn't reopen on future reloads
  //       navigate(location.pathname, { replace: true });
  //     }
  //   }, [location.state, selectedProject]);

  let rowCounter = (currentPage - 1) * pageSize + 1;

  return (
    <>
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between mt-4">
          {/* Heading */}
          <h2 className="text-xl font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
            Projects
          </h2>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <Model
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => setRefresh((prev) => !prev)}
          />
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          {/* Left side: Search + Filters + Clear */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 flex-1">
            {/* Search */}
            <div className="flex-1 md:max-w-xs mt-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Project Name or Code..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full border border-gray-200 rounded pl-10 pr-4 py-2 text-sm focus:outline-none"
                />
                <svg
                  className="w-5 h-5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="16.5" y1="16.5" x2="21" y2="21" />
                </svg>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
              {/* Delivery Type */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 mb-1">
                  Delivery Type
                </label>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700"
                  value={activeTab} // single state for all users
                  onChange={(e) => {
                    setActiveTab(e.target.value);
                    setCurrentPage(1); // reset page when filter changes
                  }}
                >
                  {tabs.map((tab) => (
                    <option key={tab} value={tab}>
                      {tab}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 mb-1">
                  Status
                </label>
                <select
                  value={activeStatus} // single state
                  onChange={(e) => {
                    setActiveStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none"
                >
                  {statusTabs.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 mb-1">
                  Date
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none"
                    value={filterDate ? dayjs(filterDate, "YYYY/MM/DD") : null}
                    format="YYYY/MM/DD"
                    onChange={(newValue) => {
                      setFilterDate(
                        newValue ? newValue.format("YYYY/MM/DD") : ""
                      );
                      setCurrentPage(1);
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          "& .MuiInputBase-root": { fontSize: "0.875rem" },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

              {/* Clear Button */}
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm transition mt-2 md:mt-6"
                onClick={() => {
                  setFilterDate("");
                  setActiveStatus("");
                  setActiveTab("");
                  setSearch("");
                  setCurrentPage(1);
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right side: Export + Create Buttons */}
          <div className="flex flex-wrap md:flex-nowrap items-center mt-6 gap-3">
            {/* Export */}
            {/* <div className="flex flex-col">
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none text-gray-400"
                onChange={(e) => {
                  const format = e.target.value;
                  if (format) {
                    exportData(format, data, "projects");
                    e.target.value = ""; // reset dropdown
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled hidden>
                  Export
                </option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div> */}
            <div className="flex flex-col relative inline-block text-left">
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="w-40 flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 text-md font-medium text-gray-700 focus:outline-none cursor-pointer"
              >
                <FaFileExport size={20} className=" text-gray-700" />
                Export
                <FaChevronDown className="ml-2 text-gray-500" />
              </button>

              {open && (
                <div className="absolute mt-1 w-40 bg-white shadow-lg rounded-md z-10">
                  <button
                    className="w-full flex items-center px-3 py-2 text-md text-gray-700 hover:bg-gray-100"
                    onClick={() => { exportData("excel", data, "projects"); setOpen(false); }}
                  >
                    <FaFileExcel size={18} className="mr-2 text-green-700" /> Excel
                  </button>
                  <button
                    className="w-full flex items-center px-3 py-2 text-md text-gray-700 hover:bg-gray-100"
                    onClick={() => { exportData("csv", data, "projects"); setOpen(false); }}
                  >
                    <FaFileCsv size={18} className="mr-2 text-blue-500" /> CSV
                  </button>
                  <button
                    className="w-full flex items-center px-3 py-2 text-md text-gray-700 hover:bg-gray-100"
                    onClick={() => { exportData("json", data, "projects"); setOpen(false); }}
                  >
                    <FaFileCode size={18} className="mr-2 text-yellow-500" /> JSON
                  </button>
                </div>
              )}
            </div>

            {/* Create Buttons */}
            {canCreateProject && (
              <button
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded transition"
                onClick={() => setIsModalOpen(true)}
              >
                + Create Project
              </button>
            )}

            {/* {canCreateFeed && (
              <button
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded transition"
                onClick={() => setFeedModalOpen(true)}
              >
                + Create Feed
              </button>
            )} */}
          </div>
        </div>
        {/* ==========SALES Department Table start========== */}
        {user?.department === "Sales" && (
          <>
            {/* Table */}
            <div className="flex flex-col">
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-100">
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
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="text-center p-4 text-gray-500"
                        >
                          <div className="flex justify-center items-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-600"></div>
                          </div>
                        </td>
                      </tr>
                    ) : data.length > 0 ? (
                      data.map((project, idx) => (
                        <tr
                          key={project._id}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-3 py-2">
                            {(currentPage - 1) * pageSize + idx + 1}
                          </td>
                          <td
                            className="px-3 py-2 whitespace-nowrap text-blue-700 cursor-pointer hover:underline"
                            onClick={() =>
                              navigate(`/projects/${project._id}/details`)
                            }
                          >
                            {project.ProjectCode ?? "-"}{" "}
                            {project.ProjectName ?? "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {project.Feeds?.length ?? 0}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {project.IndustryType ?? "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {project.PMId?.name ?? "-"}
                          </td>
                          {/* <td className="px-3 py-2">{project.BDEId?.name ?? "-"}</td> */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            {/* {project.BDEId && project.BDEId.length > 0
    ? project.BDEId.map(bde => bde.name).join(", ")
    : "-"} */}
                            {project.BDEId?.name ?? "-"}
                          </td>
                          {/* <td className="px-3 py-2">{project.DeliveryType ?? "-"}</td> */}
                          <td className="px-3 py-2">
                            {project.DeliveryType ? (
                              <div className="flex justify-left">
                                <span
                                  className={`px-3 py-1 text-xs font-semibold rounded-sm ${project.DeliveryType === "BAU"
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
                                >
                                  {project.DeliveryType}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* <td className="px-3 py-2">{project.Frequency ?? "-"}</td> */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            {project.Status ? (
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
                                {project.Status}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td className="px-3 py-2">
                            <button
                              onClick={() =>
                                navigate(`/projects/${project._id}/attachments`)
                              }
                              className="text-blue-600 hover:underline cursor-pointer"
                            >
                              View Files
                            </button>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {project.ProjectType ?? "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {project.CreatedBy?.name ?? "-"}
                          </td>
                          <td className="px-3 py-2">
                            {/* {new Date(project.CreatedDate).toLocaleDateString() ?? "-"} */}
                            {project.CreatedDate
                              ? dayjs(project.CreatedDate).format("YYYY/MM/DD")
                              : "-"}
                          </td>
                          {user?.roleName !==
                            "Business Development Executive" && (
                              <td className="px-3 py-2">
                                <button
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setIsUpdateModalOpen(true);
                                    // openModal(project._id);
                                  }}
                                >
                                  <FaEdit
                                    size={20}
                                    className="text-blue-600 hover:text-blue-800"
                                  />
                                </button>
                              </td>
                            )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="text-center p-8 text-gray-500"
                        >
                          <div className="flex flex-col items-center justify-center gap-3">
                            <img
                              src={Img}
                              alt="No data"
                              className="w-32 h-32 object-contain opacity-80"
                            />
                            <p className="font-semibold text-lg text-gray-600">
                              No Data Found
                            </p>
                            <p className="text-sm text-gray-400">
                              Try adding new projects to see them here.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <UpdateProjectModal
                  isOpen={isUpdateModalOpen}
                  // onClose={() => setIsUpdateModalOpen(false)}
                  onClose={() => {
                    setIsUpdateModalOpen(false);
                    // closeModal();
                  }}
                  project={selectedProject}
                  onUpdate={handleUpdateProject}
                />
                {/* {isUpdateModalOpen && (
        <UpdateProjectModal
          isOpen={isUpdateModalOpen}
          project={selectedProject}
          onClose={() => setIsUpdateModalOpen(false)}
        />
      )} */}
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
                  <span className="text-gray-700">1 to {currentPage * entries} of {totalDocs} Entries</span>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  // totalDocs={totalDocs}
                  entries={entries}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </>
        )}

        {/* ==========SALES Department Table End========== */}

        {user.department !== "Sales" && (
          <div className="flex flex-col">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-100">
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
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="text-center p-4 text-gray-500"
                      >
                        <div className="flex justify-center items-center">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((project, idx) => (
                      <tr
                        key={project._id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-3 py-2">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td
                          className="px-3 py-2 whitespace-nowrap text-blue-700 cursor-pointer hover:underline"
                          onClick={() =>
                            navigate(`/projects/${project._id}/details`)
                          }
                        >
                          {project.ProjectCode ?? "-"}{" "}
                          {project.ProjectName ?? "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {project.Feeds?.length ?? 0}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {project.IndustryType ?? "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {project.PMId?.name ?? "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {project.BDEId?.name ?? "-"}
                        </td>
                        {/* <td className="px-3 py-2">{project.DeliveryType ?? "-"}</td> */}
                        <td className="px-3 py-2">
                          {project.DeliveryType ? (
                            <div className="flex justify-left">
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-sm ${project.DeliveryType === "BAU"
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
                              >
                                {project.DeliveryType}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        {/* <td className="px-3 py-2">{project.Frequency ?? "-"}</td> */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          {project.Status ? (
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
                              {project.Status}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="px-3 py-2">
                          <button
                            onClick={() =>
                              navigate(`/projects/${project._id}/attachments`)
                            }
                            className="text-blue-600 hover:underline cursor-pointer"
                          >
                            View Files
                          </button>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {project.ProjectType ?? "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {project.CreatedBy?.name ?? "-"}
                        </td>
                        <td className="px-3 py-2">
                          {project.CreatedDate
                            ? dayjs(project.CreatedDate).format("YYYY/MM/DD")
                            : "-"}
                        </td>

                        {user.roleName === "Manager" && (

                          <td className="px-4 py-2">
                            <div className="flex items-center space-x-2">
                              {canAssignProject && !isAssigned(project) && (
                                <button
                                  className="px-3 py-1 rounded text-sm text-white bg-blue-600 hover:bg-blue-700"
                                  onClick={() => {
                                    setSelectedProject(project);

                                    if (user.roleName === "Manager") {
                                      setSelectedTL(project.TLId?._id || "");
                                      setSelectedPC(project.PCId?._id || "");
                                      setSelectedQA(project.QAId?._id || "");
                                      setSelectedBauPerson(project.BAUPersonId?._id || "");
                                    }


                                    setIsAssignOpen(true);
                                  }}
                                >
                                  Assign
                                </button>
                              )}

                              {/* ✅ Show "Edit" only if some members are already assigned */}
                              {(project.TLId || project.PCId || project.QAId || project.BAUPersonId) && (
                                <button
                                  className="px-3 py-1 rounded text-sm flex items-center justify-center text-blue-600 hover:text-blue-800 transition"
                                  onClick={() => {
                                    setSelectedProject(project);

                                    // Prefill current assignments before opening modal
                                    setSelectedTL(project.TLId?._id || project.TLId || "");
                                    setSelectedPC(project.PCId?._id || project.PCId || "");
                                    setSelectedQA(project.QAId?._id || project.QAId || "");
                                    setSelectedBauPerson(
                                      project.BAUPersonId?._id || project.BAUPersonId || ""
                                    );

                                    setIsAssignOpen(true);
                                  }}
                                >
                                  <FaEdit size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="text-center p-8 text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center gap-3">
                          <img
                            src={Img}
                            alt="No data"
                            className="w-32 h-32 object-contain opacity-80"
                          />
                          <p className="font-semibold text-lg text-gray-600">
                            No Data Found
                          </p>
                          <p className="text-sm text-gray-400">
                            Try adding new projects to see them here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <UpdateProjectModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                project={selectedProject}
                onUpdate={handleUpdateProject}
              />
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
                <span className="text-gray-700">1 to {currentPage * entries} of {totalDocs} Entries</span>
                {/* <span className="text-gray-700">Entries</span> */}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                // totalDocs={totalDocs}
                entries={entries}
                // totalDocs={totalDocs}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
        <Modal
          isOpen={isAssignOpen}
          onRequestClose={() => setIsAssignOpen(false)}
          className="w-full max-w-3xl bg-white rounded-2xl mx-auto my-20 p-8 outline-none shadow-2xl relative animate-fadeIn"
          overlayClassName="fixed inset-0 bg-black/20 flex items-start justify-center z-50 overflow-auto"
        >
          {/* ✨ Header */}
          <div className="flex justify-between items-center pb-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              Assign Project
              {/* <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm">Assign Project</span> */}
            </h2>
            <button
              className="text-gray-400 hover:text-gray-600 transition"
              onClick={() => setIsAssignOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* 📄 Project Information */}
          {selectedProject && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500">Project Code</p>
                <p className="text-lg font-semibold text-gray-800">
                  {selectedProject.ProjectCode || "-"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500">Project Name</p>
                <p className="text-lg font-semibold text-gray-800">
                  {selectedProject.ProjectName || "-"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500">Priority</p>
                <p
                  className={`inline-block px-2 py-1 rounded text-sm font-medium ${selectedProject.Priority === "High"
                    ? "bg-red-100 text-red-700"
                    : selectedProject.Priority === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                    }`}
                >
                  {selectedProject.Priority || "-"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500">Project Type</p>
                <p className="text-lg font-semibold text-gray-800">
                  {selectedProject.ProjectType || "-"}
                </p>
              </div>

              {/* Feeds Table */}
              <div className="overflow-x-auto md:col-span-2">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-100 text-gray-700 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">No.</th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Feed ID
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Feed Name
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Platform
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProject.Feeds &&
                      selectedProject.Feeds.length > 0 ? (
                      selectedProject.Feeds.map((feed, idx) => (
                        <tr
                          key={feed._id || idx}
                          className="border-t border-gray-200"
                          onClick={() => navigate(`/projects/feed/${feed._id}`)}
                        >
                          <td className="px-4 py-2">{idx + 1}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {feed.FeedId}
                          </td>
                          <td
                            className="px-4 py-2 text-blue-600 cursor-pointer hover:underline whitespace-nowrap"
                          // onClick={() => navigate(`/projects/feed/${feed._id}`)}
                          >
                            {feed.FeedName}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {feed.Platform ?? "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="px-4 py-6 text-center text-gray-500"
                          colSpan={4} // total number of columns
                        >
                          No Data Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

              </div>
            </div>
          )}

          {/* Assignment Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            {/* TL Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Team Lead <span className="text-red-500">*</span>
              </label>
              <Select
                value={
                  tlOptions
                    .map((tl) => ({ value: tl._id, label: tl.name }))
                    .find((opt) => opt.value === selectedTL) || null
                }
                onChange={(selected) => {
                  setSelectedTL(selected?.value || ""); // keep your existing logic
                  setErrors((prev) => ({ ...prev, TLId: null })); // clear error dynamically
                }}
                options={tlOptions.map((tl) => ({
                  value: tl._id,
                  label: tl.name,
                }))}
                placeholder="Select Team Lead"
                isSearchable
                className="text-sm"
              />
              {errors.TLId && (
                <p className="text-red-500 text-xs mt-1">{errors.TLId}</p>
              )}
            </div>

            {/* PC Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Coordinator<span className="text-red-500">*</span>
              </label>
              <Select
                value={
                  pcOptions
                    .map((pc) => ({ value: pc._id, label: pc.name }))
                    .find((opt) => opt.value === selectedPC) || null
                }
                onChange={(selected) => {
                  setSelectedPC(selected?.value || "");
                  setErrors((prev) => ({ ...prev, PCId: null }));
                }}
                options={pcOptions.map((pc) => ({
                  value: pc._id,
                  label: pc.name,
                }))}
                placeholder="Select Project Coordinator"
                isSearchable
                className="text-sm"
              />
              {errors.PCId && (
                <p className="text-red-500 text-xs mt-1">{errors.PCId}</p>
              )}
            </div>

            {/* QA Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                QA Lead<span className="text-red-500">*</span>
              </label>
              <Select
                value={
                  qaOptions
                    .map((qa) => ({ value: qa._id, label: qa.name }))
                    .find((opt) => opt.value === selectedQA) || null
                }
                onChange={(selected) => {
                  setSelectedQA(selected?.value || "");
                  setErrors((prev) => ({ ...prev, QAId: null }));
                }}
                options={qaOptions.map((qa) => ({
                  value: qa._id,
                  label: qa.name,
                }))}
                placeholder="Select QA Lead"
                isSearchable
                className="text-sm"
              />
              {errors.QAId && (
                <p className="text-red-500 text-xs mt-1">{errors.QAId}</p>
              )}
            </div>

            {/* QA Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                BAU Person<span className="text-red-500">*</span>
              </label>
              <Select
                value={
                  bauPersonOptions
                    .map((bau) => ({ value: bau._id, label: bau.name }))
                    .find((opt) => opt.value === selectedBauPerson) || null
                }
                onChange={(selected) => {
                  setSelectedBauPerson(selected?.value || "");
                  setErrors((prev) => ({ ...prev, BAUPersonId: null }));
                }}
                options={bauPersonOptions.map((bau) => ({
                  value: bau._id,
                  label: bau.name,
                }))}
                placeholder="Select BAU Person"
                isSearchable
                className="text-sm"
              />
              {errors.BAUPersonId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.BAUPersonId}
                </p>
              )}
            </div>

            {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    BAU Person
                  </label>
                  <select
                    value={selectedBauPerson}
                    onChange={(e) => setSelectedBauPerson(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm transition"
                  >
                    <option value="" hidden>Select BAU Person</option>
                    {bauPersonOptions.map((bauPerson) => (
                      <option key={bauPerson._id} value={bauPerson._id}>{bauPerson.name}</option>
                    ))}
                  </select>
                </div> */}

          </div>

          {/* 🧭 Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
              onClick={() => setIsAssignOpen(false)}
            >
              Cancel
            </button>
            <button
              className="cursor-pointer px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-md transition"
              onClick={handleAssign}
            >
              Assign
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
}
