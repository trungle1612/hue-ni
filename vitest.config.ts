import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^.*\.(jpg|jpeg|png|gif|svg|webp)$/,
        replacement: path.resolve(__dirname, 'src/__mocks__/fileMock.ts'),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
    passWithNoTests: true,
  },
})
