import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const sqlite = new Database(process.env.DATABASE_URL);
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: "./drizzle" });
