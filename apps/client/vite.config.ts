import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig(async () => {
  return {
    plugins: [
      react(),
      tsconfigPaths(),
    ],
    optimizeDeps: {
      include: ["react/jsx-runtime"],
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
      },
    },
    server: {
      port: 5174,
      host: "127.0.0.1",
    },
    preview: {
      host: "localhost",
      strictPort: true,
    },
    build: {
      target: "esnext",
      minify: true,
      cssCodeSplit: false,
    },
  };
});
