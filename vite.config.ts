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
