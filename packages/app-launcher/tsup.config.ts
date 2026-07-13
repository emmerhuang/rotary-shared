import { defineConfig } from 'tsup'

/**
 * tsup build for @rotary/app-launcher.
 *
 * 同 @rotary/global-chat-widget 的 C 方案：預先 build 成 dist artefact 提交到
 * rotary-shared，host 直接 import bundled dist（消除 host build 從 widget 物理位置
 * 往上解析依賴的路徑問題）。
 *
 * External 策略：本套件刻意「route-agnostic / 零框架依賴」——只用 react + react-dom，
 * 不 import next / lucide-react。故只 external react 系列（雙副本會炸 hooks），
 * 其餘全 inline（實際上也沒有其他 runtime 依賴，dist 極小）。
 *
 * 'use client'：esbuild bundle 時會 strip module-level directive，改用 onSuccess
 * 在 build 完 prepend，讓 next/turbopack 把 dist 視為 client boundary。
 */
export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  outExtension: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.mjs' }),
  dts: true,
  sourcemap: false,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  onSuccess: async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    for (const file of ['dist/index.mjs', 'dist/index.cjs']) {
      const p = path.resolve(file)
      try {
        const orig = await fs.readFile(p, 'utf8')
        if (!orig.startsWith("'use client'") && !orig.startsWith('"use client"')) {
          await fs.writeFile(p, "'use client';\n" + orig, 'utf8')
        }
      } catch {
        // .cjs 可能不存在時不 fatal
      }
    }
  },
})
