import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Breadcrumb from "../components/Breadcrumb";

function FeedUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [activeTab, setActiveTab] = useState("Feed Details");
  const [activeTab, setActiveTab] = useState("Feed Details");

  // Fetch feed details by id
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${id}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setFeed(data);
        console.log("Fetched feed:", data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching feed:", err);
        setLoading(false);
      }
    };
    fetchFeed();
  }, [id]);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFeed({ ...feed, [name]: value });
  // };
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update state
    setFeed((prev) => {
      const updated = { ...prev, [name]: value };

      // Clear irrelevant timeline fields when switching frequency
      if (name === "Frequency") {
        if (value === "Daily") {
          updated.TimelineTime = "";
          updated.TimelineDay = null;
          updated.TimelineDate = null;
        } else if (value === "Weekly") {
          updated.TimelineTime = "";
          updated.TimelineDay = "";
          updated.TimelineDate = null;
        } else if (value === "Monthly") {
          updated.TimelineTime = "";
          updated.TimelineDay = null;
          updated.TimelineDate = "";
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(feed),
      });
      if (res.ok) {
        alert("Feed updated successfully!");
        navigate(`/feed/${id}`);
      } else {
        alert("Failed to update feed");
      }
    } catch (err) {
      console.error("Error updating feed:", err);
    }
  };

  const tabs = [
    "Feed Details",
    "Frequency",
    // "Databases",
    // "Systems",
    // "Database Tables",
    // "Auto QA Rules"
  ]

  // Loading state
  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <>
      <div className="flex bg-gray-50 items-center justify-between px-4">
        {/* <Breadcrumb /> */}
        {/* <button
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded cursor-pointer"
            onClick={() => navigate(`/feed/update/${id}`)}
          >
            <FaEdit size={18} />
            <span>Edit</span>
          </button> */}
      </div>
      <div className="border-b border-gray-200 mb-4 overflow-x-auto whitespace-nowrap">
        {tabs.map((tabs) => (
          <button
            key={tabs}
            onClick={() =>
              setActiveTab(tabs)

            }
            className={`inline-block px-4 py-2 text-md font-medium transition-colors duration-200 ${activeTab === tabs
              ? "border-b-2 border-purple-800 text-purple-800"
              : "text-gray-500"
              }`}
          >
            {tabs}
          </button>
        ))}
      </div>
      <div className="p-6 mx-auto">

        {activeTab === "Feed Details" && (

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-2 gap-6 bg-white rounded-xl p-6"
          >
          <div>
              <label className="block font-medium mb-1">Platform</label>
              <input
                type="text"
                name="Platform"
                value={feed.Platform || ""}
                onChange={handleChange}
                className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
              />
            </div>

           
            <div>
              <label className="block font-medium mb-1">Developers</label>
              <input
                type="text"
                name="Developers"
                value={feed.Developer || ""}
                onChange={handleChange}
                className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
              />
            </div>

            
            <div>
              <label className="block font-medium mb-1">QA </label>
              <input
                type="text"
                name="QA"
                value={feed.QA || ""}
                onChange={handleChange}
                className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Manage</label>
              <input
                type="text"
                name="Manage By"
                value={feed['Manage By'] || ""}
                onChange={handleChange}
                className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Feed BAU</label>
              <input
                type="text"
                name="BAU"
                value={feed.BAU || ""}
                onChange={handleChange}
                className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
              />
            </div>

           


        
            <div>
              <label className="block font-medium mb-1">Feed Status</label>
              <input
                type="text"
                name="Status"
                value={feed.Status || ""}
                onChange={handleChange}
                className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
              />
            </div>

        
            <div className="col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
              >
                Update Feed
              </button>

            </div>
          </form>
        )}
        {activeTab === "Frequency" && (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-6 bg-white rounded-xl p-6"
          >
            <label className="block font-medium mb-2">Frequency</label>
            <div className="flex gap-4 mb-4">
              {["Daily", "Weekly", "Monthly"].map((freq) => (
                <label key={freq} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="Frequency"
                    value={freq}
                    checked={feed.Frequency === freq}
                    onChange={handleChange}
                  />
                  {freq}
                </label>
              ))}
            </div>

            {/* Timeline Input */}
            {feed.Frequency === "Daily" && (
              <div>
                <label className="block font-medium mb-1">Delivery Time</label>
                <input
                  type="time"
                  name="TimelineTime" // <-- must match schema
                  value={feed.TimelineTime || ""}
                  onChange={handleChange}
                  className="w-1/6 bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
                />
              </div>
            )}


            {feed.Frequency === "Weekly" && (
              <div className="grid grid-cols gap-4">
                <div>
                  <label className="block font-medium mb-1">Day of Week</label>
                  <select
                    name="TimelineDay"
                    value={feed.TimelineDay || ""}
                    onChange={handleChange}
                    className="w-1/4 bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
                  >
                    <option value="">Select Day</option>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Time</label>
                  <input
                    type="time"
                    name="TimelineTime"
                    value={feed.TimelineTime || ""}
                    onChange={handleChange}
                    className="w-1/4 bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>
            )}


            {feed.Frequency === "Monthly" && (
              <div className="grid grid-cols gap-4">
                <div>
                  <label className="block font-medium mb-1">Date of Month</label>
                  <input
                    type="number"
                    name="TimelineDate"
                    value={feed.TimelineDate || ""}
                    min={1}
                    max={31}
                    onChange={handleChange}
                    className="w-1/6 bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Time</label>
                  <input
                    type="time"
                    name="TimelineTime"
                    value={feed.TimelineTime || ""}
                    onChange={handleChange}
                    className="w-1/6 bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>
            )}


            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
              >
                Update Frequency
              </button>
            </div>
          </form>
        )}
        


      </div>
    </>
  );
}

export default FeedUpdate;
