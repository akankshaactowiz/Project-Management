import { useState } from "react";

export default function CreateTaskModal({ isOpen, onClose, onSuccess, onError }) {
  if (!isOpen) return null;

  // State for each input
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [relatedTo, setRelatedTo] = useState("");
  const [taskType, setTaskType] = useState("");
  const [taskPriority, setTaskPriority] = useState("");
  const [taskStatus, setTaskStatus] = useState("");
  const [project, setProject] = useState("");
  const [feed, setFeed] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedBy, setAssignedBy] = useState("");
  const [estimateStartDate, setEstimateStartDate] = useState("");
  const [estimateEndDate, setEstimateEndDate] = useState("");
  const [watcher, setWatcher] = useState("");
  const [selectedWatchers, setSelectedWatchers] = useState([]);
  const [watcherSuggestions, setWatcherSuggestions] = useState([]);
  const dummyUsers = [
    "Ashish Ghori", "Abhishek", "Krushill Gajjar", 
    "Drupad Panchal", "Aakanksha Chahal", "Vivek Pankhaniya",
    "Jaimin Panchal", "Anand Singh"
  ];

  const handleWatcherChange = (e) => {
    const value = e.target.value;
    setWatcher(value);

    if (value.length >= 1) {
      const filtered = dummyUsers.filter(
        (name) => !selectedWatchers.includes(name) && name.toLowerCase().includes(value.toLowerCase())
      );
      setWatcherSuggestions(filtered);
    } else {
      setWatcherSuggestions([]);
    }
  };

  const selectWatcher = (name) => {
    setSelectedWatchers([...selectedWatchers, name]);
    setWatcher("");
    setWatcherSuggestions([]);
  };

  const removeWatcher = (name) => {
    setSelectedWatchers(selectedWatchers.filter((w) => w !== name));
  };

  const handleSave = async () => {
    const taskData = {
      title,
      department,
      relatedTo,
      taskType,
      taskPriority,
      taskStatus,
      project,
      feed,
      assignedTo,
      assignedBy,
      estimateStartDate,
      estimateEndDate,
      watcher: selectedWatchers
    };

    try {
      const response = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData),
        credentials: "include"
      });

      if (!response.ok) {
        console.error("Failed to save task");
        return;
      }

      const data = await response.json();
      onSuccess();
      // console.log("Task saved:", data); //Debugging

      // Optionally reset the form
      setTitle("");
      setDepartment("");
      setRelatedTo("");
      setTaskType("");
      setTaskPriority("");
      setTaskStatus("");
      setProject("");
      setFeed("");
      setAssignedTo("");
      setAssignedBy("");
      setEstimateStartDate("");
      setEstimateEndDate("");
      setWatcher("");

      onClose();
    } catch (error) {
      onError(error.message);
      console.error("Error saving task:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 overflow-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-xl relative mt-12">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Create New Task</h2>

        {/* Task Details Section */}
        <div className="mb-6">
          <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
            Task Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-100 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              {/* <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-gray-100 rounded p-2"
              /> */}
              <select name="" value={department}
              onChange={(e) => setDepartment(e.target.value)}
               id="" className="w-full bg-gray-100 rounded p-2">
                <option value="">Select</option>
                <option value="R&D">R&D</option>
                <option value="Operation">Operation</option>
                <option value="QA">QA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Related To</label>
              <input
                type="text"
                placeholder="Eg. Project, Ticket, etc."
                value={relatedTo}
                onChange={(e) => setRelatedTo(e.target.value)}
                className="w-full bg-gray-100 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
              {/* <input
                type="text"
                placeholder="Task Type"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full bg-gray-100 rounded p-2"
              /> */}
              <select name="" value={taskType}
               onChange={(e) => setTaskType(e.target.value)}
              id="" className="w-full bg-gray-100 rounded p-2">
                <option value="">Select</option>
                <option value="Bug">Bug</option>
                <option value="Feature">Feature</option>
                {/* <option value="T">Task</option> */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Priority</label>
              {/* <input
                type="text"
                placeholder="Eg. High, Medium, Low"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full bg-gray-100 rounded p-2"
              /> */}
              <select name="" id="" value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full bg-gray-100 rounded p-2">
                  <option value="" disabled>Select</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Status</label>
              {/* <input
                type="text"
                placeholder="Eg. New, In progress, etc."
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                className="w-full bg-gray-100 rounded p-2"
              /> */}
              <select name="" id=""
              value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                className="w-full bg-gray-100 rounded p-2">
                <option value="" disabled>Select</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Reopen">Reopen</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            
            

             {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              name="Project"
             value={project}
                onChange={(e) => setProject(e.target.value)}
              className="w-full bg-gray-100 rounded p-2"
            >
              <option value="">Select Project</option>
              <option value="Wallmart product extraction">Wallmart product extraction</option>
              <option value="Flipkart product extraction">Flipkart product extraction</option>
              <option value="Amazon product extraction">Amazon product extraction</option>
            </select>
          </div>

          {/* Feed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feed</label>
            <select
              name="Feed"
              value={feed}
                onChange={(e) => setFeed(e.target.value)}
              className="w-full bg-gray-100 rounded p-2"
            >
              <option value="">Select Feed</option>
              <option value="Flipkart">Flipkart</option>
              <option value="Amazon">Amazon</option>
              <option value="Wallmart">Wallmart</option>
            </select>
          </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mb-6">
          <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-gray-100 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned By</label>
              <input
                type="text"
                value={assignedBy}
                onChange={(e) => setAssignedBy(e.target.value)}
                className="w-full bg-gray-100 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimate Task Start Date
              </label>
              <input
                type="date"
                value={estimateStartDate}
                onChange={(e) => setEstimateStartDate(e.target.value)}
                className="w-full bg-gray-100 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimate Task End Date
              </label>
              <input
                type="date"
                value={estimateEndDate}
                onChange={(e) => setEstimateEndDate(e.target.value)}
                className="w-full bg-gray-100 rounded p-2"
              />
            </div>

            {/* Watchers */}
           <div className="md:col-span-2 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Add Watcher</label>
              <div className="flex flex-wrap gap-2 border rounded p-2 bg-gray-100">
                {selectedWatchers.map((name) => (
                  <span key={name} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                    {name}
                    <button type="button" onClick={() => removeWatcher(name)} className="text-blue-600 hover:text-blue-900 font-bold">
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

        {/* Action Buttons */}
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
            Save Task
          </button>
        </div>
      </div>
    </div>
 
  );
}
