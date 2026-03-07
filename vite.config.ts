/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor';
          }
          if (id.includes('/src/data/exercises')) {
            return 'data';
          }
          if (id.includes('/src/features/progress') || id.includes('/src/features/workout') || id.includes('/src/hooks/useWorkout')) {
            return 'feature-workout';
          }
          if (id.includes('/src/features/profile') || id.includes('/src/features/photos')) {
            return 'feature-profile';
          }
          if (id.includes('/src/features/quick-workout')) {
            return 'feature-quick-workout';
          }
          if (id.includes('/src/features/onboarding')) {
            return 'feature-onboarding';
          }
          if (id.includes('/src/features/nutrition')) {
            return 'feature-nutrition';
          }
          if (id.includes('/src/features/readiness')) {
            return 'feature-readiness';
          }
          if (id.includes('/src/features/training-plan')) {
            return 'feature-training-plan';
          }
          if (id.includes('/src/training/') || id.includes('/src/analytics/')) {
            return 'domain-core';
          }
          if (id.includes('/src/data/animations') || id.includes('/src/data/exercise-guides')) {
            return 'data-guides';
          }
        },
      },
    },
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
        'src/features/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/data/**',
        'src/shared/components/**',
        'src/shared/demo/**',
        'src/hooks/**',
      ],
    },
  },
});
