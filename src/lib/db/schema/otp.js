import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const otpCodes = pgTable('otp_codes', {
  id: serial('id').primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  otp: varchar('otp', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});