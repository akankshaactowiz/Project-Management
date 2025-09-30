import $ from "jquery";

// import "datatables.net";
import { useEffect, useRef } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

export default function ProjectDataTable ({
  user,
  data,
  baseColumns,
  roleColumns,
  navigate,
  setSelectedProject,
  setIsUpdateModalOpen,
}) {
    // const user = useAuth();
  const tableRef = useRef();

  // Generate full columns for DataTable based on role
  const columns = [
    ...baseColumns,
    ...(roleColumns[user?.roleName] || []),
  ].map((col) => {
    switch (col) {
      case "No":
        return {
          title: col,
          render: (data, type, row, meta) => meta.row + 1,
        };
      case "Project":
        return {
          title: col,
          render: (data, type, row) => (
            <span
              className="text-blue-700 cursor-pointer"
              onClick={() => navigate(`/project/${row._id}/details`)}
            >
              {row.ProjectCode ? `${row.ProjectCode} ` : ""}
              {row.ProjectName ?? "-"}
            </span>
          ),
        };
      case "Industry":
        return { title: col, data: "IndustryType" };
      case "Project Manager":
  return {
    title: col,
    data: "PMId",
    render: (data) => data?.name ?? "-",
  };
case "BDE":
  return {
    title: col,
    data: "BDEId",
    render: (data) => data?.name ?? "-",
  };

      case "Delivery Type":
        return { title: col, data: "DeliveryType" };
      case "Frequency":
        return { title: col, data: "Frequency" };
      case "Status":
        return { title: col, data: "Status" };
      case "Attachments":
        return {
          title: col,
          render: (data, type, row) => (
            <button
              className="text-blue-600 hover:underline"
              onClick={() => navigate(`/project/${row._id}/files`)}
            >
              View Files
            </button>
          ),
        };
      case "Project Type":
        return { title: col, data: "ProjectType" };
      case "Created By":
  return {
    title: col,
    data: "CreatedBy",
    render: (data) => data?.name ?? "-",
  };

      case "Created Date":
        return {
          title: col,
          render: (data, type, row) => new Date(row.CreatedDate).toLocaleDateString(),
        };
      case "Action":
        return {
          title: col,
          render: (data, type, row) => (
            <button
              onClick={() => {
                setSelectedProject(row);
                setIsUpdateModalOpen(true);
              }}
            >
              <FaEdit className="text-blue-600 hover:text-blue-800" />
            </button>
          ),
        };
      default:
        return { title: col, data: col };
    }
  });

  // Initialize DataTable
  useEffect(() => {
    const table = $(tableRef.current).DataTable({
      data: data,
      columns: columns,
      destroy: true, // destroy previous instance if exists
      scrollX: true,
      paging: true,
      searching: true,
    });

    return () => table.destroy();
  }, [data, user?.roleName]);

  return (
  <table
    ref={tableRef}
    className="min-w-full divide-y divide-gray-200 text-sm text-left text-gray-700"
  ></table>
);

};
