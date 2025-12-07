<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    open: boolean;
    onclose?: () => void;
    children: Snippet;
  }

  let { open, onclose, children }: Props = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && open) {
      onclose?.();
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onclose?.();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div class="backdrop" onclick={handleBackdropClick} role="presentation">
    <dialog {open}>
      {@render children()}
    </dialog>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  dialog {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    margin: 0;
    padding: 2rem;
    border: none;
    border-radius: 0.5rem;
    background: var(--pico-card-background-color);
  }
</style>
