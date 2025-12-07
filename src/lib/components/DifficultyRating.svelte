<script lang="ts">
  import type { DifficultyRating } from "$lib/server/db/schema";

  interface Props {
    name: string;
    value: DifficultyRating | null;
    onchange?: (value: DifficultyRating) => void;
  }

  let { name, value = $bindable(), onchange }: Props = $props();

  const options: { value: DifficultyRating; label: string; emoji: string }[] = [
    { value: "easy", label: "Easy", emoji: "😌" },
    { value: "just_right", label: "Just Right", emoji: "👍" },
    { value: "challenging", label: "Challenging", emoji: "💪" },
  ];

  function select(rating: DifficultyRating) {
    value = rating;
    onchange?.(rating);
  }
</script>

<div class="difficulty-rating" role="radiogroup" aria-label="Difficulty rating">
  {#each options as option}
    <button
      type="button"
      class="rating-option"
      class:selected={value === option.value}
      onclick={() => select(option.value)}
      role="radio"
      aria-checked={value === option.value}
    >
      <span class="emoji">{option.emoji}</span>
      <span class="label">{option.label}</span>
    </button>
  {/each}
  <input type="hidden" {name} value={value ?? ""} />
</div>

<style>
  .difficulty-rating {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .rating-option {
    flex: 1;
    max-width: 150px;
    padding: 1.5rem 1rem;
    border: 2px solid var(--pico-muted-border-color);
    border-radius: 0.5rem;
    background: var(--pico-card-background-color);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.15s ease;
  }

  .rating-option:hover {
    border-color: var(--pico-primary);
  }

  .rating-option.selected {
    border-color: var(--pico-primary);
    background: var(--pico-primary-focus);
  }

  .emoji {
    font-size: 2rem;
  }

  .label {
    font-size: 0.875rem;
    font-weight: 500;
  }
</style>
