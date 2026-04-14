import { pgTable, serial, varchar, timestamp, boolean, jsonb, text, integer } from 'drizzle-orm/pg-core';
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
  userId: integer('user_id').references(() => users.id),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  deviceInfo: jsonb('device_info'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export { otpCodes };