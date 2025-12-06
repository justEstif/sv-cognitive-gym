import { hash } from "@node-rs/argon2";
import { db } from ".";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

// Helper to generate dates
function daysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split("T")[0];
}

function daysFromNow(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return date.toISOString().split("T")[0];
}

async function seed() {
  console.log("Seeding database...");

  // Create test user
  const userId = Bun.randomUUIDv7();
  const passwordHash = await hash("password123", {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  await db.insert(schema.user).values({
    id: userId,
    username: "testuser",
    passwordHash,
  });
  console.log("Created test user: testuser / password123");

  // Create active plan (25 min, 4 days/week, Mon-Thu)
  const planId = Bun.randomUUIDv7();
  await db.insert(schema.userPlan).values({
    id: planId,
    userId,
    focusDuration: 25,
    daysPerWeek: 4,
    workDaysSchedule: [1, 2, 3, 4], // Mon, Tue, Wed, Thu
    currentProgressionWeek: 2,
    isActive: true,
  });
  console.log("Created active plan: 25min, 4 days/week");

  // Create work sessions for the past 2 weeks
  const sessions: schema.NewWorkSession[] = [];

  // Past sessions (completed mix)
  const pastSessions = [
    { daysAgo: 14, status: "completed" as const, rating: "just_right" as const },
    { daysAgo: 13, status: "completed" as const, rating: "easy" as const },
    { daysAgo: 12, status: "completed" as const, rating: "just_right" as const },
    { daysAgo: 11, status: "completed" as const, rating: "challenging" as const },
    { daysAgo: 10, status: "missed" as const, rating: null },
    { daysAgo: 9, status: "completed" as const, rating: "just_right" as const },
    { daysAgo: 7, status: "completed" as const, rating: "easy" as const },
    { daysAgo: 6, status: "completed" as const, rating: "just_right" as const },
    { daysAgo: 5, status: "completed" as const, rating: "just_right" as const },
    { daysAgo: 4, status: "completed" as const, rating: "challenging" as const },
    { daysAgo: 3, status: "completed" as const, rating: "just_right" as const },
    { daysAgo: 2, status: "completed" as const, rating: "easy" as const },
    { daysAgo: 1, status: "completed" as const, rating: "just_right" as const },
  ];

  for (const s of pastSessions) {
    sessions.push({
      id: Bun.randomUUIDv7(),
      userId,
      planId,
      scheduledDate: daysAgo(s.daysAgo),
      plannedDuration: 25,
      actualDuration: s.status === "completed" ? 25 : null,
      isRestDay: false,
      status: s.status,
      completedAt: s.status === "completed" ? new Date() : null,
      difficultyRating: s.rating,
      notes: s.status === "completed" ? "Great focus session!" : null,
    });
  }

  // Today's session (scheduled)
  sessions.push({
    id: Bun.randomUUIDv7(),
    userId,
    planId,
    scheduledDate: daysAgo(0),
    plannedDuration: 25,
    actualDuration: null,
    isRestDay: false,
    status: "scheduled",
    completedAt: null,
    difficultyRating: null,
    notes: null,
  });

  // Future sessions
  for (let i = 1; i <= 3; i++) {
    sessions.push({
      id: Bun.randomUUIDv7(),
      userId,
      planId,
      scheduledDate: daysFromNow(i),
      plannedDuration: 25,
      actualDuration: null,
      isRestDay: false,
      status: "scheduled",
      completedAt: null,
      difficultyRating: null,
      notes: null,
    });
  }

  await db.insert(schema.workSession).values(sessions);
  console.log(`Created ${sessions.length} work sessions`);

  // Create progression record (level-up from 15min to 25min)
  await db.insert(schema.progression).values({
    id: Bun.randomUUIDv7(),
    userId,
    previousDuration: 15,
    previousFrequency: 3,
    newDuration: 25,
    newFrequency: 4,
    progressionType: "auto",
  });
  console.log("Created progression record");

  console.log("Seeding complete!");
}

seed().catch(console.error);
