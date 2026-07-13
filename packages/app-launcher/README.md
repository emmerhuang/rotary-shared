# @rotary/app-launcher

扶輪生態系共用「九宮格 App 啟動器」（Google waffle 風格）。**route-agnostic / 資料驅動**：
host 注入 app 清單（或惰性 fetcher）+ 當前 app key，元件負責 UI、fallback 圖示、a11y。
零框架依賴（只用 react / react-dom，不 import next / lucide）；layout 用 inline style，
不依賴 host 的 Tailwind 掃描 → 任何 host 掛上即可正常渲染。

## 用法

```tsx
import { AppLauncher, type LauncherApp } from '@rotary/app-launcher'

// A. 惰性（推薦，首次開啟才 fetch）
<AppLauncher
  fetchApps={async () => {
    const r = await fetch('/api/apps')
    const d = await r.json()
    if (!d.success) return null            // null ⇒ graceful degrade
    return d.data.map((a): LauncherApp => ({
      key: a.clientId,
      name: a.name,
      url: a.homepageUrl ?? buildAuthorizeUrl(a),
      iconUrl: a.logoUrl,                    // 缺 / 非 https ⇒ 自動 fallback 色塊+首字
    }))
  }}
  currentAppKey={null}                       // rotarysso 是 IdP、不在清單 ⇒ 無「目前」標示
  moreUrl="https://rotarysso.vercel.app/apps"
  className="text-white hover:bg-blue-800"   // 觸發器貼合 host navbar
/>

// B. 直接傳清單（controlled，測試 / 簡單 host 用）
<AppLauncher apps={apps} currentAppKey="acc" />
```

## Props

| prop | 說明 |
|------|------|
| `apps?` | 已解析清單（controlled）。與 `fetchApps` 二擇一 |
| `fetchApps?` | 惰性 async 取清單；回 `null` ⇒ 降級。首次開啟呼叫一次 |
| `currentAppKey?` | 命中的 tile 標「目前」、點擊只關閉不導航 |
| `moreUrl?` | footer「查看全部應用」連結 |
| `label?` | 觸發器 aria-label / tooltip，預設「應用服務」 |
| `className?` | 觸發器 className 透傳 |

`LauncherApp = { key, name, url, iconUrl? }`。`url` 為最終絕對網址（元件不組路由）；
點擊一律新分頁（`target="_blank" rel="noopener noreferrer"`）。

## logo 接口（待秘書長生成補檔）

`iconUrl` 吃**https** 網址（http/javascript/data 一律當無圖 → fallback）。
rotarysso 端資料源為 `oauth_clients.logo_url`（`/api/apps` 回 `logoUrl`）；
補檔時只需把 https 圖檔網址填進該欄，快取過後自動顯示，無需改本套件。

## 建置

```bash
npm install
npm run build        # tsup → dist（含 'use client'）
npm test             # vitest（icon 純邏輯 + AppLauncher jsdom 互動）
npm run typecheck    # tsc --noEmit
```

消費端以 `file:` 依賴引入並列入 `transpilePackages`（比照 `@rotary/global-chat-widget`）。
dist 為衍生物：**改 src 後務必 `npm run build` 重建 dist 再讓 host 消費**（7/4 dist 壞掉致登入崩潰教訓 → 配 CI dist gate）。
