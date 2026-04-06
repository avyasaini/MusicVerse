// components/Sidebar.jsx
import { useLocation, Link } from "react-router-dom";
import {
  Home,
  Compass,
  User,
  Users,
  Star,
  LogOut,
  PlaySquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

export default function Sidebar({ onLogout }) {
  const location = useLocation();

  const navLinks = useMemo(
    () => [
      { to: "/dashboard", label: "Dashboard", icon: <Home /> },
      { to: "/recommendations", label: "Recommendations", icon: <Compass /> },
      { to: "/playlists", label: "Playlists", icon: <PlaySquare /> },
      { to: "/communities", label: "Communities", icon: <Users /> },
      { to: "/friends", label: "Friends", icon: <Star /> },
      { to: "/profile", label: "Profile", icon: <User /> },
    ],
    []
  );

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-gray-900 text-white shadow-lg p-4">
      <div className="text-2xl font-bold mb-6">MusicVerse</div>

      <nav className="flex-1">
        <ul className="space-y-4">
          {navLinks.map(({ to, label, icon }) => {
            const isActive = location.pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  <motion.div
                    className="w-6 h-6"
                    animate={{ scale: isActive ? 1.2 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {icon}
                  </motion.div>
                  <span
                    className={`text-sm ${isActive ? "font-semibold" : ""}`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        onClick={onLogout}
        className="mt-auto flex items-center space-x-2 hover:text-red-500 text-sm transition-colors"
      >
        <LogOut />
        <span>Logout</span>
      </button>
    </aside>
  );
}
