import { defineConfig } from 'vitest/config'

// 套件自帶測試栈（vitest + jsdom + @testing-library），與 account 一致；
// 不碰 rotarysso 既有 tsx --test 栈（手術式）。
// 全域預設 node（純邏輯測試 icon.test.ts）；元件測試（.test.tsx）於檔首用
// `// @vitest-environment jsdom` docblock 切 DOM 環境。
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./vitest.setup.ts'],
  },
})
