import React, { useState, useEffect } from "react";
import { FaFilePdf, FaFileCsv } from "react-icons/fa6";
import { RiFileExcel2Fill } from "react-icons/ri";
import { LuFileJson } from "react-icons/lu";
import { ToastContainer
  , toast
 } from "react-toastify";


import flattenObject from "../utils/flattenObject";
import Pagination from '../components/Pagination';
import Img from '../assets/no-data-found.svg'
import { exportData } from '../utils/exportUtils'
import EscalationModel from '../components/EscalationModel'
import Model from "../components/CreateEscalations";
import { useAuth } from "../hooks/useAuth";

const tabs = [
  "My Escalations",
  "Escalation By Me",
  "My Watcher"
];

export default function Escalations() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("My Escalations");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchEscalations = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/escalations`,
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

    fetchEscalations();
  }, []);

  // Filter data based on search
  const filteredData = data.filter(row =>
    columns.some(col =>
      String(row[col] ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  // Calculate total pages based on filtered data and entries per page
  const totalPages = Math.ceil(filteredData.length / entries) || 1;

  // Reset currentPage if out of range after entries or filteredData changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [entries, filteredData.length, currentPage, totalPages]);

  // Paginate filtered data
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

          <button
            className="ml-auto bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded transition"
            onClick={() => setIsModelOpen(true)}
          >
            + Add Escalation
          </button>
        </div>

        {isModelOpen && (
          <Model isOpen={isModelOpen} onClose={() => setIsModelOpen(false)}
          onSuccess={() => toast.success("Escalation created successfully")}
          onError={(err) => toast.error(err)}
          />
        )}

        {/* Controls: Show entries + Search + Export */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-3">
          {/* Show entries */}
          <div className="flex items-center space-x-2">
            <label htmlFor="entries" className="text-gray-700">Show</label>
            <select
              id="entries"
              value={entries}
              onChange={(e) => setEntries(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-gray-700">entries</span>
          </div>

          {/* Search + export */}
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
              <svg
                className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </div>

            {/* Export icons */}
            <button title="PDF"
              onClick={() => exportData("pdf", filteredData, "escalations-data")}
            ><FaFilePdf size={16} className='text-red-700' /></button>
            <button title="Excel"
              onClick={() => exportData("excel", filteredData, "escalations-data")}
            ><RiFileExcel2Fill size={16} className='text-green-600' /></button>
            <button title="CSV"
              onClick={() => exportData("csv", filteredData, "escalations-data")}
            ><FaFileCsv size={16} className='text-blue-600' /></button>
            <button title="JSON"
              onClick={() => exportData("json", filteredData, "escalations-data")}
            ><LuFileJson size={16} className='text-yellow-500' /></button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50 text-gray-700">
    <tr>
      {[
        
        "Title",
        "Project",
        "Feed",
        "Description",
        "Status",
        "Assigned By",
        "Assigned To",
        "Department From",
        "Department To",
        "Created Date",
        "Watchers",
      ].map((col) => (
        <th
          key={col}
          className="px-3 py-2 text-left font-semibold whitespace-nowrap"
        >
          {col.replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </th>
      ))}
    </tr>
  </thead>

  <tbody>
    {loading ? (
      <tr>
        <td
          colSpan={11} // total columns
          className="text-center p-8 text-gray-500"
        >
          <div className="flex justify-center items-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-600"></div>
          </div>
        </td>
      </tr>
    ) : paginatedData.length > 0 ? (
      paginatedData.map((row, idx) => (
        <tr
          key={idx}
          onClick={() => {
            setSelectedId(row._id);
            setIsEscalationModalOpen(true);
          }}
          className={`cursor-pointer transition ${
            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
          } hover:text-blue-600`}
        >
          {/* Static column rendering */}
          
          <td className="px-3 py-2 whitespace-nowrap">{row.Title ?? "-"}</td>
          
          <td className="px-3 py-2 whitespace-nowrap">{row.Project ?? "-"}</td>
          <td className="px-3 py-2 whitespace-nowrap">{row.Feed ?? "-"}</td>
          <td className="px-3 py-2 whitespace-nowrap">{row.Description ?? "-"}</td>
          <td className="px-3 py-2 whitespace-nowrap">{row.Status ?? "-"}</td>
          <td className="px-3 py-2 whitespace-nowrap">{row["Assigned By"] ?? "-"}</td>
          <td className="px-3 py-2 whitespace-nowrap">{row["Assigned To"] ?? "-"}</td>
          <td className="px-3 py-2 whitespace-nowrap">{row["Department From"] ?? "-"}</td>
          <td className="px-3 py-2 whitespace-nowrap">{row["Department To"] ?? "-"}</td>
          <td className="px-3 py-2 whitespace-nowrap">
            {row["Created Date"]
              ? new Date(row["Created Date"]).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "-"}
          </td>
          <td className="px-3 py-2 whitespace-nowrap">
            {Array.isArray(row.Watcher) ? row.Watcher.join(", ") : row.Watcher ?? "-"}
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={11} className="text-center p-8 text-gray-500">
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

      </div>

      <EscalationModel
        isOpen={isEscalationModalOpen}
        onClose={() => setIsEscalationModalOpen(false)}
        onSuccess= {() => toast.success("Escalation updated successfully!")}
        id={selectedId}
      />

    </>
  );
}
