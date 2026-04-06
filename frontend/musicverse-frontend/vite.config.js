// frontend/musicverse-frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Note: Tailwind CSS is handled via PostCSS, no need for a separate plugin here
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
      "/auth": "http://127.0.0.1:8000", // Ensure this proxies to Django
      "/media": "http://127.0.0.1:8000",
    },
  },
});
