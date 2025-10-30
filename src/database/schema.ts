import { pgTable, timestamp, varchar, uuid, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  email: varchar("email", { length: 256 }).unique().notNull(),
  hashed_password: varchar("hashed_password").default("unset").notNull(),
});

export const chirps = pgTable("chirps", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
});

export const userRelation = relations(users, ({ many }) => ({
  feeds: many(chirps),
}));

export const userChirps = relations(chirps, ({ one }) => ({
  user: one(users, {
    fields: [chirps.user_id],
    references: [users.id],
  }),
}));

export type NewUser = typeof users.$inferInsert;
export type NewChirp = typeof chirps.$inferInsert;

export type Chirp = typeof chirps.$inferSelect;
export type UserResponse = Omit<NewUser, "hashed_password">;
