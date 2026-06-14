import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    // Dedicated port for minitask. strictPort makes Vite fail loudly on a
    // collision instead of silently landing on a neighbour's port (e.g. another
    // project already holding 5173). Matches the backend CORS_ORIGINS /
    // PUBLIC_WEB_URL, which point at :5190.
    port: 5190,
    strictPort: true,
  },
});
