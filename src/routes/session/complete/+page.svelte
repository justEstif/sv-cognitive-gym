<script lang="ts">
  import { page } from "$app/state";
  import DifficultyRating from "$lib/components/DifficultyRating.svelte";
  import { completeSession } from "../session.remote";
  import type { DifficultyRating as DifficultyRatingType } from "$lib/server/db/schema";

  const sessionId = $derived(page.url.searchParams.get("sessionId") || "");
  const planId = $derived(page.url.searchParams.get("planId") || "");
  const duration = $derived(parseInt(page.url.searchParams.get("duration") || "0", 10));

  let rating = $state<DifficultyRatingType | null>(null);
  let notes = $state("");
</script>

<svelte:head>
  <title>Session Complete - Cognitive Gym</title>
</svelte:head>

<div class="complete-page">
  <main class="container">
    <div class="celebration">
      <span class="emoji">🎉</span>
      <h1>Great Work!</h1>
      <p class="duration">You focused for {duration} minutes</p>
    </div>

    <form {...completeSession} class="feedback-form">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="planId" value={planId} />
      <input type="hidden" name="actualDuration" value={duration} />

      <section>
        <h2>How did it feel?</h2>
        <DifficultyRating name="difficultyRating" bind:value={rating} />
      </section>

      <section>
        <h2>Any reflections?</h2>
        <textarea
          name="notes"
          bind:value={notes}
          placeholder="Optional: What went well? What was challenging?"
          rows="3"
        ></textarea>
      </section>

      <button type="submit" disabled={!rating}>
        Done
      </button>

      <a href="/" class="skip">Skip feedback</a>
    </form>
  </main>
</div>

<style>
  .complete-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .container {
    max-width: 500px;
    width: 100%;
  }

  .celebration {
    text-align: center;
    margin-bottom: 3rem;
  }

  .celebration .emoji {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }

  .celebration h1 {
    margin: 0;
  }

  .duration {
    font-size: 1.25rem;
    color: var(--pico-muted-color);
  }

  .feedback-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .feedback-form section h2 {
    text-align: center;
    font-size: 1rem;
    margin-bottom: 1rem;
    color: var(--pico-muted-color);
  }

  textarea {
    resize: vertical;
  }

  button[type="submit"] {
    width: 100%;
    font-size: 1.25rem;
    padding: 1rem;
  }

  .skip {
    display: block;
    text-align: center;
    color: var(--pico-muted-color);
    font-size: 0.875rem;
  }
</style>
