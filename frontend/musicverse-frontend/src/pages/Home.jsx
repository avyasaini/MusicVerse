import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaMusic, FaUsers, FaList } from "react-icons/fa";
import "../styles/Home.css";

export default function Home() {
  const features = [
    {
      icon: <FaMusic size={40} />,
      title: "Stream Music",
      description:
        "Discover and stream your favorite tracks anytime, anywhere.",
    },
    {
      icon: <FaUsers size={40} />,
      title: "Join Communities",
      description: "Connect with music lovers and share your passion.",
    },
    {
      icon: <FaList size={40} />,
      title: "Create Playlists",
      description: "Curate your perfect playlist for every mood.",
    },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <motion.section
        className="home-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="home-title">Welcome to MusicVerse</h1>
        <p className="home-subtitle home-dark-text">
          Your ultimate destination to stream music, connect with friends, and
          vibe with communities!
        </p>
        <Link to="/signup" className="home-button">
          Get Started
        </Link>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="home-features"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <h2 className="home-features-title">Why MusicVerse?</h2>
        <div className="home-features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="home-feature-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="home-feature-icon">{feature.icon}</div>
              <h3 className="home-feature-title">{feature.title}</h3>
              <p className="home-feature-description home-dark-text">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer Section */}
      <motion.section
        className="home-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <h3 className="home-footer-title">Join the MusicVerse Community</h3>
        <div className="home-footer-links">
          <Link to="/communities" className="home-footer-link">
            Explore Communities
          </Link>
          <Link to="/playlists" className="home-footer-link">
            Create Playlists
          </Link>
          <Link to="/profile" className="home-footer-link">
            Set Up Your Profile
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
