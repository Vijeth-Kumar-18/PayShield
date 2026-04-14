import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

export const otpCodes = pgTable('otp_codes', {
  id: serial('id').primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(), // email or phone
  otp: varchar('otp', { length: 255 }).notNull(), // hashed OTP
  type: varchar('type', { length: 50 }).notNull(), // 'email' or 'phone'
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});