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
        </form>
      </div>
    </div>
  );
}

export default Register;