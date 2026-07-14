import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Target modern browsers that support all CSS/JS we use
    target: "es2020",
    // Increase chunk size warning limit slightly for this single-page app
    chunkSizeWarningLimit: 600,
  },
});
