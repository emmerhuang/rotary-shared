import { useState, useRef, useEffect, useCallback } from 'react'
import { fallbackColor, initial, isSafeIconUrl } from './internal/icon'

/** 單一 app 條目。route-agnostic：url 是最終可直接跳轉的絕對網址，元件不組任何路由。 */
export interface LauncherApp {
  /** 穩定唯一鍵（rotarysso 傳 clientId）；決定 fallback 顏色與「目前」比對。 */
  key: string
  /** 顯示名稱。 */
  name: string
  /** 點擊跳轉的最終網址（新分頁開啟）。 */
  url: string
  /** 圖示網址；缺失 / 非 https 時 graceful fallback 成色塊+首字。 */
  iconUrl?: string | null
}

export interface AppLauncherProps {
  /**
   * 已解析好的 app 清單（controlled 模式）。提供此 prop 即直接渲染、不 fetch。
   * 與 fetchApps 二擇一；tests 與簡單 host 用這個。
   */
  apps?: LauncherApp[] | null
  /**
   * 惰性取清單函式（async 模式）。首次開啟時呼叫一次；回 null ⇒ graceful degrade。
   * route-agnostic：元件不知道資料從哪來（rotarysso 注入 () => fetch('/api/apps')…）。
   */
  fetchApps?: () => Promise<LauncherApp[] | null>
  /** 目前所在 app 的 key → 標「目前」；rotarysso（IdP 不在清單）傳 null/undefined ⇒ 無標示。 */
  currentAppKey?: string | null
  /** footer「查看全部應用」連結（可選）。 */
  moreUrl?: string
  /** 觸發器 aria-label / tooltip，預設「應用服務」。 */
  label?: string
  /** 觸發器 className 透傳，供 host 調色以貼合自家 navbar（高反差）。 */
  className?: string
}

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; apps: LauncherApp[] }
  | { status: 'error' }

function initialState(apps: LauncherApp[] | null | undefined): LoadState {
  return apps != null ? { status: 'ready', apps } : { status: 'idle' }
}

export function AppLauncher({
  apps,
  fetchApps,
  currentAppKey,
  moreUrl,
  label = '應用服務',
  className,
}: AppLauncherProps) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const [state, setState] = useState<LoadState>(() => initialState(apps))
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const fetchedRef = useRef(false)

  // controlled 模式：parent 更新 apps 時同步。
  useEffect(() => {
    if (apps != null) setState({ status: 'ready', apps })
  }, [apps])

  const loadApps = useCallback(async () => {
    if (!fetchApps || fetchedRef.current) return
    fetchedRef.current = true
    setState({ status: 'loading' })
    try {
      const result = await fetchApps()
      setState(result ? { status: 'ready', apps: result } : { status: 'error' })
    } catch {
      setState({ status: 'error' })
    }
  }, [fetchApps])

  const toggle = useCallback(() => {
    setOpen(prev => {
      const next = !prev
      if (next && apps == null) void loadApps()
      return next
    })
  }, [apps, loadApps])

  const close = useCallback(() => setOpen(false), [])

  // click-outside 關閉
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // Esc 關閉 + focus 回到觸發器
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={label}
        title={label}
        onClick={toggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={className}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, padding: 0, border: 'none',
          // 中性灰 overlay：於深色 navbar 與淺色 host 皆可見（跨 host 自足，不依賴 host CSS）
          background: hover || open ? 'rgba(127,127,127,0.18)' : 'transparent',
          color: 'currentColor', cursor: 'pointer', borderRadius: 8,
        }}
      >
        <WaffleIcon />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={label}
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 50,
            width: 288, maxWidth: '92vw', background: '#ffffff', color: '#111827',
            borderRadius: 12, border: '1px solid #e5e7eb',
            boxShadow: '0 8px 28px rgba(0,0,0,0.18)', padding: 12, fontSize: 14,
          }}
        >
          <PanelBody
            state={state}
            currentAppKey={currentAppKey ?? null}
            moreUrl={moreUrl}
            onNavigate={close}
          />
        </div>
      )}
    </div>
  )
}

function WaffleIcon() {
  const rows = [0, 1, 2]
  const cols = [0, 1, 2]
  const dots = rows.flatMap(r => cols.map(c => ({ cx: 4 + c * 8, cy: 4 + r * 8, k: `${r}-${c}` })))
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {dots.map(d => <circle key={d.k} cx={d.cx} cy={d.cy} r={2} fill="currentColor" />)}
    </svg>
  )
}

