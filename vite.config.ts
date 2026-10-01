// vite.config.ts or vite.config.mts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
// import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const staticTarget = env.VITE_API_BASE_URL || "http://localhost:4000/";

  return {
    base: "/lc/",
    plugins: [
      react(),
      tailwindcss(), // ⬅️ this is the missing piece
      // basicSsl(), // ✅ HTTPS enabled
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      host: "0.0.0.0", // or your IP like '192.168.1.10'
      port: 3000,
      // proxy: {
      //   // Legacy UI uses absolute /images/... paths; serve from backend host in dev.
      //   "/images": {
      //     target: staticTarget,
      //     changeOrigin: true,
      //   },
      //   // Some pages also reference Drupal-style files.
      //   "/sites": {
      //     target: staticTarget,
      //     changeOrigin: true,
      //   },
      // },
    },
    build: {
      chunkSizeWarningLimit: 1400,
      // Keep default Rollup chunking for runtime safety in production.
      // Custom manualChunks caused React/Radix init-order errors in prod.
    },
  };
});
