import { query } from "./db";

export const LoginHistory = {
  async create(userId, session) {
    const {
      ip, city, region, country, countryCode,
      lat, lon, isp, isVPN, isProxy,
      riskScore, riskFlags, verified, userAgent,
    } = session;

    const { rows } = await query(
      `INSERT INTO login_history
         (user_id, ip, city, region, country, country_code, lat, lon, isp,
          is_vpn, is_proxy, risk_score, risk_flags, verified, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        userId, ip, city, region, country, countryCode,
        lat, lon, isp,
        isVPN || false, isProxy || false,
        riskScore || 0, riskFlags || [],
        verified || false, userAgent || null,
      ]
    );
    return rows[0];
  },

  async markVerified(userId) {
    await query(
      `UPDATE login_history SET verified = true
       WHERE id = (
         SELECT id FROM login_history WHERE user_id = $1
         ORDER BY login_at DESC LIMIT 1
       )`,
      [userId]
    );
  },

  async getByUser(userId, limit = 10) {
    const { rows } = await query(
      `SELECT * FROM login_history WHERE user_id = $1 ORDER BY login_at DESC LIMIT $2`,
      [userId, limit]
    );
    return rows;
  },

  async getLastLogin(userId) {
    const { rows } = await query(
      `SELECT * FROM login_history WHERE user_id = $1 ORDER BY login_at DESC LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  },
};