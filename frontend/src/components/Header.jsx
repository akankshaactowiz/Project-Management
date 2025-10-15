import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdFeed, MdOutlineWorkOutline, MdSupportAgent, MdLogout, MdDashboard, MdPeople, MdOutlineSettings, MdOutlineError } from "react-icons/md";
import { GoTasklist } from "react-icons/go";
import { CgProfile } from "react-icons/cg";
import { LuFileStack } from "react-icons/lu";
import Img from "../assets/profile.svg";
import {useAuth} from "../hooks/useAuth";

export default function Header() {
  const { user, loading, error, } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Map module names to icons
  const moduleIcons = {
    Feed: <MdFeed className="w-6 h-6" />,
    Work: <MdOutlineWorkOutline className="w-6 h-6" />,
    Support: <MdSupportAgent className="w-6 h-6" />,
    // dashboard: <MdDashboard className="w-6 h-6" />,
    Tasks: <GoTasklist className="w-6 h-6" />,
    Reports: <LuFileStack className="w-6 h-6" />,
    QA: <MdOutlineError className="w-6 h-6" />,
    Users: <MdPeople className="w-6 h-6" />,
    Team : <MdPeople className="w-6 h-6" />,
    Settings: <MdOutlineSettings className="w-6 h-6" />,
    // add more module-icon mappings here
  };

  // Build nav items dynamically from permissions
  const navItems = user?.permissions?.map((perm) => ({
    label: perm.module.charAt(0).toUpperCase() + perm.module.slice(1),
    path: perm.module,
    actions: perm.actions,
    icon: moduleIcons[perm.module] || <MdDashboard className="w-6 h-6" />,
  })) || [];

  // Only modules where user has "read" access
  const filteredNavItems = navItems.filter((item) => item.actions.includes("view"));

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      const response = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) window.location.href = "/";
      else alert("Logout failed");
    } catch (err) {
      console.error(err);
      alert("Error logging out");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    const baseUrl = `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}`;
  const profile = user.profileImage
    ? `${baseUrl}/uploads/profile/${user.profileImage}`
    : Img;

  return (
    <header className="sticky top-0 left-0 right-0 flex items-center justify-between px-6 py-2 bg-white border-gray-300 z-50 sm:bg-white">
      {/* Logo */}
       <div className="flex items-center space-x-2" 
       onClick={() => navigate("/")}
       > <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" className="w-12 h-12" > {/* ... your SVG paths ... */} <defs> <linearGradient id="linear-gradient" x1="12.77" y1="51.31" x2="12.77" y2="3.59" gradientTransform="translate(0 51.89) scale(1 -1)" gradientUnits="userSpaceOnUse" > <stop offset="0" stopColor="#4400ce" /> <stop offset="1" stopColor="#290660" /> </linearGradient> </defs> <path fill="#290660" d="M25.54.01c-6.9,13.5-13.9,26.9-20.9,40.3C-.06,34.31-1.96,23.71,2.64,14.41,7.24,4.71,17.44-.29,25.54.01Z" /> <path fill="#290660" d="M46.44,40.31c-2.5-4.8-5-9.6-7.5-14.4l4-.2h6.8l-11.6-1.1C33.94,16.41,29.74,8.21,25.44.01c8.1-.3,18.3,4.7,22.9,14.4,4.7,9.3,2.8,19.9-1.9,25.9Z" /> <path fill="#290660" d="M43.14,44.61c-9,9-25,9.6-34.9.2,7.9-3.1,16.2-4.1,24.8-2.7-1-2.3-1.7-4.3-2.6-6.3-.1-.2-.8-.4-1.1-.4-3.8,0-7.4,0-11.1-.1-.8,0-1.5-.1-2.6-.2,1.7-2,3.5-3.6,5.8-4.6,2.7-1.2,5.6-2,8.4-3,.6-.2,1.1,0,1.4.8,2.4,4.6,4.7,9.1,7.1,13.6.4.9,1.1,1.4,1.9,1.7,1,.1,1.8.6,2.9,1Z" /> <path fill="#290660" d="M29.64,25.11c-3.4.9-6.6,1.7-9.9,2.5,1.8-3.3,3.8-6.9,5.7-10.5,1.4,2.7,2.8,5.4,4.2,8Z" /> </svg>
       </div>

      {/* Hamburger for mobile */}
      <button className="md:hidden text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? "X" : "☰"}
      </button>

      {/* Navigation */}
      <nav className={`${menuOpen ? "block" : "hidden"} absolute top-full left-0 bg-white w-full md:static  md:block md:w-auto`}>
        <ul className="md:flex md:space-x-6 md:items-center">
          {filteredNavItems.map(({ label: title, path: key, icon }) => (
            <li
              key={key}
              className={`flex items-center space-x-2 p-4 md:p-0 cursor-pointer ${
                location.pathname.includes(key) ? "text-purple-700 font-semibold" : "text-gray-700"
              }`}
            >
              <Link to={`/${key}`} className="flex items-center space-x-2 md:flex-col md:space-x-0">
                <span>{icon}</span>
  <span className="text-sm font-medium">{title === "Qa" ? "QA" : title}</span>
              </Link>
            </li>
          ))}

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 p-4 md:p-0 cursor-pointer"
            >
              <img src={profile} alt="Profile" className="w-12 h-12 rounded-full" />
              <span className="text-sm font-medium">{user?.name || "No Name"}</span>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <button onClick={() => navigate("/profile")} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  <CgProfile className="inline mr-2 w-4 h-4" />
                  My Profile
                </button>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  <MdLogout className="inline mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </ul>
      </nav>
    </header>
  );
}
