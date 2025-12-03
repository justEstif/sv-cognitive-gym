import { db } from ".";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

await db.insert(schema.movies).values([
  {
    title: "The Matrix",
    releaseYear: 1999,
  },
  {
    title: "The Matrix Reloaded",
    releaseYear: 2003,
  },
  {
    title: "The Matrix Revolutions",
    releaseYear: 2003,
  },
]);

console.log(`Seeding complete.`);
