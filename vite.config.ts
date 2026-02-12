/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.test.*',
        'src/shared/theme/**',
        'src/ui/**',
        'src/app/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/features/**/!(*.reducer|*.context).tsx',
        'src/shared/components/**',
        'src/shared/demo/**',
        'src/shared/hooks/**',
        'src/hooks/**',
        'src/data/exercises.ts',
        'src/data/exercise-guides.ts',
        'src/data/protein-sources.ts',
        'src/data/quick-templates.ts',
      ],
      thresholds: {
        lines: 50,
      },
    },
  },
});
