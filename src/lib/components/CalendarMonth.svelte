<script lang="ts">
  import type { WorkSession } from "$lib/server/db/schema";

  interface Props {
    year: number;
    month: number;
    sessions: WorkSession[];
    onselect?: (session: WorkSession | null, date: string) => void;
  }

  let { year, month, sessions, onselect }: Props = $props();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const sessionsByDate = $derived(() => {
    const map = new Map<string, WorkSession>();
    for (const session of sessions) {
      map.set(session.scheduledDate, session);
    }
    return map;
  });

  const calendarDays = $derived(() => {
    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDayOfWeek = firstDay.getDay();

    // Fill in days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, -i);
      days.push({
        date: d.toISOString().split("T")[0],
        day: d.getDate(),
        isCurrentMonth: false,
      });
    }

    // Fill in days of current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month - 1, d);
      days.push({
        date: date.toISOString().split("T")[0],
        day: d,
        isCurrentMonth: true,
      });
    }

    // Fill in remaining days to complete the grid
    const remaining = 42 - days.length; // 6 rows * 7 days
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month, d);
      days.push({
        date: date.toISOString().split("T")[0],
        day: d,
        isCurrentMonth: false,
      });
    }

    return days;
  });

  function getStatus(date: string): string | null {
    const session = sessionsByDate().get(date);
    return session?.status ?? null;
  }

  function handleClick(date: string) {
    const session = sessionsByDate().get(date) ?? null;
    onselect?.(session, date);
  }

  function isToday(date: string): boolean {
    return date === new Date().toISOString().split("T")[0];
  }
</script>

<div class="calendar">
  <div class="calendar-header">
    <h3>{monthNames[month - 1]} {year}</h3>
  </div>

  <div class="calendar-grid">
    {#each dayNames as name}
      <div class="day-header">{name}</div>
    {/each}

    {#each calendarDays() as { date, day, isCurrentMonth }}
      {@const status = getStatus(date)}
      <button
        type="button"
        class="day-cell"
        class:other-month={!isCurrentMonth}
        class:today={isToday(date)}
        data-status={status}
        onclick={() => handleClick(date)}
        disabled={!status}
      >
        <span class="day-number">{day}</span>
        {#if status}
          <span class="status-dot"></span>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .calendar {
    background: var(--pico-card-background-color);
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .calendar-header {
    text-align: center;
    margin-bottom: 1rem;
  }

  .calendar-header h3 {
    margin: 0;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .day-header {
    text-align: center;
    font-size: 0.75rem;
    font-weight: bold;
    color: var(--pico-muted-color);
    padding: 0.5rem;
  }

  .day-cell {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 0.25rem;
    border: none;
    border-radius: 0.25rem;
    background: transparent;
    cursor: pointer;
    position: relative;
  }

  .day-cell:disabled {
    cursor: default;
  }

  .day-cell.other-month {
    opacity: 0.3;
  }

  .day-cell.today {
    outline: 2px solid var(--pico-primary);
  }

  .day-cell:not(:disabled):hover {
    background: var(--pico-primary-focus);
  }

  .day-number {
    font-size: 0.875rem;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .day-cell[data-status="completed"] .status-dot {
    background: var(--pico-color-green-500, #22c55e);
  }

  .day-cell[data-status="scheduled"] .status-dot {
    background: var(--pico-color-blue-500, #3b82f6);
  }

  .day-cell[data-status="missed"] .status-dot {
    background: var(--pico-color-red-500, #ef4444);
  }

  .day-cell[data-status="skipped"] .status-dot {
    background: var(--pico-color-yellow-500, #eab308);
  }
</style>
