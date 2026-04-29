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
  // External 策略修正（2026-04-30 02:06）：
  //   先前 lucide-react / date-fns external 上 Vercel build 仍 fail，因為 webpack
  //   從 dist 物理位置 (rotary-shared/packages/.../dist/) 往上 resolve，那層沒
  //   node_modules，且 file: 模式下 host node_modules 不在這個物理樹的 parent chain。
  //   修正：把 lucide-react / date-fns(/locale) 也 inline bundle 進 dist，dist 變成
  //   真正 self-contained。代價是 dist 變肥（lucide-react 單一 icon 用到的會 tree-shake，
  //   不會把上千 icon 都帶進去；date-fns 也只 bundle 用到的 function 與 zhTW locale）。
  //   react / react-dom / next 必須 external（雙副本會炸 hooks / Server Component runtime）。
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'next',
    /^next\//,
  ],
  // 額外指定 noExternal 以防 esbuild 把 transitive deps 漏 bundle
  noExternal: [
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
