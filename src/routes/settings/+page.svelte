<script lang="ts">
  import { signOut } from "../auth/auth.remote";
  import {
    getCurrentPlan,
    getProgressionStatus,
    updatePlan,
    triggerProgression,
    deleteAccount,
  } from "./settings.remote";
  import Modal from "$lib/components/Modal.svelte";

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const durations = [15, 25, 45, 60, 90];

  let showDeleteModal = $state(false);
  let showProgressionModal = $state(false);

  // Edit form state
  let editMode = $state(false);
  let editDuration = $state(25);
  let editDaysPerWeek = $state(4);
  let editWorkDays = $state<number[]>([1, 2, 3, 4]);

  function startEdit(plan: {
    focusDuration: number;
    daysPerWeek: number;
    workDaysSchedule: number[];
  }) {
    editDuration = plan.focusDuration;
    editDaysPerWeek = plan.daysPerWeek;
    editWorkDays = [...plan.workDaysSchedule];
    editMode = true;
  }

  function cancelEdit() {
    editMode = false;
  }

  function toggleDay(day: number) {
    if (editWorkDays.includes(day)) {
      editWorkDays = editWorkDays.filter((d) => d !== day);
    } else {
      editWorkDays = [...editWorkDays, day].sort();
    }
    editDaysPerWeek = editWorkDays.length;
  }

  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
</script>

<svelte:head>
  <title>Settings - Cognitive Gym</title>
</svelte:head>

