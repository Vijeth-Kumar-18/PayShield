import { query } from "./db";
import bcrypt from "bcryptjs";

export const User = {
  async create({ fullName, email, password, phone, trustedCountries = [] }) {
    const hashed = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO users (full_name, email, password, phone, trusted_countries)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, phone, trusted_countries, created_at`,
      [fullName, email, hashed, phone || null, trustedCountries]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await query(
      `SELECT * FROM users WHERE email = $1 LIMIT 1`,
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT id, full_name, email, phone, is_verified, is_active,
              trusted_countries, failed_login_attempts, lock_until
       FROM users WHERE id = $1 LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async comparePassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  },

  isLocked(user) {
    return user.lock_until && new Date(user.lock_until) > new Date();
  },

  async incrementFailedAttempts(userId, current) {
    const next = current + 1;
    const lockUntil = next >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;
    await query(
      `UPDATE users SET failed_login_attempts = $1, lock_until = $2, updated_at = NOW() WHERE id = $3`,
      [next, lockUntil, userId]
    );
  },

  async resetFailedAttempts(userId) {
    await query(
      `UPDATE users SET failed_login_attempts = 0, lock_until = NULL, updated_at = NOW() WHERE id = $1`,
      [userId]
    );
  },

  async setOTP(userId, code, purpose, expiresAt) {
    await query(
      `UPDATE users SET otp_code = $1, otp_purpose = $2, otp_expires_at = $3, updated_at = NOW() WHERE id = $4`,
      [code, purpose, expiresAt, userId]
    );
  },

  async clearOTP(userId) {
    await query(
      `UPDATE users SET otp_code = NULL, otp_purpose = NULL, otp_expires_at = NULL, updated_at = NOW() WHERE id = $1`,
      [userId]
    );
  },

  async addTrustedCountry(userId, countryCode) {
    await query(
      `UPDATE users SET trusted_countries = array_append(trusted_countries, $1), updated_at = NOW()
       WHERE id = $2 AND NOT ($1 = ANY(trusted_countries))`,
      [countryCode, userId]
    );
  },
};