import { form, query, getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import type { DifficultyRating } from "$lib/server/db/schema";
import { redirect } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export const getCurrentSession = query(async () => {
  const { locals } = getRequestEvent();
  if (!locals.user) redirect(307, "/auth");

  const today = getToday();

  // Get today's session
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

  if (sessions.length > 0) {
    return sessions[0];
  }

  // No session for today - get the active plan to create an ad-hoc session
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

  if (plans.length === 0) {
    redirect(303, "/onboarding");
  }

  return {
    id: null,
    planId: plans[0].id,
    plannedDuration: plans[0].focusDuration,
    status: "scheduled" as const,
    isAdHoc: true,
  };
});

export const completeSession = form("unchecked", async (data) => {
  const { locals } = getRequestEvent();
  if (!locals.user) redirect(307, "/auth");

  const sessionId = data.sessionId as string | undefined;
  const planId = data.planId as string;
  const actualDuration = Number(data.actualDuration);
  const difficultyRating = data.difficultyRating as DifficultyRating;
  const notes = (data.notes as string) || null;

  const today = getToday();

  if (sessionId) {
    // Update existing session
    await db
      .update(table.workSession)
      .set({
        actualDuration,
        status: "completed",
        completedAt: new Date(),
        difficultyRating,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(table.workSession.id, sessionId));
  } else {
    // Create new ad-hoc session
    await db.insert(table.workSession).values({
      id: crypto.randomUUID(),
      userId: locals.user.id,
      planId,
      scheduledDate: today,
      plannedDuration: actualDuration,
      actualDuration,
      isRestDay: false,
      status: "completed",
      completedAt: new Date(),
      difficultyRating,
      notes,
    });
  }

  redirect(303, "/");
});
