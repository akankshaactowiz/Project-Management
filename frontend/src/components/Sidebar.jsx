import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MdFeed,
  MdOutlineWorkOutline,
  MdSupportAgent,
  MdLogout,
  MdDashboard,
  MdPeople,
  MdOutlineSettings,
} from "react-icons/md";
import { GoTasklist } from "react-icons/go";
import { LuFileStack } from "react-icons/lu";
import { HiMenuAlt3 } from "react-icons/hi";
import Img from "../assets/profile.svg";
import { useAuth } from "../hooks/useAuth";

export default function Sidebar() {
  const { user, loading, error } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Icons for modules
  const moduleIcons = {
    feed: <MdFeed className="w-6 h-6" />,
    work: <MdOutlineWorkOutline className="w-6 h-6" />,
    support: <MdSupportAgent className="w-6 h-6" />,
    dashboard: <MdDashboard className="w-6 h-6" />,
    users: <MdPeople className="w-6 h-6" />,
    settings: <MdOutlineSettings className="w-6 h-6" />,
    tasks: <GoTasklist className="w-6 h-6" />,
    reports: <LuFileStack className="w-6 h-6" />,
  };

  const navItems =
    user?.permissions?.map((perm) => ({
      title: perm.module.charAt(0).toUpperCase() + perm.module.slice(1),
      key: perm.module,
      actions: perm.actions,
      icon: moduleIcons[perm.module] || <MdDashboard className="w-6 h-6" />,
    })) || [];

  const filteredNavItems = navItems.filter((item) =>
    item.actions.includes("read")
  );

  // Logout
  const handleLogout = async () => {
    try {
      const response = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) window.location.href = "/";
      else alert("Logout failed");
    } catch (err) {
      console.error(err);
      alert("Error logging out");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-800 text-white px-4 py-3">
        <span className="font-semibold">App</span>
        <button onClick={() => setIsOpen(true)}>
          <HiMenuAlt3 className="w-7 h-7" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 text-white flex flex-col transform transition-transform duration-300 z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* User profile */}
        <div className="flex flex-col items-center py-6 border-b border-slate-700">
          <img src={Img} alt="Profile" className="w-16 h-16 rounded-full mb-2" />
          <span className="text-sm font-medium">{user?.name || "No Name"}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavItems.map(({ title, key, icon }) => (
            <Link
              key={key}
              to={`/${key}`}
              onClick={() => setIsOpen(false)} // close on mobile click
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                location.pathname.includes(key)
                  ? "bg-slate-700 text-white font-semibold"
                  : "text-gray-300 hover:bg-slate-700"
              }`}
            >
              {icon}
              <span className="text-sm">{title}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Profile + Logout */}
        <div className="border-t border-slate-700 p-4 space-y-2">
          <button
            onClick={() => {
              navigate("/profile");
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-gray-300 hover:bg-slate-700"
          >
            <MdPeople className="w-5 h-5" />
            My Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-gray-300 hover:bg-slate-700"
          >
            <MdLogout className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
