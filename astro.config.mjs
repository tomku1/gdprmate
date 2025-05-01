// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  env: {
    schema: {
      // The key is making sure these are set to server context with secret access
      // This ensures they're available in import.meta.env on the server
      SUPABASE_URL: envField.string({ context: "server", access: "secret" }),
      SUPABASE_KEY: envField.string({ context: "server", access: "secret" }),
      OPENROUTER_API_KEY: envField.string({ context: "server", access: "secret" }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled
      alias: {
        ...(import.meta.env.PROD ? { "react-dom/server": "react-dom/server.edge" } : {}),
      },
    },
    // Add this to ensure environment variables are correctly passed to the build
    // define: {
    //   "import.meta.env.SUPABASE_URL": JSON.stringify(import.meta.env.SUPABASE_URL),
    //   "import.meta.env.SUPABASE_KEY": JSON.stringify(import.meta.env.SUPABASE_KEY),
    //   "import.meta.env.OPENROUTER_API_KEY": JSON.stringify(import.meta.env.OPENROUTER_API_KEY),
    // },
  },
  adapter: cloudflare(),
  experimental: { session: true },
});
