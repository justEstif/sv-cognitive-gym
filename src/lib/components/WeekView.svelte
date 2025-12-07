<script lang="ts">
  import type { WorkSession } from "$lib/server/db/schema";

  interface Props {
    sessions: WorkSession[];
    workDays: number[];
  }

  let { sessions, workDays }: Props = $props();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const weekDates = $derived(() => {
    const dates: { date: string; dayOfWeek: number; dayName: string }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push({
        date: d.toISOString().split("T")[0],
        dayOfWeek: d.getDay(),
        dayName: dayNames[d.getDay()],
      });
    }

    return dates;
  });

  const sessionsByDate = $derived(() => {
    const map = new Map<string, WorkSession>();
    for (const session of sessions) {
      map.set(session.scheduledDate, session);
    }
    return map;
  });

  function getStatus(
    date: string,
    dayOfWeek: number
  ): "completed" | "scheduled" | "missed" | "rest" | "skipped" {
    const session = sessionsByDate().get(date);

    if (session) {
      return session.status as "completed" | "scheduled" | "missed" | "skipped";
    }

    // No session - check if it's a rest day
    if (!workDays.includes(dayOfWeek)) {
      return "rest";
    }

    return "scheduled";
  }

  function isToday(date: string): boolean {
    return date === new Date().toISOString().split("T")[0];
  }
</script>

<div class="week-view">
  {#each weekDates() as { date, dayOfWeek, dayName }}
    {@const status = getStatus(date, dayOfWeek)}
    <div class="day" class:today={isToday(date)} data-status={status}>
      <span class="day-name">{dayName}</span>
      <div class="indicator" aria-label={status}></div>
    </div>
  {/each}
</div>

<style>
  .week-view {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 1rem 0;
  }

  .day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    padding: 0.5rem;
    border-radius: 0.5rem;
    background: var(--pico-card-background-color);
  }

  .day.today {
    outline: 2px solid var(--pico-primary);
  }

  .day-name {
    font-size: 0.75rem;
    color: var(--pico-muted-color);
    text-transform: uppercase;
  }

  .indicator {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
  }

  .day[data-status="completed"] .indicator {
    background: var(--pico-color-green-500, #22c55e);
  }

  .day[data-status="scheduled"] .indicator {
    background: var(--pico-color-blue-500, #3b82f6);
  }

  .day[data-status="missed"] .indicator {
    background: var(--pico-color-red-500, #ef4444);
  }

  .day[data-status="rest"] .indicator {
    background: var(--pico-muted-border-color);
  }

  .day[data-status="skipped"] .indicator {
    background: var(--pico-color-yellow-500, #eab308);
  }
</style>
