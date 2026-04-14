import { useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Client-side validation
  const validationErrors = useMemo(() => {
    const errors = [];
    if (!username) errors.push("Username is required");
    if (!password) errors.push("Password is required");
    return errors;
  }, [username, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    console.log("Submitting:", { username, password }); // Debug

    // Check client-side validation
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Get JWT token
      const tokenResponse = await axios.post(
        "/auth/jwt/create/",
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const accessToken = tokenResponse.data.access;
      localStorage.setItem("access_token", accessToken);
      console.log("Stored access_token:", accessToken); // Debug

      // Step 2: Fetch user details
      const userResponse = await axios.get("/auth/users/me/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const userId = userResponse.data.id;
      localStorage.setItem("user_id", userId.toString());
      console.log("Stored user_id:", userId); // Debug

      navigate("/dashboard");
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Login failed";
      if (errorData) {
        if (errorData.detail) errorMessage = errorData.detail;
        else if (errorData.username)
          errorMessage = `Username: ${errorData.username.join(", ")}`;
        else if (errorData.password)
          errorMessage = `Password: ${errorData.password.join(", ")}`;
        else if (errorData.non_field_errors)
          errorMessage = errorData.non_field_errors.join(", ");
      }
      setError(errorMessage);
      console.error("Login error:", errorData || err); // Debug
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <motion.h1
          className="login-main-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Login
        </motion.h1>
        <motion.form
          onSubmit={handleSubmit}
          className="login-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="login-form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="login-input"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="login-form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="login-input"
              required
              disabled={isSubmitting}
            />
          </div>
          <motion.button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </motion.button>
        </motion.form>
        {error && (
          <motion.p
            className="login-error"
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
