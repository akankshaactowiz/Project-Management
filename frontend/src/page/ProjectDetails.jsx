import { useEffect, useState, Fragment } from "react";

import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { useAuth } from "../hooks/useAuth";
import Pagination from "../components/Pagination"

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
  const [form, setForm] = useState({
    TLId: "",
    DeveloperIds: [],
    QAPersonIds: [],
  });


  const [activeTab, setActiveTab] = useState("Summary");
  const [selectedMembers, setSelectedMembers] = useState(null);

  const handleShowAll = (members) => {
    setSelectedMembers(members);
  };

  const projectMembers = [
    project?.PMId,


  ].filter(Boolean);
  const columns = ["No.", "Feed ID", "Feed Name", "Frequency", "Platform", "Status", "BAU", "POC", "Team Memebers", "DB Status"];

  // Fetch project + available users
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch project details
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID
          }/api/projects/${id}`,
          { credentials: "include" }
        );
        const data = await res.json();
        // console.log(data);
        setProject(data.project);
        setForm({
          TLId: data.TLId?._id || "",
          DeveloperIds: data.DeveloperIds?.map((d) => d._id) || [],
          QAPersonIds: data.QAPersonIds?.map((d) => d._id) || [],
        });

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
  }, [id]);


  // Inside your component, after fetching `project` data
  const totalFeeds = project?.Feeds?.length || 0;
  const activeFeeds = project?.Feeds?.filter(f => f.Status === "Active").length || 0;
  const closedFeeds = project?.Feeds?.filter(f => f.Status === "Closed").length || 0;

  const BAUStarted = project?.Feeds?.filter(f => f.DeliveryType === "BAU" && f.Status === "Started").length || 0;
  const BAUNotStarted = project?.Feeds?.filter(f => f.DeliveryType === "BAU" && f.Status === "Not Started").length || 0;
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

  if (!project) return <p>Loading...</p>;

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        {/* Project Title */}
        <h3 className="mb-4 text-2xl font-bold">
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
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === "Summary"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700"
                  }`}
                onClick={() => setActiveTab("Summary")}
              >
                Summary
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === "Feeds"
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
                  <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md transition">
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
                          {totalFeeds}
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
                  <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md transition">
                    <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-5 bg-blue-500 rounded"></span>
                      Status Types
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between text-gray-600">
                        <span>BAU - Started</span>
                        <span className="font-semibold text-green-600">
                          {BAUStarted}
                        </span>
                      </p>
                      <p className="flex justify-between text-gray-600">
                        <span>BAU - Not Started</span>
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
                  <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md transition">
                    <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-5 bg-blue-500 rounded"></span>
                      Frequency Options
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between text-gray-600">
                        <span>Daily</span>
                        <span className="font-semibold text-blue-600">
                          {project?.DailyCount || 0}
                        </span>
                      </p>
                      <p className="flex justify-between text-gray-600">
                        <span>Weekly</span>
                        <span className="font-semibold text-indigo-600">
                          {project?.WeeklyCount || 0}
                        </span>
                      </p>
                      <p className="flex justify-between text-gray-600">
                        <span>Monthly</span>
                        <span className="font-semibold text-purple-600">
                          {project?.MonthlyCount || 0}
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
                        {new Date(project.CreatedDate).toLocaleDateString() ??
                          "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Due Date</p>
                      <p className="font-semibold text-gray-800">
                        {project?.DueDate || "-"}
                      </p>
                    </div>
                    {/* <div>
                      <p className="text-gray-500">Efforts</p>
                      <p className="font-semibold text-gray-800">
                        {project?.Efforts || "-"}
                      </p>
                    </div> */}
                  </div>
                </div>
              </div>
            )}

            {/* FEEDS TAB */}
            {activeTab === "Feeds" && (
              <div className="flex flex-col">
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
                      {(project?.Feeds || []).map((feed, idx) => {
                        const members =
                          feed.DeveloperIds?.length > 0
                            ? feed.DeveloperIds
                            : []; // only show devs if available

                        const combinedMembers = [...members, ...projectMembers];
                        const visible = combinedMembers.slice(0, 3);
                        const extraCount = combinedMembers.length - visible.length;

                        return (
                          <tr key={idx} className="">
                            <td className="px-4 py-2 ">{idx + 1}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{feed.FeedId}</td>

                            <td className="px-4 py-2 text-blue-600 cursor-pointer whitespace-nowrap"
                              onClick={() => navigate(`/project/feed/${feed._id}`)}>{feed.FeedName}</td>
                            <td className="px-4 py-2">{feed.Frequency ?? "-"}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {feed.DomainName}|{feed.ApplicationType}|{feed.CountryName}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${feed.Status === "New"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-green-100 text-green-600"
                                  }`}
                              >
                                {feed.Status}
                              </span>
                            </td>
                            <td className="px-4 py-2">{feed.BAU ?? "-"}</td>
                            <td className="px-4 py-2">{feed.POC ?? "-"}</td>





                            {/* Team Members */}
                            <td className="px-4 py-2">
                              {combinedMembers.length === 0 ? (
                                <span className="text-gray-400">-</span>
                              ) : (
                                <div className="flex items-center -space-x-2">
                                  {visible.map((m, i) => (
                                    <div
                                      key={i}
                                      className="relative group"
                                      title={`${m.name || "Unknown"}${m.roleName ? " - " + m.roleName : ""
                                        }`}
                                    >
                                      <img
                                        src={
                                          m.avatar ||
                                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            m.name || "U"
                                          )}&background=random`
                                        }
                                        alt={m.name}
                                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition"
                                      />
                                    </div>
                                  ))}

                                  {extraCount > 0 && (
                                    <button
                                      onClick={() => handleShowAll(combinedMembers)}
                                      className="w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-medium flex items-center justify-center border-2 border-white shadow-sm hover:bg-purple-700 transition"
                                    >
                                      +{extraCount}
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-2">{feed.DBStatus || "-"}</td>
                          </tr>
                        );
                      })}
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
            )}
          </div>

          {/* RIGHT SIDE (Always visible Project Details) */}
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded"></span>
              Project Details
            </h4>

            <div className="space-y-3 text-sm">
              <p className="flex justify-between">
                <span className="text-gray-500">Project ID</span>
                <span className="font-semibold text-gray-800">
                  {project?.ProjectCode}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500">Delivery Type</span>
                <span className="font-semibold text-gray-800">
                  {project?.DeliveryType}
                </span>
              </p>

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
                <span className="font-semibold text-gray-700">
                  {/* {(project?.AssignedTo || []).join(", ") || "-"} */}
                  {project?.PMId?.name || "-"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
