<script lang="ts">
  import { createPlan } from "./onboarding.remote";

  let step = $state(1);

  let focusDuration = $state<number | null>(null);
  let daysPerWeek = $state(4);
  let workDays = $state<number[]>([1, 2, 3, 4]); // Mon-Thu default

  const durations = [
    { value: 15, label: "15 min", description: "Just starting out" },
    { value: 25, label: "25 min", description: "Pomodoro-style" },
    { value: 45, label: "45 min", description: "Building momentum" },
    { value: 60, label: "60 min", description: "Deep work" },
    { value: 90, label: "90 min", description: "Full focus" },
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function toggleDay(day: number) {
    if (workDays.includes(day)) {
      workDays = workDays.filter((d) => d !== day);
    } else {
      workDays = [...workDays, day].sort();
    }
    daysPerWeek = workDays.length;
  }

  function nextStep() {
    if (step < 3) step++;
  }

  function prevStep() {
    if (step > 1) step--;
  }
</script>

<svelte:head>
  <title>Onboarding - Cognitive Gym</title>
</svelte:head>

<div class="page">
  <main class="container">
    <header class="onboarding-header">
      <h1>Set Up Your Training Plan</h1>
      <div class="steps">
        <span class:active={step >= 1}>1</span>
        <span class="line"></span>
        <span class:active={step >= 2}>2</span>
        <span class="line"></span>
        <span class:active={step >= 3}>3</span>
      </div>
    </header>

    {#if step === 1}
      <section>
        <h2>What's your current focus capacity?</h2>
        <p>Choose the duration that feels achievable for you right now.</p>

        <div class="duration-grid">
          {#each durations as { value, label, description }}
            <button
              type="button"
              class="duration-option"
              class:selected={focusDuration === value}
              onclick={() => (focusDuration = value)}
            >
              <strong>{label}</strong>
              <span>{description}</span>
            </button>
          {/each}
        </div>

        <div class="nav-buttons">
          <span></span>
          <button onclick={nextStep} disabled={!focusDuration}>
            Next
          </button>
        </div>
      </section>
    {:else if step === 2}
      <section>
        <h2>Which days will you train?</h2>
        <p>Select the days you want to have focus sessions. Rest days are just as important as work days.</p>

        <div class="days-grid">
          {#each dayNames as name, i}
            <button
              type="button"
              class="day-option"
              class:selected={workDays.includes(i)}
              onclick={() => toggleDay(i)}
            >
              {name}
            </button>
          {/each}
        </div>

        <p class="muted">
          {daysPerWeek} days per week selected
        </p>

        <div class="nav-buttons">
          <button class="outline" onclick={prevStep}>Back</button>
          <button onclick={nextStep} disabled={workDays.length < 3}>
            Next
          </button>
        </div>
      </section>
    {:else}
      <section>
        <h2>Review Your Plan</h2>

        <article class="plan-summary">
          <h3>Your Training Plan</h3>
          <dl>
            <dt>Focus Duration</dt>
            <dd>{focusDuration} minutes</dd>

            <dt>Training Days</dt>
            <dd>{workDays.map((d) => dayNames[d]).join(", ")}</dd>

            <dt>Days Per Week</dt>
            <dd>{daysPerWeek} days</dd>
          </dl>
        </article>

        <p>
          You can adjust your plan anytime from the settings page.
        </p>

        <form {...createPlan}>
          <input type="hidden" name="focusDuration" value={focusDuration} />
          <input type="hidden" name="daysPerWeek" value={daysPerWeek} />
          {#each workDays as day}
            <input type="hidden" name="workDays" value={day} />
          {/each}

          <div class="nav-buttons">
            <button type="button" class="outline" onclick={prevStep}>
              Back
            </button>
            <button type="submit">Start Training</button>
          </div>
        </form>
      </section>
    {/if}
  </main>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }

  .container {
    max-width: 600px;
  }

  .onboarding-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .steps span:not(.line) {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--pico-muted-border-color);
    color: var(--pico-muted-color);
    font-weight: bold;
  }

  .steps span.active {
    background: var(--pico-primary);
    color: var(--pico-primary-inverse);
  }

  .steps .line {
    width: 2rem;
    height: 2px;
    background: var(--pico-muted-border-color);
  }

  .duration-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }

  .duration-option {
    padding: 1.5rem;
    border: 2px solid var(--pico-muted-border-color);
    border-radius: 0.5rem;
    background: var(--pico-card-background-color);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }

  .duration-option:hover {
    border-color: var(--pico-primary);
  }

  .duration-option.selected {
    border-color: var(--pico-primary);
    background: var(--pico-primary-focus);
  }

  .duration-option span {
    font-size: 0.875rem;
    color: var(--pico-muted-color);
  }

  .days-grid {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin: 2rem 0;
  }

  .day-option {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    border: 2px solid var(--pico-muted-border-color);
    background: var(--pico-card-background-color);
    cursor: pointer;
    font-weight: bold;
  }

  .day-option:hover {
    border-color: var(--pico-primary);
  }

  .day-option.selected {
    background: var(--pico-primary);
    border-color: var(--pico-primary);
    color: var(--pico-primary-inverse);
  }

  .nav-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
  }

  .muted {
    text-align: center;
    color: var(--pico-muted-color);
  }

  .plan-summary {
    margin: 2rem 0;
  }

  .plan-summary dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 1rem;
  }

  .plan-summary dt {
    font-weight: bold;
    color: var(--pico-muted-color);
  }

  .plan-summary dd {
    margin: 0;
  }

  form {
    margin: 0;
  }
</style>
