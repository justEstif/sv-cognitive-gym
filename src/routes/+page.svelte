<script lang="ts">
  import type { PageProps } from "./$types";
  import { signOut } from "./auth/auth.remote";
  import {
    getActivePlan,
    getTodaySession,
    getWeekSessions,
    getUserStats,
    needsOnboarding,
  } from "./dashboard.remote";
  import WeekView from "$lib/components/WeekView.svelte";
  import StatsCard from "$lib/components/StatsCard.svelte";
  import { goto } from "$app/navigation";

  let { data }: PageProps = $props();

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  function isWorkDay(workDays: number[]): boolean {
    const today = new Date().getDay();
    return workDays.includes(today);
  }
</script>

<svelte:head>
  <title>Dashboard - Cognitive Gym</title>
</svelte:head>

<div class="page">
  <header class="container">
    <nav>
      <ul>
        <li><strong>Cognitive Gym</strong></li>
      </ul>

      <ul>
        {#if data?.user?.username}
          <li>
            <a href="/history">History</a>
          </li>
          <li>
            <a href="/settings">Settings</a>
          </li>
          <li>
            {data.user.username}
          </li>
          <li>
            <form {...signOut}>
              <button type="submit" class="outline">Sign out</button>
            </form>
          </li>
        {:else}
          <li><a href="/auth">Login</a></li>
        {/if}
      </ul>
    </nav>
  </header>

  <main class="container">
    {#if !data.user}
      <section>
        <h1>Welcome to Cognitive Gym</h1>
        <p>
          A web application that helps knowledge workers and students rebuild
          and strengthen their ability to focus deeply through progressive
          training.
        </p>
        <p>Get started today <a href="/auth">Login</a></p>
      </section>
    {:else}
      <svelte:boundary>
        {#snippet pending()}
          <p aria-busy="true">Loading dashboard...</p>
        {/snippet}

        {#snippet failed(error)}
          <p>Error loading dashboard: {error instanceof Error ? error.message : "Unknown error"}</p>
        {/snippet}

        {#await needsOnboarding() then needs}
          {#if needs}
            <section>
              <h1>Welcome to Cognitive Gym!</h1>
              <p>Let's set up your first training plan.</p>
              <a href="/onboarding" role="button">Start Onboarding</a>
            </section>
          {:else}
            {#await Promise.all([getActivePlan(), getTodaySession(), getWeekSessions(), getUserStats()]) then [plan, todaySession, weekSessions, stats]}
              {#if plan}
                <section class="today-section">
                  <h1>
                    {#if todaySession}
                      {#if todaySession.status === "completed"}
                        Great work today!
                      {:else if todaySession.isRestDay}
                        Rest Day
                      {:else}
                        Today's Focus Session
                      {/if}
                    {:else if isWorkDay(plan.workDaysSchedule)}
                      Ready to Focus
                    {:else}
                      Rest Day
                    {/if}
                  </h1>

                  {#if todaySession}
                    {#if todaySession.status === "completed"}
                      <p>
                        You completed a {todaySession.actualDuration ?? todaySession.plannedDuration} minute
                        focus session.
                      </p>
                    {:else if todaySession.status === "scheduled"}
                      <p>
                        {formatDuration(todaySession.plannedDuration)} session scheduled
                        for {dayNames[new Date().getDay()]}
                      </p>
                      <a href="/session" role="button" class="start-button">
                        Start Session
                      </a>
                    {:else}
                      <p>Session status: {todaySession.status}</p>
                    {/if}
                  {:else if isWorkDay(plan.workDaysSchedule)}
                    <p>{formatDuration(plan.focusDuration)} session ready</p>
                    <a href="/session" role="button" class="start-button">
                      Start Session
                    </a>
                  {:else}
                    <p>Take it easy. Recovery is part of training.</p>
                    <a href="/session" role="button" class="outline">
                      Optional Session
                    </a>
                  {/if}
                </section>

                <section>
                  <h2>This Week</h2>
                  <WeekView sessions={weekSessions} workDays={plan.workDaysSchedule} />
                  <div class="legend">
                    <span><span class="dot completed"></span> Completed</span>
                    <span><span class="dot scheduled"></span> Scheduled</span>
                    <span><span class="dot missed"></span> Missed</span>
                    <span><span class="dot rest"></span> Rest</span>
                  </div>
                </section>

                <section>
                  <h2>Your Stats</h2>
                  <div class="stats-grid">
                    <StatsCard label="Current Streak" value={stats.streak} unit="days" />
                    <StatsCard
                      label="This Week"
                      value={stats.sessionsThisWeek}
                      unit="sessions"
                    />
                    <StatsCard
                      label="Weekly Focus"
                      value={stats.totalFocusMinutes}
                      unit="min"
                    />
                    <StatsCard
                      label="All Time"
                      value={stats.totalFocusHours}
                      unit="hours"
                    />
                  </div>
                </section>

                <section>
                  <h2>Current Plan</h2>
                  <p>
                    {formatDuration(plan.focusDuration)} sessions, {plan.daysPerWeek} days
                    per week
                  </p>
                  <p class="muted">
                    Week {plan.currentProgressionWeek} of your training
                  </p>
                </section>
              {/if}
            {/await}
          {/if}
        {/await}
      </svelte:boundary>
    {/if}
  </main>

  <footer class="container">
    <p>Copyright &copy; {new Date().getFullYear()} Cognitive Gym</p>
  </footer>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
  }

  .today-section {
    text-align: center;
    padding: 2rem 0;
  }

  .start-button {
    font-size: 1.25rem;
    padding: 1rem 2rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .legend {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 0.875rem;
    color: var(--pico-muted-color);
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

  .dot.rest {
    background: var(--pico-muted-border-color);
  }

  .muted {
    color: var(--pico-muted-color);
    font-size: 0.875rem;
  }

  nav form {
    margin: 0;
  }

  nav form button {
    margin: 0;
    padding: 0.25rem 0.75rem;
  }
</style>
