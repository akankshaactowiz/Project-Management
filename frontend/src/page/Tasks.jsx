import React, { useState, useEffect } from "react";
import { FaFilePdf, FaFileCsv } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { RiFileExcel2Fill } from "react-icons/ri";
import { LuFileJson } from "react-icons/lu";
import { ToastContainer, toast } from "react-toastify";

import Pagination from "../components/Pagination";
import Img from "../assets/no-data-found.svg";
import flattenObject from "../utils/flattenObject";
import Model from "../components/CreateTask";
import { useAuth } from "../hooks/useAuth";

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
    "Title",
    "Department",
    "Related To",
    "Task Type",
    "Task Priority",
    "Task Status",
    "Feed",
    "Assigned To",
    "Assigned By",
    "Estimate Start Date",
    "Estimate End Date",
    "Watcher"
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
        const flattenedData = data.map((item) => flattenObject(item));
        setTaskData(flattenedData);
      } catch (err) {
        console.error("Error fetching task data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Tabs
  const tabs = ["My task", "Task assigned by me", "My Watcher"];
  const statusTabs = [
    "All",
    "New",
    "Pending",
    "In Progress",
    "Complete",
    "Decline",
    "On Hold",
    "Terminated",
    "Recurring",
    "Reopen",
  ];

  // Permissions
  const canCreateTask = user?.permissions?.some(
    (perm) => perm.module === "Tasks" && perm.actions.includes("create")
  );

  // Filtered & paginated data
  const filteredData = taskData.filter((task) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      task.no?.toLowerCase().includes(searchLower) ||
      task.project?.toLowerCase().includes(searchLower) ||
      task.task?.toLowerCase().includes(searchLower) ||
      task.assignedBy?.toLowerCase().includes(searchLower) ||
      task.assignedTo?.toLowerCase().includes(searchLower) ||
      task.taskStatus?.toLowerCase().includes(searchLower);

    const matchesStatus =
      activeStatus === "All" || task.taskStatus === activeStatus;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / entries) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [entries, filteredData.length, currentPage, totalPages]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * entries,
    currentPage * entries
  );

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="px-4 pt-2">
        {/* <div>
          <h1 className="text-xl font-bold mb-4">Tasks Table</h1>
        </div> */}
        {/* Tabs */}
        <div className="bg-gray-100 px-2 py-2 rounded-md mb-4 flex flex-wrap gap-1 select-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded font-medium ${activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}

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

        {isModalOpen && (
          <Model isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
            onSuccess={() => toast.success("Task created successfully")}
            onError={(err) => toast.error(err)}
          />
        )}

        {/* Status Tabs */}
        <div className="border-b border-gray-200 mb-4 overflow-x-auto whitespace-nowrap">
          {statusTabs.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`inline-block px-4 py-2 text-xs font-medium transition-colors duration-200 ${activeStatus === status
                  ? "border-b-2 border-purple-800 text-purple-800"
                  : "text-gray-500"
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-4">
          <div className="flex items-center space-x-2">
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
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 rounded pl-8 pr-3 py-1 text-sm"
              />
              <FaSearch className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <button title="PDF">
              <FaFilePdf size={16} className="text-red-700" />
            </button>
            <button title="Excel">
              <RiFileExcel2Fill size={16} className="text-green-600" />
            </button>
            <button title="CSV">
              <FaFileCsv size={16} className="text-blue-600" />
            </button>
            <button title="JSON">
              <LuFileJson size={16} className="text-yellow-500" />
            </button>
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
            <tbody>
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
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
