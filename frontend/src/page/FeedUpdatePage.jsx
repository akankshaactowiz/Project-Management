import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { useAuth } from "../hooks/useAuth"
import Modal from "react-modal";
import toast from "react-hot-toast";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
Modal.setAppElement("#root");

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    field: "",
    type: "",
    threshold: "",
    createdBy: user?._id,
  });


  const [activeTab, setActiveTab] = useState("Feed Details");
  const [startDate, setStartDate] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [schedule, setSchedule] = useState({});

  // Open modal
  const openModal = () => {
    setNewRule({
      field: "",
      type: "",
      threshold: "",
      createdBy: user?._id,
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Add new rule
  const saveRule = () => {
    setRules([
      ...rules,
      { ...newRule, createdAt: new Date().toLocaleString() },
    ]);
    closeModal();
  };

  // Delete rule
  const removeRule = (index) => {
    const updated = [...rules];
    updated.splice(index, 1);
    setRules(updated);
  };

  const formatDate = (format) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const Y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());

    return format
      .replace("Y", Y)
      .replace("m", m)
      .replace("d", d);
  };

  const [databaseSettings, setDatabaseSettings] = useState({
    databaseType: "",
    host: "",
    port: "",
    mongoURI: "",
    username: "",
    password: "",
    databaseName: "",
    tableName: "",
    hasDataTable: false,
    dateFormat: "",
    datePosition: "",
    format: "",
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
          projectId: feedData.projectId._id || "",
          FeedId: feedData.FeedId || "",
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
  // --- Submit all updates ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const lockedRules = Array.isArray(rules)
        ? rules.map((r) => ({ ...r, isEditable: false }))
        : [];

      const payload = {
        ...feed,
        DatabaseSettings: databaseSettings,
        Frequency: frequency,
        Schedule: schedule,
        QARules: lockedRules, // ✅ send locked version
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
        setRules(lockedRules);
        toast.success("Feed updated successfully!");
        navigate(`/projects/feed/${id}`);
      } else {
        toast.error(`Update failed: ${data.message}`);
      }
    } catch (err) {
      toast.error("Update failed:", err);
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
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6"
          >
            {/* Row 1: Project & Feed Title */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feed ID
                </label>
                <input
                  type="text"
                  name="FeedId"
                  value={feed.FeedId || ""}
                  // onChange={handleChange}
                  readOnly
                  disabled
                  placeholder="Enter Feed Title"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
                />
              </div>
              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  name="projectId"
                  disabled
                  readOnly
                  value={feed.projectId || ""}
                  onChange={(e) =>
                    setFeed((prev) => ({ ...prev, projectId: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="" hidden>Select Project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.ProjectCode} {p.ProjectName}
                    </option>
                  ))}
                </select>
                {/* <input
                  type="text"
                  name="projectId"
                  disabled
                  readOnly
                  value={feed.projectId || ""}
                  onChange={handleChange}
                  placeholder="Enter Feed Title"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                /> */}
              </div>

              {/* Feed Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feed Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="FeedName"
                  readOnly
                  disabled
                  value={feed.FeedName || ""}
                  onChange={handleChange}
                  placeholder="Enter Feed Title"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Row 2: Status & BAU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feed Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="Status"
                  value={feed.Status || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" hidden>Select Status</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feed BAU
                </label>
                <select
                  name="BAUStatus"
                  value={feed.BAUStatus || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" hidden>Select</option>
                  {["BAU-Started", "BAU-Not Yet Started"].map((bau) => (
                    <option key={bau} value={bau}>
                      {bau}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Input, Output, Threads */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approx Input Listings
                </label>
                <input
                  type="number"
                  name="ApproxInputListing"
                  value={feed.ApproxInputListing || ""}
                  onChange={handleChange}
                  placeholder="e.g. 1000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approx Output Listings
                </label>
                <input
                  type="number"
                  name="ApproxOutputListing"
                  value={feed.ApproxOutputListing || ""}
                  onChange={handleChange}
                  placeholder="e.g. 1000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Threads
                </label>
                <input
                  type="number"
                  name="Threads"
                  value={feed.Threads || ""}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Row 4: QA Process, Manage By, Feed POC */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  QA Process
                </label>
                <select
                  name="QAProcess"
                  value={feed.QAProcess || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" hidden>Select QA Process</option>
                  {["Auto QA", "Random QA", "Post QA", "No QA Required", "Manual QA"].map(
                    (q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manage By
                </label>
                <select
                  name="ManageBy"
                  value={feed.ManageBy || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" hidden>Select</option>
                  <option value="Developer">Developer</option>
                  <option value="BAU">BAU</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feed POC
                </label>
                <select
                  name="POC"
                  value={feed.POC || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" hidden>Select</option>
                  <option value="Free POC">Free POC</option>
                  <option value="None">None</option>
                  <option value="Paid POC">Paid POC</option>
                </select>
              </div>
            </div>

            {/* Developers, QA, BAU */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Developers
                </label>
                <Select
                  isMulti
                  name="DeveloperIds"
                  options={
                    developers?.map((dev) => ({ value: dev._id, label: dev.name })) || []
                  }
                  value={
                    developers
                      ?.filter((dev) => feed.DeveloperIds?.includes(dev._id))
                      .map((dev) => ({ value: dev._id, label: dev.name })) || []
                  }
                  onChange={(selectedOptions) =>
                    handleMultiSelect("DeveloperIds", selectedOptions)
                  }
                  className="text-sm"
                  classNamePrefix="select"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">QA</label>
                <select
                  name="QAId"
                  value={feed.QAId || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" hidden>Select QA</option>
                  {qaUsers?.map((qa) => (
                    <option key={qa._id} value={qa._id}>
                      {qa.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">BAU</label>
      <select
        name="BAUId"
        value={feed.BAUId || ""}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="" hidden>Select BAU</option>
        {bauUsers?.map((bau) => (
          <option key={bau._id} value={bau._id}>
            {bau.name}
          </option>
        ))}
      </select>
    </div> */}
            </div>

            {/* Remark */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remark
              </label>
              <textarea
                name="Remark"
                value={feed.Remark || ""}
                onChange={handleChange}
                placeholder="Enter any additional notes..."
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 transition text-white font-medium px-6 py-2 rounded-md shadow-sm"
              >
                Update
              </button>
            </div>
          </form>

        )}

        {/* Frequency Tab */}
        {activeTab === "Frequency" && (
          <>
            <div className="grid grid-cols-[1fr_2fr_2fr] gap-4 p-6 items-end">
              {/* Start Date */}
              <div className="mb-0">
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={startDate ? dayjs(startDate, "YYYY/MM/DD") : null}
                    onChange={(newValue) => {
                      setStartDate(newValue ? newValue.format("YYYY/MM/DD") : "");
                    }}
                    format="YYYY/MM/DD"
                    slotProps={{
                      textField: {
                        className:
                          "w-full border border-gray-300 rounded-lg px-3 py-4 focus:ring-2 focus:ring-blue-400",
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

              {/* Frequency */}
              <div className="mb-0">
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={frequency || ""}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-4 focus:ring-2 focus:ring-blue-400"
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-0">
                    {(frequency === "Weekly" || frequency === "Custom") && (
                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                          Day
                        </label>
                        <select
                          value={schedule.day || ""}
                          onChange={(e) =>
                            setSchedule({ ...schedule, day: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-4 focus:ring-2 focus:ring-blue-400"
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
                          className="w-full border border-gray-300 rounded-lg px-3 py-4 focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="">Select Date</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Time */}
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        value={schedule.time || ""}
                        onChange={(e) =>
                          setSchedule({ ...schedule, time: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                )}

              {frequency === "Once-off" && (
                <div>
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-4 focus:ring-2 focus:ring-blue-400"
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
        {activeTab === "Database" && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Connection Settings */}
              <div className="border border-gray-100 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">
                  Connection Settings
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* Database Type */}
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
                      <option value="" disabled hidden>
                        Select DB Type
                      </option>
                      <option value="mysql">MySQL</option>
                      <option value="mongodb">MongoDB</option>
                    </select>
                  </div>

                  {/* Mongo URI (only for MongoDB) */}
                  {feed.databaseSettings?.databaseType === "mongodb" && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mongo URI
                      </label>
                      <input
                        type="text"
                        value={feed.databaseSettings?.mongoURI || ""}
                        onChange={(e) =>
                          setFeed({
                            ...feed,
                            databaseSettings: {
                              ...feed.databaseSettings,
                              mongoURI: e.target.value,
                            },
                          })
                        }
                        placeholder="mongodb://username:password@host:port/dbname"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  )}

                  {/* MySQL fields */}
                  {feed.databaseSettings?.databaseType !== "mongodb" && (
                    <>
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
                    </>
                  )}

                  {/* Database Name */}
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
                  {/* Table Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Table Name
                    </label>
                    <input
                      type="text"
                      value={feed.tableSettings?.tableName || ""}
                      onChange={(e) => {
                        const tableName = e.target.value;
                        let finalFormat = "";
                        const { dateFormat, datePosition, prefix, suffix } = feed.tableSettings || {};

                        if (tableName && dateFormat && datePosition) {
                          const date = formatDate(dateFormat);
                          switch (datePosition) {
                            case "before":
                              finalFormat = `${date}_${tableName}`;
                              break;
                            case "center":
                              finalFormat = `${prefix || ""}${tableName}_${date}${suffix || ""}`;
                              break;
                            default:
                              finalFormat = `${tableName}_${date}`;
                              break;
                          }
                        }

                        setFeed({
                          ...feed,
                          tableSettings: {
                            ...feed.tableSettings,
                            tableName,
                            format: finalFormat,
                          },
                        });
                      }}
                      placeholder="Table Name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* Has Data Table */}
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

                  {/* Date Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Format
                    </label>
                    <select
                      value={feed.tableSettings?.dateFormat || ""}
                      onChange={(e) => {
                        const dateFormat = e.target.value;
                        let finalFormat = "";
                        const { tableName, datePosition, prefix, suffix } = feed.tableSettings || {};

                        if (tableName && dateFormat && datePosition) {
                          const date = formatDate(dateFormat);
                          switch (datePosition) {
                            case "before":
                              finalFormat = `${date}_${tableName}`;
                              break;
                            case "center":
                              finalFormat = `${prefix || ""}${tableName}_${date}${suffix || ""}`;
                              break;
                            default:
                              finalFormat = `${tableName}_${date}`;
                              break;
                          }
                        }

                        setFeed({
                          ...feed,
                          tableSettings: {
                            ...feed.tableSettings,
                            dateFormat,
                            format: finalFormat,
                          },
                        });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="" disabled hidden>
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

                  {/* Date Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Position
                    </label>
                    <select
                      value={feed.tableSettings?.datePosition || ""}
                      onChange={(e) => {
                        const datePosition = e.target.value;
                        let finalFormat = "";
                        const { tableName, dateFormat, prefix, suffix } = feed.tableSettings || {};

                        if (tableName && dateFormat && datePosition) {
                          const date = formatDate(dateFormat);
                          switch (datePosition) {
                            case "before":
                              finalFormat = `${date}_${tableName}`;
                              break;
                            case "center":
                              finalFormat = `${prefix || ""}${tableName}_${date}${suffix || ""}`;
                              break;
                            default:
                              finalFormat = `${tableName}_${date}`;
                              break;
                          }
                        }

                        setFeed({
                          ...feed,
                          tableSettings: {
                            ...feed.tableSettings,
                            datePosition,
                            format: finalFormat,
                          },
                        });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="" disabled hidden>
                        Select Date Position
                      </option>
                      <option value="after">After</option>
                      <option value="before">Before</option>
                      <option value="center">Center</option>
                    </select>
                  </div>

                  {/* Prefix & Suffix for Center */}
                  {feed.tableSettings?.datePosition === "center" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prefix
                        </label>
                        <input
                          type="text"
                          value={feed.tableSettings?.prefix || ""}
                          onChange={(e) => {
                            const prefix = e.target.value;
                            const { tableName, dateFormat, suffix } = feed.tableSettings || {};
                            const date = tableName && dateFormat ? formatDate(dateFormat) : "";
                            const finalFormat = tableName && dateFormat ? `${prefix}${tableName}_${date}${suffix || ""}` : "";
                            setFeed({
                              ...feed,
                              tableSettings: {
                                ...feed.tableSettings,
                                prefix,
                                format: finalFormat,
                              },
                            });
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                          placeholder="Enter Prefix"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Suffix
                        </label>
                        <input
                          type="text"
                          value={feed.tableSettings?.suffix || ""}
                          onChange={(e) => {
                            const suffix = e.target.value;
                            const { tableName, dateFormat, prefix } = feed.tableSettings || {};
                            const date = tableName && dateFormat ? formatDate(dateFormat) : "";
                            const finalFormat = tableName && dateFormat ? `${prefix || ""}${tableName}_${date}${suffix}` : "";
                            setFeed({
                              ...feed,
                              tableSettings: {
                                ...feed.tableSettings,
                                suffix,
                                format: finalFormat,
                              },
                            });
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                          placeholder="Enter Suffix"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* 🔹 Dynamic Preview */}
                {feed.tableSettings?.tableName &&
                  feed.tableSettings?.dateFormat &&
                  feed.tableSettings?.datePosition && (
                    <div className="mt-4 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-md">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Format:</span>
                      </p>
                      <p className="font-mono text-blue-700 text-sm mt-1">
                        {feed.tableSettings.format}
                      </p>
                    </div>
                  )}
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
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Advanced Rules Configuration
              </h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm border border-purple-200 rounded-md text-purple-600 hover:bg-purple-50 transition">
                  Draft
                </button>
                <button className="px-4 py-2 text-sm border border-blue-200 rounded-md text-blue-600 hover:bg-blue-50 transition">
                  File
                </button>
                <button
                  className="px-4 py-2 text-sm border border-green-200 rounded-md text-green-600 hover:bg-green-50 transition"
                  onClick={openModal}
                >
                  + Add Rule
                </button>
                <button className="px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 transition">
                  Clone Rules
                </button>
              </div>
            </div>

            {/* Rules Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-100 overflow-hidden">
                <thead className="bg-gray-200 text-gray-700 border-b border-gray-100">
                  <tr >
                    <th className="px-4 py-2 font-medium">No</th>
                    <th className="px-4 py-2 font-medium">Fields</th>
                    <th className="px-4 py-2 font-medium">Rule</th>
                    <th className="px-4 py-2 font-medium">Threshold(%)</th>
                    <th className="px-4 py-2 font-medium">Created By</th>
                    <th className="px-4 py-2 font-medium">Created At</th>
                    <th className="px-4 py-2 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {rules.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-6 text-gray-500 bg-gray-50"
                      >
                        No Rules Added
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-4 py-2 text-center text-gray-600">{index + 1}</td>
                        <td className="px-4 py-2 text-center text-gray-700">{rule.field}</td>
                        <td className="px-4 py-2 text-center text-gray-700">{rule.type}</td>
                        <td className="px-4 py-2 text-center text-gray-700">{rule.threshold}</td>
                        <td className="px-4 py-2 text-center text-gray-700">
                          {rule.createdBy?.name || "-"}
                        </td>
                        <td className="px-4 py-2 text-center text-gray-700">{rule.createdAt}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => removeRule(index)}
                            className="text-red-600 hover:text-red-700 hover:underline text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Modal */}
              <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                className="bg-white rounded-lg shadow-lg max-w-md mx-auto mt-24 p-6 outline-none"
                overlayClassName="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center"
              >
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Add New Rule
                </h2>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Field"
                    value={newRule.field}
                    onChange={(e) => setNewRule({ ...newRule, field: e.target.value })}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Rule"
                    value={newRule.type}
                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Threshold"
                    value={newRule.threshold}
                    onChange={(e) =>
                      setNewRule({ ...newRule, threshold: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Modal buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveRule}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                </div>
              </Modal>
            </div>

            {/* Footer */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-md hover:bg-blue-700 transition"
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
