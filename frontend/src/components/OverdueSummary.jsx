import { useState } from "react";

export default function OverdueSummary({ department = "General" }) {
  const [activeTab, setActiveTab] = useState("projects");

  const projects = [
    { id: 1, name: "Flipkart product extraction", dueDate: "2025-08-25", overdueBy: "2 Days" },
    { id: 2, name: "Wallmart product extraction", dueDate: "2025-08-20", overdueBy: "1 Day" },
  ];

  const tasks = [
    { id: 1, name: "Fix bug in flipkart project", dueDate: "2025-08-22", overdueBy: "5 Days" },
    { id: 2, name: "Add automation to wallmart project", dueDate: "2025-08-24", overdueBy: "3 Days" },
  ];

  // choose dataset
  const data =
    department === "Sales"
      ? projects // only projects for Sales
      : activeTab === "tasks"
      ? tasks
      : projects;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      <h2 className="text-lg font-semibold mb-3">Overdue</h2>

      {/* Tabs (hide if Sales) */}
      {department !== "Sales" && (
        <div className="flex mb-4">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex-1 py-2 text-sm font-medium border-b-2 ${
              activeTab === "tasks"
                ? "border-sky-600 text-sky-600"
                : "border-transparent text-gray-500"
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex-1 py-2 text-sm font-medium border-b-2 ${
              activeTab === "projects"
                ? "border-sky-600 text-sky-600"
                : "border-transparent text-gray-500"
            }`}
          >
            Projects
          </button>
        </div>
      )}

      {/* List */}
      {data.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {data.map((item, idx) => (
            <div key={idx} className="py-3 flex justify-between">
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">
                  Due Date: {new Date(item.dueDate).toLocaleDateString()}
                </p>
              </div>
              <p className="text-red-500 font-semibold text-sm">
                {Math.ceil(
                  (new Date() - new Date(item.dueDate)) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                Days
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No overdue items</p>
      )}
    </div>
  );
}
