import { useNavigate } from "react-router-dom";
import Img from "../assets/no-data-found.svg";

export default function ProjectTable({
  role,
  data,
  loading,
  currentPage,
  entries,
  fetchQAData,
  selectedStatus,
  setSelectedStatus,
}) {
  const navigate = useNavigate();

  const renderStatus = (item) => {
    if (role === "Developer") {
      return (
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
            ${item.Status?.toLowerCase().includes("failed") ? "bg-red-100 text-red-800" :
            item.Status?.toLowerCase().includes("passed") ? "bg-green-100 text-green-800" :
            item.Status?.toLowerCase().includes("qa") ? "bg-purple-100 text-purple-800" :
            "bg-blue-100 text-blue-800"}`}
        >
          {item.Status?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") ?? "-"}
        </span>
      );
    }

    if (role === "QA") {
      if (item.Status === "assigned_to_qa") {
        return (
          <select
            value="assigned_to_qa"
            onChange={async (e) => {
              const status = e.target.value;
              if (!status) return;
              try {
                const res = await fetch(
                  `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${item._id}/transition`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ to: "qa_open", comment: "QA opened project" }),
                  }
                );
                if (res.ok) fetchQAData();
              } catch (err) {
                console.error(err);
                alert("Server error");
              }
            }}
            className="w-full border rounded px-2 py-1 text-sm bg-blue-100 text-blue-800"
          >
            <option value="assigned_to_qa">Assigned to QA</option>
            <option value="qa_open">Open</option>
          </select>
        );
      }

      if (item.Status === "qa_open") {
        return (
          <select
            value={selectedStatus[item._id] || ""}
            onChange={async (e) => {
              const status = e.target.value;
              if (!status) return;
              setSelectedStatus(prev => ({ ...prev, [item._id]: status }));
              try {
                const res = await fetch(
                  `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${item._id}/transition`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ to: status, comment: "QA updated status" }),
                  }
                );
                if (res.ok) {
                  fetchQAData();
                  navigate(`/qa/${item._id}`);
                }
              } catch (err) {
                console.error(err);
                alert("Server error");
                setSelectedStatus(prev => ({ ...prev, [item._id]: "" }));
              }
            }}
            className="w-full border rounded px-2 py-1 text-sm"
          >
            <option value="">Select Status</option>
            <option value="qa_passed">QA Passed</option>
            <option value="qa_failed">QA Failed</option>
          </select>
        );
      }

      return (
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
          ${item.Status?.toLowerCase().includes("failed") ? "bg-red-100 text-red-800" :
          item.Status?.toLowerCase().includes("passed") ? "bg-green-100 text-green-800" :
          item.Status?.toLowerCase().includes("qa") ? "bg-purple-100 text-purple-800" :
          "bg-blue-100 text-blue-800"}`}>
          {item.Status?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") ?? "-"}
        </span>
      );
    }

    return "-";
  };

  return (
    <div className="max-h-[400px] overflow-x-auto border border-gray-50">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 text-gray-700">
          <tr className="text-center">
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Project Name</th>
            <th className="px-4 py-2">PM</th>
            <th className="px-4 py-2">TL</th>
            <th className="px-4 py-2">Developer</th>
            <th className="px-4 py-2">Frequency</th>
            <th className="px-4 py-2">Platform</th>
            <th className="px-4 py-2">QA Status</th>
            <th className="px-4 py-2">File Path</th>
            {role === "Developer" && <th className="px-4 py-2">QA Report</th>}
            {role === "QA" && <th className="px-4 py-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={10} className="text-center p-8 text-gray-500">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((item, idx) => (
              <tr
                key={item._id}
                className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} `}
              >
                <td className="px-3 py-2">{(currentPage - 1) * entries + idx + 1}</td>
                <td className="px-3 py-2">{item.ProjectName || "-"}</td>
                <td className="px-3 py-2">{item.PMId?.name ?? "-"}</td>
                <td className="px-3 py-2">{item.TLId?.name ?? "-"}</td>
                <td className="px-3 py-2">
                  {item.DeveloperIds?.map(d => d.name).join(", ") || "-"}
                </td>
                <td className="px-3 py-2">{item.Frequency ?? "-"}</td>
                <td className="px-3 py-2">{item.Platform ?? "-"}</td>
                <td className="px-3 py-2 text-center">{renderStatus(item)}</td>
                <td className="px-3 py-2 space-y-1">
                  {item.assignedFiles?.length > 0 ? (
                    <a
                      href={item.assignedFiles[item.assignedFiles.length - 1].fileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block text-sm"
                    >
                      {item.assignedFiles[item.assignedFiles.length - 1].fileLink}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                {role === "Developer" && (
                  <td className="px-3 py-2">
                    <button
                      className={`text-blue-600 hover:underline ${!item.qaReportLink
                        ? "text-gray-400 cursor-not-allowed hover:underline-none"
                        : "cursor-pointer"
                        }`}
                      onClick={() => {
                        if (item.qaReportLink) {
                          navigate(`/qa/${item._id}`);
                        }
                      }}
                      disabled={!item.qaReportLink}
                    >
                      View report
                    </button>
                  </td>
                )}
                {role === "QA" && <td className="px-3 py-2"> {/* extra actions here */}</td>}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10} className="text-center p-8 text-gray-500">
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
  );
}
