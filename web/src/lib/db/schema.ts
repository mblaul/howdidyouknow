import type { InferSelectModel } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { time } from "drizzle-orm/singlestore-core";

// Helpers
const timestamps = {
  updated_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
  deleted_at: timestamp(),
};

// Schema
export const gift = pgTable("gift", {
  id: text("id").primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  link: text("link"),
  description: text("description"),
  ...timestamps,
});

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  ...timestamps,
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  expiresAt: timestamp("expires_at").notNull(),
});

export const schema = {
  gift,
  usersTable,
};

export type User = InferSelectModel<typeof usersTable>;
export type Session = InferSelectModel<typeof sessionsTable>;
