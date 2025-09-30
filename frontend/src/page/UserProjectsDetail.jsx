import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import Img from "../assets/no-data-found.svg";

export default function ProjectDetail() {
  const { id } = useParams(); // from route /users/:id/details
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // adjust if needed
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const navigate = useNavigate();

  const columns = ["Project Name", "PM", "TL", "Status"];

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/${id}/projects?page=${currentPage}&limit=${itemsPerPage}`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (res.ok) {
          setProjects(data.projects || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalDocs(data.pagination?.totalDocs || 0);
        } else {
          console.error("Failed to fetch projects:", data?.message);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, currentPage, itemsPerPage]);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600 font-medium">
        Loading...
      </p>
    );

  return (
    <div className="p-6 mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
      >
        ← Back
      </button>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
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
            {projects.length > 0 ? (
              projects.map((row, idx) => (
                <tr
                  key={row._id || idx}
                  className={`transition ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.ProjectName || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.PMId?.name || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.TL || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 font-medium rounded-full ${
                        row.Status === "Completed"
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : row.Status === "Under Development"
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                          : row.Status === "In Progress"
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : row.Status === "BAU"
                          ? "bg-purple-100 text-purple-700 border border-purple-300"
                          : "bg-gray-100 text-gray-600 border border-gray-300"
                      }`}
                    >
                      {row.Status || "-"}
                    </span>
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
                      No Data Found
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

      {/* Pagination */}
      {projects.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          // totalDocs={totalDocs}
        />
      )}
    </div>
  );
}
