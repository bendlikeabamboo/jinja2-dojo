import { defineConfig } from 'vite'

export default defineConfig({
  base: '/jinja2-dojo/',
  build: {
    target: 'es2020',
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'preact',
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
