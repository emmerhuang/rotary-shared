/**
 * 純函式圖示 helpers（無 React / 無 DOM，可獨立單元測試）。
 * fallback tile 的顏色與首字都是「確定性」——同一 app 在任何裝置永遠同色。
 */

const PALETTE = [
  '#2563eb', '#16a34a', '#dc2626', '#d97706',
  '#7c3aed', '#0891b2', '#db2777', '#4b5563',
] as const

/** 依 app 的穩定 key 決定 fallback tile 背景色（確定性）。 */
export function fallbackColor(key: string): string {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0
  }
  const idx = Math.abs(hash) % PALETTE.length
  return PALETTE[idx]
}

/** fallback tile 顯示的首字（支援 CJK / emoji 的 code point 切分）。 */
export function initial(name: string): string {
  const trimmed = (name ?? '').trim()
  if (!trimmed) return '?'
  return Array.from(trimmed)[0].toUpperCase()
}

/**
 * 只有 https URL 才可安全注入 <img src>。
 * http: / javascript: / data: 一律當「無圖示」處理 → 走 fallback tile。
 * （縱深防禦：admin 誤填 / 惡意值不進 DOM。ADR §4.1）
 */
export function isSafeIconUrl(url: string | null | undefined): url is string {
  if (!url) return false
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}
