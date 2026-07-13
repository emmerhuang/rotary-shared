/**
 * widgetSignals — D1 私訊「外部指令開啟」的純邏輯閘門。
 *
 * 抽出原因（DOM-free 可測，對齊本 package 既有結構性/邏輯性測試哲學）：
 *   host（rotarysso Navbar 訊息圖示 / NewMessageDialog 建對話成功）需要能從 widget
 *   外部把它「打開」。widget 的 `open` 原本是純內部 useState、外部開不了。openSignal
 *   prop 帶一個單調遞增的 nonce（外加可選 conversationId）當作「請打開」的指令。
 *
 * 為何用 nonce 而非 boolean：
 *   同一個對話可能被連續點兩次（關掉後再點），boolean 無法表達「又一次請求」；
 *   nonce 每次點擊 +1，widget 以「nonce 是否變新」判定是否要再開一次。
 *
 * AT-MSG-7 迴歸保證：openSignal 不傳（rotaryCredit 現行用法）→ isNewOpenSignal 恆
 * 回 false，掛在 widget 上的 open-effect 變成 no-op，既有開合行為 bit-for-bit 不變。
 */

export interface OpenSignal {
  /** 可選：要直接開到哪個對話；null/未給＝只開清單視圖 */
  conversationId?: number | null
  /** 單調遞增指令序號；每次「請打開」都給新值 */
  nonce: number
}

/**
 * 判定是否應對這次 render 觸發「打開」動作。
 *
 * @param prevNonce widget 上次已處理過的 nonce（首次為 null）
 * @param signal    host 傳入的 openSignal（不傳＝null/undefined）
 * @returns true 表示這是一個「新的、尚未處理」的開啟指令
 */
export function isNewOpenSignal(
  prevNonce: number | null,
  signal: OpenSignal | null | undefined,
): boolean {
  if (!signal) return false
  return signal.nonce !== prevNonce
}
