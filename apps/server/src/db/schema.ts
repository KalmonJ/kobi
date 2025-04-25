import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text().primaryKey().$default(crypto.randomUUID),
  email: text().unique(),
  username: text().notNull().unique(),
  name: text().notNull(),
  avatar: text().notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text().primaryKey().$default(crypto.randomUUID),
  clientId: text("client_id").notNull(),
  clientSecret: text("client_secret").notNull(),
  token: text().notNull(),
  repo: text().notNull(),
  userId: text("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const usersRelations = relations(users, ({ one }) => ({
  config: one(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    references: [users.id],
    fields: [sessions.userId],
  }),
}));
