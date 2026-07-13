'use client'
/**
 * GlobalChatWidget — single source of truth chat UI for SSO message hub.
 *
 * Lego v1.2 §3.5 + §7 F4：rotarycredit 既有 535 行 GlobalChatWidget 改造後搬入此 package。
 *
 * Changes vs rotarycredit baseline (R2 守門員：UI/操作 100% 不變)：
 *   1. 內部 fetch('/api/messages/...') → 改用 MessageClient SDK（注入 apiBaseUrl）
 *   2. 移除 `@/context/unread` 強耦合 — 改用內部 unread state + onUnreadChange callback
 *      讓 host 同步到 nav badge（與 rotarycredit 既有 useUnread context 行為等價）
 *   3. router.push 路由 → 改用 onOpenFullPage callback prop（host 自決路由；rotarycredit
 *      可傳 () => router.push('/messages/{id}')，wahoot 可不傳就只顯示 inline view）
 *   4. POST /attachment 上傳改 props.onUploadAttachment (host 自決如何處理檔案上傳，因
 *      rotarycredit 用 Vercel Blob、其他 child app 可能用不同 storage — 不寫死 endpoint)
 *
 * 不變的部分（R2）：
 *   - 視覺像素：position / 尺寸 / 顏色 / 動畫全部不變
 *   - 操作模式：auto-pop / dismiss / inline chat / sticker panel / lightbox / reply
 *   - polling 間隔：2s / 30s 與 rotarycredit 完全一致
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MessageCircle, X, Send, ArrowLeft, Paperclip, FileText, Reply, Smile, MessageSquarePlus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { STICKERS, stickerUrl, getStickerMatch } from './internal/stickers'
import { MessageClient, MessageHubError } from './internal/messageClient'
import type { ConversationSummary, HubMessage } from './internal/messageClient'
import { isNewOpenSignal, type OpenSignal } from './internal/widgetSignals'

const ONLINE_MS = 45 * 1000

function isOnline(lastSeenAt: string | null) {
  if (!lastSeenAt) return false
  return Date.now() - new Date(lastSeenAt.replace(' ', 'T') + 'Z').getTime() < ONLINE_MS
}

// ────────────────────────────────────────────────────────────────────
// Props — 公開契約（host app 看到的就這幾個）
// ────────────────────────────────────────────────────────────────────

export interface GlobalChatWidgetProps {
  /** Hub base URL（R3 rollback 開關，host 從 NEXT_PUBLIC_MESSAGE_HUB_URL 注入） */
  apiBaseUrl: string
  /** 取得 access token；hub 不收 cookie auth，必填 */
  getAccessToken: () => Promise<string | null> | string | null
  /** 來源 app code，會自動帶到每筆 sendMessage 的 sourceApp */
  sourceApp?: string
  /** 當前登入使用者 id；廣域 hidden 邏輯需要（沒 user id widget 不渲染） */
  myUserId?: number | null
  /** 全域目前 path；hidden 邏輯（在 /messages 頁時收合 widget）— 由 host 注入避免 widget 直接綁 next/navigation */
  pathname?: string
  /** 點對話標題去完整對話頁；host 自決路由。不傳則點不開全頁 */
  onOpenFullPage?: (conversationId: number) => void
  /** 點清單入口去 /messages；host 自決路由。不傳就走 widget 內 list view */
  onOpenInbox?: () => void
  /** 未讀數變動 callback；host 用來同步 nav badge */
  onUnreadChange?: (count: number) => void
  /**
   * 上傳附件處理。host 自決如何上傳（rotarycredit 用 /api/upload + Vercel Blob，其他 app
   * 可能用 Hub 的 attachment endpoint 或自家 storage）。
   * 回傳 { url, name, type }；失敗 throw Error。
   */
  onUploadAttachment?: (file: File) => Promise<{ url: string; name: string; type: string }>
  /**
   * 外部指令開啟 widget（D1 私訊，additive optional）。host 帶單調遞增 nonce 表示
   * 「請打開」，可選 conversationId 直接開到某對話。**不傳＝行為 bit-for-bit 不變**
   * （AT-MSG-7；rotaryCredit 不傳＝零影響）。widget 的 open 原本純內部 state、外部
   * 開不了 —— 這 prop 補上「Navbar 訊息圖示點擊 / 建對話成功後跳入」兩個 host 需求。
   */
  openSignal?: OpenSignal | null
  /**
   * 顯示「新對話」入口（D1 私訊，additive optional）。有傳才在清單 header 渲染「新對話」
   * 鈕，點擊交還 host 開發起對話 dialog。**不傳＝鈕不出現、與現狀相同**（AT-MSG-7）。
   */
  onComposeNew?: () => void
  /** 預留主題客製化（v1 未實作；佔欄位避 break change） */
  theme?: { primary?: string }
}

