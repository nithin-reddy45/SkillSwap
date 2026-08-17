const nodemailer = require("nodemailer");

/**
 * Creates and returns a nodemailer transporter based on environment variables
 */
const createTransporter = () => {
  // If dedicated SMTP host is provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // If standard Gmail / Service config is provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback: No credentials configured yet
  return null;
};

/**
 * Sends a 6-digit OTP email to the user for password recovery
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - Name of the user
 * @param {string} otp - 6-digit OTP code
 */
const sendOTPEmail = async (toEmail, userName, otp) => {
  const transporter = createTransporter();
  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || '"SkillSwap AI Support" <no-reply@skillswap.ai>';

  const subject = `🔐 ${otp} is your SkillSwap AI Password Reset Code`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - SkillSwap AI</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0d1117;
      color: #e6edf3;
      margin: 0;
      padding: 30px 15px;
    }
    .email-wrapper {
      max-width: 520px;
      margin: 0 auto;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }
    .email-header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0 0 6px;
    }
    .brand-subtitle {
      font-size: 13px;
      opacity: 0.9;
      margin: 0;
    }
    .email-body {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #f0f6fc;
      margin-top: 0;
      margin-bottom: 14px;
    }
    .message-text {
      font-size: 14px;
      line-height: 1.6;
      color: #8b949e;
      margin-bottom: 24px;
    }
    .otp-container {
      background: #0d1117;
      border: 1px dashed #6366f1;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #818cf8;
      margin: 0;
      display: inline-block;
    }
    .otp-expiry {
      font-size: 12px;
      color: #f59e0b;
      margin-top: 10px;
      font-weight: 500;
    }
    .security-notice {
      background: rgba(239, 68, 68, 0.08);
      border-left: 3px solid #ef4444;
      padding: 12px 16px;
      border-radius: 6px;
      margin-top: 24px;
      font-size: 12.5px;
      color: #f87171;
      line-height: 1.5;
    }
    .email-footer {
      border-top: 1px solid #30363d;
      padding: 20px 28px;
      text-align: center;
      font-size: 12px;
      color: #6e7681;
      background: #11141a;
    }
    .email-footer a {
      color: #818cf8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <div class="brand-title">⚡ SkillSwap AI</div>
      <div class="brand-subtitle">Peer-to-Peer AI-Powered Skill Exchange</div>
    </div>
    <div class="email-body">
      <h3 class="greeting">Hello ${userName || "Skill Swapper"},</h3>
      <p class="message-text">
        We received a request to reset your password for your SkillSwap AI account. Use the 6-digit verification code below to complete your password reset:
      </p>

      <div class="otp-container">
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">⏳ This code will expire in <strong>15 minutes</strong>.</div>
      </div>

      <p class="message-text" style="margin-bottom: 0;">
        Enter this code on the verification screen along with your new password to restore access to your account.
      </p>

      <div class="security-notice">
        <strong>⚠️ Security Advisory:</strong> Never share this OTP with anyone. SkillSwap staff will never ask for your verification code. If you did not make this request, you can safely ignore this email.
      </div>
    </div>
    <div class="email-footer">
      © ${new Date().getFullYear()} SkillSwap AI Platform. All rights reserved.<br>
      Empowering developers and learners worldwide.
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `Hello ${userName || "Skill Swapper"},\n\n` +
    `Your SkillSwap AI password reset code is: ${otp}\n\n` +
    `This code is valid for 15 minutes.\n\n` +
    `If you did not request a password reset, please ignore this message.\n\n` +
    `© ${new Date().getFullYear()} SkillSwap AI Platform`;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[EMAIL DISPATCH] Password reset OTP sent to ${toEmail}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed to send OTP email via SMTP to ${toEmail}:`, err.message);
      // Log for developer convenience
      console.log(`[EMAIL FALLBACK OTP] Generated OTP for ${toEmail}: ${otp}`);
      return { success: true, fallback: true, error: err.message };
    }
  } else {
    // If no transporter configured, log neatly to server console
    console.log("=================================================");
    console.log(`[EMAIL DISPATCH - CONSOLE PREVIEW]`);
    console.log(`To: ${toEmail} (${userName || "User"})`);
    console.log(`Subject: ${subject}`);
    console.log(`6-Digit OTP: >>> ${otp} <<< (Expires in 15 mins)`);
    console.log("=================================================");
    return { success: true, simulated: true };
  }
};

module.exports = {
  sendOTPEmail,
};
