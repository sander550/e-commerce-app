import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Temporary config used only for local end-to-end verification.
// Mirrors vite.config.ts but proxies to the locally-run backend.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5180,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8010",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
