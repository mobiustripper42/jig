import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    // Absolute, so a run with `--root` elsewhere (test-tmp.test.mjs does one) still finds it.
    globalSetup: [fileURLToPath(new URL('./scripts/test-tmp.mjs', import.meta.url))],
  },
})
