import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoOtpHint, setDemoOtpHint] = useState("");

  // ==========================================
  // STEP 1: REQUEST OTP CODE
  // ==========================================
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset code.");
      }

      if (data.otp) {
        setDemoOtpHint(data.otp);
      }

      setStep(2);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Unable to process request.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP 2: VERIFY 6-DIGIT OTP
  // ==========================================
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Invalid verification code.");
      }

      setStep(3);
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError(err.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP 3: RESET PASSWORD
  // ==========================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update password.");
      }

      setStep(4);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        
        <div className="forgot-card">
          
          {/* BRAND */}
          <div className="forgot-brand-header">
            <div className="brand-icon-chip">
              <span>🔐</span>
            </div>
            <h1>Password Recovery</h1>
            <p>
              {step === 1 && "Enter your email to receive a secure 6-digit recovery code."}
              {step === 2 && `Enter the 6-digit code sent to ${email}`}
              {step === 3 && "Create a strong new password for your SkillSwap account."}
              {step === 4 && "Your password has been successfully updated!"}
            </p>
          </div>

          {/* PROGRESS STEPS */}
          <div className="forgot-steps-indicator">
            <div className={`step-dot ${step >= 1 ? "active" : ""}`}>1</div>
            <div className={`step-line ${step >= 2 ? "active" : ""}`} />
            <div className={`step-dot ${step >= 2 ? "active" : ""}`}>2</div>
            <div className={`step-line ${step >= 3 ? "active" : ""}`} />
            <div className={`step-dot ${step >= 3 ? "active" : ""}`}>3</div>
          </div>

          {error && <div className="forgot-error-banner">⚠️ {error}</div>}

          {/* STEP 1 FORM */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="forgot-form">
              <div className="form-group">
                <label>Registered Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="forgot-submit-btn" disabled={loading}>
                {loading ? "Sending Code..." : "📩 Send Recovery Code"}
              </button>
            </form>
          )}

          {/* STEP 2 FORM */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="forgot-form">
              {demoOtpHint && (
                <div className="otp-hint-box">
                  <span>💡 <strong>Verification Code:</strong> {demoOtpHint}</span>
                </div>
              )}

              <div className="form-group">
                <label>6-Digit Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="otp-input-field"
                  required
                />
              </div>

              <div className="otp-actions-row">
                <button
                  type="button"
                  className="resend-otp-btn"
                  onClick={handleRequestOTP}
                  disabled={loading}
                >
                  Resend Code
                </button>
                <button type="submit" className="forgot-submit-btn" disabled={loading}>
                  {loading ? "Verifying..." : "Verify Code →"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 FORM */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="forgot-form">
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="forgot-submit-btn" disabled={loading}>
                {loading ? "Updating Password..." : "✅ Update Password"}
              </button>
            </form>
          )}

          {/* STEP 4 SUCCESS */}
          {step === 4 && (
            <div className="forgot-success-box">
              <span className="success-check-icon">🎉</span>
              <h3>Password Reset Successful!</h3>
              <p>Your password has been changed. You can now log in to your SkillSwap account.</p>
              <button
                type="button"
                className="go-login-btn"
                onClick={() => navigate("/login")}
              >
                🔐 Go to Login
              </button>
            </div>
          )}

          {/* FOOTER */}
          <div className="forgot-footer">
            <Link to="/login" className="back-login-link">
              ← Back to Login
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;
