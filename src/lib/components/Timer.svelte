<script lang="ts">
  interface Props {
    seconds: number;
  }

  let { seconds }: Props = $props();

  const minutes = $derived(Math.floor(seconds / 60));
  const secs = $derived(seconds % 60);

  const display = $derived(
    `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  );
</script>

<div class="timer">
  <span class="display">{display}</span>
</div>

<style>
  .timer {
    text-align: center;
  }

  .display {
    font-size: 6rem;
    font-weight: bold;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.05em;
  }

  @media (max-width: 600px) {
    .display {
      font-size: 4rem;
    }
  }
</style>
