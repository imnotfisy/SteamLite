import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// the finished interface is written into ../ui and embedded in the app
export default defineConfig({
  plugins: [svelte()],
  base: '/',
  build: { outDir: '../ui', emptyOutDir: false, target: 'chrome120', cssCodeSplit: false, assetsInlineLimit: 4096, chunkSizeWarningLimit: 800 }
});
