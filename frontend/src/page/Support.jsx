import React, { useState, useMemo, useEffect } from "react";
import { FaFilePdf, FaFileCsv } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { RiFileExcel2Fill } from "react-icons/ri";
import { LuFileJson } from "react-icons/lu";
import { ToastContainer, toast } from "react-toastify";
import Pagination from "../components/Pagination";
import Img from '../assets/no-data-found.svg'
import flattenObject from "../utils/flattenObject";
import Model from "../components/CreateTicket";
import { useAuth } from "../hooks/useAuth";

export default function SupportTicket() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("My Ticket");
  const [activeStatus, setActiveStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabs = ["My Ticket", "My Watcher"];



  // Fetch tickets data
  useEffect(() => {
    const fetchdata = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/tickets`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const rawData = await res.json();

        // Flatten nested objects
        const flattenedData = rawData.map(item => flattenObject(item));
        setData(flattenedData);

        // Collect unique keys as table columns
        const allKeys = new Set();
        flattenedData.forEach(row => {
          Object.keys(row).forEach(k => allKeys.add(k));
        });

        // Remove unwanted Mongo keys
        setColumns(
          [...allKeys].filter(k => !["_id", "__v", "createdAt", "updatedAt"].includes(k))
        );

      } catch (err) {
        console.error("Error fetching escalations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchdata();
  }, []);

  const statusFilters = [
    "All",
    "Pending",
    "In Progress",
    "Resolved",
    "Declined",
    "Escalated",
    "Closed",
    "Not Resolved",
    "Reopen",
  ];

  // Filter data based on search and activeStatus
  const filteredData = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    // Filter by status first
    const statusFiltered = data.filter((t) =>
      activeStatus === "All" || (t.status && t.status.toLowerCase() === activeStatus.toLowerCase())
    );

    // Then filter by search across all columns
    return statusFiltered.filter((row) =>
      columns.some((col) =>
        String(row[col] ?? "").toLowerCase().includes(searchLower)
      )
    );
  }, [data, columns, activeStatus, search]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / entries) || 1;

  // Reset currentPage if out of range
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [entries, filteredData.length, currentPage, totalPages]);

  // Paginate filtered data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * entries,
    currentPage * entries
  );

  const canCreateTicket = user?.permissions?.some(
    (perm) => perm.module === "Support" && perm.actions.includes("create")
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
        <div className="bg-yellow-50 p-4 mb-6">
          <h1 className="text-xl md:text-xl font-bold text-gray-800 mb-2">
            Support Tickets
          </h1>
        </div>
        {/* Tabs */}
        <div className="bg-gray-100 px-2 py-2 rounded-md mb-4 flex flex-wrap gap-1 select-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded font-medium ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
          {canCreateTicket && (

            <button className="ml-auto bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded transition"
              onClick={() => setIsModalOpen(true)}
            >
              + New Ticket
            </button>
          )}
        </div>

        {isModalOpen && (
          <Model isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
            onSuccess={() => toast.success(msg)}
            onError={() => toast.error(error)} />    
        )}


        {/* Status Filters */}
        <div className="border-b border-gray-200 mb-4 overflow-x-auto whitespace-nowrap">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`inline-block px-4 py-2 text-xs font-medium transition-colors duration-200
                  ${activeStatus === status
                  ? "border-b-2 border-purple-800 text-purple-800"
                  : "text-gray-500"
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search & Export */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-4">
          {/* Show entries */}
          <div className="flex items-center space-x-2">
            <label htmlFor="entries" className="text-gray-700 text-sm">
              Show
            </label>
            <select
              id="entries"
              value={entries}
              onChange={(e) => {
                const val = Number(e.target.value);
                setEntries(val);
                // setPageSize(val);
              }}
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

          {/* Search and Export */}
          <div className="flex items-center space-x-3">
            {/* Search */}
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

            {/* Export icons */}
            <FaFilePdf size={16} className="text-red-700 cursor-pointer" title="PDF" />
            <RiFileExcel2Fill size={16} className="text-green-600 cursor-pointer" title="Excel" />
            <FaFileCsv size={16} className="text-blue-600 cursor-pointer" title="CSV" />
            <LuFileJson size={16} className="text-yellow-500 cursor-pointer" title="JSON" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-gray-700">
              <tr

              >
                {columns.map(col => (
                  <th key={col} className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                    {col.replace(/\./g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center p-8 text-gray-500"
                  >
                    <div className="flex justify-center items-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                      {/* <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span> */}
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <tr key={idx}

                    onClick={() => console.log("Row clicked:", row)}
                    className={`cursor-pointer transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:text-blue-600`}
                  >
                    {columns.map(col => (
                      <td key={col} className="px-3 py-2 whitespace-nowrap">
                        {Array.isArray(row[col]) ? row[col].join(", ") : row[col] ?? "-"}
                      </td>
                    ))}
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
                        Try adjusting your filters or adding new entries.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

    </>
  );
}
