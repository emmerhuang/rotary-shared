// Twemoji SVG stickers (Apache 2.0 license)
// CDN: https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/{id}.svg
//
// 1:1 從 rotarycredit components/messages/stickers.ts 搬入（R2 對等性）。
const STICKER_CDN = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg'

export const STICKERS = [
  { emoji: '😊', id: '1f60a' }, { emoji: '😂', id: '1f602' },
  { emoji: '🥰', id: '1f970' }, { emoji: '😎', id: '1f60e' },
  { emoji: '😅', id: '1f605' }, { emoji: '😭', id: '1f62d' },
  { emoji: '😤', id: '1f624' }, { emoji: '🤔', id: '1f914' },
  { emoji: '😴', id: '1f634' }, { emoji: '🤗', id: '1f917' },
  { emoji: '😘', id: '1f618' }, { emoji: '🙃', id: '1f643' },
  { emoji: '😇', id: '1f607' }, { emoji: '🤩', id: '1f929' },
  { emoji: '😋', id: '1f60b' }, { emoji: '🤣', id: '1f923' },
  { emoji: '👍', id: '1f44d' }, { emoji: '👎', id: '1f44e' },
  { emoji: '👏', id: '1f44f' }, { emoji: '🙏', id: '1f64f' },
  { emoji: '🤝', id: '1f91d' }, { emoji: '💪', id: '1f4aa' },
  { emoji: '👋', id: '1f44b' }, { emoji: '🤞', id: '1f91e' },
  { emoji: '🎉', id: '1f389' }, { emoji: '🔥', id: '1f525' },
  { emoji: '💕', id: '1f495' }, { emoji: '💯', id: '1f4af' },
  { emoji: '⭐', id: '2b50'  }, { emoji: '🎯', id: '1f3af' },
  { emoji: '🏆', id: '1f3c6' }, { emoji: '🚀', id: '1f680' },
]

export function stickerUrl(id: string) {
  return `${STICKER_CDN}/${id}.svg`
}

/** Returns the Twemoji id if the text is a sticker emoji, otherwise null */
export function getStickerMatch(text: string) {
  return STICKERS.find(s => s.emoji === text.trim()) ?? null
}
