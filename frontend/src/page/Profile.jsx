import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa"

import { useAuth } from "../hooks/useAuth.js";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    password: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle text input changes
  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle profile image selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      if (profileData.newPassword) formData.append("newPassword", profileData.newPassword);

      if (selectedFile) formData.append("profileImage", selectedFile);

      const response = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/update-profile`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Profile updated successfully.");
      } else {
        setMessage(data.message || "Update failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      // setMessage("An error occurred while updating profile.");
    } finally {
      setLoading(false);
    }
  };

  const baseUrl = `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}`;
  const profileUrl = user.profileImage
    ? `${baseUrl}/uploads/profile/${user.profileImage}`
    : "/default-avatar.png";

  return (

    <div className="mx-auto max-w-6xl">
      {/* Top Header Section */}
      <div className="bg-white rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative w-24 h-24">
          {/* Profile Circle */}
          <div className="relative w-24 h-24">
            {previewImage ? (
              // If user selected a new image (before upload)
              <img
                src={previewImage}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : user?.profileImage ? (
              // 🟢 Show saved image (from backend)
              <img
                src={`${baseUrl}/uploads/profile/${user.profileImage}`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png"; // fallback if image missing
                }}
              />
            ) : (
              // 🟠 Show initials (no image)
              <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
            )}

            {/* Edit Icon */}
            <label className="absolute bottom-0 right-0 bg-white border border-gray-300 text-gray-700 rounded-full p-2 hover:bg-gray-100 cursor-pointer">
              <FaEdit />
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Edit Icon Overlay */}
          <label className="absolute bottom-0 right-0 bg-white border border-gray-300 text-gray-700 rounded-full p-2 hover:bg-gray-100 cursor-pointer">
            <FaEdit />
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {/* User Details */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
          <div className="flex flex-col bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500 font-medium">ID</span>
            <span className="font-semibold text-gray-800">12479834</span>
          </div>

          <div className="flex flex-col bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500 font-medium">Email</span>
            <span className="font-semibold text-gray-800">{user.email}</span>
          </div>

          <div className="flex flex-col bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500 font-medium">Role</span>
            <span className="font-semibold text-gray-800">{user.roleName || "-"}</span>
          </div>

          <div className="flex flex-col bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500 font-medium">Department</span>
            <span className="font-semibold text-gray-800">{user.department || "-"}</span>
          </div>

          <div className="flex flex-col bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500 font-medium">Designation</span>
            <span className="font-semibold text-gray-800">{user.designation || "-"}</span>
          </div>

          <div className="flex flex-col bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500 font-medium">Reporting By</span>
            <span className="font-semibold text-gray-800">{user.reportingBy || "-"}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Change Password Form */}
        <div className="bg-white border border-gray-100 rounded-2xl mb-6 p-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Change Password
          </h3>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleProfileUpdate}>
            {/* Current Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Current Password
              </label>
              <input
                type="text"
                placeholder="Enter your current password"
                value={profileData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                New Password
              </label>
              <input
                type="text"
                placeholder="Enter your new password"
                value={profileData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="text"
                placeholder="Enter your new password again"
                value={profileData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex justify-end mt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-xl transition disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>

          {/* Message */}
          {/* {message && (
          <p className={`mt-4 text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )} */}
        </div>
      </div>
    </div>
  );
}
