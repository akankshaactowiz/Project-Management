import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { ToastContainer, toast } from 'react-toastify';

export default function RoleSettings({ currentUserRole }) {
  const [roles, setRoles] = useState([]);
  const [permissionsList, setPermissionsList] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapping department IDs → names for display
  const [departmentsMap, setDepartmentsMap] = useState({});

  // Fetch roles, modules, and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Fetch roles
        const rolesRes = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/roles`,
          { credentials: "include" }
        );
        if (!rolesRes.ok) throw new Error("Failed to fetch roles");
        const rolesData = await rolesRes.json();

        // 2️⃣ Fetch modules (permissions list)
        const modulesRes = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/roles/modules`,
          { credentials: "include" }
        );
        if (!modulesRes.ok) throw new Error("Failed to fetch modules");
        const modulesData = await modulesRes.json();

        // 3️⃣ Optional: fetch department list to map IDs → names
        const deptsRes = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/department`,
          { credentials: "include" }
        );
        const deptsData = await deptsRes.json();
        const map = {};
        (deptsData.departments || []).forEach(d => {
          map[d.id] = d.department;
        });
        setDepartmentsMap(map);

        setRoles(rolesData.roles || []);
        setPermissionsList(modulesData.modules || []);
      } catch (err) {
        console.error("Error fetching roles/modules/departments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Open edit modal
  const openEditModal = (role) => {
    setEditingRole(role);

    // Flatten permissions for checkbox state
    const rolePerms = role.permissions.flatMap((perm) =>
      perm.actions.map((action) => `${perm.module}-${action}`)
    );
    setSelectedPermissions(rolePerms);
  };

  const togglePermission = (permId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  // Save updated permissions
const savePermissions = async () => {
  if (!editingRole) return;

  try {
    // Use numeric departmentId directly
    const deptId = editingRole?.departmentId || currentUserRole?.departmentId;

    // Convert selectedPermissions → backend format
    const formatted = permissionsList
      .map((perm) => {
        const actions = perm.actions.filter((a) =>
          selectedPermissions.includes(`${perm.module}-${a}`)
        );
        if (!actions.length) return null;

        return {
          module: perm.module,
          actions,
          departments: [deptId] // always send as array of numbers
        };
      })
      .filter(Boolean);

    const res = await fetch(
      `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/roles/${editingRole._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissions: formatted,
          departmentId: deptId
        }),
        credentials: "include",
      }
    );

    if (!res.ok) throw new Error("Failed to update permissions");

    // Update local state
    setRoles((prev) =>
      prev.map((r) =>
        r._id === editingRole._id
          ? { ...r, permissions: formatted, departmentId: deptId }
          : r
      )
    );

    setEditingRole(null);
    toast.success("Permissions updated successfully!");
  } catch (err) {
    console.error("Failed to save permissions:", err);
    toast.error("Failed to update permissions.");
  }
};

  return (
    <>
      <ToastContainer 
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="p-4 md:p-6 bg-white min-h-screen">
        <div className="bg-blue-50 p-4 mb-6">
          <h1 className="text-xl md:text-xl font-bold text-gray-800 mb-2">
            Manage Roles Permissions
          </h1>
        </div>

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-1/6 px-12 py-2 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="w-1/6 px-3 py-2 text-left text-sm font-medium text-gray-700">Department</th>
                <th className="w-1/4 px-3 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                <th className="w-1/4 px-3 py-2 text-left text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role._id} className="hover:bg-gray-50">
                    <td className="px-10 py-2 truncate">{role.name}</td>
                    <td className="px-3 py-2 truncate">{departmentsMap[role.department] || "-"}</td>
                    <td className="px-3 py-2 truncate">{role.description || "-"}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => openEditModal(role)}
                        className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Permissions
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {editingRole && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
              <h2 className="text-md md:text-xl font-semibold p-4 border-b">{`Edit Permissions - ${editingRole.name}`}</h2>
              <div className="p-4 overflow-y-auto max-h-[400px]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Modules</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Permissions / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {permissionsList.map((perm) => (
                      <tr key={perm.module}>
                        <td className="px-3 py-2 font-medium">{perm.module}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            {perm.actions.map((action) => {
                              const permissionId = `${perm.module}-${action}`;
                              return (
                                <label key={permissionId} className="flex items-center gap-1 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(permissionId)}
                                    onChange={() => togglePermission(permissionId)}
                                    className="w-4 h-4"
                                  />
                                  <span>{action}</span>
                                </label>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t">
                <button
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={savePermissions}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
