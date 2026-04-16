import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { LoginHistory } from "@/lib/loginHistoryModel";

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const lastLogin = await LoginHistory.getLastLogin(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      trustedCountries: user.trusted_countries,
      lastLogin,
    },
  });
}