import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSpring, animated } from "@react-spring/web";
import axios from "axios";
import { motion } from "framer-motion";
import { FaHome, FaList, FaUsers, FaUser, FaBars } from "react-icons/fa";
import "../styles/Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/users/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    if (token) {
      fetchUser();
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  const menuSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: {
      opacity: isOpen ? 1 : 0,
      transform: isOpen ? "translateY(0)" : "translateY(-20px)",
    },
    config: { tension: 300, friction: 20 },
  });

  const navItems = token
    ? [
        { to: "/", label: "Home", icon: <FaHome /> },
        { to: "/dashboard", label: "My Music", icon: <FaList /> },
        { to: "/playlists", label: "Playlists", icon: <FaList /> },
        { to: "/communities", label: "Communities", icon: <FaUsers /> },
        { to: "/profile", label: "Profile", icon: <FaUser /> },
      ]
    : [
        { to: "/", label: "Home", icon: <FaHome /> },
        { to: "/login", label: "Login", icon: null },
        { to: "/signup", label: "Signup", icon: null },
      ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          MusicVerse
        </Link>

        <div className="navbar-items">
          {/* User Info */}
          {token && user && (
            <motion.div
              className="navbar-user"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/profile">
                {imageError || !user.avatar ? (
                  <div className="navbar-avatar-placeholder">
                    <span>{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                ) : (
                  <motion.img
                    src={user.avatar || "https://placehold.co/40x40"}
                    alt={user.username}
                    className="navbar-avatar"
                    onError={() => setImageError(true)}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                )}
              </Link>
            </motion.div>
          )}

          {/* Hamburger Menu */}
          <button
            className="navbar-hamburger"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <FaBars size={24} />
            </motion.div>
          </button>

          {/* Desktop Menu */}
          <div className="navbar-desktop">
            {navItems.map(({ to, label, icon }) => (
              <Link key={to} to={to} className="navbar-link">
                {icon && <span className="navbar-icon">{icon}</span>}
                {label}
              </Link>
            ))}
            {token && (
              <motion.button
                onClick={handleLogout}
                className="navbar-logout"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <animated.div
          style={menuSpring}
          className="navbar-mobile"
          ref={menuRef}
        >
          <div className="navbar-mobile-items">
            {navItems.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className="navbar-mobile-link"
                onClick={() => setIsOpen(false)}
              >
                {icon && <span className="navbar-icon">{icon}</span>}
                {label}
              </Link>
            ))}
            {token && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="navbar-mobile-logout"
              >
                Logout
              </button>
            )}
          </div>
        </animated.div>
      )}
    </nav>
  );
}
