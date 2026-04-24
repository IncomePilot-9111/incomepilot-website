import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: { reporter: ['text'] },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
