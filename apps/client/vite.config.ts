import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  optimizeDeps: {
    include: ['@webtex/lib']
  },
  resolve: {
    alias: {
      "@styles": path.resolve(__dirname, "./src/assets/styles"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@chips": path.resolve(__dirname, "./src/components/chips"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@model": path.resolve(__dirname, "./src/model"),
      "@utilities": path.resolve(__dirname, "./src/utils"),
      "@views": path.resolve(__dirname, "./src/views"),
    }
  },
  server: {
    port: 5174,
    host: 'localhost',
    proxy: {
      "/api": {
        target: "http://localhost:5173",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  preview: {
    host: "localhost",
    strictPort: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  build: {
    target: "esnext",
    minify: true,
    cssCodeSplit: false,
  },
});
