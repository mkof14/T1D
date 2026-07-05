import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    fileParallelism: false,
    include: ['tests/unit/**/*.test.mjs', 'tests/unit/**/*.test.ts', 'tests/integration/**/*.test.mjs'],
  },
});
