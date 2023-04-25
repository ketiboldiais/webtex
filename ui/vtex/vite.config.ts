import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "pathe";
import dts from "vite-plugin-dts";
import mdx from '@mdx-js/rollup';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypePrism from '@mapbox/rehype-prism';

export default defineConfig({
  plugins: [
    react(),
    mdx({
      providerImportSource: '@mdx-js/react',
      remarkPlugins: [remarkMath, remarkGfm],
      rehypePlugins: [rehypeKatex, rehypeSlug, rehypePrism],
    }),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "vtex",
      fileName: "index",
      formats: ["es"],
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
        "@visx/scale",
      ],
    },
  },
});
