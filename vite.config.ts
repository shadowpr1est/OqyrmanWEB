import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("@tanstack/")) return "vendor-query";
          if (id.includes("@radix-ui/")) return "vendor-radix";
          if (
            id.includes("/react-dom/") ||
            id.includes("/react-router") ||
            id.match(/node_modules\/react\//) ||
            id.includes("/react/jsx-runtime") ||
            id.includes("/react/jsx-dev-runtime")
          ) return "vendor-react";
        },
      },
    },
  },
});
