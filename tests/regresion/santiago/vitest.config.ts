import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    environment: 'node',
    // Las pruebas hablan con una tienda real: se les da tiempo, y los archivos
    // corren uno tras otro para que las mediciones de rendimiento no compitan
    // entre sí por el servidor.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
})
