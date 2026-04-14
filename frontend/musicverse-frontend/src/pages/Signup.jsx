import { useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/Signup.css";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Client-side validation
  const validationErrors = useMemo(() => {
    const errors = [];
    if (!username) errors.push("Username is required");
    if (!email) errors.push("Email is required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.push("Invalid email format");
    if (!password) errors.push("Password is required");
    else if (password.length < 8)
      errors.push("Password must be at least 8 characters");
    if (password !== rePassword) errors.push("Passwords do not match");
    return errors;
  }, [username, email, password, rePassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    console.log("Submitting:", { username, email, password, rePassword }); // Debug

    // Check client-side validation
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        "/auth/users/",
        {
          username,
          email,
          password,
          re_password: rePassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Signup successful:", response.data); // Debug
      navigate("/login");
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Signup failed";
      if (errorData) {
        // Parse Djoser errors
        if (errorData.username)
          errorMessage = `Username: ${errorData.username.join(", ")}`;
        else if (errorData.email)
          errorMessage = `Email: ${errorData.email.join(", ")}`;
        else if (errorData.non_field_errors)
          errorMessage = errorData.non_field_errors.join(", ");
        else if (errorData.detail) errorMessage = errorData.detail;
      }
      setError(errorMessage);
      console.error("Signup error:", errorData || err); // Debug
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page-wrapper">
      <div className="signup-container">
        <motion.h1
          className="signup-main-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Signup
        </motion.h1>
        <motion.form
          onSubmit={handleSubmit}
          className="signup-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="signup-form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="signup-input"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="signup-form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="signup-input"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="signup-form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="signup-input"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="signup-form-group">
            <input
              type="password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              placeholder="Re-enter Password"
              className="signup-input"
              required
              disabled={isSubmitting}
            />
          </div>
          <motion.button
            type="submit"
            className="signup-button"
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? "Signing up..." : "Signup"}
          </motion.button>
        </motion.form>
        {error && (
          <motion.p
            className="signup-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}
