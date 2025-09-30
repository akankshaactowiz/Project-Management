import React, { useState, useEffect } from "react";

function AddUserModel({ isModalOpen, setIsModalOpen, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    departmentId: "",
  });
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [selectedTeamLeadId, setSelectedTeamLeadId] = useState("");

  // ✅ Fetch roles & departments from backend
  useEffect(() => {
    if (isModalOpen) {
      fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/roles`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setRoles(data.roles));

      fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/department`,
        {
          credentials: "include",
        }
      )
        .then((res) => res.json())
        .then((data) => setDepartments(data));
    }
  }, [isModalOpen]);

  // ✅ Fetch managers & team leads when role or department changes
  useEffect(() => {
    const role = roles.find((r) => r._id === formData.roleId);
    if (formData.roleId && formData.departmentId && role) {
      if (role.name === "Team Lead") {
        fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/by-role?roleName=Manager&departmentId=${formData.departmentId}`,
          {
            credentials: "include",
          }
        )
          .then((res) => res.json())
          .then((data) => setManagers(data))
          .catch((err) => console.error(err));
      }

      if (role.name === "Developer") {
        fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/by-role?roleName=Manager&departmentId=${formData.departmentId}`,
          {
            credentials: "include",
          }
        )
          .then((res) => res.json())
          .then((data) => setManagers(data))
          .catch((err) => console.error(err));

        fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/by-role?roleName=Team Lead&departmentId=${formData.departmentId}`,
          {
            credentials: "include",
          }
        )
          .then((res) => res.json())
          .then((data) => setTeamLeads(data))
          .catch((err) => console.error(err));
      }
    }
  }, [formData.roleId, formData.departmentId, roles]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // ✅ Submit form with extra manager/team lead IDs if needed
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        managerId: selectedManagerId || null,
        leadId: selectedTeamLeadId || null,
      };

      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to register user");
      const data = await res.json();
      onSuccess();
      // console.log("✅ User registered:", data);

      setIsModalOpen(false); // close modal
    } catch (err) {
      onError(err.message);
      // toast.error(err.message);
      // console.error("❌ Error:", err.message);
    }
  };

  if (!isModalOpen) return null;

  const selectedRole = roles.find((r) => r._id === formData.roleId);

  return (
    <>
 
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add User</h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Role</label>
            <select
              id="roleId"
              value={formData.roleId}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Department</label>
            <select
              id="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.department}
                </option>
              ))}
            </select>
          </div>

          {/* Conditionally render Manager dropdown if role is Team Lead or Developer */}
          {selectedRole?.name === "Team Lead" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Manager</label>
              <select
                value={selectedManagerId}
                onChange={(e) => setSelectedManagerId(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Select Manager</option>
                {managers.map((manager) => (
                  <option key={manager._id} value={manager._id}>
                    {manager.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedRole?.name === "Developer" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Manager</label>
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select Manager</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Select Team Lead</label>
                <select
                  value={selectedTeamLeadId}
                  onChange={(e) => setSelectedTeamLeadId(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select Team Lead</option>
                  {teamLeads.map((teamLead) => (
                    <option key={teamLead._id} value={teamLead._id}>
                      {teamLead.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}

export default AddUserModel;
