import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function SalesSummaryDashboard() {
  // Dummy KPI data
  const kpis = [
    { title: "Projects Handed Over", value: 20 },
    // { title: "Avg. Handover Time", value: "1.2 Days" },
    { title: "Escalation Rate", value: "5%" },
    { title: "On-Time Deliveries", value: "85%" },
    // { title: "Avg. Client Satisfaction", value: "4.3/5" },
  ];

  // Chart Data
  const projectHealthData = {
    labels: ["On Track", "Delayed", "Completed"],
    datasets: [
      {
        data: [12, 3, 2, 8],
        backgroundColor: ["#3B82F6", "#F59E0B", "#EF4444", "#10B981"],
      },
    ],
  };

  const escalationTrendData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Escalations",
        data: [2, 3, 1, 4, 2, 3],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239,68,68,0.3)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Dummy project table data
  const projects = [
    {
      name: "Flipkart Product Extraction",
      handover: "2025-09-10",
      status: "On Track",
      manager: "Alice",
    },
    {
      name: "Walmart Scraper",
      handover: "2025-09-15",
      status: "Delayed",
      manager: "Bob",
    },
    {
      name: "Amazon QA Automation",
      handover: "2025-09-18",
      status: "Completed",
      manager: "Carol",
    },
  ];

  return (
    <div className="p-6 min-h-screen">
      {/* <h1 className="text-2xl font-bold mb-6">Sales Summary Dashboard</h1> */}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl shadow-md hover:scale-105 transition"
          >
            <p className="text-sm text-gray-300">{kpi.title}</p>
            <p className="text-xl font-semibold mt-2">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Project Health</h2>
          <Doughnut data={projectHealthData} />
        </div>
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Escalation Trends</h2>
          <Line data={escalationTrendData} />
        </div>
      </div>

      {/* Project Table */}
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-md mb-8 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Project Handover Log</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-300 text-sm">
              <th className="p-2">Project Name</th>
              <th className="p-2">Handover Date</th>
              <th className="p-2">Status</th>
              <th className="p-2">Account Manager</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, idx) => (
              <tr key={idx} className="border-t border-gray-700 text-sm">
                <td className="p-2">{project.name}</td>
                <td className="p-2">{project.handover}</td>
                <td
                  className={`p-2 ${
                    project.status === "Delayed"
                      ? "text-yellow-400"
                      : project.status === "On Track"
                      ? "text-blue-400"
                      : project.status === "Completed"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {project.status}
                </td>
                <td className="p-2">{project.manager}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feedback Section */}
      {/* <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Client Feedback</h2>
        <ul className="space-y-3">
          <li className="flex justify-between">
            <span>Flipkart Product Extraction</span>
            <span>⭐⭐⭐⭐☆</span>
          </li>
          <li className="flex justify-between">
            <span>Walmart Scraper</span>
            <span>⭐⭐⭐☆☆</span>
          </li>
          <li className="flex justify-between">
            <span>Amazon QA Automation</span>
            <span>⭐⭐⭐⭐⭐</span>
          </li>
        </ul>
      </div> */}
    </div>
  );
}
