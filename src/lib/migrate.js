// Run this once to create tables in NeonDB:
// node src/lib/migrate.js

require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("🔄 Running migrations...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name             VARCHAR(255) NOT NULL,
        email                 VARCHAR(255) UNIQUE NOT NULL,
        password              VARCHAR(255) NOT NULL,
        phone                 VARCHAR(50),
        is_verified           BOOLEAN DEFAULT false,
        is_active             BOOLEAN DEFAULT true,
        trusted_countries     TEXT[]  DEFAULT '{}',
        failed_login_attempts INT     DEFAULT 0,
        lock_until            TIMESTAMPTZ,
        otp_code              VARCHAR(10),
        otp_expires_at        TIMESTAMPTZ,
        otp_purpose           VARCHAR(50),
        created_at            TIMESTAMPTZ DEFAULT NOW(),
        updated_at            TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS login_history (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        ip           VARCHAR(100),
        city         VARCHAR(100),
        region       VARCHAR(100),
        country      VARCHAR(100),
        country_code VARCHAR(10),
        lat          NUMERIC(10,6),
        lon          NUMERIC(10,6),
        isp          VARCHAR(255),
        is_vpn       BOOLEAN DEFAULT false,
        is_proxy     BOOLEAN DEFAULT false,
        risk_score   INT     DEFAULT 0,
        risk_flags   TEXT[]  DEFAULT '{}',
        verified     BOOLEAN DEFAULT false,
        user_agent   TEXT,
        login_at     TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_login_history_login_at ON login_history(login_at DESC);
    `);

    console.log("✅ Tables created successfully in NeonDB");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();