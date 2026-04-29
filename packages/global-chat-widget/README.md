# @rotary/global-chat-widget

> Lego v1.2 §3.5 + §7 F4 — single source of truth for SSO message hub chat UI.

## 為什麼存在

R4 鐵則：rotarycredit / wahoot / account-rotary 三系統的私訊 widget **必須是同一份程式碼**，不准各畫一套。本 package 從 rotarycredit 既有 GlobalChatWidget 抽出，所有 child app 透過 npm workspace path import 拿同一份 source。

## 對外 API

```tsx
import { GlobalChatWidget } from '@rotary/global-chat-widget';

<GlobalChatWidget
  apiBaseUrl={process.env.NEXT_PUBLIC_MESSAGE_HUB_URL ?? 'https://rotarycredit.vercel.app'}
  getAccessToken={async () => session?.accessToken ?? null}
  myUserId={session?.user?.id}
  onUnreadChange={(n) => updateNavBadge(n)}
  onOpenFullPage={(convId) => router.push(`/messages/${convId}`)}
/>
```

| Prop | 必填 | 說明 |
|---|---|---|
| `apiBaseUrl` | 是 | hub base URL（R3 rollback 開關，host 從 env var 注入） |
| `getAccessToken` | 是 | 回傳 OIDC access token 的 async callback（hub 不收 cookie auth，必須帶 Bearer） |
| `myUserId` | 是 | 當前登入使用者 id（用於判斷訊息送出方 vs 接收方） |
| `onUnreadChange` | 否 | 未讀數變動時觸發，host 用來同步 nav badge |
| `onOpenFullPage` | 否 | 使用者點對話標題時觸發，host 自行決定路由（rotarycredit `/messages/[id]`、其他 app 可不實作） |
| `theme` | 否 | 預留主題色客製化（v1 未實作，先佔欄位） |

## 內部 SDK（host app 不直接 import）

`messageClient.ts` 包裝 hub 9 個 endpoint。Widget 內部使用，不對 host 暴露 — host 看到的是 widget 的 React 介面，不是 SDK。

如需在 widget 外（例如 host app 的「點社員→開對話」入口）程式化操作，呼叫 widget instance 上的 method（例如 `openConversationWith(userId)`）；不要繞過 widget 直接打 SDK。

## 切換 / Rollback

整套切換靠 `apiBaseUrl` env var：
- 切換前 / Rollback：`NEXT_PUBLIC_MESSAGE_HUB_URL=https://rotarycredit.vercel.app`
- 切換後：`NEXT_PUBLIC_MESSAGE_HUB_URL=https://rotarysso.vercel.app`

Host app **不可** hardcode hub URL。

## 已知 quirks（API 對等性 R2）

從 rotarycredit 1:1 移植到 hub 的端點 quirks，SDK 跟著保留：

1. **`/messages/unread` 回 `{ success, count }`**，不是標準的 `{ success, data }` envelope
2. **`PATCH /messages/[id]/read`** verb 是 PATCH（不是 POST）
3. **`/attachment/[id]` 401 回空 body**（不是 JSON envelope）— BLOB consumer 不會 parse JSON

SDK method 介面照 quirks 設計，未統一，是有意保留行為對等性。

## 開發

```bash
# 從 rotarysso root
npm install                                  # 拉 workspace deps
npm run test:widget                          # 跑 widget package 單元測試
```
