import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { LoginHistory } from "@/lib/loginHistoryModel";
import { User } from "@/lib/userModel";
import { generateToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { userId, otp } = await request.json();

    if (!userId || !otp) {
      return NextResponse.json({ message: "userId and OTP are required" }, { status: 400 });
    }

    // Fetch full user row (includes otp fields)
    const { rows } = await query(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [userId]);
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.otp_code || user.otp_purpose !== "geo_verify" || user.otp_code !== otp.trim()) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return NextResponse.json({ message: "OTP expired. Please login again." }, { status: 400 });
    }

    // Mark session verified + auto-trust this country
    await LoginHistory.markVerified(userId);
    const lastLogin = await LoginHistory.getLastLogin(userId);
    if (lastLogin?.country_code) {
      await User.addTrustedCountry(userId, lastLogin.country_code);
    }

    await User.clearOTP(userId);

    return NextResponse.json({
      message: "Verification successful",
      token: generateToken(user.id),
      user: { id: user.id, fullName: user.full_name, email: user.email },
    });

  } catch (err) {
    console.error("Geo verify error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}