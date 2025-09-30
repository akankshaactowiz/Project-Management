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
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    postcode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [savedProfileData, setSavedProfileData] = useState(profileData);

  // Sync profileData & savedProfileData once user is fetched
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.name || "",
        email: user.email || "",
        role: user.roleName || "",
        department: user.department || "",
        password: "••••••••", // always mask password
        phone: "",
        dateOfBirth: "",
        address: "",
        city: "",
        postcode: "",
      });
      setSavedProfileData({
        fullName: user.name || "",
        email: user.email || "",
        role: user.roleName || "",
        department: user.department || "",
        password: "••••••••", // always mask password
        phone: "",
        dateOfBirth: "",
        address: "",
        city: "",
        postcode: "",
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
                <span className="font-semibold text-gray-700">
                  Email:
                </span>
                <span className="text-gray-600">
                  {savedProfileData.email}
                </span>
              </div>

              <div className="flex justify-between pr-4 border-r border-gray-300">
                <span className="font-semibold text-gray-700">
                  Password:
                </span>
                <span className="text-gray-600">
                  {showPassword ? savedProfileData.password : "••••••••"}
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

              <div className="flex justify-between ">
                <span className="font-semibold text-gray-700">
                  Designation:
                </span>
                <span className="text-gray-600">
                  {savedProfileData.designation}
                </span>
              </div>

              <div className="flex justify-between pr-4 border-r border-gray-300">
                <span className="font-semibold text-gray-700">
                  Phone:
                </span>
                <span className="text-gray-600">
                  {savedProfileData.phone || "-"}
                </span>
              </div>

              <div className="flex justify-between pr-4 border-r border-gray-300">
                <span className="font-semibold text-gray-700 ">
                  Date of Birth:
                </span>
                <span className="text-gray-600">
                  {savedProfileData.dateOfBirth || "-"}
                </span>
              </div>

              <div className="flex justify-between pr-4 border-r border-gray-300">
                <span className="font-semibold text-gray-700">
                  Address:{" "}
                </span>
                <span className="text-gray-600">
                  {savedProfileData.address || "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">
                  City, State:
                </span>
                <span className="text-gray-600">
                  {savedProfileData.city || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Profile Details Form */}
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8 m-4">
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

            {/* Password - Readonly */}
            {/* <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={profileData?.password || ""}
                  readOnly
                  className={`w-full px-4 py-2 rounded-lg border border-gray-300 pr-10 cursor-not-allowed ${showPassword ? "bg-white" : "bg-gray-100"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div> */}

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone"
                className="block text-gray-700 font-medium mb-1"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                placeholder="+1 234 567 8900"
                value={profileData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            {/* Date of Birth */}
            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-gray-700 font-medium mb-1"
              >
                Date of Birth
              </label>
              <input
                type="text"
                id="dateOfBirth"
                placeholder="MM/DD/YYYY"
                value={profileData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Address */}
            <div className="">
              <label
                htmlFor="address"
                className="block text-gray-700 font-medium mb-1"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                placeholder="Street address"
                value={profileData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* City, State */}
            <div className="">
              <label
                htmlFor="city"
                className="block text-gray-700 font-medium mb-1"
              >
                City, State
              </label>
              <input
                type="text"
                id="city"
                placeholder="City, State"
                value={profileData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>


      {/* Activity Section */}
      {/* <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8 m-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Activity</h2>
                  <button className="text-red-500 hover:text-red-600 text-sm font-medium">
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full ${activity.avatar} flex items-center justify-center`}
                      >
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-initial">
                        <p className="text-sm">
                          <span className="font-semibold text-gray-900">
                            {activity.action}
                          </span>
                          <span className="text-gray-600"> on </span>
                          <span className="font-semibold text-gray-900">
                            {activity.date}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}
    </div>


  );
}
