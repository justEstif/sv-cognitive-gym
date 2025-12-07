<script lang="ts">
  import CalendarMonth from "$lib/components/CalendarMonth.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import StatsCard from "$lib/components/StatsCard.svelte";
  import type { WorkSession } from "$lib/server/db/schema";
  import { getHistoryStats, getSessionsByMonth } from "./history.remote";

  const now = new Date();
  let year = $state(now.getFullYear());
  let month = $state(now.getMonth() + 1);

  let selectedSession = $state<WorkSession | null>(null);
  let showModal = $state(false);

  const yearMonth = $derived(`${year}-${month.toString().padStart(2, "0")}`);

  function prevMonth() {
    if (month === 1) {
      month = 12;
      year--;
    } else {
      month--;
    }
  }

  function nextMonth() {
    if (month === 12) {
      month = 1;
      year++;
    } else {
      month++;
    }
  }

  function handleSelect(session: WorkSession | null, date: string) {
    if (session) {
      selectedSession = session;
      showModal = true;
    }
  }

  function closeModal() {
    showModal = false;
    selectedSession = null;
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatRating(rating: string | null): string {
    if (!rating) return "Not rated";
    return rating.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
</script>

<svelte:head>
  <title>History - Cognitive Gym</title>
</svelte:head>

<div class="page">
  <header class="container">
    <nav>
      <ul>
        <li><a href="/"><strong>Cognitive Gym</strong></a></li>
      </ul>
      <ul>
        <li><a href="/">Dashboard</a></li>
        <li><strong>History</strong></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </nav>
  </header>

  <main class="container">
    <h1>Session History</h1>

    <svelte:boundary>
      {#snippet pending()}
        <p aria-busy="true">Loading history...</p>
      {/snippet}

      {#await getHistoryStats() then stats}
        <section class="stats">
          <div class="stats-grid">
            <StatsCard label="Total Sessions" value={stats.totalSessions} />
            <StatsCard
              label="Total Focus Time"
              value={stats.totalHours}
              unit="hours"
            />
            <StatsCard
              label="Longest Streak"
              value={stats.longestStreak}
              unit="days"
            />
          </div>
        </section>
      {/await}

      <section class="calendar-section">
        <div class="month-nav">
          <button class="outline" onclick={prevMonth}>← Previous</button>
          <button class="outline" onclick={nextMonth}>Next →</button>
        </div>

        {#await getSessionsByMonth(yearMonth) then sessions}
          <CalendarMonth {year} {month} {sessions} onselect={handleSelect} />
        {/await}

        <div class="legend">
          <span><span class="dot completed"></span> Completed</span>
          <span><span class="dot scheduled"></span> Scheduled</span>
          <span><span class="dot missed"></span> Missed</span>
        </div>
      </section>
    </svelte:boundary>
  </main>

  <Modal open={showModal} onclose={closeModal}>
    {#if selectedSession}
      <h2>Session Details</h2>
      <dl class="session-details">
        <dt>Date</dt>
        <dd>{formatDate(selectedSession.scheduledDate)}</dd>

        <dt>Status</dt>
        <dd class="status" data-status={selectedSession.status}>
          {selectedSession.status}
        </dd>

        <dt>Duration</dt>
        <dd>
          {#if selectedSession.actualDuration}
            {selectedSession.actualDuration} min (planned: {selectedSession.plannedDuration}
            min)
          {:else}
            {selectedSession.plannedDuration} min planned
          {/if}
        </dd>

        {#if selectedSession.difficultyRating}
          <dt>Difficulty</dt>
          <dd>{formatRating(selectedSession.difficultyRating)}</dd>
        {/if}

        {#if selectedSession.notes}
          <dt>Notes</dt>
          <dd>{selectedSession.notes}</dd>
        {/if}
      </dl>

      <button onclick={closeModal}>Close</button>
    {/if}
  </Modal>
</div>

<style>
  .page {
    min-height: 100vh;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .calendar-section {
    max-width: 600px;
    margin: 0 auto;
  }

  .month-nav {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .month-nav button {
    margin: 0;
  }

  .legend {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 0.875rem;
    color: var(--pico-muted-color);
    margin-top: 1rem;
  }

  .legend span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    display: inline-block;
  }

  .dot.completed {
    background: var(--pico-color-green-500, #22c55e);
  }

  .dot.scheduled {
    background: var(--pico-color-blue-500, #3b82f6);
  }

  .dot.missed {
    background: var(--pico-color-red-500, #ef4444);
  }

  .session-details {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 1rem;
    margin-bottom: 1.5rem;
  }

  .session-details dt {
    font-weight: bold;
    color: var(--pico-muted-color);
  }

  .session-details dd {
    margin: 0;
  }

  .status {
    text-transform: capitalize;
  }

  .status[data-status="completed"] {
    color: var(--pico-color-green-500, #22c55e);
  }

  .status[data-status="missed"] {
    color: var(--pico-color-red-500, #ef4444);
  }
</style>
