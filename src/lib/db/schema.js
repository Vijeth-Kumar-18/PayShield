import { pgTable, serial, varchar, timestamp, boolean, jsonb, text, integer, index } from 'drizzle-orm/pg-core';
import { otpCodes } from './schema/otp.js';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: varchar('full_name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phone: varchar('phone', { length: 20 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  motherNickname: varchar('mother_nickname', { length: 255 }),
  firstPetName: varchar('first_pet_name', { length: 255 }),
  isEmailVerified: boolean('is_email_verified').default(false),
  isPhoneVerified: boolean('is_phone_verified').default(false),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  deviceId: varchar('device_id', { length: 255 }),
  location: varchar('location', { length: 255 }),
  systemInfo: text('system_info'),
  gsmInfo: text('gsm_info'),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Add userSessions table
export const userSessions = pgTable('user_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  deviceInfo: jsonb('device_info'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const deviceCredentials = pgTable('device_credentials', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  deviceName: varchar('device_name', { length: 255 }).notNull(),
  deviceDna: varchar('device_dna', { length: 255 }).notNull(),
  publicKeyPem: text('public_key_pem').notNull(),
  browserSignature: text('browser_signature'),
  screenResolution: varchar('screen_resolution', { length: 50 }),
  lastSeenIp: varchar('last_seen_ip', { length: 45 }),
  lastSeenCountry: varchar('last_seen_country', { length: 2 }),
  lastUsedAt: timestamp('last_used_at'),
  trusted: boolean('trusted').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return [
    index('device_credentials_user_id_idx').on(table.userId),
    index('device_credentials_device_dna_idx').on(table.deviceDna),
  ];
});

export const loginChallenges = pgTable('login_challenges', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  deviceCredentialId: integer('device_credential_id').references(() => deviceCredentials.id),
  challenge: text('challenge').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  expiresAt: timestamp('expires_at').notNull(),
  consumedAt: timestamp('consumed_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return [
    index('login_challenges_user_id_idx').on(table.userId),
  ];
});

export const behavioralEvents = pgTable('behavioral_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar('session_id', { length: 255 }),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  riskScore: integer('risk_score').notNull(),
  triggeredRules: jsonb('triggered_rules'),
  actionTaken: varchar('action_taken', { length: 50 }).notNull(),
  metrics: jsonb('metrics'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const webauthnCredentials = pgTable('webauthn_credentials', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  credentialId: text('credential_id').notNull().unique(), 
  publicKey: text('public_key').notNull(),
  counter: integer('counter').notNull().default(0),
  transports: jsonb('transports'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const webauthnChallenges = pgTable('webauthn_challenges', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  currentChallenge: text('current_challenge').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export { otpCodes };