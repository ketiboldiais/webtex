import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  optimizeDeps: {
    include: ['@webtex/lib']
  },
  server: {
    port: 5174,
    host: '127.0.0.1',
    hmr: {
      clientPort: 443
    },
    proxy: {
      "/api": {
        target: "https://api.webtex.cloud",
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
