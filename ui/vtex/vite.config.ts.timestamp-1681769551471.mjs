// vite.config.ts
import { defineConfig } from "file:///Users/ketiboldiais/My%20Drive/webtex/node_modules/.pnpm/vite@4.2.1/node_modules/vite/dist/node/index.js";
import react from "file:///Users/ketiboldiais/My%20Drive/webtex/node_modules/.pnpm/@vitejs+plugin-react@3.1.0_vite@4.2.1/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "file:///Users/ketiboldiais/My%20Drive/webtex/node_modules/.pnpm/pathe@1.1.0/node_modules/pathe/dist/index.mjs";
import dts from "file:///Users/ketiboldiais/My%20Drive/webtex/node_modules/.pnpm/vite-plugin-dts@2.3.0_vite@4.2.1/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/ketiboldiais/My Drive/webtex/ui/vtex";
var vite_config_default = defineConfig({
  plugins: [react(), dts({
    insertTypesEntry: true
  })],
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.tsx"),
      name: "vtex",
      fileName: "index",
      formats: ["es"]
    },
    minify: true,
    rollupOptions: {
      external: ["react", "react-dom"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMva2V0aWJvbGRpYWlzL015IERyaXZlL3dlYnRleC91aS92dGV4XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMva2V0aWJvbGRpYWlzL015IERyaXZlL3dlYnRleC91aS92dGV4L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9rZXRpYm9sZGlhaXMvTXklMjBEcml2ZS93ZWJ0ZXgvdWkvdnRleC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQge3Jlc29sdmV9IGZyb20gJ3BhdGhlJztcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBkdHMoe1xuICAgIGluc2VydFR5cGVzRW50cnk6IHRydWUsXG4gIH0pXSxcbiAgYnVpbGQ6IHtcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9pbmRleC50c3gnKSxcbiAgICAgIG5hbWU6ICd2dGV4JyxcbiAgICAgIGZpbGVOYW1lOiAnaW5kZXgnLFxuICAgICAgZm9ybWF0czogWydlcyddXG4gICAgfSxcbiAgICBtaW5pZnk6IHRydWUsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFsncmVhY3QnLCAncmVhY3QtZG9tJ11cbiAgICB9XG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFULFNBQVMsb0JBQW9CO0FBQ2xWLE9BQU8sV0FBVztBQUNsQixTQUFRLGVBQWM7QUFDdEIsT0FBTyxTQUFTO0FBSGhCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSTtBQUFBLElBQ3JCLGtCQUFrQjtBQUFBLEVBQ3BCLENBQUMsQ0FBQztBQUFBLEVBQ0YsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTyxRQUFRLGtDQUFXLGVBQWU7QUFBQSxNQUN6QyxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsTUFDVixTQUFTLENBQUMsSUFBSTtBQUFBLElBQ2hCO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsU0FBUyxXQUFXO0FBQUEsSUFDakM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
