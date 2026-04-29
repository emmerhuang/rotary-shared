# rotary-shared

> Rotary 系列共用套件 monorepo — R4 鐵則：single source of truth。

## 為什麼存在

- Lego v1.2 §3.5 + §7 F4/F5 — 跨應用（rotarysso / rotaryCredit / wahoot / account-rotary）共用 UI 與 SDK 不可各自 fork
- 抽出後 child app 透過 npm `file:` 路徑或未來的 git submodule / GitHub Packages 引用同一份 source

## 目前 packages

| 套件 | 用途 |
|---|---|
| `packages/global-chat-widget` | SSO message hub chat widget（`@rotary/global-chat-widget`）|

## 對外引用方式（本機開發）

Host app 的 `package.json` 直接指 file: 路徑：

```json
{
  "dependencies": {
    "@rotary/global-chat-widget": "file:../rotary-shared/packages/global-chat-widget"
  }
}
```

> ⚠️ 限制：file: 路徑只能在本機 sibling 目錄解析，**Vercel build 時抓不到**。詳見 `docs/F5-deployment-plan-v0.md`。

## 部署計畫（未拍板）

雲端 build 用以下其一，等老大授權再切：

1. Git submodule（rotary-shared 進每個 host repo）
2. GitHub Packages 私有 npm registry
3. CI 階段把 rotary-shared 同步進 host repo workspaces

詳細評估見 `docs/F5-deployment-plan-v0.md`。

## 開發

```bash
# 從 rotary-shared root
npm install                              # 拉 workspace deps（host app 提供 peerDependencies）
```

Widget 單元測試目前掛在 host app（rotarysso）的 `npm run test:widget`，本 repo 不獨立跑 — 因為 tsx / test runner 都在 host 那邊。
