/**
 * messageClient — internal SDK wrapping all 9 hub endpoints.
 *
 * Lego v1.2 §3.4：SDK 是 widget package 的內部依賴，host app 不直接 import。
 * Host app 看到的契約是 <GlobalChatWidget> props；SDK 是實作細節。
 *
 * Why these 9 method (and not 7 like Lego §3.4 列的)：
 *   §3.4 列了 7 個（list / get / send / read / unread / attachment / blocks），但實際
 *   widget 用得到的是 9 個 — 因為 §3.2 endpoint table 把「create-or-get conv」（POST
 *   /api/hub/messages）跟「send message」（POST /api/hub/messages/[id]）算成兩個動作，
 *   且 F3 已新增的 blocks endpoint 是 POST + DELETE 兩個 method。Widget 完整可用必須
 *   全包，所以本 SDK 暴露 9 個 method：
 *
 *     1. listConversations        → GET    /api/hub/messages
 *     2. createOrGetConversation  → POST   /api/hub/messages
 *     3. getConversation          → GET    /api/hub/messages/[id]
 *     4. sendMessage              → POST   /api/hub/messages/[id]
 *     5. deleteConversation       → DELETE /api/hub/messages/[id]   ← F4 順手補（前為 stub）
 *     6. markRead                 → PATCH  /api/hub/messages/[id]/read
 *     7. getUnreadCount           → GET    /api/hub/messages/unread
 *     8. getAttachmentUrl         → GET    /api/hub/messages/attachment/[id]（回 URL，不下載）
 *     9. blockUser / unblockUser  → POST/DELETE /api/hub/blocks*
 *
 * API 對等性 (R2) quirks 完整保留：
 *   - /unread 回 `{ success, count }` 不是 `{ success, data }`
 *   - /[id]/read 用 PATCH 不是 POST
 *   - /attachment/[id] 401 是空 body（這個 SDK 只組 URL 不 fetch BLOB，由 widget <img src=...> 處理）
 *
 * Auth：
 *   每 request Bearer token 由 host 注入 — SDK 接 `getAccessToken: () => Promise<string | null>` 而
 *   不是把 token 字串直存實例上，這樣 token refresh 後 widget 不需要重 mount。
 *
 * Idempotency (RISK-6 切換窗口防護):
 *   sendMessage 自動產 `clientMessageId` UUID 並帶到 hub。Hub 端遇相同 (senderId, clientMessageId)
 *   會回現有 row，而非重複 insert。詳見 rotarysso/app/api/hub/messages/[id]/route.ts L159-179。
 */

// ────────────────────────────────────────────────────────────────────
// Wire types — 與 hub response shape 1:1 對齊
// ────────────────────────────────────────────────────────────────────

export interface ConversationSummary {
  id: number
  other: {
    id: number
    contactName: string
    rotaryClubName: string
    lastSeenAt: string | null
  }
  latestMessage: HubMessage | null
  unreadCount: number
  updatedAt: string | null
}

export interface ConversationRow {
  id: number
  participant1Id: number
  participant2Id: number
  createdAt: string | null
  updatedAt: string | null
  deletedByParticipant1At: string | null
  deletedByParticipant2At: string | null
  p1VisibleFrom: string | null
  p2VisibleFrom: string | null
}

export interface HubMessage {
  id: number
  conversationId: number
  senderId: number
  content: string
  attachmentUrl: string | null
  attachmentName: string | null
  attachmentType: string | null
  replyToId: number | null
  replyToContent: string | null
  replyToSenderName: string | null
  readAt: string | null
  createdAt: string | null
  clientMessageId?: string | null
  sourceApp?: string | null
}

export interface UserSummary {
  id: number
  contactName: string
  rotaryClubName: string
  lastSeenAt: string | null
}

export interface ConversationDetail {
  messages: HubMessage[]
  other: UserSummary | undefined
}

export interface BlockRow {
  blockerId: number
  blockedId: number
  createdAt: string | null
}

export interface SendMessageInput {
  content?: string
  attachmentUrl?: string | null
  attachmentName?: string | null
  attachmentType?: string | null
  replyToId?: number | null
  replyToContent?: string | null
  replyToSenderName?: string | null
  /** 來源 app code（'rotarycredit' / 'wahoot' / 'account-rotary'）— widget 注入 */
  sourceApp?: string
  /** 由 SDK 自動產生，呼叫端不需要傳；保留 override 給冪等重試測試 */
  clientMessageId?: string
}

// ────────────────────────────────────────────────────────────────────
// Errors
// ────────────────────────────────────────────────────────────────────

/**
 * 包裝 hub 回的錯誤，讓 widget UI 能依 status / code 決定怎麼顯示。
 */
export class MessageHubError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'MessageHubError'
  }
}

