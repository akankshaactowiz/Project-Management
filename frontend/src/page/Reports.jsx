import { useState, useEffect } from "react";
import { FaFilePdf, FaFileCsv, } from "react-icons/fa6";
import { RiFileExcel2Fill } from "react-icons/ri";
import { LuFileJson } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import Pagination from "../components/Pagination";
import Img from "../assets/no-data-found.svg";
import { useAuth } from "../hooks/useAuth";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function WorkDescription() {

  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  const [summaryData, setSummaryData] = useState({ dates: [], summary: [] });
  const [filter, setFilter] = useState("weekly"); // daily | weekly | monthly

  const [fromDate, setFromDate] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [activeQuick, setActiveQuick] = useState("");

  const [chartLoading, setChartLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState(""); // "" means all allowed roles

  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // fetch only allowed roles for current user
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/roles`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch roles");
        const data = await res.json();
        // extract only role names for dropdown
        setRoles(data.roles.map(r => r.name));

        setRoles(data.roles); // e.g., [{_id, name}]
      } catch (err) {
        console.error(err);
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  // Fetch table reports
  // useEffect(() => {
  //   const fetchReports = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await fetch(
  //         `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/reports/{}`,
  //         { credentials: "include" }
  //       );
  //       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  //       const result = await res.json();
  //       const formatted = result.map((item) => ({
  //         name: item.name?.name || "-",
  //         role: item.roleId?.name || "-",
  //         department: item.departmentId?.department || "-",
  //         taskType: item.taskType,
  //         project: item.project,
  //         feed: item.feed,
  //         task: item.task,
  //         assignedBy: item.assignedBy,
  //         date: item.date ? new Date(item.date).toISOString().split("T")[0] : "-",
  //         timetaken: `${item.hours || 0}h ${item.minutes || 0}m`,
  //       }));

  //       setData(formatted);
  //       setColumns(Object.keys(formatted[0] || {}));
  //     } catch (err) {
  //       console.error("Error fetching work reports:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchReports();
  // }, []);


  // useEffect(() => {
  //   const fetchSummary = async () => {
  //     try {
  //       setChartLoading(true);
  //       const params = new URLSearchParams({ filter });
  //       if (appliedFrom) {
  //         params.append("fromDate", appliedFrom);
  //         params.append("toDate", appliedFrom);
  //       }

  //       const res = await fetch(
  //         `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/reports/summary?${params.toString()}`,
  //         { credentials: "include" }
  //       );
  //       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  //       const result = await res.json();
  //       setSummaryData(result);
  //     } catch (err) {
  //       console.error("Error fetching report summary:", err);
  //     }finally {
  //       setChartLoading(false);
  //     }
  //   };
  //   fetchSummary();
  // }, [filter, appliedFrom]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setChartLoading(true);

        const params = new URLSearchParams({ filter });
        if (appliedFrom) {
          params.append("fromDate", appliedFrom);
          params.append("toDate", appliedFrom);
        }

        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/reports/with-summary?${params.toString()}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result = await res.json();
        console.log(result)

        const formatted = result.reports.map((item) => ({
          // id: item.name?._id || "",
          name: item.name?.name || "-",
          userId: item.name?._id || "",
          role: item.roleId?.name || "-",
          department: item.departmentId?.department || "-",
          taskType: item.taskType,
          project: item.project,
          feed: item.feed,
          task: item.task,
          assignedBy: item.assignedBy,
          date: item.date ? new Date(item.date).toISOString().split("T")[0] : "-",
          timetaken: `${item.hours || 0}h ${item.minutes || 0}m`,
        }));

        setData(formatted);
        setColumns(Object.keys(formatted[0] || {}).filter(key => key !== "userId"));

        setSummaryData({
          dates: result.dates,
          summary: result.summary
        });
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
        setChartLoading(false);
      }
    };
    fetchData();
  }, [filter, appliedFrom]);


  // Chart config
  // const chartData = {
  //   labels: summaryData.dates || [],
  //   datasets: (summaryData.summary || [])
  //     .filter((u) => {
  //       // If no roleFilter selected, include all
  //       if (!roleFilter) return true;
  //       return u.userRole === roleFilter;
  //     })
  //     .map((u, idx) => ({
  //       label: u.user, // display user name
  //       data: u.hoursPerDate,
  //       borderColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
  //       backgroundColor: `hsla(${(idx * 60) % 360}, 70%, 50%, 0.3)`,
  //       tension: 0.3,
  //       fill: true,
  //     })),
  // };

  const parseHoursString = (str) => {
    // str = "5 hrs 7 mins" or "3 hrs 0 mins"
    const match = str.match(/(\d+)\s*hrs?\s*(\d+)?\s*mins?/);
    if (!match) return 0;
    const hrs = Number(match[1] || 0);
    const mins = Number(match[2] || 0);
    return hrs * 60 + mins;
  };
  const chartData = {
    labels: summaryData.dates || [],
    datasets: (summaryData.summary || [])
      .filter((u) => !roleFilter || u.userRole === roleFilter)
      .map((u, idx) => ({
        label: u.user,
        data: (summaryData.dates || []).map((_, i) => {
          const str = u.hoursPerDate?.[i] ?? "0 hrs 0 mins";
          return parseHoursString(str); // convert to minutes
        }),
        borderColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
        backgroundColor: `hsla(${(idx * 60) % 360}, 70%, 50%, 0.3)`,
        tension: 0.3,
        fill: false,
      })),
  };
  const formatMinutes = (totalMins) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs && mins) return `${hrs}h ${mins}m`;
    if (hrs) return `${hrs}h`;
    return `${mins}m`;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) => formatMinutes(context.raw),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 540, // e.g., 8h in minutes
        title: { display: true, text: "Hours" },
        ticks: { stepSize: 60, callback: (val) => formatMinutes(val) },
      },
      x: { title: { display: true, text: "Date" } },
    },
  };



  //   const chartOptions = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   plugins: {
  //     legend: { position: "top" },
  //   },
  //   scales: {
  //     y: {
  //   beginAtZero: true,
  //   suggestedMax: 8.5, // 8h 30m
  //   title: { display: true, text: "Hours" },
  //   ticks: {
  //     stepSize: 1, // show full hours only
  //     callback: function(value, index, ticks) {
  //       if (value === 8.5) return "8h 30m"; // top tick
  //       return `${value}h`; // full hours for others
  //     },
  //   },
  // },

  //     x: {
  //       title: { display: true, text: "Date" },
  //       ticks: {
  //         autoSkip: true,
  //         maxTicksLimit: 7,
  //         maxRotation: 0,
  //         minRotation: 0,
  //       },
  //     },
  //   },
  // };
  // console.log("Labels:", summaryData.dates);
  // console.log("Datasets:", summaryData.summary.map(u => ({
  //   user: u.user,
  //   hoursPerDate: u.hoursPerDate
  // })));


  // const chartData = {
  //   labels: summaryData.dates || [],
  //   datasets: (summaryData.summary || [])
  //     .filter((u) => {
  //       if (!roleFilter) return true;
  //       return u.userRole === roleFilter;
  //     })
  //     .map((u, idx) => ({
  //       label: u.user,
  //       data: u.hoursPerDate.map((val) => {
  //         const hrs = Math.floor(val);
  //         const mins = Math.round((val - hrs) * 60);
  //         return hrs * 60 + mins; // store minutes
  //       }),
  //       borderColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
  //       backgroundColor: `hsla(${(idx * 60) % 360}, 70%, 50%, 0.3)`,
  //       tension: 0.3,
  //       fill: true,
  //     })),
  // };

  // const chartOptions = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   plugins: {
  //     legend: { position: "top" },
  //     tooltip: {
  //       callbacks: {
  //         label: (context) => {
  //           const totalMins = context.raw;
  //           const hrs = Math.floor(totalMins / 60);
  //           const mins = totalMins % 60;
  //           if (hrs && mins) return `${hrs}h ${mins}m`;
  //           if (hrs) return `${hrs}h`;
  //           return `${mins}m`;
  //         },
  //       },
  //     },
  //   },
  //   scales: {
  //     y: {
  //       beginAtZero: true,
  //       suggestedMax: 510, // 8h 30m in minutes
  //       title: { display: true, text: "Hours" },
  //       ticks: {
  //         stepSize: 60, // 1h steps
  //         callback: function (value) {
  //           const hrs = Math.floor(value / 60);
  //           const mins = value % 60;
  //           if (hrs && mins) return `${hrs}h ${mins}m`;
  //           if (hrs) return `${hrs}h`;
  //           return `${mins}m`;
  //         },
  //       },
  //     },
  //     x: {
  //       title: { display: true, text: "Date" },
  //       ticks: {
  //         autoSkip: true,
  //         maxTicksLimit: 7,
  //         maxRotation: 0,
  //         minRotation: 0,
  //       },
  //     },
  //   },
  // };


  // Filtered + paginated data
  // const filteredData = data.filter((item) => {
  //   const searchLower = search.toLowerCase();
  //   const matchesSearch = Object.values(item).some((val) =>
  //     String(val).toLowerCase().includes(searchLower)
  //   );

  //   const itemDate = item.date && item.date !== "-" ? new Date(item.date) : null;
  //   let matchesDate = true;
  //   if (appliedFrom && itemDate) {
  //     const d = new Date(appliedFrom);
  //     matchesDate = matchesDate && itemDate >= d && itemDate <= d;
  //   }
  //   return matchesSearch && matchesDate;
  // });
  const filteredData = data.filter((item) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchLower)
    );

    const itemDate = item.date && item.date !== "-" ? new Date(item.date) : null;
    let matchesDate = true;
    if (appliedFrom && itemDate) matchesDate = matchesDate && itemDate >= new Date(appliedFrom);

    // if (appliedTo && itemDate) matchesDate = matchesDate && itemDate <= new Date(appliedTo);

    let matchesRole = true;
    if (roleFilter) matchesRole = item.role === roleFilter;

    return matchesSearch && matchesDate && matchesRole;
  });


  const totalPages = Math.ceil(filteredData.length / entries) || 1;
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * entries,
    currentPage * entries
  );

  // Quick date filters
  const applyToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setFromDate(today);
    setAppliedFrom(today);
    setActiveQuick("today");
  };

  const applyYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.toISOString().split("T")[0];
    setFromDate(y);
    setAppliedFrom(y);
    setActiveQuick("yesterday");
  };

  const clearFilter = () => {
    setFromDate("");
    setAppliedFrom("");
    setActiveQuick("");
  };

  return (
    <div className="px-4 pt-4">
      <div className="bg-green-50 p-4 mb-6">
        <h1 className="text-xl md:text-xl font-bold text-gray-800 mb-2">
          Employees Work Time Reports
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          Overview of user activity and work time logs.
        </p>
      </div>
      {/* Summary Line Chart */}
      <div className="bg-white rounded-lg shadow p-4 mb-2">
        <div className="flex items-center justify-end mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
          </select>
        </div>
        {chartLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-500 font-semibold">
            Loading...
          </div>
        ) : (summaryData.summary?.length || 0) > 0 ? (
          <div className="h-64">
            <Line data={chartData} options={chartOptions} height={120} />
          </div>
        ) : (
          <p className="text-center text-gray-500">No summary data available</p>
        )}
      </div>

      {/* Date Filter */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <button
            onClick={applyYesterday}
            className={`px-3 py-1 text-xs rounded ${activeQuick === "yesterday"
                ? "bg-blue-500 text-white"
                : "bg-blue-100 text-blue-600"
              }`}
          >
            Yesterday
          </button>
          <button
            onClick={applyToday}
            className={`px-3 py-1 text-xs rounded ${activeQuick === "today"
                ? "bg-blue-500 text-white"
                : "bg-blue-100 text-blue-600"
              }`}
          >
            Today
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAppliedFrom(fromDate) || setActiveQuick("")}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded"
            >
              Apply
            </button>
            <button
              onClick={clearFilter}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded"
            >
              Clear
            </button>
          </div>
        </div>
        {/* role filter */}
        <div className="flex items-center gap-2">
          {/* <label className="text-gray-700 text-sm">Role:</label> */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Select Role</option>
            {roles
              .filter((role) => role.name !== "Superadmin" && role.name !== "Manager" && role.name !== "Support" && role.name !== "BAU" && role.name !== "Project Admin") // exclude Superadmin
              .map((role) => (
                <option key={role._id} value={role.name}>
                  {role.name}
                </option>
              ))}
          </select>
        </div>


      </div>

      {/* Search + Export */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="entries" className="text-gray-700 text-sm">
            Show
          </label>
          <select
            id="entries"
            value={entries}
            onChange={(e) => {
              setEntries(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="text-gray-700 text-sm">entries</span>
        </div>




        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded pl-8 pr-3 py-1"
            />
            {/* <FaSearch className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" /> */}
          </div>
          <FaFilePdf size={16} className="text-red-700 cursor-pointer" />
          <RiFileExcel2Fill size={16} className="text-green-600 cursor-pointer" />
          <FaFileCsv size={16} className="text-blue-600 cursor-pointer" />
          <LuFileJson size={16} className="text-yellow-500 cursor-pointer" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                </th>
              ))}
              <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Actions</th> {/* ✅ New Actions column */}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center p-8 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-2 whitespace-nowrap">
                      {row[col] ?? "-"}
                    </td>
                  ))}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button
                      className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      onClick={() => navigate(`/users/${row.userId}/report`)}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="text-center p-8 text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <img src={Img} alt="No data" className="w-32 h-32 object-contain opacity-80" />
                    <p className="font-semibold text-lg text-gray-600">No Data Found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

      </div>

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
