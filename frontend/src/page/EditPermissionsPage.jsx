import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function UserPermissions() {
  const { userId } = useParams(); // get userId from URL
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]); // dynamic permissions from role
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch user and their permissions
  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/permissions/${userId}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          console.log(data);
          setPermissions(data.user.permissions || []);
          setAllPermissions(data.user.permissions || []); // permissions come from role in backend
        } else {
          console.error("Failed to fetch user:", data.message);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPermissions();
  }, [userId]);

  const togglePermission = (perm) => {
    setPermissions((prev) =>
      prev.includes(perm)
        ? prev.filter((p) => p !== perm)
        : [...prev, perm]
    );
  };

  const savePermissions = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/permissions/${userId}/permissions`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to save permissions:", data.message);
      } else {
        alert("Permissions updated successfully!");
        setAllPermissions(permissions); // update local state
      }
    } catch (err) {
      console.error("Error saving permissions:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-700">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">
        Permissions for {user?.name}
      </h2>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-medium mb-2">User Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {allPermissions.map((perm) => (
            <label
              key={perm}
              className="flex items-center gap-2 bg-gray-100 p-2 rounded cursor-pointer hover:bg-gray-200"
            >
              <input
                type="checkbox"
                checked={permissions.includes(perm)}
                onChange={() => togglePermission(perm)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              {perm}
            </label>
          ))}
        </div>

        <button
          onClick={savePermissions}
          disabled={saving}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {saving ? "Saving..." : "Save Permissions"}
        </button>
      </div>
    </div>
  );
}

export default UserPermissions;
