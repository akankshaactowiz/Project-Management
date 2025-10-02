import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProjectFilesPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to display clean file name
  const getDisplayFileName = (fileName) => {
    if (!fileName) return "";
    const name = fileName.split("/").pop(); // remove URL path
    const parts = name.split("-");
    return parts.length > 3 ? parts.slice(3).join("-").trim() : name;
  };

  const BACKEND_URL = `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}`;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(
          `http://${
            import.meta.env.VITE_BACKEND_NETWORK_ID
          }/api/projects/${id}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (data.success) {
          setProject(data.data || data.project);
        }
      } catch (err) {
        console.error("Error fetching project files:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!project)
    return <div className="p-6 text-red-500">Project not found</div>;

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-6 mt-4">
        {/* Heading */}
        <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
          Project Attachments
        </h2>
      </div>
      <h1 className="text-xl font-bold mb-8 text-gray-900">
        <span className="">{project.ProjectCode}</span> {project.ProjectName}{" "}
        Attachments
      </h1>

      {/* SOW & Sample Files Container */}
      <div className="border border-gray-100 p-6 shadow bg-white">
        {/* SOW Files */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            SOW Files
          </h2>
          {project.SOWFile && project.SOWFile.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm tracking-wide">
                    <th className="w-[10%] px-4 py-3">Version</th>
                    <th className="w-[40%] px-4 py-3">File</th>
                    <th className="w-[20%] px-4 py-3">Uploaded At</th>
                    <th className="w-[20%] px-4 py-3">Uploaded By</th>
                    <th className="w-[10%] px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {project.SOWFile.map((file, idx) => (
                    <tr
                      key={file._id}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-200"
                    >
                      <td className="px-4 py-3 font-medium text-gray-700">
                        V{idx + 1}
                      </td>
                      <td
                        className="px-4 py-3 truncate"
                        title={getDisplayFileName(file.fileName)}
                      >
                        {getDisplayFileName(file.fileName)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {file.uploadedAt
                          ? new Date(file.uploadedAt).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {file.uploadedByName ||
                          file.uploadedBy?.name ||
                          "Unknown"}
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                          onClick={() => {
                            const fileUrl = `${BACKEND_URL}${file.fileName}`;
                            window.open(
                              fileUrl,
                              "_blank",
                              "noopener,noreferrer",
                              "download"
                            );
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No SOW files uploaded yet.</p>
          )}
        </div>

        {/* Sample Files */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Sample Files
          </h2>
          {project.SampleFiles && project.SampleFiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm tracking-wide">
                    <th className="w-[10%] px-4 py-3">Version</th>
                    <th className="w-[40%] px-4 py-3">File</th>
                    <th className="w-[20%] px-4 py-3">Uploaded At</th>
                    <th className="w-[20%] px-4 py-3">Uploaded By</th>
                    <th className="w-[10%] px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {project.SampleFiles.map((file, idx) => (
                    <tr
                      key={file._id}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-200"
                    >
                      <td className="px-4 py-3 font-medium text-gray-700">
                        V{idx + 1}
                      </td>
                      <td
                        className="px-4 py-3 truncate"
                        title={getDisplayFileName(file.fileName)}
                      >
                        {getDisplayFileName(file.fileName)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {file.uploadedAt
                          ? new Date(file.uploadedAt).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {file.uploadedBy?.name || "Unknown"}
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                          onClick={() => {
                            const fileUrl = `${BACKEND_URL}${file.fileName}`;

                            window.open(
                              fileUrl,
                              "_blank",
                              "noopener,noreferrer",
                              "download"
                            );
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No Sample files uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
