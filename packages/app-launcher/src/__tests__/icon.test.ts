import { describe, it, expect } from 'vitest'
import { fallbackColor, initial, isSafeIconUrl } from '../internal/icon'

describe('fallbackColor', () => {
  it('確定性：同 key 兩次同色', () => {
    expect(fallbackColor('acc')).toBe(fallbackColor('acc'))
  })
  it('回傳調色盤 hex', () => {
    expect(fallbackColor('anything')).toMatch(/^#[0-9a-f]{6}$/i)
  })
  it('不同 key 可得不同色（palette 分布 sanity）', () => {
    const colors = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(fallbackColor))
    expect(colors.size).toBeGreaterThan(1)
  })
})

describe('initial', () => {
  it('CJK 取首字', () => { expect(initial('扶輪會計大師')).toBe('扶') })
  it('英文首字大寫', () => { expect(initial('wahoot')).toBe('W') })
  it('空字串 → ?', () => { expect(initial('')).toBe('?') })
  it('前後空白裁切', () => { expect(initial('  photoTeam ')).toBe('P') })
})

describe('isSafeIconUrl', () => {
  it('https 通過', () => { expect(isSafeIconUrl('https://cdn.example.com/x.png')).toBe(true) })
  it('http 拒絕', () => { expect(isSafeIconUrl('http://x/y.png')).toBe(false) })
  it('javascript: 拒絕', () => { expect(isSafeIconUrl('javascript:alert(1)')).toBe(false) })
  it('data: 拒絕', () => { expect(isSafeIconUrl('data:image/png;base64,AAAA')).toBe(false) })
  it('null / undefined / 空 → false', () => {
    expect(isSafeIconUrl(null)).toBe(false)
    expect(isSafeIconUrl(undefined)).toBe(false)
    expect(isSafeIconUrl('')).toBe(false)
  })
  it('壞格式 URL → false（不 throw）', () => { expect(isSafeIconUrl('not a url')).toBe(false) })
})
