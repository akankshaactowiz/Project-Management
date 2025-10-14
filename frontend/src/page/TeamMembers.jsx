import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import Pagination from "../components/Pagination";

const TeamMembers = () => {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All Roles");
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState(["All Roles"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [memberProjectCounts, setMemberProjectCounts] = useState({});

  const navigate = useNavigate();

  // ✅ Fetch team members from backend
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: currentPage,
        limit: entries,
        search: search || "",
        role: filterRole !== "All Roles" ? filterRole : "",

      });

      const res = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch users");

      // 🔹 Format members
      const formatted = data.users.map((u) => ({
        id: u._id,
        name: u.name,
        role: u.roleId?.name || "N/A",
      }));

      setMembers(formatted);

      // 🔹 Unique roles for filter dropdown
      const uniqueRoles = ["All", ...new Set(data.allowedRoles.map(r => r.name))];
      setRoles(uniqueRoles);

      // 🔹 Pagination
      setCurrentPage(data.pagination.currentPage);
      setTotalPages(data.pagination.totalPages);
      setEntries(data.pagination.pageSize);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchTeamMembers();
  }, [search, filterRole, currentPage, entries]);


  // useEffect(() => {
  //   members.forEach(async (member) => {
  //     try {
  //       const res = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/${member.id}/project-count`, {
  //         credentials: "include"
  //       });
  //       const data = await res.json();
  //       setMemberProjectCounts(prev => ({ ...prev, [member.id]: data }));
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   });
  // }, [members]);

  useEffect(() => {
    if (!members.length) return;

    const fetchCountsForMembers = async () => {
      try {
        const countsArray = await Promise.all(
          members.map(async (member) => {
            const res = await fetch(
              `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/${member.id}/project-count`,
              { credentials: "include" }
            );
            if (!res.ok) throw new Error("Failed to fetch count");
            const data = await res.json();
            return { id: member.id, data };
          })
        );

        // Transform array to object: { memberId: data }
        const countsObject = countsArray.reduce((acc, { id, data }) => {
          acc[id] = data;
          return acc;
        }, {});

        setMemberProjectCounts(countsObject);
      } catch (err) {
        console.error("Error fetching member project counts:", err);
      }
    };

    fetchCountsForMembers();
  }, [members]);


  useEffect(() => {
    fetchTeamMembers();
    // fetchCounts();
  }, [search, filterRole, currentPage, entries]);



  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h2 className="text-lg font-bold text-gray-800 border-l-4 border-blue-500 pl-3">
          Team Members
        </h2>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <input
            type="text"
            placeholder="Search by name...."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none w-full sm:w-64"
          />

          {/* Role Filter */}
          <div className="flex flex-col">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          {/* Clear Filters Button */}
          <div className="flex flex-col">
            <button
              onClick={() => {
                setSearch("");
                setFilterRole("All Roles");
                // setFilterDate("");
                setCurrentPage(1);
              }}
              className="h-10 px-4 cursor-pointer bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none"
            >
              Clear
            </button>
          </div>
          <div>

          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {loading ? (
        <div className="text-center py-6 text-gray-500">Loading team members...</div>
      ) : error ? (
        <div className="text-center py-6 text-red-500">{error}</div>
      ) : (
        <div className="bg-white border border-gray-100 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-100">
            <thead className="bg-gray-100 text-gray-700 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">No</th>
                <th className="px-6 py-3 text-left font-semibold">Name</th>
                <th className="px-6 py-3 text-left font-semibold">Role</th>
                <th className="px-6 py-3 text-left font-semibold">Projects</th>
                <th className="px-6 py-3 text-left font-semibold">BAU</th>
                <th className="px-6 py-3 text-left font-semibold">Escalation</th>
                {/* <th className="px-6 py-3 text-left font-semibold">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? (
                members.map((member, idx) => (
                  <tr
                    key={member.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-2">{idx + 1}</td>
                    <td className="px-6 py-2"  onClick={() => navigate(`/team/${member.id}/team-insights`)}><span className= "cursor-pointer text-blue-700 hover:underline">{member.name}</span></td>
                    <td className="px-6 py-2">{member.role}</td>
                    <td className="px-6 py-2">
                      <span className="cursor-pointer inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-md"
                        onClick={() => navigate(`/team/${member.id}/team-insights`)}>
                        {memberProjectCounts[member.id]?.totalCounts?.total || 0}
                      </span>
                    </td>
                    <td className="px-6 py-2">
                      <span className="cursor-pointer inline-block bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded-md"
                        onClick={() =>
                          navigate(`/team/${member.id}/team-insights`, {
                            state: { filter: "BAU", memberName: member.name },
                          })
                        }>
                        {memberProjectCounts[member.id]?.totalCounts?.bau || 0}
                      </span>
                    </td>
                    <td className="px-6 py-2">
                      <span className="cursor-pointer inline-block bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-md"
                        onClick={() =>
                          navigate(`/team/${member.id}/team-insights`, {
                            state: { filter: "Escalation", memberName: member.name },
                          })
                        }>
                        {memberProjectCounts[member.id]?.totalCounts?.escalation || 0}
                      </span>
                    </td>
                    {/* <td className="px-6 py-2 ">
                      
                      <FaEye size={20} title="View" className="cursor-pointer text-blue-600 hover:text-blue-800"
                        onClick={() => navigate(`/team/${member.id}/team-insights`)} />
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No team members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination & Entries */}
          <div className="flex justify-between m-4">
            <div className="flex items-center space-x-2 mt-4">
              <label htmlFor="entries" className="text-gray-700">Show</label>
              <select
                id="entries"
                value={entries}
                onChange={(e) => {
                  setEntries(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-2 py-1"
              >
                {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="text-gray-700">entries</span>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
