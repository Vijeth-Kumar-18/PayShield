import { NextResponse } from "next/server";
import { User } from "@/lib/userModel";
import { generateToken } from "@/lib/auth";
import { getGeoFromIP, getClientIP } from "@/lib/geoService";

export async function POST(request) {
  try {
    const { fullName, email, password, phone } = await request.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    // Trust the country they register from
    const ip = getClientIP(request);
    const geo = await getGeoFromIP(ip);
    const trustedCountries = geo?.countryCode ? [geo.countryCode] : [];

    const user = await User.create({ fullName, email, password, phone, trustedCountries });

    return NextResponse.json({
      message: "Account created successfully",
      token: generateToken(user.id),
      user: { id: user.id, fullName: user.full_name, email: user.email },
    }, { status: 201 });

  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}