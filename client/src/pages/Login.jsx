import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { socket } from "../socket";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // HANDLE LOGIN
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // Remove old login data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        }
      );

      // Safely read response
      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Server returned:", text);

        alert("Invalid response from server");
        return;
      }

      console.log("Login Response:", data);

      // =========================
      // LOGIN FAILED
      // =========================
      if (!response.ok) {
        alert(
          data.message ||
          "Invalid email or password"
        );

        return;
      }

      // =========================
      // VALIDATE RESPONSE
      // =========================
      if (!data.token || !data.user) {
        console.error(
          "Invalid login response:",
          data
        );

        alert(
          "Login failed: token or user data missing"
        );

        return;
      }

      // =========================
      // SAVE LOGIN DATA
      // =========================
      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // =========================
      // CONNECT SOCKET
      // =========================
      if (data.user._id) {
        if (!socket.connected) {
          socket.connect();
        }

        socket.emit(
          "join",
          data.user._id
        );

        console.log(
          "Socket joined for user:",
          data.user._id
        );
      }

      console.log(
        "Login Success:",
        data
      );

      alert(
        `Welcome back, ${data.user.name}! 🎉`
      );

      // =========================
      // REDIRECT
      // =========================
      navigate("/dashboard");

    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      alert(
        "Unable to connect to the server"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        <div className="login-header">

          <p className="login-tag">
            WELCOME BACK
          </p>

          <h1>
            Login to SkillSwap AI
          </h1>

          <p>
            Continue learning, teaching, and
            connecting with your skill community.
          </p>

        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          {/* EMAIL */}
          <div className="form-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>

          {/* PASSWORD */}
          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>

          {/* OPTIONS */}
          <div className="login-options">

            <label className="remember-me">

              <input type="checkbox" />

              Remember me

            </label>

            <a href="#forgot">
              Forgot password?
            </a>

          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

          {/* REGISTER */}
          <p className="register-link">

            Don't have an account?{" "}

            <Link to="/register">
              Create an account
            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}

export default Login;