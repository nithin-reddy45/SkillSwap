import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);

  const [newTeachSkill, setNewTeachSkill] = useState("");
  const [newLearnSkill, setNewLearnSkill] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ============================
  // FETCH PROFILE
  // ============================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("Profile API Response:", data);

        if (!response.ok) {
          alert(data.message || "Failed to load profile");

          if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }

          return;
        }

        // Supports:
        // { user: {...} }
        // OR direct user object {...}
        const profileUser = data.user || data;

        setUser(profileUser);

        setName(profileUser.name || "");

        setTeachSkills(
          Array.isArray(profileUser.teachSkills)
            ? profileUser.teachSkills
            : []
        );

        setLearnSkills(
          Array.isArray(profileUser.learnSkills)
            ? profileUser.learnSkills
            : []
        );

      } catch (error) {
        console.error("Profile Error:", error);
        alert("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);


  // ============================
  // ADD TEACH SKILL
  // ============================
  const addTeachSkill = () => {
    const skill = newTeachSkill.trim();

    if (!skill) return;

    const exists = teachSkills.some(
      (item) =>
        item.toLowerCase() === skill.toLowerCase()
    );

    if (exists) {
      alert("Skill already added");
      return;
    }

    setTeachSkills([...teachSkills, skill]);
    setNewTeachSkill("");
  };


  // ============================
  // ADD LEARN SKILL
  // ============================
  const addLearnSkill = () => {
    const skill = newLearnSkill.trim();

    if (!skill) return;

    const exists = learnSkills.some(
      (item) =>
        item.toLowerCase() === skill.toLowerCase()
    );

    if (exists) {
      alert("Skill already added");
      return;
    }

    setLearnSkills([...learnSkills, skill]);
    setNewLearnSkill("");
  };


  // ============================
  // REMOVE TEACH SKILL
  // ============================
  const removeTeachSkill = (skillToRemove) => {
    setTeachSkills(
      teachSkills.filter(
        (skill) => skill !== skillToRemove
      )
    );
  };


  // ============================
  // REMOVE LEARN SKILL
  // ============================
  const removeLearnSkill = (skillToRemove) => {
    setLearnSkills(
      learnSkills.filter(
        (skill) => skill !== skillToRemove
      )
    );
  };


  // ============================
  // SAVE PROFILE
  // ============================
  const handleSave = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/users/profile`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name,
            teachSkills,
            learnSkills,
          }),
        }
      );

      const data = await response.json();

      console.log("Updated Profile Response:", data);

      if (!response.ok) {
        alert(
          data.message || "Failed to update profile"
        );
        return;
      }

      // Supports both response formats
      const updatedUser = data.user || data;

      setUser(updatedUser);

      setName(updatedUser.name || "");

      setTeachSkills(
        Array.isArray(updatedUser.teachSkills)
          ? updatedUser.teachSkills
          : teachSkills
      );

      setLearnSkills(
        Array.isArray(updatedUser.learnSkills)
          ? updatedUser.learnSkills
          : learnSkills
      );

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      alert("Profile updated successfully! 🎉");

    } catch (error) {
      console.error(
        "Update Profile Error:",
        error
      );

      alert("Unable to connect to the server");
    } finally {
      setSaving(false);
    }
  };


  // ============================
  // LOADING
  // ============================
  if (loading) {
    return (
      <div className="profile-page">
        <h1>Loading profile... 👤</h1>
      </div>
    );
  }


  // ============================
  // UI
  // ============================
  return (
    <div className="profile-page">

      <div className="profile-container">

        <div className="profile-header">

          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <p className="profile-tag">
              MY PROFILE
            </p>

            <h1>
              {user?.name || "User"}
            </h1>

            <p className="profile-email">
              {user?.email || ""}
            </p>
          </div>

        </div>


        {/* PERSONAL INFORMATION */}
        <div className="profile-card">

          <h2>Personal Information</h2>

          <div className="form-group">

            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              value={user?.email || ""}
              disabled
            />

          </div>

        </div>


        {/* TEACH SKILLS */}
        <div className="profile-card">

          <h2>🎓 Skills I Can Teach</h2>

          <div className="add-skill">

            <input
              type="text"
              placeholder="Example: React.js"
              value={newTeachSkill}
              onChange={(e) =>
                setNewTeachSkill(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTeachSkill();
                }
              }}
            />

            <button
              type="button"
              onClick={addTeachSkill}
            >
              Add
            </button>

          </div>


          <div className="profile-skills">

            {teachSkills.length === 0 && (
              <p>No skills added yet.</p>
            )}

            {teachSkills.map((skill, index) => (
              <span
                className="profile-teach-tag"
                key={`${skill}-${index}`}
              >
                {skill}

                <button
                  type="button"
                  onClick={() =>
                    removeTeachSkill(skill)
                  }
                >
                  ×
                </button>

              </span>
            ))}

          </div>

        </div>


        {/* LEARN SKILLS */}
        <div className="profile-card">

          <h2>📚 Skills I Want to Learn</h2>

          <div className="add-skill">

            <input
              type="text"
              placeholder="Example: Machine Learning"
              value={newLearnSkill}
              onChange={(e) =>
                setNewLearnSkill(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLearnSkill();
                }
              }}
            />

            <button
              type="button"
              onClick={addLearnSkill}
            >
              Add
            </button>

          </div>


          <div className="profile-skills">

            {learnSkills.length === 0 && (
              <p>No skills added yet.</p>
            )}

            {learnSkills.map((skill, index) => (
              <span
                className="profile-learn-tag"
                key={`${skill}-${index}`}
              >
                {skill}

                <button
                  type="button"
                  onClick={() =>
                    removeLearnSkill(skill)
                  }
                >
                  ×
                </button>

              </span>
            ))}

          </div>

        </div>


        <button
          className="save-profile-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "💾 Save Profile"}
        </button>

      </div>

    </div>
  );
}

export default Profile;