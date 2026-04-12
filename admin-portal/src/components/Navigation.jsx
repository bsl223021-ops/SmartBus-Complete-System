import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/students", label: "Students", icon: "👨‍🎓" },
  { to: "/buses", label: "Buses", icon: "🚌" },
  { to: "/routes", label: "Routes", icon: "🗺️" },
  { to: "/drivers", label: "Drivers", icon: "👨‍✈️" },
  { to: "/attendance", label: "Attendance", icon: "📋" },
];

export default function Navigation() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚌</span>
          <div>
            <div className="font-bold text-lg leading-tight">SmartBus</div>
            <div className="text-gray-400 text-xs">Admin Portal</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
