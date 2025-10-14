import { useState, useEffect } from "react";
import { Clock, Eye, EyeOff } from "lucide-react";

import { useAuth } from "../hooks/useAuth.js";

export default function ProfilePage() {
  const { user } = useAuth();
  // console.log("User object:", user); // Debugging
  // Initialize local state with empty/default values
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    role: "",
    department: "",
    password: "••••••••",
    designation: "",
    reportingBy: "",
    // phone: "",
    // dateOfBirth: "",
    // address: "",
    // city: "",
    // postcode: "",
  });

  // const [showPassword, setShowPassword] = useState(false);
  const [savedProfileData, setSavedProfileData] = useState(profileData);

  // Sync profileData & savedProfileData once user is fetched
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.name || "",
        email: user.email || "",
        role: user.roleName || "",
        department: user.department || "",
        designation: user.designation || "",
        reportingBy: user.reportingBy || "",
      });
      setSavedProfileData({
        fullName: user.name || "",
        email: user.email || "",
        role: user.roleName || "",
        department: user.department || "",
        designation: user.designation || "",
        reportingBy: user.reportingBy || "",
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    setSavedProfileData(profileData);
    alert("Profile updated successfully!");
  };

  return (

    <div className="mx-auto">
      {/* Top Header Section */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-semibold">
                {savedProfileData.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-y-3 gap-x-12 bg-white ">
              <div className="flex justify-between pr-4 border-r border-gray-300">
                <span className="font-semibold text-gray-700">ID:</span>
                <span className="text-gray-600">12479834</span>
              </div>

              <div className="flex justify-between pr-4 border-r border-gray-300">
                <span className="font-semibold text-gray-700 mr-1">
                  Email:
                </span>
                <span className="text-gray-600">
                  {savedProfileData.email}
                </span>
              </div>

              <div className="flex justify-between pr-4 border-r border-gray-300">
                <span className="font-semibold text-gray-700">Role:</span>
                <span className="text-gray-600">
                  {savedProfileData.role || "-"}
                </span>
              </div>

              <div className="flex justify-between pr-4 border-r border-gray-300">
                <span className="font-semibold text-gray-700">
                  Department:
                </span>
                <span className="text-gray-600">
                  {savedProfileData.department || "-"}
                </span>
              </div>

              <div className="flex justify-between border-r border-gray-300">
                <span className="font-semibold text-gray-700">
                  Designation:
                </span>
                <span className="text-gray-600">
                  {savedProfileData.designation}
                </span>
              </div>

              <div className="flex justify-between ">
                <span className="font-semibold text-gray-700">
                  Reporting By:
                </span>
                <span className="text-gray-600">
                  {savedProfileData.designation}
                </span>
              </div>               
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Profile Details Form */}
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 m-4  ">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Profile Details
          </h3>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSaveChanges}>
            {/* Full Name - Readonly */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-gray-700 font-medium mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                placeholder="Your full name"
                value={profileData.fullName}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Email - Readonly */}
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="your.email@example.com"
                value={profileData.email}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Designation */}
            <div>
              <label
                htmlFor="designation"
                className="block text-gray-700 font-medium mb-1"
              >
                Designation
              </label>
              <input
                type="text"
                id="designation"
                placeholder="Your designation"
                value={profileData.designation}
                onChange={(e) => handleInputChange("designation", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 m-4">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Change Password
          </h3>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-1"
              >
                Current Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={profileData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
           
            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                placeholder="••••••••"
                value={profileData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                value={profileData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
