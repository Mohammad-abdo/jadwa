import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: parseInt(process.env.VITE_PORT) || 5173,
    open: true,
    host: true, // Allow external connections
  },
  build: {
    outDir: "dist",
    sourcemap: false, // Disable sourcemaps for production
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "antd-vendor": ["antd"],
          utils: ["dayjs"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
