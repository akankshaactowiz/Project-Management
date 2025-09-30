import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFilePdf, FaFileCsv } from "react-icons/fa6";
import { RiFileExcel2Fill } from "react-icons/ri";
import { LuFileJson } from "react-icons/lu";
import { useAuth } from "../hooks/useAuth";
import QADashboard from '../components/QADashboard';
import Pagination from "../components/Pagination";
import Img from '../assets/no-data-found.svg';
import AssignQAModal from "../components/AssignToQa";
import ProjectTable from "../components/QAProjectsTable";

export default function QA() {
  const { user } = useAuth();
  const [isDashboard, setIsDashboard] = useState(false);
  const [qaData, setQaData] = useState([]);
  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Projects");

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState("All");
  const navigate = useNavigate();

  // Normalize keys helper
  const normalizeKeys = (obj) => {
    if (!obj) return {};
    const normalized = {};
    Object.keys(obj).forEach((key) => {
      const newKey = key.replace(/\u00A0/g, " ");
      normalized[newKey] = obj[key];
    });
    return normalized;
  };

  // Fetch QA data
  // const fetchQAData = async () => {
  //   try {
  //     setLoading(true);
  //     const params = new URLSearchParams({
  //       page: currentPage.toString(),
  //       pageSize: entries.toString(),
  //       search: search || "",
  //     });

  //     const res = await fetch(
  //       `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects?${params.toString()}`,
  //       { credentials: "include" }
  //     );
  //     const result = await res.json();
  //     if (res.ok) {
  //       const mappedData = result.data.map((item) => {
  //         const latestQaHistory = item.history
  //           ?.filter(h => h.toStatus.startsWith("qa"))
  //           .slice(-1)[0] || {};

  //         return {
  //           ...item,
  //           feedId: normalizeKeys(item),
  //           latestQaReport: item.qaReports?.slice(-1)[0] || {},
  //           latestQaHistory,
  //         };
  //       });
  //       setQaData(mappedData);
  //       setTotalPages(Math.ceil(result.total / result.pageSize) || 1);
  //     } else {
  //       console.error("Failed to fetch QA data:", result.message);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching QA data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // const fetchQAData = async () => {
  //   try {
  //     setLoading(true);
  //     const params = new URLSearchParams({
  //       date_range: activeTab.toLowerCase().replace(" ", "_"),
  //       page: currentPage.toString(),
  //       pageSize: entries.toString(),
  //       qaStatus,
  //       Status,
  //       status: activeStatus !== "All" ? activeStatus : "",
  //       search: search || "",
  //     });

  //     const res = await fetch(
  //       `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/assigned-to-qa?${params.toString()}`,
  //       { credentials: "include" }
  //     );

  //     const result = await res.json();
  //     if (res.ok) {
  //       const mappedData = result.data.map((item) => {
  //         const latestQaHistory = item.history
  //           ?.filter(h => h.toStatus && h.toStatus.startsWith("qa"))
  //           .slice(-1)[0] || {};

  //         return {
  //           ...item,
  //           feedId: normalizeKeys(item),
  //           latestQaReport: item.qaReports?.slice(-1)[0] || {},
  //           latestQaHistory,
  //         };
  //       });

  //       setQaData(mappedData);
  //       setTotalPages(Math.ceil(result.total / result.pageSize) || 1);
  //     } else {
  //       console.error("Failed to fetch QA data:", result.message);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching QA data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchQAData = async () => {
    try {
      setLoading(true);

      // Only send relevant query params; backend handles QAStatus and Status
      const params = new URLSearchParams({
        // status: activeStatus !== "All" ? activeStatus : "",
        date_range: activeTab.toLowerCase().replace(" ", "_"),
        page: currentPage.toString(),
        pageSize: entries.toString(),
        search: search || "",
        status: activeStatus !== "All" ? activeStatus : "",
      });

      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/assigned-to-qa?${params.toString()}`,
        { credentials: "include" }
      );

      const result = await res.json();

      if (res.ok) {
        const mappedData = result.data.map((item) => {
          const latestQaHistory =
            item.history?.filter(h => h.toStatus && h.toStatus.startsWith("qa")).slice(-1)[0] || {};

          return {
            ...item,
            feedId: normalizeKeys(item),
            latestQaReport: item.qaReports?.slice(-1)[0] || {},
            latestQaHistory,
          };
        });

        setQaData(mappedData);
        setTotalPages(Math.ceil(result.total / result.pageSize) || 1);
      } else {
        console.error("Failed to fetch QA data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching QA data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch whenever relevant state changes
  useEffect(() => { fetchQAData(); }, [currentPage, entries, search, activeTab, activeStatus]);


  //   useEffect(() => {
  //   const statusMap = {};
  //   qaData.forEach((item) => {
  //     if (item.qaStatus) statusMap[item._id] = item.qaStatus;
  //   });
  //   setSelectedStatus(statusMap);
  // }, [qaData]);  // make sure dependency matches

  // useEffect(() => { fetchQAData(); }, [currentPage, entries, search,  activeTab, activeStatus]);

  const tabs = [
    "Projects", "Today", "Tomorrow", "Yesterday", "This Week",
    "Last Week", "Next Week", "This Month", "Next Month", "Last Month", "Date",
  ];

  const statusTabs = [
    { key: "All", label: "All" },
    // { key: "New", label: "New" },
    { key: "assigned_to_qa", label: "Assigned to QA" },
    { key: "qa_open", label: "Open" },
    { key: "qa_passed", label: "QA Passed" },
    { key: "qa_failed", label: "QA Failed" },
    // { key: "completed", label: "Completed" },
  ];

  return (
    <div className="p-2">
      {/* Tabs */}
      <div className="bg-gray-100 px-2 py-2 rounded-md mb-4 flex flex-wrap gap-1 select-none">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded font-medium ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"}`}
          >
            {tab}
          </button>
        ))}
      </div>


      {/* Status tabs */}
      <div className="border-b border-gray-200 mb-4 overflow-x-auto whitespace-nowrap">
        {statusTabs.map((status) => (
          <button
            key={status.key}
            onClick={() => setActiveStatus(status.key)}
            className={`inline-block px-4 py-2 text-xs font-medium transition-colors duration-200 ${activeStatus === status.key ? "border-b-2 border-purple-800 text-purple-800" : "text-gray-500"
              }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Toggle Buttons */}
      <div className="inline-flex justify-end w-full mb-2">
        <div className="rounded-full border border-purple-800 shadow-md">
          {["Feed View", "QA Dashboard"].map((label) => (
            <button
              key={label}
              onClick={() => setIsDashboard(label === "QA Dashboard")}
              className={`px-4 py-2 font-medium transition-colors duration-200 ${isDashboard === (label === "QA Dashboard") ? "bg-purple-800 text-white" : "text-purple-600"} rounded-full`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isDashboard ? (
        <QADashboard />
      ) : (
        <>


          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
            <div className="flex items-center space-x-2">
              <label>Show</label>
              <select
                value={entries}
                onChange={(e) => { setEntries(Number(e.target.value)); setCurrentPage(1); }}
                className="border rounded px-2 py-1"
              >
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>entries</span>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="border border-gray-300 rounded pl-3 pr-2 py-1 text-sm"
              />
              {/* Export buttons */}
              <FaFilePdf size={16} className="text-red-700 cursor-pointer" />
              <RiFileExcel2Fill size={16} className="text-green-600 cursor-pointer" />
              <FaFileCsv size={16} className="text-blue-600 cursor-pointer" />
              <LuFileJson size={16} className="text-yellow-500 cursor-pointer" />
            </div>
          </div>
         
         {user?.roleName !== "Developer" &&  user?.department !== "QA" && (
            <div className="max-h-[400px] overflow-x-auto border border-gray-50">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-gray-700">
                  <tr className="text-center">
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Project Name</th>
                    <th className="px-4 py-2">PM</th>
                    <th className="px-4 py-2">TL</th>
                    <th className="px-4 py-2">Developer</th>
                    <th className="px-4 py-2">Frequency</th>
                    <th className="px-4 py-2">Platform</th>
                    <th className="px-4 py-2">QA Status</th>
                    <th className="px-4 py-2">Assigned File Path</th>
                    <th className="px-4 py-2">QA Report</th>
                    {/* <th className="px-4 py-2">Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-500">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
                      </td>
                    </tr>
                  ) : qaData.length > 0 ? (
                    qaData.map((item, idx) => (
                      <tr key={item._id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} `}
                      // onClick={() => navigate(`/qa/${item._id}`)}
                      >
                        <td className="px-3 py-2">{(currentPage - 1) * entries + idx + 1}</td>
                        <td className="px-3 py-2">{item.ProjectName || "-"}</td>
                        <td className="px-3 py-2">{item.PMId?.name ?? "-"}</td>
                        <td className="px-3 py-2">{item.TLId?.name ?? "-"}</td>
                        <td className="px-3 py-2">{item.DeveloperIds?.map(d => d.name).join(", ") || "-"}</td>
                        <td className="px-3 py-2">{item.Frequency ?? "-"}</td>
                        <td className="px-3 py-2">{item.Platform ?? "-"}</td>
                        <td className="px-3 py-2">
                          <span className={` inline-block px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap
                          ${item.Status?.toLowerCase().includes("failed") ? "bg-red-100 text-red-800" :
                              item.Status?.toLowerCase().includes("passed") ? "bg-green-100 text-green-800" :
                                item.Status?.toLowerCase().includes("qa") ? "bg-purple-100 text-purple-800" :
                                  "bg-blue-100 text-blue-800"}`}>
                            {item.Status?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") ?? "-"}
                          </span>
                        </td>
                        <td className="px-3 py-2 space-y-1">
                          {item.assignedFiles?.length > 0 ? (
                            <a
                              href={item.assignedFiles[item.assignedFiles.length - 1].fileLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline block text-sm"
                            >
                              {item.assignedFiles[item.assignedFiles.length - 1].fileLink}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="px-3 py-2">
                          <button
                            className={`text-blue-600 hover:underline ${!item.qaReportLink ? "text-gray-400 cursor-not-allowed hover:underline-none" : "cursor-pointer"}`}
                            onClick={() => {
                              if (item.qaReportLink) {
                                navigate(`/qa/${item._id}`);
                              }
                            }}
                            disabled={!item.qaReportLink}
                          >
                            View report
                          </button>
                        </td>

                        {/* {item.qaReports?.length > 0 && item.qaReports.map((r, idx) => (
              
                              <a
                                key={idx}
                                href={`/qa/developer-report/${r.uniqueId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:underline block text-sm"
                              >
                                QA Report {idx + 1}
                              </a>
                            ))} */}

                        {/* <td className="px-3 py-2 space-y-1">
                          {(() => {
                            const assigned = qaData.find(p => p._id === item._id)?.developerStatus === "assigned_to_qa" || qaData.find(p => p._id === item._id)?.qaStatus === "qa_passed";

                            return (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedProjectId(item._id);
                                    setAssignModalOpen(true);
                                  }}
                                  disabled={assigned} // disable if already assigned
                                  className={`w-full px-2 py-1 rounded text-sm text-white ${assigned ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                                    }`}
                                >
                                  {assigned ? "Assigned" : "Assign to QA"}
                                </button>

                                <AssignQAModal
                                  isAssigned={assigned}
                                  isOpen={assignModalOpen}
                                  projectId={selectedProjectId}
                                  onClose={() => setAssignModalOpen(false)}
                                  onAssign={async (projectId, { fileName, fileLink }) => {
                                    const formData = new FormData();
                                    if (fileName) formData.append("fileName", fileName);
                                    if (fileLink) formData.append("fileLink", fileLink);

                                    const res = await fetch(
                                      `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${projectId}/assign-to-qa`,
                                      { method: "POST", body: formData, credentials: "include" }
                                    );
                                    const result = await res.json();
                                    if (res.ok) {
                                      alert("File assigned to QA");
                                      setAssignModalOpen(false);
                                      fetchQAData();
                                    } else {
                                      alert(result.message || "Failed to assign file");
                                    }
                                  }}
                                />
                              </>
                            );
                          })()}
                        </td> */}

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <img src={Img} alt="No data" className="w-32 h-32 object-contain opacity-80" />
                          <p className="font-semibold text-lg text-gray-600">No Data Found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {user?.roleName === "Developer" && (
            <div className="max-h-[400px] overflow-x-auto border border-gray-50">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-gray-700">
                  <tr className="text-center">
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Project Name</th>
                    <th className="px-4 py-2">PM</th>
                    <th className="px-4 py-2">TL</th>
                    <th className="px-4 py-2">Developer</th>
                    <th className="px-4 py-2">Frequency</th>
                    <th className="px-4 py-2">Platform</th>
                    <th className="px-4 py-2">QA Status</th>
                    <th className="px-4 py-2">Assigned File Path</th>
                    <th className="px-4 py-2">QA Report</th>
                    {/* <th className="px-4 py-2">Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-500">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
                      </td>
                    </tr>
                  ) : qaData.length > 0 ? (
                    qaData.map((item, idx) => (
                      <tr key={item._id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} `}
                      // onClick={() => navigate(`/qa/${item._id}`)}
                      >
                        <td className="px-3 py-2">{(currentPage - 1) * entries + idx + 1}</td>
                        <td className="px-3 py-2">{item.ProjectName || "-"}</td>
                        <td className="px-3 py-2">{item.PMId?.name ?? "-"}</td>
                        <td className="px-3 py-2">{item.TLId?.name ?? "-"}</td>
                        <td className="px-3 py-2">{item.DeveloperIds?.map(d => d.name).join(", ") || "-"}</td>
                        <td className="px-3 py-2">{item.Frequency ?? "-"}</td>
                        <td className="px-3 py-2">{item.Platform ?? "-"}</td>
                        <td className="px-3 py-2">
                          <span className={` inline-block px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap
                          ${item.Status?.toLowerCase().includes("failed") ? "bg-red-100 text-red-800" :
                              item.Status?.toLowerCase().includes("passed") ? "bg-green-100 text-green-800" :
                                item.Status?.toLowerCase().includes("qa") ? "bg-purple-100 text-purple-800" :
                                  "bg-blue-100 text-blue-800"}`}>
                            {item.Status?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") ?? "-"}
                          </span>
                        </td>
                        <td className="px-3 py-2 space-y-1">
                          {item.assignedFiles?.length > 0 ? (
                            <a
                              href={item.assignedFiles[item.assignedFiles.length - 1].fileLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline block text-sm"
                            >
                              {item.assignedFiles[item.assignedFiles.length - 1].fileLink}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="px-3 py-2">
                          <button
                            className={`text-blue-600 hover:underline ${!item.qaReportLink ? "text-gray-400 cursor-not-allowed hover:underline-none" : "cursor-pointer"}`}
                            onClick={() => {
                              if (item.qaReportLink) {
                                navigate(`/qa/${item._id}`);
                              }
                            }}
                            disabled={!item.qaReportLink}
                          >
                            View report
                          </button>
                        </td>

                        {/* {item.qaReports?.length > 0 && item.qaReports.map((r, idx) => (
              
                              <a
                                key={idx}
                                href={`/qa/developer-report/${r.uniqueId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:underline block text-sm"
                              >
                                QA Report {idx + 1}
                              </a>
                            ))} */}

                        {/* <td className="px-3 py-2 space-y-1">
                          {(() => {
                            const assigned = qaData.find(p => p._id === item._id)?.developerStatus === "assigned_to_qa" || qaData.find(p => p._id === item._id)?.qaStatus === "qa_passed";

                            return (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedProjectId(item._id);
                                    setAssignModalOpen(true);
                                  }}
                                  disabled={assigned} // disable if already assigned
                                  className={`w-full px-2 py-1 rounded text-sm text-white ${assigned ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                                    }`}
                                >
                                  {assigned ? "Assigned" : "Assign to QA"}
                                </button>

                                <AssignQAModal
                                  isAssigned={assigned}
                                  isOpen={assignModalOpen}
                                  projectId={selectedProjectId}
                                  onClose={() => setAssignModalOpen(false)}
                                  onAssign={async (projectId, { fileName, fileLink }) => {
                                    const formData = new FormData();
                                    if (fileName) formData.append("fileName", fileName);
                                    if (fileLink) formData.append("fileLink", fileLink);

                                    const res = await fetch(
                                      `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${projectId}/assign-to-qa`,
                                      { method: "POST", body: formData, credentials: "include" }
                                    );
                                    const result = await res.json();
                                    if (res.ok) {
                                      alert("File assigned to QA");
                                      setAssignModalOpen(false);
                                      fetchQAData();
                                    } else {
                                      alert(result.message || "Failed to assign file");
                                    }
                                  }}
                                />
                              </>
                            );
                          })()}
                        </td> */}

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <img src={Img} alt="No data" className="w-32 h-32 object-contain opacity-80" />
                          <p className="font-semibold text-lg text-gray-600">No Data Found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {user.department === "QA" && (
            <div className="max-h-[400px] overflow-x-auto border border-gray-50">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-gray-700">
                  <tr className="text-center">
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Project Name</th>
                    <th className="px-4 py-2">PM</th>
                    <th className="px-4 py-2">TL</th>
                    <th className="px-4 py-2">Developer</th>
                    <th className="px-4 py-2">Frequency</th>
                    <th className="px-4 py-2">Platform</th>
                    <th className="px-4 py-2">QA Status</th>
                    <th className="px-4 py-2">File path</th>
                    {/* <th className="px-4 py-2">QA Report</th> */}
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-500">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
                      </td>
                    </tr>
                  ) : qaData.length > 0 ? (
                    qaData.map((item, idx) => (
                      <tr key={item._id} className={` ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} `}
                      // onClick={() => navigate(`/qa/${item._id}`)}
                      >
                        <td className="px-3 py-2">{(currentPage - 1) * entries + idx + 1}</td>
                        <td className="px-3 py-2">{item.ProjectName || "-"}</td>
                        <td className="px-3 py-2">{item.PMId?.name ?? "-"}</td>
                        <td className="px-3 py-2">{item.TLId?.name ?? "-"}</td>
                        <td className="px-3 py-2">{item.DeveloperIds?.map(d => d.name).join(", ") || "-"}</td>
                        <td className="px-3 py-2">{item.Frequency ?? "-"}</td>
                        <td className="px-3 py-2">{item.Platform ?? "-"}</td>
                        {/* <td className="px-3 py-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
                          ${item.Status?.toLowerCase().includes("failed") ? "bg-red-100 text-red-800" :
                              item.Status?.toLowerCase().includes("passed") ? "bg-green-100 text-green-800" :
                                item.Status?.toLowerCase().includes("qa") ? "bg-purple-100 text-purple-800" :
                                  "bg-blue-100 text-blue-800"}`}>
                            {item.Status?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") ?? "-"}
                          </span>
                        </td> */}
                        <td className="px-3 py-2 text-center">
                          {item.Status === "assigned_to_qa" ? (
                            <select
                              value="assigned_to_qa"
                              onChange={async (e) => {
                                const status = e.target.value;
                                if (!status) return;

                                try {
                                  const res = await fetch(
                                    `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${item._id}/transition`,
                                    {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      credentials: "include",
                                      body: JSON.stringify({ to: "qa_open", comment: "QA opened project" }),
                                    }
                                  );
                                  const result = await res.json();
                                  if (res.ok) 
                                  fetchQAData(); // refresh table
                                  else alert(result.message || "Failed to update status");
                                } catch (err) {
                                  console.error(err);
                                  alert("Server error");
                                }
                              }}
                              className="w-full border rounded px-2 py-1 text-sm bg-blue-100 text-blue-800"
                            >
                              <option value="assigned_to_qa">Assigned to QA</option>
                              <option value="qa_open">Open</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
                              ${item.Status?.toLowerCase().includes("failed") ? "bg-red-100 text-red-800" :
                                  item.Status?.toLowerCase().includes("passed") ? "bg-green-100 text-green-800" :
                                    item.Status?.toLowerCase().includes("qa") ? "bg-purple-100 text-purple-800" :
                                      "bg-blue-100 text-blue-800"}`}
                            >
                              {item.Status?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") ?? "-"}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 space-y-1">
                          {item.assignedFiles?.length > 0 ? (
                            <a
                              href={item.assignedFiles[item.assignedFiles.length - 1].fileLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline block text-sm"
                            >
                              {item.assignedFiles[item.assignedFiles.length - 1].fileLink}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>


                        {/* <td className="px-3 py-2 space-y-1">
                          {item.assignedFiles?.map((file, idx) => (
                            <a
                              key={idx}
                              href={file.fileLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline block text-sm"
                            >
                              {file.fileLink}
                            </a>
                          )) || "-"}
                        </td> */}
                        {/* {item.qaReports?.length > 0 && item.qaReports.map((r, idx) => (
              
                              <a
                                key={idx}
                                href={`/qa/developer-report/${r.uniqueId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:underline block text-sm"
                              >
                                QA Report {idx + 1}
                              </a>
                            ))} */}

                        {/* <td className="px-3 py-2 space-y-1">
                          
                            <button
                              onClick={() => navigate(`/qa/${item._id}`)}
                              className="bg-green-500 w-full text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
                            >
                              Submit QA Report
                            </button>
                          
                        </td> */}
                        {/* <td className="px-3 py-2">
                          <select
                            value={selectedStatus[item._id] || ""}
                            onChange={async (e) => {
                              const status = e.target.value;
                              setSelectedStatus(prev => ({ ...prev, [item._id]: status }));

                              if (!status) return;

                              try {
                                const res = await fetch(
                                  `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${item._id}/transition`,
                                  {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    credentials: "include",
                                    body: JSON.stringify({ to: status, comment: "Status updated before QA report" }),
                                  }
                                );
                                const result = await res.json();
                                if (res.ok) {
                                  // alert("Status updated successfully!");
                                  navigate(`/qa/${item._id}`); // auto-redirect
                                } else {
                                  alert(result.message || "Failed to update status");
                                }
                              } catch (err) {
                                console.error(err);
                                alert("Server error");
                              }
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          >
                            <option value="">Select Status</option>
                            <option value="qa_passed">QA Passed</option>
                            <option value="qa_failed">QA Failed</option>
                            <option value="qa_open">QA Open</option>
                          </select>
                        </td> */}

                        <td className="px-3 py-2">
                          {item.Status === "qa_open" && (
                            <select
                              value={selectedStatus[item._id] || ""}
                              onChange={async (e) => {
                                const status = e.target.value;
                                if (!status) return;

                                setSelectedStatus(prev => ({ ...prev, [item._id]: status }));

                                try {
                                  const res = await fetch(
                                    `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${item._id}/transition`,
                                    {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      credentials: "include",
                                      body: JSON.stringify({ to: status, comment: "QA updated status" }),
                                    }
                                  );
                                  const result = await res.json();
                                  if (res.ok) {
                                  fetchQAData();
                                  navigate(`/qa/${item._id}`);
                                  }
                                  else {
                                    alert(result.message || "Failed to update status");
                                    setSelectedStatus(prev => ({ ...prev, [item._id]: "" }));
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert("Server error");
                                  setSelectedStatus(prev => ({ ...prev, [item._id]: "" }));
                                }
                              }}
                              className="w-full border rounded px-2 py-1 text-sm"
                            >
                              <option value="">Select Status</option>
                              <option value="qa_passed">QA Passed</option>
                              <option value="qa_failed">QA Failed</option>
                            </select>
                          ) || "-"}
                        </td>



                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <img src={Img} alt="No data" className="w-32 h-32 object-contain opacity-80" />
                          <p className="font-semibold text-lg text-gray-600">No Data Found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}


          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

          {/* Assign to QA Modal */}

        </>
      )}
    </div>
  );
}
