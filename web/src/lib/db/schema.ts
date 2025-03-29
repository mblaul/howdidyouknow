import type { InferSelectModel } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// Helpers
const timestamps = {
  updatedAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  deletedAt: timestamp(),
};

// Schema
export const wishlistsTable = pgTable("wishlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  ...timestamps,
});

export const giftsTable = pgTable("gifts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  link: text("link"),
  description: text("description"),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  wishlistId: uuid("wishlist_id")
    .notNull()
    .references(() => wishlistsTable.id),
  ...timestamps,
});

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  ...timestamps,
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  expiresAt: timestamp("expires_at").notNull(),
});

export const schema = {
  giftsTable,
  usersTable,
};

export type User = InferSelectModel<typeof usersTable>;
export type Session = InferSelectModel<typeof sessionsTable>;
