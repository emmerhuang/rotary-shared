# F5 Deployment Plan v0（未拍板）

> **狀態**：草案，等老大授權才執行任一方案
> **作者**：Forge
> **日期**：2026-04-29
> **背景**：Lego v1.2 §7 F5 — `rotary-shared` monorepo 抽出 `@rotary/global-chat-widget`，本機 file: 路徑可跑，**Vercel build 抓不到 sibling 目錄是核心 gap**

---

## 1. 問題描述

本輪 F5a/b/c 完成後：

- `rotary-shared/packages/global-chat-widget` 是 single source
- `rotarysso` / `rotaryCredit` 透過 `"@rotary/global-chat-widget": "file:../rotary-shared/packages/global-chat-widget"` 引用
- **本機開發**：`npm install` 走 symlink，build 用 `next build --webpack` PASS（Turbopack 對 file: + symlink 有相容問題，先避開）
- **Vercel build**：每個 host repo 各自 clone，**根本看不到 sibling 的 `rotary-shared` 目錄**，build 必爛

只要嘗試 deploy，CI 會在 `npm install` 階段就 fail（找不到 file: 路徑），廣度影響：

| Host App | 風險 |
|---|---|
| rotarysso | 一切 deploy（含 OIDC 修補）卡住 |
| rotaryCredit | 一切 deploy 卡住 |

**結論**：在拍板部署方案前，**rotarysso / rotaryCredit 都不能 push deploy**。

---

## 2. 候選方案

### 方案 A：Git Submodule（最簡單，不需 npm registry）

把 `rotary-shared` 加成每個 host repo 的 submodule，`file:` 路徑改成本機相對 submodule 路徑。

**優點**：
- 不需要新建 GitHub Packages / npm 私有 registry
- Vercel 內建支援 submodule，`vercel.json` 開 `git.submodules: true` 即可
- 一份 source，bump 時只要 push submodule + 更新各 host 的 commit ref

**缺點**：
- 開發者每次 clone 要 `git clone --recursive`，新人容易踩雷
- submodule 的 commit ref 需要在 host repo 顯式 update，自動化要寫 hook
- 兩個 host repo 各自 update ref 容易跑掉版本，需要紀律

**file: 路徑改寫**：
- rotarysso: `file:./rotary-shared/packages/global-chat-widget`（submodule 在 root）
- rotaryCredit: 同上

**實作步驟（待授權）**：
1. `rotary-shared` push 到 GitHub（私有 repo）
2. 在 rotarysso / rotaryCredit root 各自 `git submodule add git@github.com:.../rotary-shared.git`
3. 改 `package.json` 的 file: 路徑
4. `vercel.json` 加 `"git": { "deploymentEnabled": true }` 並確認 submodule 抓得到（Vercel 設定 SSH key 或 GH token）

---

### 方案 B：GitHub Packages 私有 npm Registry

`rotary-shared` 自動發布到 GitHub Packages，host app 用一般 npm dep `^0.x` 引用。

**優點**：
- 標準 npm flow，dep / version 一目瞭然
- 多個 host 可同時鎖定不同版本（漸進升級）
- 無 submodule 心智負擔

**缺點**：
- 需要 GH Action 自動 publish（rotary-shared 改一次 → version bump → publish）
- 每個 host repo 要設 `.npmrc` + `NODE_AUTH_TOKEN` env（Vercel 也要設）
- 私有 registry 設定一旦壞，所有 deploy 卡住

**實作步驟（待授權）**：
1. `rotary-shared` 加 publishConfig + GH Action workflow
2. 第一次手動 `npm publish`
3. host repo 改 `package.json` 的 file: → `"^0.1.0"`，加 `.npmrc` 帶 token
4. Vercel 設 `NODE_AUTH_TOKEN` env

---

### 方案 C：CI 階段同步進 host repo workspaces

不改 host repo 結構，只在 Vercel build 前的 install hook 把 `rotary-shared/packages/*` 拷貝進 host repo 的 `packages/` 目錄並用 npm workspace 引用。

**優點**：
- 不需要新 registry / submodule
- host repo 結構保持乾淨

**缺點**：
- Vercel build 需要 SSH key 拉 rotary-shared（同 submodule 配置成本）
- install hook 邏輯難維護，corner case 多
- **強烈不建議** — 這個方案是「在錯誤的層級解問題」

---

## 3. 推薦

**短期**：方案 A（git submodule）— 改動最小，標準工具，Vercel 原生支援。
**中長期**：若 `rotary-shared` 套件數 ≥ 3 或開始給外部社團用，再升級到方案 B。

---

## 4. 暫時護欄（在拍板前必須遵守）

1. **rotarysso / rotaryCredit 都不要 push deploy** — 直到 deployment plan 拍板並執行
2. 本機改 widget 後，host app 用 `npm run build --webpack` 確認可編譯
3. 不主動進 Turbopack mode（Next 16 預設）— 對 file: + symlink 有相容問題，已提 issue
4. rotary-shared 本機 git 持續 commit，先不 push GitHub（避免暴露未拍板架構）

---

## 5. 待補項（與本方案無關但本輪標出來）

1. **rotaryCredit 端 R2 對接 GAP**：`GlobalChatWidgetAdapter.tsx` 裡：
   - `getAccessToken: () => null` — R3 切換時必須能回 OIDC access token
   - 上傳附件目前打 rotaryCredit 自家 `/api/messages/attachment`，R3 切換時改打 hub 端
2. **Turbopack 修好後切回**：dev script 目前用 `--webpack`，待 Next.js / Turbopack 修 file: symlink 後切回（效能差很多）
3. **date-fns 版本不一致**：rotarysso v3 / rotaryCredit v4，widget peerDeps `>=3` 兩邊都通過。若以後出現 locale / format API 差異，需要鎖到同版本
