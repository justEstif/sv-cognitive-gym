<script lang="ts">
  interface Props {
    label: string;
    value: string | number;
    unit?: string;
  }

  let { label, value, unit }: Props = $props();
</script>

<article class="stats-card">
  <div class="value">
    {value}
    {#if unit}
      <span class="unit">{unit}</span>
    {/if}
  </div>
  <div class="label">{label}</div>
</article>

<style>
  .stats-card {
    text-align: center;
    padding: 1rem;
    margin: 0;
  }

  .value {
    font-size: 2rem;
    font-weight: bold;
    line-height: 1;
  }

  .unit {
    font-size: 1rem;
    font-weight: normal;
    color: var(--pico-muted-color);
  }

  .label {
    font-size: 0.875rem;
    color: var(--pico-muted-color);
    margin-top: 0.25rem;
  }
</style>
