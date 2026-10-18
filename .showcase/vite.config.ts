import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const SHOWCASE_ROOT = fileURLToPath(new URL('.', import.meta.url))

/** The library root, one level up. Component folders live directly inside it. */
const LIBRARY_ROOT = resolve(SHOWCASE_ROOT, '..')

const { dependencies } = createRequire(import.meta.url)('./package.json')

/**
 * Component files live outside this app, so Node resolution never reaches
 * `.showcase/node_modules`. Point every declared dependency at it explicitly.
 */
const dependencyAliases = Object.fromEntries(
  Object.keys(dependencies).map(name => [
    name,
    resolve(SHOWCASE_ROOT, 'node_modules', name)
  ])
)

/**
 * Vite only watches its own root, so edits to component folders — and new
 * `*Showcase.tsx` files the gallery globs for — would otherwise go unnoticed.
 */
const watchLibrary = (): Plugin => ({
  name: 'watch-library',
  configureServer: server => {
    server.watcher.add(LIBRARY_ROOT)
  }
})

export default defineConfig({
  plugins: [react(), watchLibrary()],
  resolve: {
    alias: {
      ...dependencyAliases,
      // Mirrors the `components/*` imports used once a folder is grabbed.
      components: LIBRARY_ROOT
    }
  },
  server: {
    fs: { allow: [LIBRARY_ROOT] }
  }
})
