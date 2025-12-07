<script lang="ts">
  import { goto } from "$app/navigation";
  import Timer from "$lib/components/Timer.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { getCurrentSession } from "./session.remote";

  let isRunning = $state(false);
  let isPaused = $state(false);
  let remainingSeconds = $state(0);
  let elapsedSeconds = $state(0);
  let showEndModal = $state(false);
  let sessionData = $state<{
    id: string | null;
    planId: string;
    plannedDuration: number;
  } | null>(null);

  let intervalId: ReturnType<typeof setInterval> | null = null;

  async function initSession() {
    const session = await getCurrentSession();
    sessionData = {
      id: session.id ?? null,
      planId: session.planId,
      plannedDuration: session.plannedDuration,
    };
    remainingSeconds = session.plannedDuration * 60;
  }

  function start() {
    isRunning = true;
    isPaused = false;
    intervalId = setInterval(() => {
      if (!isPaused) {
        remainingSeconds--;
        elapsedSeconds++;

        if (remainingSeconds <= 0) {
          complete();
        }
      }
    }, 1000);
  }

  function pause() {
    isPaused = !isPaused;
  }

  function endEarly() {
    showEndModal = true;
  }

  function confirmEnd() {
    showEndModal = false;
    complete();
  }

  function cancelEnd() {
    showEndModal = false;
  }

  function complete() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isRunning = false;

    // Navigate to completion page with session data
    const params = new URLSearchParams({
      sessionId: sessionData?.id || "",
      planId: sessionData?.planId || "",
      duration: Math.ceil(elapsedSeconds / 60).toString(),
    });
    goto(`/session/complete?${params}`);
  }

  function formatMinutes(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  // Initialize on mount
  initSession();
</script>

<svelte:head>
  <title>Focus Session - Cognitive Gym</title>
</svelte:head>

<div class="session-page">
  <main>
    {#if !sessionData}
      <p aria-busy="true">Loading session...</p>
    {:else if !isRunning}
      <div class="pre-session">
        <h1>Ready to Focus?</h1>
        <p>{formatMinutes(sessionData.plannedDuration)} session</p>

        <Timer seconds={remainingSeconds} />

        <button class="start-button" onclick={start}>
          Start Session
        </button>

        <a href="/" class="secondary">Back to Dashboard</a>
      </div>
    {:else}
      <div class="active-session">
        <Timer seconds={remainingSeconds} />

        <div class="controls">
          <button class="outline" onclick={pause}>
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button class="secondary outline" onclick={endEarly}>
            End Early
          </button>
        </div>

        <p class="elapsed">
          {Math.floor(elapsedSeconds / 60)} min elapsed
        </p>
      </div>
    {/if}
  </main>

  <Modal open={showEndModal} onclose={cancelEnd}>
    <h2>End Session Early?</h2>
    <p>
      You've been focusing for {Math.floor(elapsedSeconds / 60)} minutes.
      Are you sure you want to end now?
    </p>
    <div class="modal-buttons">
      <button class="outline" onclick={cancelEnd}>Keep Going</button>
      <button onclick={confirmEnd}>End Session</button>
    </div>
  </Modal>
</div>

<style>
  .session-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  main {
    text-align: center;
    width: 100%;
    max-width: 500px;
  }

  .pre-session,
  .active-session {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  h1 {
    margin: 0;
  }

  .start-button {
    font-size: 1.5rem;
    padding: 1rem 3rem;
  }

  .controls {
    display: flex;
    gap: 1rem;
  }

  .controls button {
    min-width: 120px;
  }

  .elapsed {
    color: var(--pico-muted-color);
  }

  .modal-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  a.secondary {
    color: var(--pico-muted-color);
  }
</style>
