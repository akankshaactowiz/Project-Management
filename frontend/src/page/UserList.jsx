import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AddUserModel from "../components/AddUserModel";
import Pagination from "../components/Pagination";
import { useAuth } from "../hooks/useAuth";

function UserList() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ismodalOpen, setIsModalOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const columns = ["No.", "Name", "Email", "Role", "Department", "Actions"];
  const navigate = useNavigate();

  const canAddUser = user?.permissions?.some(
    (perm) => perm.module === "Users" && perm.actions.includes("create")
  );

  // Fetch users with backend pagination and filters
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        let url = `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users?page=${currentPage}&limit=${itemsPerPage}`;
        if (selectedRole) url += `&role=${encodeURIComponent(selectedRole)}`;
        if (selectedDept) url += `&department=${encodeURIComponent(selectedDept)}`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();

        if (res.ok) {
          setUsers(data.users || []);
          setRoles(data.allowedRoles || []);
          setDepartments(data.allowedDepartments || []);
          setCurrentUserRole(data.currentUserRole || "");
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalDocs(data.pagination?.totalDocs || 0);
        } else {
          console.error("Failed to fetch users:", data?.message);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [selectedRole, selectedDept, searchQuery, currentPage, itemsPerPage]);

  // Fetch all departments & roles if Superadmin
  useEffect(() => {
    const fetchAllForSuperadmin = async () => {
      if (currentUserRole !== "Superadmin") return;
      try {
        const depRes = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/department`,
          { credentials: "include" }
        );
        const depData = await depRes.json();
        if (depRes.ok) setDepartments(depData.departments || []);

        const roleRes = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/roles`,
          { credentials: "include" }
        );
        const roleData = await roleRes.json();
        if (roleRes.ok) setRoles(roleData.roles || []);
      } catch (err) {
        console.error("Error fetching all departments/roles:", err);
      }
    };
    fetchAllForSuperadmin();
  }, [currentUserRole]);
   
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

      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Users ({totalDocs})
          </h2>
          {canAddUser && (
            <button
              className="flex bg-green-600 cursor-pointer text-white px-4 py-2"
              onClick={() => setIsModalOpen(true)}
            >
              + Add User
            </button>
          )}
        </div>

        {/* Filters + Search + Items per page */}
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            className="border px-3 py-2 rounded-md"
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="" disabled>Select Role</option>
            {roles.map((role) => (
              <option key={role._id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>

          <select
            className="border px-3 py-2 rounded-md"
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="" disabled>Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept.department || dept.name}>
                {dept.department || dept.name}
              </option>
            ))}
          </select>

    
        </div>
       {/* Table controller */}
           <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-3">
                    {/* Left: Show entries */}
                    <div className="flex items-center space-x-2">
                      <label htmlFor="entries" className="text-gray-700">
                        Show
                      </label>
                      <select
                        id="entries"
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border rounded px-2 py-1"
                      >
                        {[5, 10, 25, 50].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      {/* <span className=" text-gray-700">entries</span> */}
                    </div>
          
                    {/* Right: Search + Export */}
                    <div className="flex items-center space-x-3">
                      {/* Search */}
                      {/* <div className="relative">
                        <input
                          type="text"
                          placeholder="Search..."
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="border border-gray-300 rounded pl-8 pr-3 py-1 text-sm"
                        />
                        <svg
                          className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="11" cy="11" r="7" />
                          <line x1="16.5" y1="16.5" x2="21" y2="21" />
                        </svg>
                      </div> */}
          
                    </div>
                  </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center p-8 text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{user?.name || "-"}</td>
                    <td className="px-4 py-2 text-gray-700">{user?.email || "-"}</td>
                    <td className="px-4 py-2 text-gray-700">{user?.roleId?.name || "-"}</td>
                    <td className="px-4 py-2 text-gray-700">{user?.departmentId?.department || "-"}</td>
                    <td className="px-4 py-2 text-gray-700">
                      <button
                        className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
                          user?.roleId?.name === "Manager"
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:bg-blue-600"
                        }`}
                        onClick={() => navigate(`/users/${user._id}/report`)}
                        disabled={user?.roleId?.name === "Manager"}
                      >
                        View Report
                      </button>
                      <button
                        className="bg-yellow-500 cursor-pointer text-white px-4 py-2 rounded-md ml-2"
                        onClick={() => navigate(`/users/${user._id}/details`)}
                      >
                        View Projects
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-4 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {ismodalOpen && (
          <AddUserModel
            isModalOpen={ismodalOpen}
            setIsModalOpen={setIsModalOpen}
            onSuccess={() => toast.success("User registered successfully")}
            onError={(msg) => toast.error(msg)}
          />
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}

export default UserList;
