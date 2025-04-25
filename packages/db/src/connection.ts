import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";

const sqlite = new Database("../../packages/db/reviewer.db", {
  create: true,
});

export const db = drizzle({ client: sqlite, schema });
