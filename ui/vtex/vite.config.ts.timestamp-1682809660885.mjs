// vite.config.ts
import { defineConfig } from "file:///Users/ketiboldiais/My%20Drive/webtex/node_modules/.pnpm/vite@4.2.1_sass@1.59.3/node_modules/vite/dist/node/index.js";
import react from "file:///Users/ketiboldiais/My%20Drive/webtex/node_modules/.pnpm/@vitejs+plugin-react@3.1.0_vite@4.2.1/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "file:///Users/ketiboldiais/My%20Drive/webtex/node_modules/.pnpm/pathe@1.1.0/node_modules/pathe/dist/index.mjs";
import dts from "file:///Users/ketiboldiais/My%20Drive/webtex/node_modules/.pnpm/vite-plugin-dts@2.3.0_rollup@3.21.0+vite@4.2.1/node_modules/vite-plugin-dts/dist/index.mjs";
import mdx from "file:///Users/ketiboldiais/My%20Drive/webtex/node_modules/.pnpm/@mdx-js+rollup@2.3.0_rollup@3.21.0/node_modules/@mdx-js/rollup/index.js";
import remarkMath from "file:///Users/ketiboldiais/My%20Drive/webtex/node_modules/.pnpm/remark-math@5.1.1/node_modules/remark-math/index.js";
import remarkGfm from "file:///Users/ketiboldiais/My%20Drive/webtex/node_modules/.pnpm/remark-gfm@3.0.1/node_modules/remark-gfm/index.js";
import rehypeKatex from "file:///Users/ketiboldiais/My%20Drive/webtex/node_modules/.pnpm/rehype-katex@6.0.3/node_modules/rehype-katex/index.js";
import rehypeSlug from "file:///Users/ketiboldiais/My%20Drive/webtex/node_modules/.pnpm/rehype-slug@5.1.0/node_modules/rehype-slug/index.js";
import rehypePrism from "file:///Users/ketiboldiais/My%20Drive/webtex/node_modules/.pnpm/@mapbox+rehype-prism@0.8.0/node_modules/@mapbox/rehype-prism/index.js";
import * as path from "path";
var __vite_injected_original_dirname = "/Users/ketiboldiais/My Drive/webtex/ui/vtex";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    mdx({
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [remarkMath, remarkGfm],
      rehypePlugins: [rehypeKatex, rehypeSlug, rehypePrism]
    }),
    dts({
      insertTypesEntry: true
    })
  ],
  resolve: {
    alias: [{
      find: "@",
      replacement: path.resolve(__vite_injected_original_dirname, "src/lib")
    }]
  },
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/lib/index.ts"),
      name: "vtex",
      fileName: "index",
      formats: ["es"]
    },
    minify: true,
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react-router-dom",
        "d3-force",
        "d3-shape",
        "@visx/annotation",
        "@visx/axis",
        "@visx/scale"
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMva2V0aWJvbGRpYWlzL015IERyaXZlL3dlYnRleC91aS92dGV4XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMva2V0aWJvbGRpYWlzL015IERyaXZlL3dlYnRleC91aS92dGV4L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9rZXRpYm9sZGlhaXMvTXklMjBEcml2ZS93ZWJ0ZXgvdWkvdnRleC92aXRlLmNvbmZpZy50c1wiOy8vLyA8cmVmZXJlbmNlIHR5cGVzPVwidml0ZXN0XCIgLz5cblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aGVcIjtcbmltcG9ydCBkdHMgZnJvbSBcInZpdGUtcGx1Z2luLWR0c1wiO1xuaW1wb3J0IG1keCBmcm9tIFwiQG1keC1qcy9yb2xsdXBcIjtcbmltcG9ydCByZW1hcmtNYXRoIGZyb20gXCJyZW1hcmstbWF0aFwiO1xuaW1wb3J0IHJlbWFya0dmbSBmcm9tIFwicmVtYXJrLWdmbVwiO1xuaW1wb3J0IHJlaHlwZUthdGV4IGZyb20gXCJyZWh5cGUta2F0ZXhcIjtcbmltcG9ydCByZWh5cGVTbHVnIGZyb20gXCJyZWh5cGUtc2x1Z1wiO1xuaW1wb3J0IHJlaHlwZVByaXNtIGZyb20gXCJAbWFwYm94L3JlaHlwZS1wcmlzbVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbWR4KHtcbiAgICAgIHByb3ZpZGVySW1wb3J0U291cmNlOiBcIkBtZHgtanMvcmVhY3RcIixcbiAgICAgIHJlbWFya1BsdWdpbnM6IFtyZW1hcmtNYXRoLCByZW1hcmtHZm1dLFxuICAgICAgcmVoeXBlUGx1Z2luczogW3JlaHlwZUthdGV4LCByZWh5cGVTbHVnLCByZWh5cGVQcmlzbV0sXG4gICAgfSksXG4gICAgZHRzKHtcbiAgICAgIGluc2VydFR5cGVzRW50cnk6IHRydWUsXG4gICAgfSksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczogW3tcbiAgICAgIGZpbmQ6ICdAJyxcbiAgICAgIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2xpYicpXG4gICAgfV1cbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvbGliL2luZGV4LnRzXCIpLFxuICAgICAgbmFtZTogXCJ2dGV4XCIsXG4gICAgICBmaWxlTmFtZTogXCJpbmRleFwiLFxuICAgICAgZm9ybWF0czogW1wiZXNcIl0sXG4gICAgfSxcbiAgICBtaW5pZnk6IHRydWUsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFtcbiAgICAgICAgXCJyZWFjdFwiLFxuICAgICAgICBcInJlYWN0LWRvbVwiLFxuICAgICAgICBcInJlYWN0LXJvdXRlci1kb21cIixcbiAgICAgICAgXCJkMy1mb3JjZVwiLFxuICAgICAgICBcImQzLXNoYXBlXCIsXG4gICAgICAgIFwiQHZpc3gvYW5ub3RhdGlvblwiLFxuICAgICAgICBcIkB2aXN4L2F4aXNcIixcbiAgICAgICAgXCJAdmlzeC9zY2FsZVwiLFxuICAgICAgXSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBRUEsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZUFBZTtBQUN0QixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGlCQUFpQjtBQUN4QixZQUFZLFVBQVU7QUFadEIsSUFBTSxtQ0FBbUM7QUFjekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sSUFBSTtBQUFBLE1BQ0Ysc0JBQXNCO0FBQUEsTUFDdEIsZUFBZSxDQUFDLFlBQVksU0FBUztBQUFBLE1BQ3JDLGVBQWUsQ0FBQyxhQUFhLFlBQVksV0FBVztBQUFBLElBQ3RELENBQUM7QUFBQSxJQUNELElBQUk7QUFBQSxNQUNGLGtCQUFrQjtBQUFBLElBQ3BCLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPLENBQUM7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLGFBQWtCLGFBQVEsa0NBQVcsU0FBUztBQUFBLElBQ2hELENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxLQUFLO0FBQUEsTUFDSCxPQUFPLFFBQVEsa0NBQVcsa0JBQWtCO0FBQUEsTUFDNUMsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBLE1BQ1YsU0FBUyxDQUFDLElBQUk7QUFBQSxJQUNoQjtBQUFBLElBQ0EsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsVUFBVTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
