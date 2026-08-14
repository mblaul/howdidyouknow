import type { InferSelectModel } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

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
  position: integer("position").default(0).notNull(),
  purchasedByUserId: uuid("purchased_by_user_id").references(() => usersTable.id),
  purchasedAt: timestamp("purchased_at"),
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

export const wishlistSharesTable = pgTable(
  "wishlist_shares",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    wishlistId: uuid("wishlist_id")
      .notNull()
      .references(() => wishlistsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).default("viewer").notNull(),
    expiresAt: timestamp("expires_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("wishlist_shares_wishlist_id_user_id_idx").on(
      table.wishlistId,
      table.userId
    ),
  ]
);

export const schema = {
  wishlistsTable,
  giftsTable,
  usersTable,
  sessionsTable,
  wishlistSharesTable,
};

export type User = InferSelectModel<typeof usersTable>;
export type Session = InferSelectModel<typeof sessionsTable>;
export type Wishlist = InferSelectModel<typeof wishlistsTable>;
export type WishlistShare = InferSelectModel<typeof wishlistSharesTable>;
