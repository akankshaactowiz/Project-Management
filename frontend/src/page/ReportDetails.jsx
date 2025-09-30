import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PaginationControls from "../components/Pagination";
import Img from "../assets/no-data-found.svg";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function UserReports() {
  const { id } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("7days");

  const navigate = useNavigate();
  const itemsPerPage = 5;
  const columns = ["Project", "Task Type", "Task", "Assigned By", "Time Taken","Description", "Date"];
  const now = new Date();

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        // `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/${id}/report?page=${currentPage}&limit=${itemsPerPage}`,
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/reports/${id}?page=${currentPage}&limit=${itemsPerPage}`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (res.ok) {
          setReports(data.reports || []);
          setTotalPages(data.pagination?.totalPages || 1);
        } else {
          console.error("Failed to fetch reports:", data?.message);
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [id, currentPage]);

  if (loading)
    return <p className="text-center mt-10 text-gray-600 font-medium">Loading...</p>;

  const formatTime = (hours, minutes) => {
    if (!hours && !minutes) return "0m";
    let result = "";
    if (hours) result += `${hours}h `;
    if (minutes) result += `${minutes}m`;
    return result.trim();
  };

  let filteredReports = reports;
  if (filter === "7days") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    filteredReports = reports.filter((r) => new Date(r.date) >= sevenDaysAgo);
  } else if (filter === "last30days") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 29);
    filteredReports = reports.filter((r) => new Date(r.date) >= thirtyDaysAgo);
  } else if (filter === "today") {
    filteredReports = reports.filter(
      (r) => new Date(r.date).toDateString() === now.toDateString()
    );
  }

  const aggregateData = () => {
    const grouped = {};

    if (filter === "today") {
      const today = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      let totalMinutes = 0;
      filteredReports.forEach((r) => {
        totalMinutes += r.hours * 60 + r.minutes;
      });
      grouped[today] = totalMinutes;
    } else if (filter === "7days") {
      const last7days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        last7days.push(label);
        grouped[label] = 0;
      }
      filteredReports.forEach((r) => {
        const d = new Date(r.date);
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (grouped[label] !== undefined) {
          grouped[label] += r.hours * 60 + r.minutes;
        }
      });
    } else if (filter === "last30days") {
      const last30days = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        last30days.push(label);
        grouped[label] = 0;
      }
      filteredReports.forEach((r) => {
        const d = new Date(r.date);
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (grouped[label] !== undefined) {
          grouped[label] += r.hours * 60 + r.minutes;
        }
      });
    }

    return Object.entries(grouped).map(([label, minutes]) => ({
      label,
      hours: Math.round(minutes / 60),
      minutes: minutes % 60,
    }));
  };

  const chartData = aggregateData();

  const colors = [
    "rgba(255, 99, 132, 0.6)",
    "rgba(255, 159, 64, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(201, 203, 207, 0.6)",
  ];

  return (
    <div className="p-6 mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
      >
        ← Back
      </button>

      <div className="flex justify-end mb-3 space-x-2">
        {["7days", "today", "last30days"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {f === "7days" ? "Last 7 Days" : f === "today" ? "Today" : "Last 30 Days"}
          </button>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="mb-6 bg-white p-4 rounded shadow h-[300px]">
          <Bar
  key={filter}
  data={{
    labels: chartData.map((d) => d.label),
    datasets: [
      {
        label: "Hours Logged",
        data: chartData.map((d) => d.hours + d.minutes / 60), // plot total hours with decimal
        backgroundColor: chartData.map((_, i) => colors[i % colors.length]),
        borderColor: chartData.map((_, i) =>
          colors[i % colors.length].replace("0.6", "1")
        ),
        borderWidth: 1,
      },
    ],
  }}
  options={{
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Work Log (Hours)" },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const data = chartData[index];
            let label = `${data.hours}h`;
            if (data.minutes > 0) {
              label += ` ${data.minutes}m`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: function (val, index) {
            return this.getLabelForValue(val);
          },
          padding: 20,
        },
        grid: { drawTicks: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    datasets: {
      bar: {
        barThickness: 50,
        maxBarThickness: 60,
      },
    },
  }}
/>

        </div>
      )}

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto mb-8">
        <table className="min-w-full divide-y divide-gray-200">
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

          <tbody>
            {reports.length > 0 ? (
              reports.map((row, idx) => (
                <tr
                  key={row._id || idx}
                  className={`transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <td className="px-4 py-3">{row.project}</td>
                  <td className="px-4 py-3">{row.taskType}</td>
                  <td className="px-4 py-3">{row.task}</td>
                  <td className="px-4 py-3">{row.assignedBy}</td>
                  <td className="px-4 py-3">{formatTime(row.hours, row.minutes)}</td>
                  <td className="px-4 py-3">{row.description || "-"}</td>
                  <td className="px-4 py-3">
                    {new Date(row.date).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center p-10 text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <img
                      src={Img}
                      alt="No data"
                      className="w-28 h-28 object-contain opacity-70"
                    />
                    <p className="font-semibold text-gray-600 text-base">
                      No Reports Found
                    </p>
                    <p className="text-gray-400">
                      Try adjusting your filters or adding new entries.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
