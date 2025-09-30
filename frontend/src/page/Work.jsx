import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFilePdf, FaFileCsv } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { RiFileExcel2Fill } from "react-icons/ri";
import { LuFileJson } from "react-icons/lu";
import { useAuth } from "../hooks/useAuth";
import Pagination from "../components/Pagination";
import Img from "../assets/no-data-found.svg";

export default function WorkReport() {
  const {user } = useAuth();
  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [project, setProject] = useState("");
  const [feed, setFeed] = useState("");
  const [taskType, setTaskType] = useState("");
  // const [task, setTask] = useState("");
  // const [assignedBy, setAssignedBy] = useState("");
  // const [date, setDate] = useState("");
   const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const [date, setDate] = useState(today);
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [report, setReport] = useState("");

  const naviagte = useNavigate();
  // ✅ Removed developer state, backend will use logged-in user
  // const [developer, setDeveloper] = useState("");

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/work/me`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result = await res.json();

    
       const formatted = result.map((item) => ({
  name: item.name?.name || "-",       // populated user name
  taskType: item.taskType,
  project: item.project,
  feed: item.feed,
  // task: item.task,
  // assignedBy: item.assignedBy,
  date: item.date
    ? new Date(item.date).toISOString().split("T")[0]
    : "-",
  timetaken: `${item.hours || 0}h ${item.minutes || 0}m`,
  description: item.description
}));

      setData(formatted);
      setColumns(Object.keys(formatted[0] || {}));
    } catch (err) {
      naviagte("*",err);
      // console.error("Error fetching work reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Add report handler
  const handleAdd = async () => {
    if (!project || !feed || !taskType || !date || !hours || !minutes) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      project,
      feed,
      taskType,
      // task,
      // assignedBy,
      date,
      hours: Number(hours),
      minutes: Number(minutes),
      description: report,
      // ✅ no need to send name/roleId/departmentId manually
      // backend will attach from req.user
    };

    try {
      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/work/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to add report");

      await fetchReports(); // refresh list
      // reset form
      setProject("");
      setFeed("");
      setTaskType("");
      // setTask("");
      // setAssignedBy("");
      // setDate("");
      setHours("00");
      setMinutes("00");
      setReport("");
    } catch (err) {
      console.error(err);
      alert("Error adding report.");
    }
  };

  // Filter data by search
  const filteredData = data.filter((item) => {
    const searchLower = search.toLowerCase();
    return Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchLower);
  });

  const totalPages = Math.ceil(filteredData.length / entries) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * entries,
    currentPage * entries
  );

  const canAddReport = user?.permissions?.some(
    (perm) => perm.module === "Work" && perm.actions.includes("add work report")
  );

  return (
    <>
      <div className="px-4 pt-4">
        {/* Form */}
        <div className="bg-gray-50 backdrop-blur-lg p-4 mb-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 w-full md:w-[90%]">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                required
                  className="p-2 rounded bg-white/80 w-full"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                >
                  <option value="">Select Project</option>
                  <option value="Flipkart product extraction">
                    Flipkart product extraction
                  </option>
                  <option value="Wallmart product extraction">
                    Wallmart product extraction
                  </option>
                  <option value="Amazon product extraction">
                    Amazon product extraction
                  </option>
                  <option value="General"> General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feed <span className="text-red-500">*</span>
                </label>
                <select
                  className="p-2 rounded bg-white/80 w-full"
                  required
                  value={feed}
                  onChange={(e) => setFeed(e.target.value)}
                >
                  <option value="">Select Feed</option>
                  <option value="Flipkart">Flipkart</option>
                  <option value="Wallmart">Wallmart</option>
                  <option value="Amazon">Amazon</option>
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Type 
                </label>
                <select
                  className="p-2 rounded bg-white/80 w-full"
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="New Development">New Development</option>
                  <option value="R&D">R&D</option>
                  <option value="Operation">Operation</option>
                  <option value="BAU">BAU</option>
                </select>
              </div>
{/* Taskkkkkkk*/}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task <span className="text-red-500">*</span>
                </label>
                <select
                  className="p-2 rounded bg-white/80 w-full"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                >
                  <option value="">Select Task</option>
                  <option value="collect cookie from twitter">
                    collect cookie from twitter
                  </option>
                  <option value="collect cookie from facebook">
                    collect cookie from facebook
                  </option>
                </select>
              </div> */}
{/* Asssigned By */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned By <span className="text-red-500">*</span>
                </label>
                <select
                  className="p-2 rounded bg-white/80 w-full"
                  value={assignedBy}
                  onChange={(e) => setAssignedBy(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Krushill Gajjar">Krushill Gajjar</option>
                  <option value="Drupad">Drupad Panchal </option>
                </select>
              </div> */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                 Developer
                </label>
                <select
                  className="p-2 rounded bg-white/80 w-full"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Aakanksha Chahal">Aakanksha Chahal</option>
                  <option value="Vivek">Vivek</option>
                </select>
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                  <input
        type="date"
        className="p-2 rounded bg-white/80 w-full"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        max={today} // disables future dates
      />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours
                </label>
                <select
                required
                  className="p-2 rounded bg-white/80 w-full"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, "0")}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minutes
                </label>
                <select
                required
                  className="p-2 rounded bg-white/80 w-full"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, "0")}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Description<span className="text-red-500">*</span>
  </label>
  <textarea
    required
    minLength={4}
    maxLength={400}
    rows={4}
    columns={200}
    className="p-2 rounded bg-white/80 w-[500px] resize-y"
    value={report}
    onChange={(e) => setReport(e.target.value)}
  />
</div>
            </div>

            <div className="mt-6 md:mt-0 md:w-[10%] flex justify-end">
              {canAddReport && (
                
              <button
                onClick={handleAdd}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
              >
                + Add
              </button>
              )}
            </div>
          </div>
        </div>

        {/* Table + Pagination */}
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
                setEntries(Number(e.target.value));
                setCurrentPage(1);
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

          {/* Search + Export */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded pl-8 pr-3 py-1"
              />
              <FaSearch className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <button title="PDF" onClick={() => alert("PDF clicked")}>
              <FaFilePdf size={16} className="text-red-700" />
            </button>
            <button title="Excel" onClick={() => alert("Excel clicked")}>
              <RiFileExcel2Fill size={16} />
            </button>
            <button title="CSV" onClick={() => alert("CSV clicked")}>
              <FaFileCsv size={16} className="text-blue-600" />
            </button>
            <button title="JSON" onClick={() => alert("JSON clicked")}>
              <LuFileJson size={16} className="text-yellow-500" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                  >
                    {col
                      .replace(/\./g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
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
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } `}
                  >
                    {columns.map((col) => (
                      <td key={col} className="px-3 py-2 whitespace-nowrap">
                        {row[col] ?? "-"}
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
