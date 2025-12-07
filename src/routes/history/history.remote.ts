import { query, getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { redirect } from "@sveltejs/kit";
import { and, eq, gte, lte, desc, sql } from "drizzle-orm";
import { z } from "zod";

const monthSchema = z.string().regex(/^\d{4}-\d{2}$/);

export const getSessionsByMonth = query(monthSchema, async (yearMonth) => {
  const { locals } = getRequestEvent();
  if (!locals.user) redirect(307, "/auth");

  const [year, month] = yearMonth.split("-").map(Number);
  const startDate = `${yearMonth}-01`;
  const endDate = new Date(year, month, 0).toISOString().split("T")[0]; // Last day of month

  const sessions = await db
    .select()
    .from(table.workSession)
    .where(
      and(
        eq(table.workSession.userId, locals.user.id),
        gte(table.workSession.scheduledDate, startDate),
        lte(table.workSession.scheduledDate, endDate)
      )
    )
    .orderBy(table.workSession.scheduledDate);

  return sessions;
});

export const getHistoryStats = query(async () => {
  const { locals } = getRequestEvent();
  if (!locals.user) redirect(307, "/auth");

  const allSessions = await db
    .select()
    .from(table.workSession)
    .where(eq(table.workSession.userId, locals.user.id))
    .orderBy(desc(table.workSession.scheduledDate));

  const completedSessions = allSessions.filter((s) => s.status === "completed");

  const totalSessions = completedSessions.length;
  const totalMinutes = completedSessions.reduce(
    (sum, s) => sum + (s.actualDuration ?? 0),
    0
  );
  const totalHours = Math.round(totalMinutes / 60);

  // Calculate longest streak
  let longestStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;

  for (const session of completedSessions) {
    const sessionDate = new Date(session.scheduledDate);

    if (lastDate) {
      const diffDays = Math.round(
        (lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    lastDate = sessionDate;
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  // Calculate average difficulty
  const ratingsCount = { easy: 0, just_right: 0, challenging: 0 };
  for (const session of completedSessions) {
    if (session.difficultyRating) {
      ratingsCount[session.difficultyRating]++;
    }
  }

  return {
    totalSessions,
    totalHours,
    longestStreak,
    ratingsCount,
  };
});
