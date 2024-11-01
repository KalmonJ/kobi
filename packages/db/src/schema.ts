import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const authors = pgTable("authors", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: text().unique().notNull(),
  name: varchar({ length: 255 }).notNull(),
});

export const posts = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text().notNull(),
  body: text().notNull(),
});
