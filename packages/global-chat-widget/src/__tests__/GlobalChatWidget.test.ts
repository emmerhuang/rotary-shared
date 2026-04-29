/**
 * GlobalChatWidget 結構性測試（F4）。
 *
 * Scope（同 F2/F3 sanity test 哲學 — 結構性不跑 UI）：
 *   - Module 載入無 import 錯（catch internal/* path 拼錯 / lucide / date-fns 漏裝）
 *   - 對外 export 的 component 是 function（React component 形式）
 *   - public prop 型別經 TS compile 不會失型 — 由 npx tsc --noEmit 涵蓋（不在這裡）
 *
 * 不在 scope（留 Lens AC + Playwright screenshot diff）：
 *   - DOM render
 *   - useEffect / polling 行為
 *   - 視覺像素 vs rotarycredit baseline diff (R2)
 *
 * 為什麼結構性 only：
 *   rotarysso 既有 dep 沒裝 jsdom / @testing-library/react，加裝會把測試栈改大，
 *   違反 §7a "最小代價優先"。Widget UI 行為的真正驗證點是 Lens 對 staging 跑
 *   screenshot diff（v1.2 §7a F5）。本檔 catches 的是「import path 改壞了沒人發現」
 *   級的低級錯誤，足夠保 F4 階段的 sanity baseline。
 *
 * Run:
 *   npx tsx --test packages/global-chat-widget/src/__tests__/GlobalChatWidget.test.ts
 */
import { test, before } from 'node:test'
import assert from 'node:assert/strict'

type WidgetMod = typeof import('../index')

let mod: WidgetMod

before(async () => {
  mod = await import('../index')
})

test('widget package: index 對外 export GlobalChatWidget', () => {
  assert.equal(typeof mod.GlobalChatWidget, 'function')
  assert.equal(mod.GlobalChatWidget.name, 'GlobalChatWidget')
})

test('widget package: 對外不直接暴露 MessageClient（host app 不該繞過 widget 直打 SDK）', () => {
  // index.ts 只 re-export wire types + GlobalChatWidget；MessageClient 是 internal/。
  // 這條 lock 住「實作細節不爆」的決策。
  assert.equal((mod as Record<string, unknown>).MessageClient, undefined)
})

test('widget package: stickers 也屬 internal，不從 index 漏出', async () => {
  assert.equal((mod as Record<string, unknown>).STICKERS, undefined)
  assert.equal((mod as Record<string, unknown>).stickerUrl, undefined)
  // sanity: 但 internal 模組本身仍可 import（widget 自己用得到）
  const stickersMod = await import('../internal/stickers')
  assert.ok(Array.isArray(stickersMod.STICKERS))
  assert.ok(stickersMod.STICKERS.length > 0)
})

test('widget package: SDK 內部模組可 import 且 9 個 method 全在', async () => {
  const sdkMod = await import('../internal/messageClient')
  const proto = sdkMod.MessageClient.prototype
  // 9 個 public method 全要在（SDK 簽章鎖定）
  for (const m of [
    'listConversations',
    'createOrGetConversation',
    'getConversation',
    'sendMessage',
    'deleteConversation',
    'markRead',
    'getUnreadCount',
    'getAttachmentUrl',
    'fetchAttachment',
    'blockUser',
    'unblockUser',
  ]) {
    assert.equal(typeof (proto as unknown as Record<string, unknown>)[m], 'function', `MessageClient should expose ${m}`)
  }
})
