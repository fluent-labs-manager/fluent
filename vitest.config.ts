import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

const coverageThreshold = 80;

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary', 'html'],
        include: ['src/**/*.{ts,vue}'],
        exclude: [
          'src/**/__tests__/**',
          'src/**/*.d.ts',
          'src/**/*.dto.ts',
          'src/api/interfaces/**',
          'src/mocks/**',
          'src/types/**',
          'src/main.ts',
        ],
        thresholds: {
          lines: coverageThreshold,
          functions: coverageThreshold,
          branches: coverageThreshold,
          statements: coverageThreshold,
        },
      },
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
);
