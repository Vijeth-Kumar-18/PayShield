import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { LoginHistory } from "@/lib/loginHistoryModel";

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const history = await LoginHistory.getByUser(user.id, 10);
  return NextResponse.json({ loginHistory: history });
}