<div class="page">
  <header class="container">
    <nav>
      <ul>
        <li><a href="/"><strong>Cognitive Gym</strong></a></li>
      </ul>
      <ul>
        <li><a href="/">Dashboard</a></li>
        <li><a href="/history">History</a></li>
        <li><strong>Settings</strong></li>
      </ul>
    </nav>
  </header>

  <main class="container">
    <h1>Settings</h1>

    <svelte:boundary>
      {#snippet pending()}
        <p aria-busy="true">Loading settings...</p>
      {/snippet}

      {#await getCurrentPlan() then plan}
        {#if plan}
          <section>
            <h2>Current Plan</h2>

            {#if !editMode}
              <article>
                <dl>
                  <dt>Focus Duration</dt>
                  <dd>{formatDuration(plan.focusDuration)}</dd>

                  <dt>Days Per Week</dt>
                  <dd>{plan.daysPerWeek} days</dd>

                  <dt>Training Days</dt>
                  <dd>{plan.workDaysSchedule.map((d) => dayNames[d]).join(", ")}</dd>

                  <dt>Current Week</dt>
                  <dd>Week {plan.currentProgressionWeek}</dd>
                </dl>
                <button class="outline" onclick={() => startEdit(plan)}>
                  Edit Plan
                </button>
              </article>
            {:else}
              <article>
                <form {...updatePlan}>
                  <label>
                    Focus Duration
                    <select name="focusDuration" bind:value={editDuration}>
                      {#each durations as d}
                        <option value={d}>{formatDuration(d)}</option>
                      {/each}
                    </select>
                  </label>

                  <fieldset>
                    <legend>Training Days</legend>
                    <div class="days-grid">
                      {#each dayNames as name, i}
                        <button
                          type="button"
                          class="day-option"
                          class:selected={editWorkDays.includes(i)}
                          onclick={() => toggleDay(i)}
                        >
                          {name}
                        </button>
                      {/each}
                    </div>
                  </fieldset>

                  <input type="hidden" name="daysPerWeek" value={editDaysPerWeek} />
                  {#each editWorkDays as day}
                    <input type="hidden" name="workDays" value={day} />
                  {/each}

                  <div class="button-group">
                    <button type="button" class="outline" onclick={cancelEdit}>
                      Cancel
                    </button>
                    <button type="submit">Save Changes</button>
                  </div>
                </form>
              </article>
            {/if}
          </section>

          {#await getProgressionStatus() then progression}
            {#if progression?.isEligible}
              <section>
                <h2>Ready to Level Up?</h2>
                <article class="progression-card">
                  <p>
                    You've been training at your current level for {progression.weeksAtLevel} weeks.
                    Consider progressing to challenge yourself!
                  </p>

                  <div class="progression-comparison">
                    <div>
                      <strong>Current</strong>
                      <p>
                        {formatDuration(progression.currentPlan.focusDuration)},
                        {progression.currentPlan.daysPerWeek} days/week
                      </p>
                    </div>
                    <span class="arrow">→</span>
                    <div>
                      <strong>Suggested</strong>
                      <p>
                        {formatDuration(progression.suggestion.duration)},
                        {progression.suggestion.frequency} days/week
                      </p>
                    </div>
                  </div>

                  <button onclick={() => (showProgressionModal = true)}>
                    Level Up
                  </button>
                </article>
              </section>

              <Modal open={showProgressionModal} onclose={() => (showProgressionModal = false)}>
                <h2>Confirm Progression</h2>
                <p>You're about to update your training plan to:</p>
                <ul>
                  <li>{formatDuration(progression.suggestion.duration)} sessions</li>
                  <li>{progression.suggestion.frequency} days per week</li>
                </ul>

                <form {...triggerProgression}>
                  <input
                    type="hidden"
                    name="newDuration"
                    value={progression.suggestion.duration}
                  />
                  <input
                    type="hidden"
                    name="newFrequency"
                    value={progression.suggestion.frequency}
                  />
                  <div class="button-group">
                    <button
                      type="button"
                      class="outline"
                      onclick={() => (showProgressionModal = false)}
                    >
                      Cancel
                    </button>
                    <button type="submit">Confirm</button>
                  </div>
                </form>
              </Modal>
            {/if}
          {/await}
        {:else}
          <section>
            <p>No active plan found.</p>
            <a href="/onboarding" role="button">Create a Plan</a>
          </section>
        {/if}
      {/await}

      <section>
        <h2>Account</h2>
        <article>
          <form {...signOut}>
            <button type="submit" class="outline">Sign Out</button>
          </form>

          <hr />

          <details>
            <summary>Danger Zone</summary>
            <p>
              Deleting your account will permanently remove all your data,
              including your training history and progress.
            </p>
            <button class="secondary" onclick={() => (showDeleteModal = true)}>
              Delete Account
            </button>
          </details>
        </article>
      </section>
    </svelte:boundary>
  </main>

  <Modal open={showDeleteModal} onclose={() => (showDeleteModal = false)}>
    <h2>Delete Account?</h2>
    <p>
      This action cannot be undone. All your data will be permanently deleted.
    </p>
    <form {...deleteAccount}>
      <div class="button-group">
        <button
          type="button"
          class="outline"
          onclick={() => (showDeleteModal = false)}
        >
          Cancel
        </button>
        <button type="submit" class="secondary">Delete Account</button>
      </div>
    </form>
  </Modal>
</div>

<style>
  .page {
    min-height: 100vh;
  }

  section {
    margin-bottom: 2rem;
  }

  article {
    margin: 0;
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 1rem;
    margin-bottom: 1rem;
  }

  dt {
    font-weight: bold;
    color: var(--pico-muted-color);
  }

  dd {
    margin: 0;
  }

  .days-grid {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin: 0.5rem 0;
  }

  .day-option {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    border: 2px solid var(--pico-muted-border-color);
    background: var(--pico-card-background-color);
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: bold;
    padding: 0;
    margin: 0;
  }

  .day-option:hover {
    border-color: var(--pico-primary);
  }

  .day-option.selected {
    background: var(--pico-primary);
    border-color: var(--pico-primary);
    color: var(--pico-primary-inverse);
  }

  .button-group {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
  }

  .button-group button {
    margin: 0;
  }

  .progression-card {
    text-align: center;
  }

  .progression-comparison {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    margin: 1.5rem 0;
  }

  .arrow {
    font-size: 1.5rem;
    color: var(--pico-primary);
  }

  details summary {
    cursor: pointer;
    color: var(--pico-color-red-500, #ef4444);
  }

  hr {
    margin: 1rem 0;
  }

  form {
    margin: 0;
  }
</style>
