import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Polyp-Model-Code/",
  plugins: [react()],
  server: {
    proxy: {
      "/predict": "http://localhost:7860",
    },
  },
});
