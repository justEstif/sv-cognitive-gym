import { form, getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { redirect } from "@sveltejs/kit";

function generateSessions(
  userId: string,
  planId: string,
  focusDuration: number,
  workDays: number[],
  weeksToGenerate: number = 4,
): table.NewWorkSession[] {
  const sessions: table.NewWorkSession[] = [];
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + weeksToGenerate * 7);

  const currentDate = new Date(today);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const isWorkDay = workDays.includes(dayOfWeek);

    sessions.push({
      id: crypto.randomUUID(),
      userId,
      planId,
      scheduledDate: currentDate.toISOString().split("T")[0],
      plannedDuration: focusDuration,
      isRestDay: !isWorkDay,
      status: "scheduled",
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return sessions;
}

// TODO create a schema for the remote function below
export const createPlan = form("unchecked", async (data) => {
  const { locals } = getRequestEvent();
  if (!locals.user) redirect(307, "/auth");

  const focusDuration = Number(data.focusDuration);
  const daysPerWeek = Number(data.daysPerWeek);
  const workDays: number[] = JSON.parse(data.workDays as string);

  const planId = crypto.randomUUID();

  // Create the plan
  await db.insert(table.userPlan).values({
    id: planId,
    userId: locals.user.id,
    focusDuration,
    daysPerWeek,
    workDaysSchedule: workDays,
    currentProgressionWeek: 1,
    isActive: true,
  });

  // Generate sessions for the next 4 weeks
  const sessions = generateSessions(
    locals.user.id,
    planId,
    focusDuration,
    workDays,
    4,
  );

  if (sessions.length > 0) {
    await db.insert(table.workSession).values(sessions);
  }

  redirect(303, "/");
});
