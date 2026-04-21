import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: process.env.BASE_URL ?? '/',
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'node',
  },
});
