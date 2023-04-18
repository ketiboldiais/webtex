import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'pathe';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({
    insertTypesEntry: true,
  })],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.tsx'),
      name: 'vtex',
      fileName: 'index',
      formats: ['es']
    },
    minify: true,
    rollupOptions: {
      external: ['react', 'react-dom']
    }
  }
})
