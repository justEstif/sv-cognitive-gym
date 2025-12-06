<script lang="ts">
  import type { PageProps } from "./$types";
  import { signOut } from "./auth/auth.remote";
  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Cognitive Gym</title>
</svelte:head>

<header class="container">
  <nav>
    <ul>
      <li><strong>Cognitive Gym</strong></li>
    </ul>

    <ul>
      {#if data?.user?.username}
        <li>
          {data.user.username}
        </li>
        <li>
          <button
            onclick={async () => {
              await signOut();
            }}>Sign Out</button
          >
        </li>
      {:else}
        <li><a href="/auth">Login</a></li>
      {/if}
    </ul>
  </nav>
</header>

<main class="container">
  <h1>Welcome to Cognitive Gym</h1>
  <p>
    A web application that helps knowledge workers and students rebuild and
    strengthen their ability to focus deeply through progressive training.
  </p>

  {#if !data.user}
    <p>Get started today <a href="/auth">Login</a></p>
  {/if}

  // we should have the dashboard content here
</main>

<footer class="container">
  <p>Copyright &copy; {new Date().getFullYear()} Cognitive Gym</p>
</footer>

<style>
  main {
    min-height: calc(100vh - 10rem);
  }
</style>