// ────────────────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────────────────

export interface MessageClientConfig {
  /** Hub base URL，例如 https://rotarysso.vercel.app（不含 /api 前綴） */
  apiBaseUrl: string
  /** 取得當前 access token；回 null 表示未登入（SDK 會跳過 Authorization header） */
  getAccessToken: () => Promise<string | null> | string | null
  /** 來源 app code，會自動帶到 sendMessage 的 sourceApp 欄位 */
  sourceApp?: string
  /** 自訂 fetch（測試用）。預設用 globalThis.fetch */
  fetchImpl?: typeof fetch
  /** 自訂 UUID 產生器（測試用）。預設用 crypto.randomUUID */
  uuidImpl?: () => string
}

// ────────────────────────────────────────────────────────────────────
// Helper：UUID 產生（瀏覽器 crypto.randomUUID）
// ────────────────────────────────────────────────────────────────────

function defaultUuid(): string {
  // crypto.randomUUID 在現代瀏覽器 / Node 19+ 都有；舊環境 fallback。
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }
  // RFC4122 v4 fallback（純 Math.random 版本，僅給超舊環境）
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ────────────────────────────────────────────────────────────────────
// MessageClient
// ────────────────────────────────────────────────────────────────────

export class MessageClient {
  private readonly apiBaseUrl: string
  private readonly getAccessToken: MessageClientConfig['getAccessToken']
  private readonly sourceApp?: string
  private readonly fetchImpl: typeof fetch
  private readonly uuidImpl: () => string

  constructor(config: MessageClientConfig) {
    // strip trailing slash so '/api/hub/...' 接得起來
    this.apiBaseUrl = config.apiBaseUrl.replace(/\/+$/, '')
    this.getAccessToken = config.getAccessToken
    this.sourceApp = config.sourceApp
    this.fetchImpl = config.fetchImpl ?? globalThis.fetch.bind(globalThis)
    this.uuidImpl = config.uuidImpl ?? defaultUuid
  }

  // ── Internal helper ────────────────────────────────────────────────

