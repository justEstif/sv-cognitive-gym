import { query } from "$app/server";
import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { redirect } from "@sveltejs/kit";
import { and, eq, gte, lte, desc, sql } from "drizzle-orm";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getDaysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split("T")[0];
}

export const getActivePlan = query(async () => {
  const { locals } = getRequestEvent();
  if (!locals.user) redirect(307, "/auth");

  const plans = await db
    .select()
    .from(table.userPlan)
    .where(
      and(
        eq(table.userPlan.userId, locals.user.id),
        eq(table.userPlan.isActive, true)
      )
    )
    .limit(1);

  return plans.at(0) ?? null;
});

export const getTodaySession = query(async () => {
  const { locals } = getRequestEvent();
  if (!locals.user) redirect(307, "/auth");

  const today = getToday();
  const sessions = await db
    .select()
    .from(table.workSession)
    .where(
      and(
        eq(table.workSession.userId, locals.user.id),
        eq(table.workSession.scheduledDate, today)
      )
    )
    .limit(1);

  return sessions.at(0) ?? null;
});

export const getWeekSessions = query(async () => {
  const { locals } = getRequestEvent();
  if (!locals.user) redirect(307, "/auth");

  const today = getToday();
  const weekAgo = getDaysAgo(6);

  const sessions = await db
    .select()
    .from(table.workSession)
    .where(
      and(
        eq(table.workSession.userId, locals.user.id),
        gte(table.workSession.scheduledDate, weekAgo),
        lte(table.workSession.scheduledDate, today)
      )
    )
    .orderBy(table.workSession.scheduledDate);

  return sessions;
});

export const getUserStats = query(async () => {
  const { locals } = getRequestEvent();
  if (!locals.user) redirect(307, "/auth");

  const today = getToday();
  const weekAgo = getDaysAgo(6);

  // Get all completed sessions for streak calculation
  const allSessions = await db
    .select()
    .from(table.workSession)
    .where(eq(table.workSession.userId, locals.user.id))
    .orderBy(desc(table.workSession.scheduledDate));

  // Calculate current streak (consecutive completed days)
  let streak = 0;
  const todayDate = new Date(today);

  for (let i = 0; i < allSessions.length; i++) {
    const session = allSessions[i];
    const sessionDate = new Date(session.scheduledDate);
    const expectedDate = new Date(todayDate);
    expectedDate.setDate(expectedDate.getDate() - streak);

    // Check if session is from expected day (today - streak days)
    if (sessionDate.toISOString().split("T")[0] === expectedDate.toISOString().split("T")[0]) {
      if (session.status === "completed") {
        streak++;
      } else if (session.status !== "scheduled") {
        // Missed or skipped breaks the streak
        break;
      }
    }
  }

  // Weekly stats
  const weekSessions = allSessions.filter(
    (s) => s.scheduledDate >= weekAgo && s.scheduledDate <= today
  );

  const sessionsThisWeek = weekSessions.filter(
    (s) => s.status === "completed"
  ).length;

  const totalFocusMinutes = weekSessions
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + (s.actualDuration ?? 0), 0);

  // All-time total
  const totalAllTime = allSessions
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + (s.actualDuration ?? 0), 0);

  return {
    streak,
    sessionsThisWeek,
    totalFocusMinutes,
    totalFocusHours: Math.round(totalAllTime / 60),
  };
});

export const needsOnboarding = query(async () => {
  const { locals } = getRequestEvent();
  if (!locals.user) redirect(307, "/auth");

  const plans = await db
    .select({ id: table.userPlan.id })
    .from(table.userPlan)
    .where(
      and(
        eq(table.userPlan.userId, locals.user.id),
        eq(table.userPlan.isActive, true)
      )
    )
    .limit(1);

  return plans.length === 0;
});
