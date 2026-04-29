import { defineConfig } from 'tsup'

/**
 * tsup build for @rotary/global-chat-widget
 *
 * C 方案 (F6 真因解法)：widget 預先 build 成 dist artefact 提交到 rotary-shared，
 * host (wahoot / rotarycredit / account-rotary) 直接 import bundled dist 檔，
 * 消除 widget src tree 裡的多層 import 解析路徑（host build 時不再從 widget
 * 物理位置往上找 lucide-react / date-fns）。
 *
 * External 策略：peer deps 全部 external（react/react-dom/next/lucide-react/date-fns）
 *   - react/react-dom 必須 external（雙副本會炸 hooks）
 *   - next 必須 external（host 自己提供 next/navigation 等）
 *   - lucide-react / date-fns external 因 host 三家都已宣告為 dependencies；
 *     bundle 進來會肥（lucide-react 上千 icons、date-fns locales 大）
 *
 * 為什麼 external 還能解 F6 卡住的根因？
 *   F6 之前卡是因為 turbopack 從 widget 物理位置 (rotary-shared/packages/.../src)
 *   往上 resolve lucide-react，那條路徑沒 node_modules。
 *   現在 host import 的是 dist/index.mjs（bundled single file），import path 只剩
 *   「lucide-react」「date-fns/locale」這層，host 從自己 node_modules 一次解析成功。
 */
export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
  dts: true,
  sourcemap: false,
  clean: true,
  splitting: false,
  treeshake: true,
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'next',
    /^next\//,
    'lucide-react',
    'date-fns',
    /^date-fns\//,
  ],
  // 'use client' directive：esbuild 把 module-level "use client" 視為 directive 並
  // strip（看到 warning: Module level directives cause errors when bundled...）。
  // 改用 onSuccess hook 在 build 完直接 prepend，next/turbopack 把 dist 視為 client
  // boundary。
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
      } catch (e) {
        // .cjs 在純 ESM 設定下可能不存在；不 fatal
      }
    }
  },
})