// ────────────────────────────────────────────────────────────────────

export function GlobalChatWidget({
  apiBaseUrl,
  getAccessToken,
  sourceApp,
  myUserId,
  pathname = '',
  onOpenFullPage,
  onOpenInbox,
  onUnreadChange,
  onUploadAttachment,
  openSignal,
  onComposeNew,
}: GlobalChatWidgetProps) {
  // ── SDK instance（apiBaseUrl/token callback 變動時 re-create）──────
  const clientRef = useRef<MessageClient | null>(null)
  if (!clientRef.current ||
      (clientRef.current as unknown as { __apiBaseUrl?: string }).__apiBaseUrl !== apiBaseUrl) {
    clientRef.current = new MessageClient({ apiBaseUrl, getAccessToken, sourceApp })
    ;(clientRef.current as unknown as { __apiBaseUrl?: string }).__apiBaseUrl = apiBaseUrl
  }
  const client = clientRef.current

  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [convs, setConvs] = useState<ConversationSummary[]>([])
  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const [msgs, setMsgs] = useState<HubMessage[]>([])
  const [draft, setDraft] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [replyTo, setReplyTo] = useState<HubMessage | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [stickerOpen, setStickerOpen] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const lastIdRef = useRef(0)
  const isSendingRef = useRef(false)
  const isAtBottomRef = useRef(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const openRef = useRef(false)
  const dismissedRef = useRef(false)
  const prevUnreadRef = useRef(-1)
  const prevHiddenRef = useRef(true)
  const prevOpenNonceRef = useRef<number | null>(null)
  const hidden = pathname.startsWith('/messages')

  useEffect(() => setMounted(true), [])
  useEffect(() => { openRef.current = open }, [open])

  // ── Unread 同步：refetch + bubble up ──────────────────────────────
  const refreshUnread = useCallback(async () => {
    try {
      const n = await client.getUnreadCount()
      setUnread(n)
      onUnreadChange?.(n)
    } catch {
      // 靜默失敗（網路抖動），下一輪 polling 會補
    }
  }, [client, onUnreadChange])

  // 初始 + 每 30s 拉一次
  useEffect(() => {
    if (!myUserId) return
    refreshUnread()
    const t = setInterval(refreshUnread, 30000)
    return () => clearInterval(t)
  }, [myUserId, refreshUnread])

  // 從 /messages 全頁回來時 reset state（避免顯示過期清單）
  useEffect(() => {
    if (prevHiddenRef.current && !hidden) {
      setOpen(false)
      setActiveConvId(null)
      setMsgs([])
      setConvs([])
      refreshUnread()
    }
    prevHiddenRef.current = hidden
  }, [hidden, refreshUnread])

  // Auto-pop：未讀變多時自動展開（單對話）或跳到 /messages（多對話）
  useEffect(() => {
    const prev = prevUnreadRef.current
    prevUnreadRef.current = unread

    if (hidden) return
    if (openRef.current) return
    if (unread === 0) { dismissedRef.current = false; return }

    const isNewMessages = prev === -1 || unread > prev
    if (isNewMessages) dismissedRef.current = false
    if (dismissedRef.current) return
    if (!isNewMessages) return

    client.listConversations()
      .then((allConvs) => {
        const unreadConvs = allConvs.filter(c => c.unreadCount > 0)
        if (unreadConvs.length === 1) {
          setConvs(allConvs)
          setOpen(true)
          openConv(unreadConvs[0].id)
        } else if (unreadConvs.length > 1) {
          onOpenInbox?.()
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unread, hidden])

  // Fetch conversation list when panel opens
  const fetchConvs = useCallback(() => {
    client.listConversations()
      .then(setConvs)
      .catch(() => {})
  }, [client])

  useEffect(() => {
    if (open && !activeConvId) fetchConvs()
  }, [open, activeConvId, fetchConvs])

  // 外部指令開啟（D1，openSignal）：nonce 變新才觸發一次，同 nonce re-render 不重複彈開。
  // openSignal 不傳（rotaryCredit 現行用法）→ isNewOpenSignal 恆 false → 此 effect 為 no-op。
  useEffect(() => {
    if (!isNewOpenSignal(prevOpenNonceRef.current, openSignal)) return
    prevOpenNonceRef.current = openSignal!.nonce
    setOpen(true)
    const cid = openSignal!.conversationId
    if (cid != null) {
      fetchConvs()   // 補清單讓 header 顯示對方社名
      openConv(cid)  // 直接開到該對話
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSignal])

  // Scroll to bottom only when already at bottom
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [msgs])

  function handleScroll() {
    const el = scrollContainerRef.current
    if (!el) return
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  // Poll new messages（2s 與 rotarycredit 一致）
  const poll = useCallback(async () => {
    if (!activeConvId) return
    try {
      const detail = await client.getConversation(activeConvId, { since: lastIdRef.current })
      const newMsgs = detail.messages
      if (newMsgs.length > 0) {
        setMsgs(prev => {
          const seen = new Set(prev.map(m => m.id))
          const toAdd = newMsgs.filter(m => !seen.has(m.id))
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev
        })
        lastIdRef.current = newMsgs.at(-1)!.id
      }
    } catch {}
  }, [activeConvId, client])

  useEffect(() => {
    if (!activeConvId) return
    const t = setInterval(poll, 2000)
    return () => clearInterval(t)
  }, [poll, activeConvId])

  // Full refresh every 30s 取 readAt 變動
  useEffect(() => {
    if (!activeConvId) return
    const t = setInterval(() => {
      client.getConversation(activeConvId)
        .then(d => {
          setMsgs(d.messages)
          lastIdRef.current = d.messages.at(-1)?.id ?? lastIdRef.current
        })
        .catch(() => {})
    }, 30000)
    return () => clearInterval(t)
  }, [activeConvId, client])

  useEffect(() => {
    if (pendingFile?.type.startsWith('image/')) {
      const url = URL.createObjectURL(pendingFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl(null)
  }, [pendingFile])

  function openConv(convId: number) {
    setActiveConvId(convId)
    setMsgs([])
    lastIdRef.current = 0
    isAtBottomRef.current = true
    client.getConversation(convId)
      .then(d => {
        setMsgs(d.messages)
        lastIdRef.current = d.messages.at(-1)?.id ?? 0
      })
      .catch(() => {})
    client.markRead(convId).catch(() => {})
    setTimeout(refreshUnread, 300)
  }

  async function send() {
    if (!activeConvId) return
    const content = draft.trim()
    if ((!content && !pendingFile) || isSendingRef.current) return
    isSendingRef.current = true
    setUploading(true)
    setDraft('')
    const fileToSend = pendingFile
    const replyTarget = replyTo
    setPendingFile(null)
    setReplyTo(null)
    try {
      let attachmentUrl: string | null = null
      let attachmentName: string | null = null
      let attachmentType: string | null = null
      if (fileToSend) {
        if (!onUploadAttachment) {
          setUploadError('host app 未提供 onUploadAttachment 處理函式')
          return
        }
        try {
          const uploaded = await onUploadAttachment(fileToSend)
          attachmentUrl = uploaded.url
          attachmentName = uploaded.name
          attachmentType = uploaded.type
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : '上傳失敗')
          return
        }
      }
      try {
        const msg = await client.sendMessage(activeConvId, {
          content,
          attachmentUrl,
          attachmentName,
          attachmentType,
          replyToId: replyTarget?.id ?? null,
          replyToContent: replyTarget?.content ?? null,
          replyToSenderName: replyTarget
            ? (activeConv && replyTarget.senderId === activeConv.other.id
                ? activeConv.other.contactName
                : '你')
            : null,
        })
        isAtBottomRef.current = true
        setMsgs(prev => [...prev, msg])
        lastIdRef.current = msg.id
      } catch (err) {
        if (err instanceof MessageHubError) {
          setUploadError(err.message)
        }
      }
    } finally {
      isSendingRef.current = false
      setUploading(false)
      inputRef.current?.focus()
    }
  }

  async function sendSticker(emoji: string) {
    if (!activeConvId || isSendingRef.current) return
    isSendingRef.current = true
    setStickerOpen(false)
    try {
      const msg = await client.sendMessage(activeConvId, { content: emoji })
      isAtBottomRef.current = true
      setMsgs(prev => [...prev, msg])
      lastIdRef.current = msg.id
    } catch {} finally {
      isSendingRef.current = false
      inputRef.current?.focus()
    }
  }

  function backToList() {
    setActiveConvId(null)
    setMsgs([])
    setReplyTo(null)
    setStickerOpen(false)
    fetchConvs()
  }

  if (!mounted || hidden || !myUserId) return null

  const activeConv = convs.find(c => c.id === activeConvId)

  const lightbox = lightboxUrl ? createPortal(
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center" onClick={() => setLightboxUrl(null)}>
      <button className="absolute top-4 right-4 text-white hover:text-gray-300"><X size={28} /></button>
      <img src={lightboxUrl} alt="全圖" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
    </div>,
    document.body
  ) : null

  const widget = (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="w-80 bg-white rounded-xl shadow-2xl border flex flex-col overflow-hidden" style={{ height: '420px' }}>
          {/* Header */}
          <div className="px-3 py-2.5 bg-blue-700 text-white flex items-center justify-between shrink-0">
            {activeConvId ? (
              <>
                <div className="flex items-center gap-1.5 min-w-0">
                  <button onClick={backToList} className="hover:text-blue-200 shrink-0">
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    onClick={() => { setOpen(false); if (activeConvId && onOpenFullPage) onOpenFullPage(activeConvId) }}
                    className="flex items-center gap-1 hover:underline text-left min-w-0"
                  >
                    <span className="text-sm font-medium truncate">{activeConv?.other.rotaryClubName ?? ''}</span>
                  </button>
                </div>
                <button onClick={() => { setOpen(false); dismissedRef.current = true }} className="hover:text-blue-200 shrink-0 ml-1"><X size={15} /></button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium">私人訊息</span>
                  {onComposeNew && (
                    <button
                      onClick={onComposeNew}
                      className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 rounded px-1.5 py-0.5 transition-colors"
                      title="新對話"
                      aria-label="新對話"
                    >
                      <MessageSquarePlus size={13} />
                      新對話
                    </button>
                  )}
                </div>
                <button onClick={() => { setOpen(false); dismissedRef.current = true }} className="hover:text-blue-200 shrink-0"><X size={15} /></button>
              </>
            )}
          </div>

          {/* Conversation list */}
          {!activeConvId && (
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {convs.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-10">尚無對話</p>
              )}
              {convs.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => openConv(conv.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-semibold text-sm">
                      {conv.other.rotaryClubName.slice(0, 1)}
                    </div>
                    {isOnline(conv.other.lastSeenAt) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">{conv.other.rotaryClubName}</span>
                      {conv.latestMessage?.createdAt && (
                        <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                          {formatDistanceToNow(new Date(conv.latestMessage.createdAt.replace(' ', 'T') + 'Z'), { locale: zhTW, addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-gray-500 truncate">{conv.latestMessage?.content ?? '尚無訊息'}</span>
                      {conv.unreadCount > 0 && (
                        <span className="ml-1 shrink-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                          {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Inline chat view */}
          {activeConvId && (
            <>
              <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-gray-50">
                {msgs.length === 0 && (
                  <p className="text-center text-xs text-gray-400 py-6">開始傳送第一則訊息吧！</p>
                )}
                {msgs.map(msg => {
                  const isMine = activeConv ? msg.senderId !== activeConv.other.id : false
                  return (
                    <div key={msg.id} className={`group flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-end gap-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                        <button
                          onClick={() => { setReplyTo(msg); inputRef.current?.focus() }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-blue-500 shrink-0 mb-1"
                          title="回覆"
                        >
                          <Reply size={12} />
                        </button>
                        <div className={`max-w-[80%] px-2.5 py-1.5 rounded-xl text-sm ${isMine ? 'bg-blue-600 text-white' : 'bg-white shadow-sm text-gray-900'}`}>
                          {msg.replyToContent != null && (
                            <div className={`mb-1 px-1.5 py-1 rounded text-xs border-l-2 ${isMine ? 'border-blue-300 bg-blue-500 text-blue-100' : 'border-gray-300 bg-gray-100 text-gray-500'}`}>
                              <p className="font-medium">{msg.replyToSenderName}</p>
                              <p className="truncate">{msg.replyToContent || '附件'}</p>
                            </div>
                          )}
                          {msg.content && (() => {
                            const sm = getStickerMatch(msg.content)
                            return sm
                              ? <img src={stickerUrl(sm.id)} alt={sm.emoji} className="w-14 h-14" />
                              : <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          })()}
                          {msg.attachmentUrl ? (
                            msg.attachmentType?.startsWith('image/') ? (
                              <button onClick={() => setLightboxUrl(msg.attachmentUrl!)} className="mt-1 block">
                                <img src={msg.attachmentUrl} alt={msg.attachmentName ?? '圖片'} className="max-w-[160px] max-h-[160px] rounded-lg object-cover cursor-zoom-in hover:opacity-90 transition-opacity" />
                              </button>
                            ) : (
                              <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer"
                                className={`flex items-center gap-1.5 mt-1 text-xs ${isMine ? 'text-blue-100 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                                <FileText size={12} />
                                <span className="truncate max-w-[120px]">{msg.attachmentName ?? '附件'}</span>
                              </a>
                            )
                          ) : (!msg.content && msg.replyToContent == null && <p className="text-xs opacity-60">附件已過期</p>)}
                        </div>
                      </div>
                      {isMine && msg.readAt && (
                        <span className="text-[10px] text-gray-400 mt-0.5 px-1">已讀</span>
                      )}
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
              {replyTo && (
                <div className="px-2 py-1.5 bg-blue-50 border-t flex items-center gap-2 text-xs shrink-0">
                  <Reply size={11} className="text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-blue-600 font-medium">{replyTo.replyToSenderName ?? (activeConv && replyTo.senderId === activeConv.other.id ? activeConv.other.contactName : '你')}</p>
                    <p className="text-gray-500 truncate">{replyTo.content || replyTo.attachmentName || '附件'}</p>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="hover:text-red-500 shrink-0"><X size={11} /></button>
                </div>
              )}
              {pendingFile && (
                <div className="px-2 py-1.5 bg-blue-50 border-t shrink-0">
                  {previewUrl ? (
                    <div className="flex items-start gap-2">
                      <img src={previewUrl} alt="預覽" className="max-h-[80px] max-w-[120px] rounded-lg object-cover border border-blue-200" />
                      <div className="flex-1 min-w-0 mt-0.5">
                        <p className="text-xs text-blue-700 truncate">{pendingFile.name}</p>
                        <p className="text-[10px] text-blue-400 mt-0.5">按送出鍵上傳</p>
                      </div>
                      <button onClick={() => setPendingFile(null)} className="shrink-0 text-gray-400 hover:text-red-500"><X size={12} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <FileText size={12} />
                      <span className="flex-1 truncate">{pendingFile.name}</span>
                      <button onClick={() => setPendingFile(null)} className="hover:text-red-500"><X size={12} /></button>
                    </div>
                  )}
                </div>
              )}
              {uploadError && (
                <div className="px-2 py-1.5 bg-red-50 border-t flex items-center gap-1.5 text-xs text-red-600 shrink-0">
                  <span className="flex-1">{uploadError}</span>
                  <button onClick={() => setUploadError(null)} className="hover:text-red-800"><X size={11} /></button>
                </div>
              )}
              {stickerOpen && (
                <div className="px-2 py-2 border-t bg-white grid grid-cols-8 gap-1 shrink-0">
                  {STICKERS.map(s => (
                    <button key={s.id} onClick={() => sendSticker(s.emoji)} className="hover:bg-gray-100 rounded-lg p-0.5 transition-colors flex items-center justify-center">
                      <img src={stickerUrl(s.id)} alt={s.emoji} className="w-7 h-7" />
                    </button>
                  ))}
                </div>
              )}
              <div className="px-2 py-2 border-t flex gap-1.5 shrink-0 bg-white">
                {/* 附件上傳 UI 只在 host 有注入 onUploadAttachment 時出現（F17 契約：host 自決）。
                    不注入＝迴紋針與 file input 都不渲染（rotarysso D5 無附件；credit 有注入不受影響）。 */}
                {onUploadAttachment && (
                  <>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={e => {
                      const file = e.target.files?.[0] ?? null
                      if (file && file.size > 3 * 1024 * 1024) {
                        setUploadError('檔案大小不可超過 3 MB')
                        e.target.value = ''
                        return
                      }
                      setPendingFile(file)
                    }} />
                    <button onClick={() => fileInputRef.current?.click()} className="shrink-0 p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors" title="附加檔案">
                      <Paperclip size={15} />
                    </button>
                  </>
                )}
                <button onClick={() => setStickerOpen(o => !o)} className={`shrink-0 p-1.5 rounded-lg transition-colors ${stickerOpen ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600'}`} title="貼圖">
                  <Smile size={15} />
                </button>
                <input
                  ref={inputRef}
                  className="flex-1 text-sm border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="輸入訊息…"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
                  autoFocus
                />
                <button
                  onClick={send}
                  disabled={(!draft.trim() && !pendingFile) || uploading}
                  className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-40 hover:bg-blue-700 transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => { if (open) dismissedRef.current = true; setOpen(o => !o) }}
        className="w-12 h-12 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-lg flex items-center justify-center transition-colors relative"
      >
        <MessageCircle size={22} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
    </div>
  )

  return <>{lightbox}{createPortal(widget, document.body)}</>
}
