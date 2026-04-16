import { NextResponse } from "next/server";
import { User } from "@/lib/userModel";
import { LoginHistory } from "@/lib/loginHistoryModel";
import { generateToken } from "@/lib/auth";
import {
  getGeoFromIP, getClientIP,
  analyzeRisk, requiresExtraVerification,
} from "@/lib/geoService";
import { generateOTP, sendGeoVerificationEmail } from "@/lib/emailService";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Lockout check
    if (User.isLocked(user)) {
      const minutesLeft = Math.ceil((new Date(user.lock_until) - Date.now()) / 60000);
      return NextResponse.json(
        { message: `Account locked. Try again in ${minutesLeft} minute(s).` },
        { status: 423 }
      );
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      await User.incrementFailedAttempts(user.id, user.failed_login_attempts);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    await User.resetFailedAttempts(user.id);

    // ── Geo Analysis ───────────────────────────────────────────────────────────
    const ip = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "";
    const geo = await getGeoFromIP(ip);
    const lastLogin = await LoginHistory.getLastLogin(user.id);

    const { riskScore, riskFlags } = analyzeRisk(geo, lastLogin, user.trusted_countries);

    const sessionData = {
      ip, ...(geo || {}), riskScore, riskFlags, userAgent,
      verified: !requiresExtraVerification(riskScore),
    };

    // ── High risk → OTP required ───────────────────────────────────────────────
    if (requiresExtraVerification(riskScore)) {
      const otp = generateOTP();
      const expiresAt = new Date(
        Date.now() + (parseInt(process.env.OTP_EXPIRES_MINUTES) || 10) * 60000
      );

      await User.setOTP(user.id, otp, "geo_verify", expiresAt);
      await LoginHistory.create(user.id, { ...sessionData, verified: false });
      await sendGeoVerificationEmail(user.email, otp, geo);

      return NextResponse.json({
        requiresVerification: true,
        userId: user.id,
        riskScore,
        riskFlags,
        geoInfo: {
          city: geo?.city,
          country: geo?.country,
          isVPN: geo?.isVPN,
          isProxy: geo?.isProxy,
        },
        message: "Suspicious login detected. Check your email for a verification code.",
      }, { status: 202 });
    }

    // ── Low risk → issue token ─────────────────────────────────────────────────
    await LoginHistory.create(user.id, sessionData);

    return NextResponse.json({
      requiresVerification: false,
      token: generateToken(user.id),
      riskScore,
      riskFlags,
      user: { id: user.id, fullName: user.full_name, email: user.email },
    });

  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}