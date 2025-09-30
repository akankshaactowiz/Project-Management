import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CreateEscalationModal({ isOpen, onClose, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    No: "",
    Title: "",
    Project: "",
    Feed: "",
    Description: "",
    Status: "",
    "Assigned By": "",
    "Assigned To": "",
    "Department From": "",
    "Department To": "",
    Watcher: [],
  });

  const [watcherInput, setWatcherInput] = useState("");
  const [watcherSuggestions, setWatcherSuggestions] = useState([]);
  const [createdDate, setCreatedDate] = useState(new Date());

  // Dummy user data (same as ticket example)
  const dummyUsers = [
    "Ashish Ghori",
    "Abhishek",
    "Krushill Gajjar",
    "Drupad Panchal",
    "Aakanksha Chahal",
    "Vivek Pankhaniya",
    "Jaimin Panchal",
    "Anand Singh",
  ];

  if (!isOpen) return null;

  // Watcher input handling
  const handleWatcherChange = (e) => {
    const value = e.target.value;
    setWatcherInput(value);

    if (value.length >= 1) {
      const filtered = dummyUsers.filter(
        (name) =>
          name.toLowerCase().includes(value.toLowerCase()) &&
          !formData.Watcher.includes(name)
      );
      setWatcherSuggestions(filtered);
    } else {
      setWatcherSuggestions([]);
    }
  };

  const selectWatcher = (name) => {
    setFormData((prev) => ({
      ...prev,
      Watcher: [...prev.Watcher, name],
    }));
    setWatcherInput("");
    setWatcherSuggestions([]);
  };

  const removeWatcher = (name) => {
    setFormData((prev) => ({
      ...prev,
      Watcher: prev.Watcher.filter((w) => w !== name),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const submissionData = {
        ...formData,
        "Created Date": createdDate.toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };

      const response = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/escalations`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
        }
      );

      const data = await response.json();
      onSuccess();
      if (response.ok) {
        alert("Escalation created successfully!");
        onClose();
        setFormData({
          Title: "",
          Project: "",
          Feed: "",
          Description: "",
          Status: "",
          "Assigned By": "",
          "Assigned To": "",
          "Department From": "",
          "Department To": "",
          Watcher: [],
        });
        setWatcherInput("");
        setCreatedDate(new Date());
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      onError(error.message);
      console.error("Error:", error);
      // alert("Failed to create escalation");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 overflow-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-xl relative mt-12">
        <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
          Escalation Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="Title"
              value={formData.Title}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded p-2"
            />
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              name="Project"
              value={formData.Project}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded p-2"
            >
              <option value="">Select Project</option>
              <option value="Wallmart product extraction">
                Wallmart product extraction
              </option>
              <option value="Flipkart product extraction">
                Flipkart product extraction
              </option>
              <option value="Amazon product extraction">
                Amazon product extraction
              </option>
            </select>
          </div>

          {/* Feed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feed
            </label>
            <select
              name="Feed"
              value={formData.Feed}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded p-2"
            >
              <option value="">Select Feed</option>
              <option value="Flipkart">Flipkart</option>
              <option value="Amazon">Amazon</option>
              <option value="Wallmart">Wallmart</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded p-2"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="Status"
              value={formData.Status}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded p-2"
            >
              <option value="">Select Status</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Assigned By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned By
            </label>
            <select
              name="Assigned By"
              value={formData["Assigned By"]}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded p-2"
            >
              <option value="">Select</option>
              <option value="Krushill Gajjar">Krushill Gajjar</option>
              <option value="Abhishek">Abhishek</option>
              <option value="Drupad Panchal">Drupad Panchal</option>
            </select>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <select
              name="Assigned To"
              value={formData["Assigned To"]}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded p-2"
            >
              <option value="">Select</option>
              <option value="Ashish Ghori">Ashish Ghori</option>
              <option value="Aakanksha Chahal">Aakanksha Chahal</option>
              <option value="Vivek Pankhaniya">Vivek Pankhaniya</option>
            </select>
          </div>

          {/* Department From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department From
            </label>
            <select
              name="Department From"
              value={formData["Department From"]}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded p-2"
            >
              <option value="">Select</option>
              <option value="R&D">R&D</option>
              <option value="Operation">Operation</option>
              <option value="Sales">Sales</option>
              <option value="IT">IT</option>
              <option value="QA">QA</option>
            </select>
          </div>

          {/* Department To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department To
            </label>
            <select
              name="Department To"
              value={formData["Department To"]}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded p-2"
            >
              <option value="">Select</option>
              <option value="R&D">R&D</option>
              <option value="Operation">Operation</option>
              <option value="Sales">Sales</option>
              <option value="IT">IT</option>
              <option value="QA">QA</option>
            </select>
          </div>

          {/* Watchers */}
          <div className="md:col-span-2 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Watchers
            </label>

            <div className="flex flex-wrap gap-2 border rounded p-2 bg-gray-100">
              {formData.Watcher.map((name) => (
                <span
                  key={name}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => removeWatcher(name)}
                    className="text-blue-600 hover:text-blue-900 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}

              <input
                type="text"
                className="flex-1 bg-transparent outline-none p-1"
                placeholder="Type to search..."
                value={watcherInput}
                onChange={handleWatcherChange}
              />
            </div>

            {watcherSuggestions.length > 0 && (
              <ul className="absolute bg-white border rounded shadow mt-1 w-full max-h-40 overflow-y-auto z-50">
                {watcherSuggestions.map((name) => (
                  <li
                    key={name}
                    onClick={() => selectWatcher(name)}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Created Date */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created Date
            </label>
            <DatePicker
              selected={createdDate}
              onChange={(date) => setCreatedDate(date)}
              showTimeSelect
              timeFormat="hh:mm aa"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy hh:mm aa"
              className="w-full bg-gray-100 rounded p-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
