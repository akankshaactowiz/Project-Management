import React, { useState, useEffect } from "react";
import { FaFilePdf, FaFileCsv } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { RiFileExcel2Fill } from "react-icons/ri";
import { LuFileJson } from "react-icons/lu";
import { toast } from "react-hot-toast";

import Pagination from "../components/Pagination";
import Img from "../assets/no-data-found.svg";
import flattenObject from "../utils/flattenObject";
import Model from "../components/CreateTask";
import { useAuth } from "../hooks/useAuth";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function TaskPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("My task");
  const [activeStatus, setActiveStatus] = useState("All");
  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [taskData, setTaskData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Static columns
  const columns = [
    "No",
    "Task ID",
    "Task", //Task name will be Project Code + Task title
    "Project", //Related To will be Project name
    "Assigned Date", // date + time   
    "Status",
    "Due Date", // date + time
    "Priority",
    "Assigned To",
    "Assigned By",
    "Completed Date",
    "Time Taken",
    "Last Updated",
    "Actions",
  ];

  const columnKeyMap = {
    "Title": "title",
    "Department": "department",
    "Related To": "relatedTo",
    "Task Type": "taskType",
    "Task Priority": "taskPriority",
    "Task Status": "taskStatus",
    "Feed": "feed",
    "Assigned To": "assignedTo",
    "Assigned By": "assignedBy",
    "Estimate Start Date": "estimateStartDate",
    "Estimate End Date": "estimateEndDate",
    "Watcher": "watcher"
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/tasks`,
          {
            credentials: "include",
          } 
        );
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        // const flattenedData = data.map((item) => flattenObject(item));
        // setTaskData(flattenedData);
      } catch (err) {
        console.error("Error fetching task data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Tabs
  const tabs = ["My task", "Assigned by me", "Watchers"];
  const statusTabs = [
    "All",
    "New",
    "In Progress",
    "Completed",
    "Declined",
    "On Hold",
    "Terminated",
    "Recurring",
    "Closed",
    "Reopen",
  ];
  const Priority = ["Low","High", "Medium"];

  // Permissions
  const canCreateTask = user?.permissions?.some(
    (perm) => perm.module === "Tasks" && perm.actions.includes("create")
  );

  // Filtering
  // useEffect(() => {
  //   if (currentPage > totalPages) setCurrentPage(1);
  // }, [entries, filteredData.length, currentPage, totalPages]);

  // const paginatedData = filteredData.slice(
  //   (currentPage - 1) * entries,
  //   currentPage * entries
  // );

  return (
    <>
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between mt-4">
    {/* Heading */}
    <h2 className="text-xl font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
      Tasks
    </h2>
</div>

{/* Controllers and Filters */}
<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
 
 {/* Left side: Search + Filters + Clear */}
  <div className="flex flex-wrap md:flex-nowrap items-center gap-3 flex-1">
    {/* Search */}
    <div className="flex-1 md:max-w-xs mt-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
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
      {/* TAsk */}
      <div className="flex flex-col">
<label className="text-sm font-medium text-gray-500 mb-1">
         
          Task

        </label>
  <select
    value={activeTab}
    onChange={(e) => setActiveTab(e.target.value)}
    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    {tabs.map((tab) => (
      <option key={tab} value={tab}>
        {tab}
      </option>
    ))}
  </select>
</div>

      {/* Status Dropdown */}
<  div className="mb-4 mt-6">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Status
  </label>
  <select
    value={activeStatus}
    onChange={(e) => setActiveStatus(e.target.value)}
    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
  >
    {statusTabs.map((status) => (
      <option key={status} value={status}>
        {status}
      </option>
    ))}
  </select>
</div>

      </div>
      

      

      {/* Date */}
      {/* <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-500 mb-1">Date</label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none"
            value={filterDate ? dayjs(filterDate, "DD/MM/YYYY") : null}
            format="DD/MM/YYYY"
            onChange={(newValue) => {
              setFilterDate(newValue ? newValue.format("DD/MM/YYYY") : "");
              setCurrentPage(1);
            }}
            slotProps={{
              textField: { size: "small", sx: { "& .MuiInputBase-root": { fontSize: "0.875rem" } } },
            }}
          />
        </LocalizationProvider>
      </div> */}

      {/* Clear Button */}
      <button
        className="bg-gray-200 hover:bg-gray-300 text-gray-700  px-3 py-2 rounded text-sm transition mt-2 md:mt-6"
        // onClick={() => {
        //   setFilterDate("");
        //   setActiveStatus("");
        //   setActiveTab("");
        //   setActiveSalesTab("");
        //   setSalesActiveStatusTabs("");
        //   setSearch("");
        //   setCurrentPage(1);
        // }}
      >
        Clear
      </button>
    </div>

    <div className="flex flex-wrap md:flex-nowrap items-center mt-6 gap-3">
        {/* Export */}
        <div className="flex flex-col">
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
            <option value="" disabled hidden>Export</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>
    
       {/* Create Task Button */}
          {canCreateTask && (
            <button
              className="ml-auto bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded transition"
              onClick={() => setIsModalOpen(true)}
            >
              + Create Task
            </button>
          )}
      </div>
  </div>


        {isModalOpen && (
          <Model isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
            onSuccess={() => toast.success("Task created successfully")}
            onError={(err) => toast.error(err)}
          />
        )}



        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-4">
          {/* <div className="flex items-center space-x-2">
            <label htmlFor="entries" className="text-gray-700 text-sm">
              Show
            </label>
            <select
              id="entries"
              value={entries}
              onChange={(e) => setEntries(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-gray-700 text-sm">entries</span>
          </div> */}

          

            
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200" data={taskData}>
            <thead className="bg-gray-50 text-gray-700">
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
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center p-8 text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {columns.map((col) => {
                      let value = row[columnKeyMap[col]] ?? "-";

                      if (col === "Watcher" && Array.isArray(value)) {
                        value = value.join(", ");
                      }
                      // Format dates for specific columns
                      const isDateColumn = col === "Estimate Start Date" || col === "Estimate End Date";
                      const formattedValue = isDateColumn && value !== "-"
                        ? new Date(value).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })
                        : value;

                      return (
                        <td key={col} className="px-3 py-2 whitespace-nowrap">
                          {col === "Task Status" ? (
                            <span
                              className={`inline-flex items-center px-3 py-1 font-medium rounded-full ${value === "Complete"
                                  ? "bg-green-100 text-green-700 border border-green-300"
                                  : value === "In Progress"
                                    ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                    : value === "New"
                                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                                      : value === "Pending"
                                        ? "bg-orange-100 text-orange-700 border border-orange-300"
                                        : value === "Decline"
                                          ? "bg-red-100 text-red-700 border border-red-300"
                                          : value === "On Hold"
                                            ? "bg-purple-100 text-purple-700 border border-purple-300"
                                            : value === "Terminated"
                                              ? "bg-gray-100 text-gray-600 border border-gray-300"
                                              : value === "Recurring"
                                                ? "bg-teal-100 text-teal-700 border border-teal-300"
                                                : value === "Reopen"
                                                  ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                                                  : "bg-gray-100 text-gray-600 border border-gray-300"
                                }`}
                            >
                              {value}
                            </span>

                          ) : (
                            formattedValue
                          )}
                        </td>
                      );
                    })}
                  </tr>

                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center p-8 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <img src={Img} alt="No data" className="w-32 h-32 object-contain opacity-80" />
                      <p className="font-semibold text-lg text-gray-600">No Data Found</p>
                      <p className="text-sm text-gray-400">
                        Try adjusting your filters or adding new entries.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody> */}
          </table>
        </div>

        <Pagination
          // currentPage={currentPage}
          // // totalPages={totalPages}
          // onPageChange={setCurrentPage}
        />
      {/* </div> */}
    </>
  );
}
