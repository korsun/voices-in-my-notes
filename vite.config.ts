import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: ['53f8c2e8-77bc-4033-9ed7-7cdddf159c6d-00-3jpycbzkd1mdu.worf.replit.dev'],
  },
  plugins: [react(), tailwindcss(), tsconfigPaths()],
});
