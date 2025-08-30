import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sitemap } from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      // Ensure this is your correct, live domain name
      hostname: 'https://picode.polsage.in', 
    }),
  ],
});