  private async authHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  /**
   * Standard JSON envelope handler。處理 hub 標準 `{success, data, error, code}` 格式。
   * Throws MessageHubError on failure；回 data on success。
   */
  private async requestJson<T>(
    path: string,
    init: RequestInit = {},
    /** envelope key — 'data' (預設) 或 'count' (unread 例外) */
    envelopeKey: 'data' | 'count' = 'data',
  ): Promise<T> {
    const url = `${this.apiBaseUrl}${path}`
    const auth = await this.authHeaders()
    const res = await this.fetchImpl(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...auth,
        ...(init.headers ?? {}),
      },
    })

    let body: { success?: boolean; data?: unknown; count?: number; error?: string; code?: string } = {}
    try {
      body = await res.json()
    } catch {
      // Non-JSON response — 包成 hub error 讓 caller 知道
      throw new MessageHubError(
        `Hub 回應非 JSON（status=${res.status}）`,
        res.status,
      )
    }

    if (!res.ok || body.success === false) {
      throw new MessageHubError(
        body.error ?? `Hub 請求失敗（status=${res.status}）`,
        res.status,
        body.code,
      )
    }

    if (envelopeKey === 'count') {
      // unread quirk：rotarycredit ships `{success, count}`，不是 `{success, data}`
      return body.count as unknown as T
    }
    return body.data as T
  }

  // ── 1. listConversations ──────────────────────────────────────────

  /** GET /api/hub/messages — 列出對話清單 + 最新訊息 + 未讀數 */
  async listConversations(): Promise<ConversationSummary[]> {
    return this.requestJson<ConversationSummary[]>('/api/hub/messages')
  }

  // ── 2. createOrGetConversation ────────────────────────────────────

  /**
   * POST /api/hub/messages — 建立或取得既有對話。
   * 雙向找，restore my soft-delete view if previously deleted。
   */
  async createOrGetConversation(targetUserId: number): Promise<ConversationRow> {
    return this.requestJson<ConversationRow>('/api/hub/messages', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    })
  }

  // ── 3. getConversation ────────────────────────────────────────────

  /**
   * GET /api/hub/messages/[id]?since=N — 列訊息。
   * `since` 為訊息 id cursor，poll 時帶上一次最大 id。
   */
  async getConversation(
    conversationId: number,
    opts: { since?: number } = {},
  ): Promise<ConversationDetail> {
    const qs = opts.since != null ? `?since=${opts.since}` : ''
    return this.requestJson<ConversationDetail>(`/api/hub/messages/${conversationId}${qs}`)
  }

  // ── 4. sendMessage ────────────────────────────────────────────────

  /**
   * POST /api/hub/messages/[id] — 送訊息。
   *
   * 自動產 clientMessageId UUID（除非 caller 自帶；測試會用）。
   * 自動帶 sourceApp（從 client config 帶）。
   *
   * Idempotency 由 hub 端保證：同一 sender 的同 UUID 回現有 row 而非重複 insert。
   */
  async sendMessage(conversationId: number, input: SendMessageInput): Promise<HubMessage> {
    const clientMessageId = input.clientMessageId ?? this.uuidImpl()
    const sourceApp = input.sourceApp ?? this.sourceApp
    return this.requestJson<HubMessage>(`/api/hub/messages/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({
        content: input.content ?? '',
        attachmentUrl: input.attachmentUrl ?? null,
        attachmentName: input.attachmentName ?? null,
        attachmentType: input.attachmentType ?? null,
        replyToId: input.replyToId ?? null,
        replyToContent: input.replyToContent ?? null,
        replyToSenderName: input.replyToSenderName ?? null,
        clientMessageId,
        sourceApp: sourceApp ?? null,
      }),
    })
  }

  // ── 5. deleteConversation ─────────────────────────────────────────

  /**
   * DELETE /api/hub/messages/[id] — 軟刪除對話（雙方都刪才硬刪）。
   *
   * F4 補實作（F3 為 stub）。對等於 rotarycredit `DELETE /api/messages/[id]`：
   *   - 設 conversations.deletedByParticipantNAt + pNVisibleFrom = now
   *   - 雙方都刪 → hard delete row
   *   - 對方既已刪除狀態下我方再 delete 也照流程走（對方收到新訊息會 restore，與此無關）
   */
  async deleteConversation(conversationId: number): Promise<void> {
    await this.requestJson<unknown>(`/api/hub/messages/${conversationId}`, {
      method: 'DELETE',
    })
  }

  // ── 6. markRead ───────────────────────────────────────────────────

  /**
   * PATCH /api/hub/messages/[id]/read — 標記對方來訊為已讀。
   *
   * Verb 是 PATCH 不是 POST（R2 對等性，rotarycredit 用 PATCH）。
   */
  async markRead(conversationId: number): Promise<void> {
    await this.requestJson<unknown>(`/api/hub/messages/${conversationId}/read`, {
      method: 'PATCH',
    })
  }

  // ── 7. getUnreadCount ─────────────────────────────────────────────

  /**
   * GET /api/hub/messages/unread — 全域未讀數。
   *
   * Quirk：response shape 是 `{ success, count }`，不是 `{ success, data }`。
   */
  async getUnreadCount(): Promise<number> {
    return this.requestJson<number>('/api/hub/messages/unread', {}, 'count')
  }

  // ── 8. getAttachmentUrl ───────────────────────────────────────────

  /**
   * 組附件下載 URL — 不執行 fetch（widget <img src=...> 由瀏覽器發 request）。
   *
   * ⚠ 瀏覽器 <img> 不會自帶 Authorization header。Hub auth 走 cookie 不接受，所以
   * 附件 URL 必須由 widget 在 fetch + objectURL 模式下取得 BLOB（或由 host app
   * proxy）。但既有 rotarycredit widget 目前直接用 <img src={attachmentUrl}>，那是
   * 因為 attachmentUrl 是 vercel-blob URL（外部 CDN），不是這個 endpoint。
   *
   * 本 method 留給 widget 內 fetch BLOB 模式（`fetchAttachment` below），實際 widget
   * UI 仍可繼續用 attachmentUrl 直接顯示外部 CDN 連結。
   */
  getAttachmentUrl(attachmentId: number): string {
    return `${this.apiBaseUrl}/api/hub/messages/attachment/${attachmentId}`
  }

  /**
   * 真正下載附件 BLOB（含 Authorization header）。
   * Caller 自行 createObjectURL / revokeObjectURL。
   */
  async fetchAttachment(attachmentId: number): Promise<Blob> {
    const url = this.getAttachmentUrl(attachmentId)
    const auth = await this.authHeaders()
    const res = await this.fetchImpl(url, { headers: auth })
    if (!res.ok) {
      throw new MessageHubError(
        `下載附件失敗（status=${res.status}）`,
        res.status,
      )
    }
    return res.blob()
  }

  // ── 9. blockUser / unblockUser ────────────────────────────────────

  /** POST /api/hub/blocks — 加封鎖；冪等（重複封同人回現有 row） */
  async blockUser(targetUserId: number): Promise<BlockRow> {
    return this.requestJson<BlockRow>('/api/hub/blocks', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    })
  }

  /** DELETE /api/hub/blocks/[blocked_id] — 解封；冪等（不存在也回 success） */
  async unblockUser(blockedUserId: number): Promise<void> {
    await this.requestJson<unknown>(`/api/hub/blocks/${blockedUserId}`, {
      method: 'DELETE',
    })
  }
}
