import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { API_BASE_URL } from "../config/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChanged"));

      if (!socket.connected) {
        socket.connect();
      }
      socket.emit("join", data.user._id || data.user.id);

      navigate("/dashboard");
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GOOGLE MAIL SIGN IN HANDLER
  // ==========================================
  const handleGoogleSignIn = async () => {
    const googleEmail = prompt("Enter your Google Mail address to sign in / register:", "user@gmail.com");
    if (!googleEmail || !googleEmail.trim()) return;

    try {
      setGoogleLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleEmail.trim(),
          name: googleEmail.split("@")[0].replace(/[._]/g, " "),
          googleId: `google_${Date.now()}`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Google sign-in failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChanged"));

      if (!socket.connected) {
        socket.connect();
      }
      socket.emit("join", data.user._id || data.user.id);

      alert(`👋 Welcome to SkillSwap AI, ${data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError(err.message || "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        
        <div className="login-header">
          <p className="login-tag">WELCOME BACK</p>
          <h1>Login to SkillSwap AI</h1>
          <p>Continue learning, teaching, and connecting with your skill community.</p>
        </div>

        {error && <div className="login-error-banner">⚠️ {error}</div>}

        {/* GOOGLE SIGN IN BUTTON */}
        <button
          type="button"
          className="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? "Connecting to Google..." : "Continue with Google Mail"}</span>
        </button>

        <div className="login-divider-row">
          <span>or sign in with email</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              Remember me
            </label>

            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login to Account"}
          </button>

          <p className="register-link">
            Don't have an account?{" "}
            <Link to="/register">Create an account</Link>
          </p>
        </form>

      </div>
    </div>
  );
}

export default Login;