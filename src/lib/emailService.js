import nodemailer from "nodemailer";
import crypto from "crypto";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function sendGeoVerificationEmail(email, otp, geoInfo) {
  const expiresMin = parseInt(process.env.OTP_EXPIRES_MINUTES) || 10;

  await transporter.sendMail({
    from: `"PayShield Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "⚠️ Suspicious Login Detected - PayShield",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 30px; text-align: center;">
          <h1 style="color: #6c63ff; margin: 0;">🛡️ PayShield</h1>
          <p style="color: #aaa; margin: 5px 0;">Security Alert</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Unusual Login Detected</h2>
          <p>We noticed a login from an unusual location:</p>
          <div style="background:#fff;border-left:4px solid #e74c3c;padding:15px;margin:20px 0;border-radius:4px;">
            <p style="margin:5px 0;"><strong>📍 Location:</strong> ${geoInfo?.city || "Unknown"}, ${geoInfo?.country || "Unknown"}</p>
            <p style="margin:5px 0;"><strong>🌐 IP:</strong> ${geoInfo?.ip || "Unknown"}</p>
            ${geoInfo?.isVPN ? '<p style="color:#e74c3c;margin:5px 0;"><strong>⚠️ VPN/Proxy Detected</strong></p>' : ""}
          </div>
          <p>Your verification code:</p>
          <div style="text-align:center;margin:30px 0;">
            <div style="background:#1a1a2e;color:#6c63ff;font-size:36px;font-weight:bold;padding:20px 40px;border-radius:8px;letter-spacing:8px;display:inline-block;">
              ${otp}
            </div>
          </div>
          <p style="color:#888;font-size:14px;text-align:center;">Expires in <strong>${expiresMin} minutes</strong>.</p>
          <p style="color:#e74c3c;font-size:14px;text-align:center;">Not you? Change your password immediately.</p>
        </div>
      </div>
    `,
  });
}