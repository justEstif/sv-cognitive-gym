import { form, query, getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { redirect } from "@sveltejs/kit";
import { and, eq, gte } from "drizzle-orm";
import * as auth from "$lib/server/auth";

export const getCurrentPlan = query(async () => {
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

export const getProgressionStatus = query(async () => {
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

  if (plans.length === 0) return null;

  const plan = plans[0];
  const weeksAtLevel = plan.currentProgressionWeek;

  // Check if ready for progression (2+ weeks at current level)
  const isEligible = weeksAtLevel >= 2;

  // Calculate next level
  const durations = [15, 25, 45, 60, 90];
  const currentIndex = durations.indexOf(plan.focusDuration);
  const canIncreaseDuration = currentIndex < durations.length - 1;
  const canIncreaseFrequency = plan.daysPerWeek < 7;

  let suggestedDuration = plan.focusDuration;
  let suggestedFrequency = plan.daysPerWeek;

  if (canIncreaseDuration) {
    suggestedDuration = durations[currentIndex + 1];
  } else if (canIncreaseFrequency) {
    suggestedFrequency = Math.min(7, plan.daysPerWeek + 1);
  }

  return {
    currentPlan: plan,
    weeksAtLevel,
    isEligible,
    suggestion: {
      duration: suggestedDuration,
      frequency: suggestedFrequency,
    },
  };
});

export const updatePlan = form("unchecked", async (data) => {
  const { locals } = getRequestEvent();
  if (!locals.user) redirect(307, "/auth");

  const focusDuration = Number(data.focusDuration);
  const daysPerWeek = Number(data.daysPerWeek);
  const workDays = (Array.isArray(data.workDays) ? data.workDays : [data.workDays]).map(Number);

  // Get current active plan
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

  const plan = plans[0];

  // Update the plan
  await db
    .update(table.userPlan)
    .set({
      focusDuration,
      daysPerWeek,
      workDaysSchedule: workDays,
      updatedAt: new Date(),
    })
    .where(eq(table.userPlan.id, plan.id));

  // Update future scheduled sessions
  const today = new Date().toISOString().split("T")[0];

  await db
    .update(table.workSession)
    .set({
      plannedDuration: focusDuration,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(table.workSession.planId, plan.id),
        eq(table.workSession.status, "scheduled"),
        gte(table.workSession.scheduledDate, today)
      )
    );

  redirect(303, "/settings");
});

export const triggerProgression = form("unchecked", async (data) => {
  const { locals } = getRequestEvent();
  if (!locals.user) redirect(307, "/auth");

  const newDuration = Number(data.newDuration);
  const newFrequency = Number(data.newFrequency);

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

  const plan = plans[0];

  // Record the progression
  await db.insert(table.progression).values({
    id: crypto.randomUUID(),
    userId: locals.user.id,
    previousDuration: plan.focusDuration,
    previousFrequency: plan.daysPerWeek,
    newDuration,
    newFrequency,
    progressionType: "manual",
  });

  // Update the plan
  await db
    .update(table.userPlan)
    .set({
      focusDuration: newDuration,
      daysPerWeek: newFrequency,
      currentProgressionWeek: 1,
      updatedAt: new Date(),
    })
    .where(eq(table.userPlan.id, plan.id));

  // Update future scheduled sessions
  const today = new Date().toISOString().split("T")[0];

  await db
    .update(table.workSession)
    .set({
      plannedDuration: newDuration,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(table.workSession.planId, plan.id),
        eq(table.workSession.status, "scheduled"),
        gte(table.workSession.scheduledDate, today)
      )
    );

  redirect(303, "/settings");
});

export const deleteAccount = form("unchecked", async () => {
  const event = getRequestEvent();
  if (!event.locals.user) redirect(307, "/auth");

  // Delete user (cascades to plans, sessions, etc.)
  await db
    .delete(table.user)
    .where(eq(table.user.id, event.locals.user.id));

  // Clear session
  if (event.locals.session?.id) {
    await auth.invalidateSession(event.locals.session.id);
  }
  auth.deleteSessionTokenCookie(event);

  redirect(303, "/auth");
});
