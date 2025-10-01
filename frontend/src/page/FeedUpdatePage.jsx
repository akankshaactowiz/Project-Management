import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { useAuth } from "../hooks/useAuth"

import Breadcrumb from "../components/Breadcrumb";

function FeedUpdate() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feed, setFeed] = useState({});
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [qaUsers, setQaUsers] = useState([]);
  const [bauUsers, setBauUsers] = useState([]);

  const [rules, setRules] = useState([]);
  const [activeTab, setActiveTab] = useState("Feed Details");
  const [startDate, setStartDate] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [schedule, setSchedule] = useState({});

  const [databaseSettings, setDatabaseSettings] = useState({
    databaseType: "",
    host: "",
    port: "",
    username: "",
    password: "",
    databaseName: "",
    tableName: "",
    hasDataTable: false,
    dateFormat: "",
    datePosition: "",
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // --- Custom Schedule Entries ---
  const handleCustomChange = (index, field, value) => {
    const newCustom = [...(schedule.custom || [])];
    newCustom[index][field] = value;
    setSchedule({ ...schedule, custom: newCustom });
  };

  const addCustomEntry = () => {
    setSchedule({
      ...schedule,
      custom: [...(schedule.custom || []), { day: "", time: "" }],
    });
  };

  const removeCustomEntry = (index) => {
    const newCustom = [...(schedule.custom || [])];
    newCustom.splice(index, 1);
    setSchedule({ ...schedule, custom: newCustom });
  };

  // --- Fetch initial data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedRes, usersRes, projRes] = await Promise.all([
          fetch(
            `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${id}`,
            { credentials: "include" }
          ),
          fetch(
            `http://${import.meta.env.VITE_BACKEND_NETWORK_ID
            }/api/users/tl-dev`,
            { credentials: "include" }
          ),
          fetch(
            `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects`,
            { credentials: "include" }
          ),
        ]);

        const [feedData, usersData, projData] = await Promise.all([
          feedRes.json(),
          usersRes.json(),
          projRes.json(),
        ]);

        setProjects(projData?.data || []);
        setDevelopers(usersData.devUsers || []);
        setQaUsers(usersData.qaLead || []);
        setBauUsers(usersData.BAU || []);

        setFeed({
          projectId: feedData.projectId?._id || "",
          DeveloperIds: feedData.DeveloperIds || [],
          QAId: feedData.QAId || null, // <- use null instead of ""
          BAUId: feedData.BAUId || null,
          POC: feedData.POC || "",
          Platform: feedData.Platform || "",
          FeedName: feedData.FeedName || "",
          Status: feedData.Status || feedData.BAUStatus || "",
          BAUStatus: feedData.BAUStatus || "",
          QAProcess: feedData.QAProcess || "",
          FrameworkType: feedData.FrameworkType || "N/A",
          Remark: feedData.Remark || "",
        });

        setFrequency(feedData.Frequency || "Daily");
        setSchedule(feedData.Schedule || {});
        setDatabaseSettings(feedData.DatabaseSettings || {});
        // setRules(feedData.QARules || []);
        setRules(
          Array.isArray(feedData.QARules)
            ? feedData.QARules
            : JSON.parse(feedData.QARules || "[]")
        );

        setStartDate(feedData.StartDate || "");

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // --- Generic input change ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeed((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name, selectedOptions) => {
    setFeed((prev) => ({
      ...prev,
      [name]: selectedOptions.map((opt) => opt.value),
    }));
  };

  // --- Database settings change ---
  const handleDBChange = (field, value) => {
    setDatabaseSettings((prev) => ({ ...prev, [field]: value }));
  };

  // --- QA Rules CRUD ---
  const addRule = () =>
    setRules([...rules, { field: "", type: "", threshold: "", createdBy: user?._id }]);
  const updateRule = (index, key, value) => {
    const newRules = [...rules];
    newRules[index][key] = value;
    setRules(newRules);
  };
  const removeRule = (index) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  // --- Submit all updates ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...feed,
        DatabaseSettings: databaseSettings,
        Frequency: frequency,
        Schedule: schedule,
        // QARules: rules,
        QARules: Array.isArray(rules)
          ? rules
          : JSON.parse(rules || "[]")
      };

      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("✅ Feed updated successfully!");
        navigate(`/project/feed/${id}`);
      } else {
        alert(`❌ Update failed: ${data.message}`);
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const tabs = [
    "Feed Details",
    "Frequency",
    "Database",
    // "Systems",
    // "Database Tables",
    "Auto QA Rules",
  ];

  // Loading state
  // if (loading) return <p className="p-4">Loading...</p>;

  return (
    <>
    
      <div className="flex items-center justify-between mb-6">
        {/* Heading */}
        <h2 className="text-xl font-semibold text-gray-800 border-l-4 border-blue-500 pl-3 mt-4">
          Feed Update
        </h2>
      </div>
      <div className="border-b border-gray-200 overflow-x-auto whitespace-nowrap">
        {tabs.map((tabs) => (
          <button
            key={tabs}
            onClick={() => setActiveTab(tabs)}
            className={`inline-block px-4 py-2 text-md font-medium transition-colors duration-200 ${activeTab === tabs
              ? "border-b-2 border-purple-800 text-purple-800"
              : "text-gray-500"
              }`}
          >
            {tabs}
          </button>
        ))}
      </div>
      <div className="p-2 mx-auto">
        {activeTab === "Feed Details" && (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border-gray-50 rounded-sm p-8 border"
          >
            {/* Project Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                name="projectId"
                value={feed.projectId || ""}
                onChange={(e) => {
                  const selectedProject = projects.find(
                    (p) => p._id === e.target.value
                  );
                  setFeed((prev) => ({
                    ...prev,
                    projectId: e.target.value,
                  }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.ProjectName}
                  </option>
                ))}
              </select>
            </div>

            {/* Feed Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Feed Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="FeedName"
                value={feed.FeedName || ""}
                onChange={handleChange}
                placeholder="Enter Feed Title"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Feed Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Feed Status <span className="text-red-500 ">*</span>
              </label>
              <select
                name="Status"
                value={feed.Status || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Status</option>
                {[
                  "Scheduled",
                  "Assigned to Developer",
                  "Under Development",
                  "Waiting from Client",
                  "Sample Delivered",
                  "Sample Approved",
                  "BAU",
                  "Once off Delivered",
                  "Bug Fixing",
                  "Blocking Issue",
                  "Close",
                  "Able to recover",
                  "Feed missed",
                ].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Feed BAU */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Feed BAU
              </label>
              <select
                name="BAUStatus"
                value={feed.BAUStatus || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="" className="text-gray-400">
                  Select
                </option>
                {["BAU-Started", "BAU-Not Yet Started"].map((bau) => (
                  <option key={bau} value={bau}>
                    {bau}
                  </option>
                ))}
              </select>
            </div>

            {/* Approx Number of Input Listing */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Approx Number of Input Listings
              </label>
              <input
                type="number"
                name="ApproxInputListing"
                value={feed.ApproxInputListing || ""}
                onChange={handleChange}
                placeholder="e.g. 1000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2  focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Approx Number of Output Listing */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Approx Number of Output Listings
              </label>
              <input
                type="number"
                name="ApproxOutputListing"
                value={feed.ApproxOutputListing || ""}
                onChange={handleChange}
                placeholder="e.g. 1000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2  focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Number of Threads */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Number of Threads
              </label>
              <input
                type="number"
                name="Threads"
                value={feed.Threads || ""}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Platform <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Platform"
                value={feed.Platform || ""}
                onChange={handleChange}
                placeholder="e.g. Web, Mobile"
                className="w-full border border-gray-300 rounded-lg px-3 py-2  focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Framework Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Framework Type
              </label>
              <select
                name="FrameworkType"
                value={feed.FrameworkType || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Framework</option>
                {[
                  "Selenium",
                  "Multithread",
                  "Multipart Request",
                  "Scrapy",
                  ".Net",
                  "Django",
                  "Playwright",
                  "Fastapi",
                  "Other",
                ].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* QA Process */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                QA Process
              </label>
              <select
                name="QAProcess"
                value={feed.QAProcess || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select QA Process</option>
                {[
                  "Auto QA",
                  "Random QA",
                  "Post QA",
                  "No QA Required",
                  "Manual QA",
                ].map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            {/* Manage By */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Manage By
              </label>
              <select
                name="ManageBy"
                value={feed.ManageBy || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2  focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="" disabled>
                  Managed By
                </option>
                <option value="Developer">Developer</option>
                <option value="BAU">BAU</option>
              </select>
            </div>

            {/* Feed POC */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Feed POC
              </label>
              <select
                name="POC"
                value={feed.POC || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2  focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select POC</option>
                <option value="Free POC">Free POC</option>
                <option value="None">None</option>
                <option value="Paid POC">Paid POC</option>
              </select>
            </div>

            {/* Developers Multi-select */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Developers
              </label>
              <Select
                isMulti
                name="DeveloperIds"
                options={
                  developers?.map((dev) => ({
                    value: dev._id,
                    label: dev.name,
                  })) || []
                }
                value={
                  developers
                    ?.filter((dev) => feed.DeveloperIds?.includes(dev._id))
                    .map((dev) => ({ value: dev._id, label: dev.name })) || []
                }
                onChange={(selectedOptions) =>
                  handleMultiSelect("DeveloperIds", selectedOptions)
                }
                className="w-full text-sm"
                classNamePrefix="select"
              />
            </div>

            {/* QA Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                QA
              </label>
              <select
                name="QAId"
                value={feed.QAId || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select QA</option>
                {qaUsers?.map((qa) => (
                  <option key={qa._id} value={qa._id}>
                    {qa.name}
                  </option>
                ))}
              </select>
            </div>

            {/* BAU Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                BAU
              </label>
              <select
                name="BAUId"
                value={feed.BAUId || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select BAU</option>
                {bauUsers?.map((bau) => (
                  <option key={bau._id} value={bau._id}>
                    {bau.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Remark */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Remark
              </label>
              <textarea
                name="Remark"
                value={feed.Remark || ""}
                onChange={handleChange}
                placeholder="Enter any additional notes..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Submit */}
            <div className="col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 transition-all text-white font-medium px-6 py-2 rounded-lg shadow-md"
                onClick={handleSubmit}
              >
                Update
              </button>
            </div>
          </form>
        )}

        {/* Frequency Tab */}
        {activeTab === "Frequency" && (
          <>
            <div className="grid grid-cols-3 gap-4 p-6">
              {/* Start Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate || ""}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Frequency */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={frequency || ""}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select Frequency</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Once-off">Once-off</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {/* Conditional Inputs */}
              {(frequency === "Daily" ||
                frequency === "Weekly" ||
                frequency === "Monthly" ||
                frequency === "Custom") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {(frequency === "Weekly" || frequency === "Custom") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Day
                        </label>
                        <select
                          value={schedule.day || ""}
                          onChange={(e) =>
                            setSchedule({ ...schedule, day: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="">Select Day</option>
                          {daysOfWeek.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {frequency === "Monthly" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date (1-31)
                        </label>
                        <select
                          value={schedule.date || ""}
                          onChange={(e) =>
                            setSchedule({
                              ...schedule,
                              date: Number(e.target.value),
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="">Select Date</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )}

                    {/* Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={schedule.time || ""}
                        onChange={(e) =>
                          setSchedule({ ...schedule, time: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                )}

              {frequency === "Once-off" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      schedule.datetime
                        ? new Date(schedule.datetime).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setSchedule({
                        ...schedule,
                        datetime: new Date(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              )}
            </div>

            {/* Update Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
              >
                Update
              </button>
            </div>
          </>
        )}

        {/* Database Tab */}
        {/* Database Tab */}
        {activeTab === "Database" && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Connection Settings */}
              <div className="border border-gray-100 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">
                  Connection Settings
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Database Type
                    </label>
                    <select
                      name="databaseType"
                      value={feed.databaseSettings?.databaseType || ""}
                      onChange={(e) =>
                        setFeed({
                          ...feed,
                          databaseSettings: {
                            ...feed.databaseSettings,
                            databaseType: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="" disabled>
                        Select DB Type
                      </option>
                      <option value="mysql">MySQL</option>
                      <option value="mongodb">MongoDB</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Host
                    </label>
                    <input
                      type="text"
                      value={feed.databaseSettings?.host || ""}
                      onChange={(e) =>
                        setFeed({
                          ...feed,
                          databaseSettings: {
                            ...feed.databaseSettings,
                            host: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Port
                    </label>
                    <input
                      type="text"
                      value={feed.databaseSettings?.port || ""}
                      onChange={(e) =>
                        setFeed({
                          ...feed,
                          databaseSettings: {
                            ...feed.databaseSettings,
                            port: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={feed.databaseSettings?.username || ""}
                      onChange={(e) =>
                        setFeed({
                          ...feed,
                          databaseSettings: {
                            ...feed.databaseSettings,
                            username: e.target.value,
                          },
                        })
                      }
                      placeholder="Database Username"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={feed.databaseSettings?.password || ""}
                      onChange={(e) =>
                        setFeed({
                          ...feed,
                          databaseSettings: {
                            ...feed.databaseSettings,
                            password: e.target.value,
                          },
                        })
                      }
                      placeholder="Database Password"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Database Name
                    </label>
                    <input
                      type="text"
                      value={feed.databaseSettings?.dbName || ""}
                      onChange={(e) =>
                        setFeed({
                          ...feed,
                          databaseSettings: {
                            ...feed.databaseSettings,
                            dbName: e.target.value,
                          },
                        })
                      }
                      placeholder="Database Name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* Table Settings */}
              <div className="border border-gray-100 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Table Settings</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Table Name
                    </label>
                    <select
                      value={feed.tableSettings?.tableName || ""}
                      onChange={(e) =>
                        setFeed({
                          ...feed,
                          tableSettings: {
                            ...feed.tableSettings,
                            tableName: e.target.value,
                          },
                        })
                      }
                      placeholder="Table Name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="" disabled>Select Table</option>
                      {/* <option value="productdata">productdata</option>
                      <option value="userdata">userdata</option>
                      <option value="orders">orders</option>
                      <option value="salesreport">salesreport</option> */}
                    </select>
                    {/* Example / Format */}
                    <p className="mt-1 text-xs text-gray-500">
                      Name should be in the format: <span className="text-red-500">*</span> <span className="font-mono text-gray-700">productdata_2025_10_01</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Has Data Table
                    </label>
                    <select
                      value={feed.tableSettings?.hasDataTable || ""}
                      onChange={(e) =>
                        setFeed({
                          ...feed,
                          tableSettings: {
                            ...feed.tableSettings,
                            hasDataTable: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Format
                    </label>
                    <select
                      value={feed.tableSettings?.dateFormat || ""}
                      onChange={(e) =>
                        setFeed({
                          ...feed,
                          tableSettings: {
                            ...feed.tableSettings,
                            dateFormat: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="" disabled>
                        Select Date Format
                      </option>
                      <option value="Y_m_d">Y_m_d</option>
                      <option value="Y-m-d">Y-m-d</option>
                      <option value="d-m-Y">d-m-Y</option>
                      <option value="d_m_Y">d_m_Y</option>
                      <option value="m-d-Y">m-d-Y</option>
                      <option value="m_d_Y">m_d_Y</option>
                      <option value="Ymd">Ymd</option>
                      <option value="dmY">dmY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Position
                    </label>
                    <select
                      value={feed.tableSettings?.datePosition || ""}
                      onChange={(e) =>
                        setFeed({
                          ...feed,
                          tableSettings: {
                            ...feed.tableSettings,
                            datePosition: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="" disabled>
                        Select Date Position
                      </option>
                      <option value="after">After</option>
                      <option value="before">Before</option>
                      <option value="center">Center</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-2 flex justify-end mt-2">
              <button
                onClick={handleSubmit} // <-- existing handler
                className="bg-blue-600 hover:bg-blue-700 transition-all text-white font-medium px-6 py-2 rounded-lg shadow-md"
              >
                Update
              </button>
            </div>
          </div>
        )}

        {/* Auto QA Rules Tab */}
        {activeTab === "Auto QA Rules" && (
          <div className="p-4 bg-white rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Advanced Rules Configuration
              </h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 border rounded text-purple-600 hover:bg-purple-50">
                  Draft
                </button>
                <button className="px-4 py-2 border rounded text-blue-600 hover:bg-blue-50">
                  File
                </button>
                <button
                  className="px-4 py-2 border rounded text-green-600 hover:bg-green-50"
                  onClick={addRule}
                >
                  + Add Rule
                </button>
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                // onClick={}
                >
                  Clone Rules
                </button>
              </div>
            </div>

            <table className="w-full table-auto border-collapse border border-gray-100 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2">No</th>
                  <th className="px-3 py-2">Fields</th>
                  <th className="px-3 py-2">Rule</th>
                  <th className="px-3 py-2">Threshold(%)</th>
                  <th className="px-3 py-2">Created By</th>
                  <th className="px-3 py-2">Created At</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      No Rules Added
                    </td>
                  </tr>
                ) : (
                  rules.map((rule, index) => (
                    <tr key={index}>
                      <td className="border px-3 py-2">{index + 1}</td>
                      <td className="border px-3 py-2">
                        <input
                          type="text"
                          value={rule.field}
                          onChange={(e) =>
                            updateRule(index, "field", e.target.value)
                          }
                          className="w-full border px-2 py-1 rounded"
                        />
                      </td>
                      <td className="border px-3 py-2">
                        <input
                          type="text"
                          value={rule.type}
                          onChange={(e) =>
                            updateRule(index, "type", e.target.value)
                          }
                          className="w-full border px-2 py-1 rounded"
                        />
                      </td>
                      <td className="border px-3 py-2">
                        <input
                          type="text"
                          value={rule.threshold}
                          onChange={(e) =>
                            updateRule(index, "threshold", e.target.value)
                          }
                          className="w-full border px-2 py-1 rounded"
                        />
                      </td>
                      <td className="border px-3 py-2">{rule.createdBy?.name || "-"}</td>
                      <td className="border px-3 py-2">
                        {rule.createdAt || "-"}
                      </td>
                      <td className="border px-3 py-2">
                        <button
                          onClick={() => removeRule(index)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Save Rules
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default FeedUpdate;
