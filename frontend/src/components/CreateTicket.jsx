import { useState } from "react";
import { useAuth } from "../hooks/useAuth"; // Adjust the path as needed

export default function CreateTicketModal({ isOpen, onClose, onSuccess, onError }) {
  const { user } = useAuth(); // Get the logged-in user's info
  const [department, setDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState(""); // default priority
  const [description, setDescription] = useState("");
  const [watcher, setWatcher] = useState("");
  const [selectedWatchers, setSelectedWatchers] = useState([]);
  const [watcherSuggestions, setWatcherSuggestions] = useState([]);


 

  // Dummy user data
  const dummyUsers = ["Ashish Ghori", "Abhishek", "Krushill Gajjar", "Drupad Panchal", "Aakanksha Chahal", "Vivek Pankhaniya", "Jaimin Panchal", "Anand Singh"];

  // Handle typing in watcher input
  const handleWatcherChange = (e) => {
    const value = e.target.value;
    setWatcher(value);

    if (value.length >= 1) {
      const filtered = dummyUsers.filter(
        (name) =>
          name.toLowerCase().includes(value.toLowerCase()) &&
          !selectedWatchers.includes(name)
      );
      setWatcherSuggestions(filtered);
    } else {
      setWatcherSuggestions([]);
    }
  };

  // Select a watcher
  const selectWatcher = (name) => {
    setSelectedWatchers([...selectedWatchers, name]);
    setWatcher("");
    setWatcherSuggestions([]);
  };

  // Remove a watcher
  const removeWatcher = (name) => {
    setSelectedWatchers(selectedWatchers.filter((w) => w !== name));
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!department || !title || !priority || !description) {
      alert("Please fill all required fields.");
      return;
    }

    if (!user || !user.name) {
      alert("User not logged in.");
      return;
    }

    const ticketData = {
      department,
      title,
      status,
      priority,
      description,
      watcher: selectedWatchers // optional
    };

    try {
      const res = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/tickets`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess(`Ticket created successfully! Ticket No: ${data.ticket.ticketNo}`);
        onClose();
      } else {
        alert(data.message || "Failed to create ticket.");
      }
    } catch (error) {
      onError(error.message);
      console.error("Error saving ticket:", error);
      alert("Server error.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-xl relative">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Generate Ticket</h2>

        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="w-full bg-gray-100 rounded p-2"
                placeholder="Ticket title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                className="w-full bg-gray-100 rounded p-2"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="" disabled>Select Department</option>
                <option value="Support">Support</option>
                <option value="R&D">R&D</option>
                <option value="Operation">Operation</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full bg-gray-100 rounded p-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="" disabled>Select Status</option>
                <option value="New">New</option>
                <option value="Pending">Pending</option>
                <option value="In-Progress">In-Progress</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                className="w-full bg-gray-100 rounded p-2"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="" disabled>Select Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full bg-gray-100 rounded p-2"
                rows="4"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            {/* Watcher */}
             <div className="mb-6 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Watcher</label>

          <div className="flex flex-wrap gap-2 border rounded p-2 bg-gray-100">
            {selectedWatchers.map((name) => (
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
              value={watcher}
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
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Create Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
