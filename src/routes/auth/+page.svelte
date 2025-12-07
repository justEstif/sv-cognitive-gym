<script lang="ts">
  import { authenticate } from "./auth.remote";

  const pending = $derived(!!authenticate.pending);
</script>

<svelte:head>
  <title>Sign In | Cognitive Gym</title>
</svelte:head>

<main class="container">
  <h1>Cognitive Gym</h1>

  <form {...authenticate}>
    <fieldset>
      <label
        >Username
        <input
          id="username"
          {...authenticate.fields.username.as("text")}
          placeholder="Enter your username"
        />
      </label>
    </fieldset>

    {#each authenticate.fields.username.issues() as issue, i (i)}
      <p>{issue.message}</p>
    {/each}

    <label
      >Password
      <input
        id="password"
        {...authenticate.fields._password.as("password")}
        placeholder="Enter your password"
      />
    </label>

    {#each authenticate.fields._password.issues() as issue, i (i)}
      <p>{issue.message}</p>
    {/each}

    <button type="submit" disabled={pending}>
      {#if authenticate.pending}
        Loading...
      {/if}

      {authenticate.fields.register.value() ? "Register" : "Sign In"}
    </button>

    <label>
      <input {...authenticate.fields.register.as("checkbox")} />
      Register
    </label>

    {#each authenticate.fields.allIssues() as issue, i (i)}
      {#if !issue.path?.length}
        <p>{issue.message}</p>
      {/if}
    {/each}
  </form>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100vh;
    max-width: 576px;
  }
</style>
