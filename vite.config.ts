import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  // Load envs early (if needed in plugins)
  loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), nodePolyfills()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 5173,
      strictPort: true
    }
  };
});
