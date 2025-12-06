import Database from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const sqlite = new Database(process.env.DATABASE_URL);
sqlite.run("PRAGMA journal_mode = WAL;");

export const db = drizzle(sqlite, { schema });