function PanelBody({
  state, currentAppKey, moreUrl, onNavigate,
}: {
  state: LoadState
  currentAppKey: string | null
  moreUrl?: string
  onNavigate: () => void
}) {
  if (state.status === 'idle' || state.status === 'loading') {
    return <SkeletonGrid />
  }
  if (state.status === 'error') {
    return (
      <div>
        <p style={{ margin: '8px 4px', color: '#6b7280' }}>暫時無法載入應用清單</p>
        {moreUrl && <MoreLink moreUrl={moreUrl} onNavigate={onNavigate} />}
      </div>
    )
  }
  if (state.apps.length === 0) {
    return <p style={{ margin: '12px 4px', color: '#6b7280' }}>目前尚無可用的應用系統</p>
  }
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {state.apps.map(app => (
          <AppTile
            key={app.key}
            app={app}
            current={currentAppKey != null && app.key === currentAppKey}
            onNavigate={onNavigate}
          />
        ))}
      </div>
      {moreUrl && (
        <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 10, paddingTop: 8 }}>
          <MoreLink moreUrl={moreUrl} onNavigate={onNavigate} />
        </div>
      )}
    </>
  )
}

function AppTile({
  app, current, onNavigate,
}: {
  app: LauncherApp
  current: boolean
  onNavigate: () => void
}) {
  const base = {
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 6,
    padding: '10px 6px', borderRadius: 10, textDecoration: 'none',
    color: '#111827', textAlign: 'center' as const,
  }
  const inner = (
    <>
      <AppIcon app={app} />
      <span style={{ fontSize: 14, lineHeight: 1.25, maxHeight: '2.5em', overflow: 'hidden', color: '#111827' }}>
        {app.name}
      </span>
    </>
  )
  if (current) {
    // 目前 app：不導航，點擊只關 popover（與 Google waffle 一致）。
    return (
      <button
        type="button"
        role="menuitem"
        aria-current="true"
        title={`${app.name}（目前）`}
        onClick={onNavigate}
        style={{ ...base, border: 'none', outline: '2px solid #2563eb', background: '#eff6ff', cursor: 'default', font: 'inherit' }}
      >
        {inner}
      </button>
    )
  }
  return (
    <a
      role="menuitem"
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      title={app.name}
      onClick={onNavigate}
      style={{ ...base, background: 'transparent' }}
    >
      {inner}
    </a>
  )
}

// 所有圖示（含 fallback）共用的固定正方形 tile 尺寸，確保有 logo / 無 logo 視覺對齊。
const ICON_TILE = 40

function AppIcon({ app }: { app: LauncherApp }) {
  const [broken, setBroken] = useState(false)
  const showImg = isSafeIconUrl(app.iconUrl) && !broken
  if (showImg) {
    // 固定正方形容器（淺底 + 1px 邊框）給 logo 明確視覺邊界；
    // 寬扁 / 直長 logo 以 contain 等比縮入置中留白，與 fallback 色塊 tile 同尺寸對齊。
    return (
      <span
        data-testid="app-icon-tile"
        style={{
          width: ICON_TILE, height: ICON_TILE, borderRadius: 10, boxSizing: 'border-box',
          background: '#f1f5f9', border: '1px solid #e5e7eb', padding: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}
      >
        <img
          src={app.iconUrl as string}
          alt=""
          // contain：非正方形 logo 等比縮入容器、留白置中，不裁切
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          onError={() => setBroken(true)}
        />
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      data-testid="app-icon-tile"
      style={{
        width: ICON_TILE, height: ICON_TILE, borderRadius: 10, boxSizing: 'border-box',
        background: fallbackColor(app.key),
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 700,
      }}
    >
      {initial(app.name)}
    </span>
  )
}

function MoreLink({ moreUrl, onNavigate }: { moreUrl: string; onNavigate: () => void }) {
  return (
    <a
      href={moreUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      style={{ display: 'block', textAlign: 'center', fontSize: 14, color: '#2563eb', textDecoration: 'none', padding: 4 }}
    >
      查看全部應用 →
    </a>
  )
}

function SkeletonGrid() {
  return (
    <div data-testid="launcher-skeleton" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 6px' }}>
          <span style={{ width: 40, height: 40, borderRadius: 10, background: '#f0f0f0' }} />
          <span style={{ width: '70%', height: 8, borderRadius: 4, background: '#f0f0f0' }} />
        </div>
      ))}
    </div>
  )
}
