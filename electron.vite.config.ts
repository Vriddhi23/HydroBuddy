import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
export default defineConfig({
  main: { plugins: [externalizeDepsPlugin()], build: { rollupOptions: { input: resolve('src/main/main.ts') } } },
  preload: { plugins: [externalizeDepsPlugin()], build: { rollupOptions: { input: resolve('src/preload/index.ts') } } },
  renderer: { root: 'src/renderer', plugins: [react(), {
    name: 'offline-production-csp', apply: 'build',
    transformIndexHtml: html => html.replace("connect-src 'self' ws://localhost:* ws://127.0.0.1:*", "connect-src 'none'")
  }], build: { rollupOptions: { input: resolve('src/renderer/index.html') } } }
})
