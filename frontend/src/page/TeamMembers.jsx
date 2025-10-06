import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TeamMembers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
    const navigate = useNavigate();
  const members = [
    { id: 1, name: "Aakanksha Chahal", role: "Full Stack Developer" },
    { id: 2, name: "Rahul Sharma", role: "UI/UX Designer" },
    { id: 3, name: "Neha Singh", role: "Project Manager" },
    { id: 4, name: "Amit Verma", role: "Backend Engineer" },
    { id: 5, name: "Riya Mehta", role: "Frontend Developer" },
  ];

  const roles = ["All", ...new Set(members.map((m) => m.role))];

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || m.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-500 pl-3">
          Team Members
        </h2>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm "
          />

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white border border-gray-100 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-100">
          <thead className="bg-gray-100 text-gray-700 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Role</th>
              <th className="px-6 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member, idx) => (
                <tr
                  key={member.id}
                 className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-2">{member.name}</td>
                  <td className="px-6 py-2">{member.role}</td>
                  <td className="px-6 py-2 text-center">
                    <button className="cursor-pointer bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-all mr-2"
                    // onClick={() => navigate(`/users/${member.id}`)} 
                    onClick={() => navigate(`/team/team-insights`)} 

                    >
                      View Progress
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No team members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamMembers;
