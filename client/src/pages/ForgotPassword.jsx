import { useState, useEffect } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [demoOtpHint, setDemoOtpHint] = useState("");

  // Resend OTP countdown timer
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ==========================================
  // STEP 1: REQUEST OTP CODE VIA EMAIL
  // ==========================================
  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

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

      setSuccessMsg(`A 6-digit OTP code has been dispatched to ${email.trim()}.`);
      setResendCooldown(60); // 60s cooldown
      setStep(2);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Unable to process request. Please try again.");
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
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

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

      setSuccessMsg("Code verified! Set your new password.");
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
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please ensure both passwords match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

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
          
          {/* BRAND HEADER */}
          <div className="forgot-brand-header">
            <div className="brand-icon-chip">
              <span>🔐</span>
            </div>
            <h1>Password Recovery</h1>
            <p>
              {step === 1 && "Enter your registered email to receive a secure 6-digit OTP code."}
              {step === 2 && `Enter the 6-digit code sent to ${email}`}
              {step === 3 && "Create a secure new password for your SkillSwap account."}
              {step === 4 && "Your password has been successfully updated!"}
            </p>
          </div>

          {/* PROGRESS STEPS INDICATOR */}
          <div className="forgot-steps-indicator">
            <div className={`step-dot ${step >= 1 ? "active" : ""}`}>1</div>
            <div className={`step-line ${step >= 2 ? "active" : ""}`} />
            <div className={`step-dot ${step >= 2 ? "active" : ""}`}>2</div>
            <div className={`step-line ${step >= 3 ? "active" : ""}`} />
            <div className={`step-dot ${step >= 3 ? "active" : ""}`}>3</div>
          </div>

          {/* NOTIFICATION BANNERS */}
          {error && <div className="forgot-error-banner">⚠️ {error}</div>}
          {successMsg && step !== 4 && <div className="forgot-success-banner">✉️ {successMsg}</div>}

          {/* STEP 1: EMAIL INPUT */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="forgot-form">
              <div className="form-group">
                <label>Registered Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. user@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
                <span className="field-helper">
                  We'll send a 6-digit one-time password (OTP) to this email address.
                </span>
              </div>

              <button type="submit" className="forgot-submit-btn" disabled={loading}>
                {loading ? "Sending 6-Digit OTP..." : "📨 Send 6-Digit OTP"}
              </button>
            </form>
          )}

          {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="forgot-form">
              {demoOtpHint && (
                <div className="otp-hint-box">
                  <span>💡 <strong>Quick Dev OTP:</strong> {demoOtpHint}</span>
                </div>
              )}

              <div className="form-group">
                <div className="label-row">
                  <label>6-Digit Verification Code</label>
                  <button
                    type="button"
                    className="change-email-btn"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setError("");
                    }}
                  >
                    Change Email
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="otp-input-field"
                  autoFocus
                  required
                />
                <span className="field-helper">
                  Check your inbox and spam folder. Code is valid for 15 minutes.
                </span>
              </div>

              <div className="otp-actions-row">
                <button
                  type="button"
                  className="resend-otp-btn"
                  onClick={handleRequestOTP}
                  disabled={loading || resendCooldown > 0}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "🔄 Resend Code"}
                </button>
                <button type="submit" className="forgot-submit-btn" disabled={loading || otp.length !== 6}>
                  {loading ? "Verifying..." : "Verify Code →"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="forgot-form">
              <div className="form-group">
                <label>New Password</label>
                <div className="password-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input-wrap">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              {newPassword && confirmPassword && (
                <div className={`match-badge ${newPassword === confirmPassword ? "matched" : "mismatch"}`}>
                  {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </div>
              )}

              <button
                type="submit"
                className="forgot-submit-btn"
                disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
              >
                {loading ? "Updating Password..." : "✅ Save New Password"}
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && (
            <div className="forgot-success-box">
              <span className="success-check-icon">🎉</span>
              <h3>Password Reset Successful!</h3>
              <p>Your password has been changed securely. You can now log in to your SkillSwap account.</p>
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
              ← Return to Login
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;
