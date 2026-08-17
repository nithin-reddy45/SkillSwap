import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    teachSkills: "",
    learnSkills: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Unable to connect to the server");
    }
  };

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    const googleEmail = prompt("Enter your Google Mail address to get started:", "user@gmail.com");
    if (!googleEmail || !googleEmail.trim()) return;

    try {
      setGoogleLoading(true);
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
        throw new Error(data.message || "Google sign-up failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChanged"));

      alert(`🎉 Welcome to SkillSwap AI, ${data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Google Auth Error:", err);
      alert(err.message || "Google sign-up failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <p className="register-tag">JOIN SKILLSWAP AI</p>
          <h1>Create Your Account</h1>
          <p>
            Tell us what you can teach and what you want to learn.
          </p>
        </div>

        {/* GOOGLE SIGN UP BUTTON */}
        <button
          type="button"
          className="google-signin-btn"
          onClick={handleGoogleSignUp}
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
          <span>{googleLoading ? "Connecting to Google..." : "Sign up with Google Mail"}</span>
        </button>

        <div className="login-divider-row">
          <span>or create account with email</span>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Skills You Can Teach</label>
            <input
              type="text"
              name="teachSkills"
              placeholder="Example: Java, React, Python"
              value={formData.teachSkills}
              onChange={handleChange}
              required
            />
            <small>Separate multiple skills using commas.</small>
          </div>

          <div className="form-group">
            <label>Skills You Want to Learn</label>
            <input
              type="text"
              name="learnSkills"
              placeholder="Example: Machine Learning, Node.js"
              value={formData.learnSkills}
              onChange={handleChange}
              required
            />
            <small>Separate multiple skills using commas.</small>
          </div>

          <button type="submit" className="register-btn">
            Create Account
          </button>

          <p className="auth-redirect-text" style={{ textAlign: "center", marginTop: "1rem", color: "var(--text-secondary, #94a3b8)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary-color, #6366f1)", fontWeight: 600, textDecoration: "none" }}>
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;