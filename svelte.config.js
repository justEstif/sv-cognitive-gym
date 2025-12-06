import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "svelte-adapter-bun";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  compilerOptions: {
    experimental: {
      async: true,
    },
  },
  kit: {
    adapter: adapter({
      out: "build",
      precompress: true,
    }),
    experimental: {
      remoteFunctions: true,
    },
  },
};

export default config;
