import jwt from "jsonwebtoken";
import { query } from "./db";

export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Use this inside any route.js to get the logged-in user
export async function getAuthUser(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const { rows } = await query(
      `SELECT id, full_name, email, phone, is_active, trusted_countries
       FROM users WHERE id = $1 LIMIT 1`,
      [decoded.id]
    );

    const user = rows[0];
    if (!user || !user.is_active) return null;
    return user;
  } catch {
    return null;
  }
}