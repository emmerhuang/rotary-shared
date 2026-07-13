/**
 * widgetSignals 單元測試（D1 私訊 openSignal 外部開啟閘門）。
 *
 * Scope（同既有 widget 測試哲學 — 結構性/邏輯性，不跑 DOM）：
 *   openSignal 的 nonce 去重是 widget 「外部指令開啟」的核心閘門邏輯。抽成純函式
 *   讓它 DOM-free 可測（rotarysso 刻意不裝 jsdom，見 GlobalChatWidget.test.ts 檔頭）。
 *   實際 setOpen 接線 + 「新對話」鈕 render 由 Lens Playwright（AT-MSG-1）覆蓋。
 *
 * 鎖定的行為：
 *   - AT-MSG-7 迴歸：openSignal 不傳（＝rotaryCredit 現行用法）→ 閘門恆 false，
 *     新 effect 對既有行為 bit-for-bit 零影響（no-op）。
 *   - 傳 openSignal 且 nonce 變新 → 閘門 true（外部可開）。
 *   - 同 nonce 重複 render → false（不會每次 re-render 都彈開）。
 *
 * Run:
 *   npx tsx --test packages/global-chat-widget/src/__tests__/widgetSignals.test.ts
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isNewOpenSignal } from '../internal/widgetSignals'

test('widgetSignals: openSignal 不傳（undefined）→ 恆 false（AT-MSG-7 credit no-op）', () => {
  assert.equal(isNewOpenSignal(null, undefined), false)
  assert.equal(isNewOpenSignal(5, undefined), false)
})

test('widgetSignals: openSignal 不傳（null）→ 恆 false', () => {
  assert.equal(isNewOpenSignal(null, null), false)
  assert.equal(isNewOpenSignal(3, null), false)
})

test('widgetSignals: 首次收到 signal（prev=null）→ true（外部可開）', () => {
  assert.equal(isNewOpenSignal(null, { nonce: 1 }), true)
})

test('widgetSignals: 同 nonce 重複 render → false（不重複彈開）', () => {
  assert.equal(isNewOpenSignal(1, { nonce: 1 }), false)
  assert.equal(isNewOpenSignal(7, { nonce: 7 }), false)
})

test('widgetSignals: nonce 變新 → true（每次點擊都能再開）', () => {
  assert.equal(isNewOpenSignal(1, { nonce: 2 }), true)
  assert.equal(isNewOpenSignal(2, { nonce: 3 }), true)
})

test('widgetSignals: 帶 conversationId 不影響閘門判定（只看 nonce）', () => {
  assert.equal(isNewOpenSignal(1, { nonce: 1, conversationId: 42 }), false)
  assert.equal(isNewOpenSignal(1, { nonce: 2, conversationId: 42 }), true)
  assert.equal(isNewOpenSignal(null, { nonce: 1, conversationId: null }), true)
})
