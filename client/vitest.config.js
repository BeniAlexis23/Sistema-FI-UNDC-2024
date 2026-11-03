import { defineConfig } from 'vitest/config';

// Solo se prueban funciones puras (sin DOM): helpers de fechas, videos y bloques
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
