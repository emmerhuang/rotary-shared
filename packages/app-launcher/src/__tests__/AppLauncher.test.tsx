// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AppLauncher, type LauncherApp } from '../index'

const APPS: LauncherApp[] = [
  { key: 'acc', name: '扶輪會計大師', url: 'https://account-rotary.vercel.app', iconUrl: null },
  { key: 'credit', name: 'rotaryCredit', url: 'https://rotarycredit.vercel.app', iconUrl: 'https://cdn.example.com/credit.png' },
  { key: 'evil', name: 'BadApp', url: 'https://bad.example.com', iconUrl: 'javascript:alert(1)' },
]

function trigger() {
  return screen.getByRole('button', { name: '應用服務' })
}
function openPanel() {
  fireEvent.click(trigger())
}

describe('AppLauncher — 觸發器與開合', () => {
  it('初始只渲染觸發器、aria-expanded=false、無 menu', () => {
    render(<AppLauncher apps={APPS} />)
    expect(trigger()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('點觸發器開啟 menu、aria-expanded=true；再點關閉', () => {
    render(<AppLauncher apps={APPS} />)
    openPanel()
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(trigger()).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(trigger())
    expect(screen.queryByRole('menu')).toBeNull()
  })
})

describe('AppLauncher — render grid', () => {
  it('渲染全部 app 名稱', () => {
    render(<AppLauncher apps={APPS} />)
    openPanel()
    expect(screen.getByText('扶輪會計大師')).toBeInTheDocument()
    expect(screen.getByText('rotaryCredit')).toBeInTheDocument()
    expect(screen.getByText('BadApp')).toBeInTheDocument()
  })

  it('一般 app 連結為新分頁 + rel noopener + 正確 href', () => {
    render(<AppLauncher apps={APPS} />)
    openPanel()
    const link = screen.getByText('扶輪會計大師').closest('a')!
    expect(link).toHaveAttribute('href', 'https://account-rotary.vercel.app')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('空清單 → 顯示尚無可用系統', () => {
    render(<AppLauncher apps={[]} />)
    openPanel()
    expect(screen.getByText('目前尚無可用的應用系統')).toBeInTheDocument()
  })
})

describe('AppLauncher — icon fallback', () => {
  it('null iconUrl → fallback 色塊+首字，無 img', () => {
    render(<AppLauncher apps={[APPS[0]]} />)
    openPanel()
    expect(screen.getByText('扶')).toBeInTheDocument()
    expect(document.querySelector('img')).toBeNull()
  })

  it('https iconUrl → 渲染 img', () => {
    render(<AppLauncher apps={[APPS[1]]} />)
    openPanel()
    const img = document.querySelector('img')
    expect(img).not.toBeNull()
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/credit.png')
  })

  it('非正方形圖示縮入正方形（object-contain）不截切', () => {
    render(<AppLauncher apps={[APPS[1]]} />)
    openPanel()
    const img = document.querySelector('img')!
    // 完整縮入正方形容器、留白置中，而非 cover 硬裁
    expect(img.style.objectFit).toBe('contain')
  })

  it('javascript: iconUrl → 不進 DOM，改 fallback（首字 B）', () => {
    render(<AppLauncher apps={[APPS[2]]} />)
    openPanel()
    expect(document.querySelector('img')).toBeNull()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('img onError → 換 fallback tile', () => {
    render(<AppLauncher apps={[APPS[1]]} />)
    openPanel()
    const img = document.querySelector('img')!
    fireEvent.error(img)
    expect(document.querySelector('img')).toBeNull()
    expect(screen.getByText('R')).toBeInTheDocument() // rotaryCredit → R
  })
})

describe('AppLauncher — 當前 app 標示', () => {
  it('currentAppKey 命中 → aria-current 的 menuitem 為 button（非連結），點擊只關閉不導航', () => {
    render(<AppLauncher apps={APPS} currentAppKey="acc" />)
    openPanel()
    const current = screen.getByText('扶輪會計大師').closest('[role="menuitem"]')!
    expect(current.tagName).toBe('BUTTON')
    expect(current).toHaveAttribute('aria-current', 'true')
    // 非目前 app 仍是連結
    expect(screen.getByText('rotaryCredit').closest('a')).not.toBeNull()
    // 點目前 app → 關閉 menu
    fireEvent.click(current)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('未給 currentAppKey → 全部皆連結、無 aria-current', () => {
    render(<AppLauncher apps={APPS} />)
    openPanel()
    expect(screen.getByText('扶輪會計大師').closest('a')).not.toBeNull()
    expect(document.querySelector('[aria-current="true"]')).toBeNull()
  })
})

describe('AppLauncher — click-outside 關閉', () => {
  it('點 menu 外部 → 關閉', () => {
    render(
      <div>
        <AppLauncher apps={APPS} />
        <button>outside</button>
      </div>,
    )
    openPanel()
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByText('outside'))
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('點 menu 內部 → 不關閉', () => {
    render(<AppLauncher apps={APPS} />)
    openPanel()
    fireEvent.mouseDown(screen.getByText('扶輪會計大師'))
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })
})

describe('AppLauncher — 鍵盤 a11y', () => {
  it('Esc 關閉且 focus 回到觸發器', () => {
    render(<AppLauncher apps={APPS} />)
    openPanel()
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(trigger()).toHaveFocus()
  })

  it('觸發器具備 aria-haspopup', () => {
    render(<AppLauncher apps={APPS} />)
    expect(trigger()).toHaveAttribute('aria-haspopup', 'true')
  })
})

describe('AppLauncher — 惰性 fetchApps + graceful degrade', () => {
  beforeEach(() => vi.clearAllMocks())

  it('未開啟前不呼叫 fetchApps；開啟才呼叫一次；重複開合仍只一次', async () => {
    const fetchApps = vi.fn().mockResolvedValue(APPS)
    render(<AppLauncher fetchApps={fetchApps} />)
    expect(fetchApps).not.toHaveBeenCalled()

    openPanel()
    await waitFor(() => expect(screen.getByText('扶輪會計大師')).toBeInTheDocument())
    expect(fetchApps).toHaveBeenCalledTimes(1)

    fireEvent.click(trigger()) // 關
    openPanel()                // 再開
    await waitFor(() => expect(screen.getByText('扶輪會計大師')).toBeInTheDocument())
    expect(fetchApps).toHaveBeenCalledTimes(1)
  })

  it('fetchApps 回 null → 降級訊息 + moreUrl 連結', async () => {
    const fetchApps = vi.fn().mockResolvedValue(null)
    render(<AppLauncher fetchApps={fetchApps} moreUrl="https://rotarysso.vercel.app/apps" />)
    openPanel()
    await waitFor(() => expect(screen.getByText('暫時無法載入應用清單')).toBeInTheDocument())
    const more = screen.getByText('查看全部應用 →').closest('a')!
    expect(more).toHaveAttribute('href', 'https://rotarysso.vercel.app/apps')
  })

  it('fetchApps throw → 降級（不 crash）', async () => {
    const fetchApps = vi.fn().mockRejectedValue(new Error('network'))
    render(<AppLauncher fetchApps={fetchApps} />)
    openPanel()
    await waitFor(() => expect(screen.getByText('暫時無法載入應用清單')).toBeInTheDocument())
  })
})
