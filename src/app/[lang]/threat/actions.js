"use server";

import { cookies } from "next/headers";

export async function loginAction(formData) {
  const cookieStore = await cookies();
  const code = formData.get("accessCode");
  // Hardcoded for now. In real scenario use DB and better crypt.
  if (code === "neo123") {
    // 1-hour session token
    cookieStore.set('threat_token', 'granted-neo-level-access', { maxAge: 3600, httpOnly: true, secure: true });
    return { success: true };
  } else {
    // Simulate honeypot tracking failure
    console.warn("Honeypot Trigger: Failed Threat Login Attempt");
    return { success: false, error: "ACCESS DENIED. IP LOGGED." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('threat_token');
}

export async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('threat_token');
  return token?.value === 'granted-neo-level-access';
}
