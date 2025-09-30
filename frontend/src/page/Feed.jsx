import { useState, useEffect } from "react";
import { FaFilePdf, FaFileCsv } from "react-icons/fa6";
import { RiFileExcel2Fill } from "react-icons/ri";
import { LuFileJson } from "react-icons/lu";
import Pagination from "../components/Pagination";
import Img from "../assets/no-data-found.svg";
import { exportData } from "../utils/exportUtils";
import AddFeedModel from "../components/CreateFeed";

const tabs = [
  "Feed",
  "Today",
  "Tomorrow",
  "Yesterday",
  "This Week",
  "Last Week",
  "Next Week",
  "This Month",
  "Next Month",
  "Last Month",
  "Date",
];

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState("Feed");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);


  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed?page=1&limit=10`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        console.log(data)
        setFeeds(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching feed data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, []);

  // Manually define column headers
  const columns = [
    "No",
    "Project Name",
    "Feed Name",
    "Frequency",
    "Platform",
    "Status",
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
    "Created Date",
  ];

  return (
    <>
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
            onClick={() => setIsModalOpen(true)}
          >
            + Add Feed
          </button>
        </div>
        {isModalOpen && (
          <AddFeedModel isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        )}
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-3">
          {/* Left: Show entries */}
          <div className="flex items-center space-x-2">
            <label htmlFor="entries" className="text-gray-700">
              Show
            </label>
            <select
              id="entries"
              value={entries}
              onChange={(e) => {
                setEntries(Number(e.target.value));
                setCurrentPage(1); // reset to first page
              }}
              className="border rounded px-2 py-1"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className=" text-gray-700">entries</span>
          </div>

          {/* Right: Search + Export */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // reset to first page
                }}
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
            <button
              title="PDF"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => exportData("pdf", feeds, "feed-data")}
            >
              <FaFilePdf size={16} className="text-red-700" />
            </button>
            <button
              title="Excel"
              className="text-green-600 hover:text-green-800"
              onClick={() => exportData("excel", feeds, "feed-data")}
            >
              <RiFileExcel2Fill size={16} className="text-green-600" />
            </button>
            <button
              title="CSV"
              className="text-blue-600 hover:text-blue-800"
              onClick={() => exportData("csv", feeds, "feed-data")}
            >
              <FaFileCsv size={16} className="text-blue-600" />
            </button>
            <button
              title="JSON"
              className="text-red-600 hover:text-red-800"
              onClick={() => exportData("json", feeds, "feed-data")}
            >
              <LuFileJson size={16} className="text-yellow-500" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 ">
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
                    className="text-center p-8 text-gray-500"
                  >
                    <div className="flex justify-center items-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                      {/* <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span> */}
                    </div>
                  </td>
                </tr>
              ) : feeds.length > 0 ? (
                feeds.map((row, idx) => (
                  <tr
                    key={row._id || idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >

                    {/* <td className="px-3 py-2">{row.No ?? "-"}</td> */}
                    <td className="px-3 py-2">{idx + 1}</td>
                    {/* <td className="px-3 py-2">{row.ProjectName ?? "-"}</td> */}
                    <td className="px-3 py-2">
                      {row.projectId?.ProjectCode && row.projectId?.ProjectName
                        ? `[${row.projectId.ProjectCode}] ${row.projectId.ProjectName}`
                        : "-"}
                    </td>

                    <td
                      className="px-3 py-2 text-blue-600 cursor-pointer hover:underline"
                      onClick={() =>
                        (window.location.href = `/project/feed/${row._id}`)
                      }
                    >
                      {row.FeedName ?? "-"}
                    </td>
                    <td className="px-3 py-2">{row.projectId?.Frequency ?? "-"}</td>
                    <td className="px-3 py-2">{row.projectId?.Platform ?? "-"}</td>
                    <td className="px-3 py-2">{row.projectId?.Status ?? "-"}</td>
                    <td className="px-3 py-2">{row.projectId?.BAU ?? "-"}</td>
                    <td className="px-3 py-2">{row.projectId?.POC ?? "-"}</td>
                    <td className="px-3 py-2">{row.projectId?.PMId?.name ?? "-"}</td>
                    <td className="px-3 py-2">{row.projectId?.PC ?? "-"}</td>
                    <td className="px-3 py-2">{row.projectId?.TLId?.name ?? "-"}</td>
                    <td className="px-3 py-2">{row.projectId?.DeveloperIds?.name ?? "-"}</td>
                    <td className="px-3 py-2">{row.projectId?.QA ?? "-"}</td>
                    <td className="px-3 py-2">{row.projectId?.BAUPerson ?? "-"}</td>
                    <td className="px-3 py-2">{row.FeedId ?? "-"}</td>
                    <td className="px-3 py-2">
                      {row.projectId?.FrameworkType ?? "-"}
                    </td>
                    <td className="px-3 py-2">
                      {row.projectId?.QAReportCount ?? "-"}
                    </td>
                    <td className="px-3 py-2">{row.projectId?.ManageBy ?? "-"}</td>
                    <td className="px-3 py-2">{row.projectId?.QARules ?? "-"}</td>
                    <td className="px-3 py-2">{row.projectId?.DBStatus ?? "-"}</td>
                    <td className="px-3 py-2">{row.projectId?.DBType ?? "-"}</td>
                    <td className="px-3 py-2">{row.CreatedDate ?? "-"}</td>
                    {/* <td className="px-3 py-2"></td> */}
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
                        Try adding new feeds to see them here.
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
