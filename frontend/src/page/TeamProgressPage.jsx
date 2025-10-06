import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

// Single-file React component using Tailwind CSS + Chart.js
// Change the mock data below to connect with your backend.

export default function TeamProgressPage() {
  // --- Top summary cards ---
  const summaryCards = [
    { title: "Total Projects", value: 28, color: "bg-blue-500" },
    { title: "Completed", value: 18, color: "bg-green-500" },
    { title: "Ongoing", value: 6, color: "bg-yellow-400" },
    { title: "Pending", value: 4, color: "bg-red-500" },
  ];

  // --- Bar chart (project overview per person) ---
  const teamMembers = ["John (Mgr)", "Sarah (BDE)", "Ankit (BDE)", "Priya (Mgr)"];
  const completed = [8, 5, 6, 7];
  const ongoing = [3, 2, 1, 4];

  const barData = {
    labels: teamMembers,
    datasets: [
      {
        label: "Completed",
        data: completed,
        backgroundColor: "#3B82F6",
        borderRadius: 6,
      },
      {
        label: "Ongoing",
        data: ongoing,
        backgroundColor: "#F59E0B",
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "bottom" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 2 } },
      x: { grid: { display: false } },
    },
  };

  // --- Concentric rings (Your team's progress) ---
  // Each dataset is a ring: [completedPercent, remaining]
  // The `weight` controls relative thickness of each ring.
  const ringDatasets = [
    { name: "Priya", value: 92, color: "#2563EB", weight: 4 },
    { name: "Ankit", value: 68, color: "#06B6D4", weight: 3 },
    { name: "Sarah", value: 50, color: "#FB923C", weight: 2 },
    { name: "John", value: 28, color: "#A78BFA", weight: 1 },
  ];

  const concentricData = {
    // labels represent the two slices used by each dataset
    labels: ["Progress", "Remaining"],
    datasets: ringDatasets.map((r) => ({
      label: r.name,
      data: [r.value, 100 - r.value],
      backgroundColor: [r.color, "#EFF2F6"],
      borderWidth: 0,
      weight: r.weight,
      hoverOffset: 4,
    })),
  };

  const concentricOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    // drawingOrder: 'default',
  };

  // --- Project completion donut (single dataset) ---
  const completionData = {
    labels: ["Completed", "In Progress", "Pending"],
    datasets: [
      {
        data: [75, 15, 10],
        backgroundColor: ["#2563EB", "#06B6D4", "#E5E7EB"],
        borderWidth: 0,
      },
    ],
  };

  const completionOptions = {
    cutout: "70%",
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((c, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between"
          >
            <div>
              <h4 className="text-xs text-gray-500">{c.title}</h4>
              <p className="text-2xl font-semibold text-gray-800">{c.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${c.color} bg-opacity-90`} />
          </div>
        ))}
      </div>

      {/* Main grid: left = "Your team's progress" (rings), right = Bar (project overview) + completion donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left card: concentric rings + chips */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Project progress</h3>
            {/* <button className="text-sm text-gray-500">Show more details ▾</button> */}
          </div>

          {/* Top chips */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
              <div className="text-orange-500 font-semibold text-lg">12</div>
              <div className="text-xs text-gray-500">Due</div>
            </div>
            <div className="flex-1 bg-cyan-50 border border-cyan-100 rounded-lg p-3 text-center">
              <div className="text-cyan-500 font-semibold text-lg">23</div>
              <div className="text-xs text-gray-500">In progress</div>
            </div>
            <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center">
              <div className="text-indigo-500 font-semibold text-lg">64</div>
              <div className="text-xs text-gray-500">Done</div>
            </div>
          </div>

          {/* Concentric doughnut chart */}
          <div className="flex items-center justify-center">
            <div style={{ width: 220, height: 220, position: "relative" }}>
              <Doughnut data={concentricData} options={concentricOptions} />

              {/* center label - optionally show aggregate or legend */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Team</div>
                  <div className="text-xl font-semibold text-gray-800">4 members</div>
                </div>
              </div>
            </div>
          </div>

          {/* small legend under chart */}
          {/* <div className="mt-6 grid grid-cols-2 gap-2 text-sm text-gray-600">
            {ringDatasets.map((r) => (
              <div key={r.name} className="flex items-center gap-2">
                <span style={{ background: r.color }} className="w-3 h-3 rounded-full inline-block" />
                <span>{r.name}</span>
                <span className="ml-auto font-semibold">{r.value}%</span>
              </div>
            ))}
          </div> */}
        </div>

        {/* Right column: Bar chart + Project completion donut */}
        {/* <div className="space-y-6"> */}
          {/* <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Your Team's Progress (Overview)</h3>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
            <Bar data={barData} options={barOptions} />
          </div> */}

         <div className="bg-white border border-gray-100 p-6 shadow-sm rounded-xl duration-300">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-semibold text-gray-800">Project Completion</h3>
    <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
      Updated Today
    </span>
  </div>

  <div className="relative flex items-center justify-center">
    <div style={{ width: 240, height: 240 }}>
      <Doughnut data={completionData} options={completionOptions} />
    </div>
    {/* Centered percentage */}
    <div className="absolute text-center">
      <h4 className="text-3xl font-bold text-gray-800">78%</h4>
      <p className="text-sm text-gray-500 mt-1">Completed</p>
    </div>
  </div>

  <div className="mt-6 text-center">
    <p className="text-gray-600">
      <span className="text-green-600 font-medium">+5.4%</span> improvement from last month
    </p>
  </div>
</div>

        </div>
      </div>
    // </div>
  );
}
