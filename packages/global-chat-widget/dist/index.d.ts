import * as react_jsx_runtime from 'react/jsx-runtime';

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
interface OpenSignal {
    /** 可選：要直接開到哪個對話；null/未給＝只開清單視圖 */
    conversationId?: number | null;
    /** 單調遞增指令序號；每次「請打開」都給新值 */
    nonce: number;
}

interface GlobalChatWidgetProps {
    /** Hub base URL（R3 rollback 開關，host 從 NEXT_PUBLIC_MESSAGE_HUB_URL 注入） */
    apiBaseUrl: string;
    /** 取得 access token；hub 不收 cookie auth，必填 */
    getAccessToken: () => Promise<string | null> | string | null;
    /** 來源 app code，會自動帶到每筆 sendMessage 的 sourceApp */
    sourceApp?: string;
    /** 當前登入使用者 id；廣域 hidden 邏輯需要（沒 user id widget 不渲染） */
    myUserId?: number | null;
    /** 全域目前 path；hidden 邏輯（在 /messages 頁時收合 widget）— 由 host 注入避免 widget 直接綁 next/navigation */
    pathname?: string;
    /** 點對話標題去完整對話頁；host 自決路由。不傳則點不開全頁 */
    onOpenFullPage?: (conversationId: number) => void;
    /** 點清單入口去 /messages；host 自決路由。不傳就走 widget 內 list view */
    onOpenInbox?: () => void;
    /** 未讀數變動 callback；host 用來同步 nav badge */
    onUnreadChange?: (count: number) => void;
    /**
     * 上傳附件處理。host 自決如何上傳（rotarycredit 用 /api/upload + Vercel Blob，其他 app
     * 可能用 Hub 的 attachment endpoint 或自家 storage）。
     * 回傳 { url, name, type }；失敗 throw Error。
     */
    onUploadAttachment?: (file: File) => Promise<{
        url: string;
        name: string;
        type: string;
    }>;
    /**
     * 外部指令開啟 widget（D1 私訊，additive optional）。host 帶單調遞增 nonce 表示
     * 「請打開」，可選 conversationId 直接開到某對話。**不傳＝行為 bit-for-bit 不變**
     * （AT-MSG-7；rotaryCredit 不傳＝零影響）。widget 的 open 原本純內部 state、外部
     * 開不了 —— 這 prop 補上「Navbar 訊息圖示點擊 / 建對話成功後跳入」兩個 host 需求。
     */
    openSignal?: OpenSignal | null;
    /**
     * 顯示「新對話」入口（D1 私訊，additive optional）。有傳才在清單 header 渲染「新對話」
     * 鈕，點擊交還 host 開發起對話 dialog。**不傳＝鈕不出現、與現狀相同**（AT-MSG-7）。
     */
    onComposeNew?: () => void;
    /** 預留主題客製化（v1 未實作；佔欄位避 break change） */
    theme?: {
        primary?: string;
    };
}
declare function GlobalChatWidget({ apiBaseUrl, getAccessToken, sourceApp, myUserId, pathname, onOpenFullPage, onOpenInbox, onUnreadChange, onUploadAttachment, openSignal, onComposeNew, }: GlobalChatWidgetProps): react_jsx_runtime.JSX.Element | null;

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
interface ConversationSummary {
    id: number;
    other: {
        id: number;
        contactName: string;
        rotaryClubName: string;
        lastSeenAt: string | null;
    };
    latestMessage: HubMessage | null;
    unreadCount: number;
    updatedAt: string | null;
}
interface ConversationRow {
    id: number;
    participant1Id: number;
    participant2Id: number;
    createdAt: string | null;
    updatedAt: string | null;
    deletedByParticipant1At: string | null;
    deletedByParticipant2At: string | null;
    p1VisibleFrom: string | null;
    p2VisibleFrom: string | null;
}
interface HubMessage {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    attachmentUrl: string | null;
    attachmentName: string | null;
    attachmentType: string | null;
    replyToId: number | null;
    replyToContent: string | null;
    replyToSenderName: string | null;
    readAt: string | null;
    createdAt: string | null;
    clientMessageId?: string | null;
    sourceApp?: string | null;
}
interface UserSummary {
    id: number;
    contactName: string;
    rotaryClubName: string;
    lastSeenAt: string | null;
}
interface ConversationDetail {
    messages: HubMessage[];
    other: UserSummary | undefined;
}
interface BlockRow {
    blockerId: number;
    blockedId: number;
    createdAt: string | null;
}
interface SendMessageInput {
    content?: string;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
    attachmentType?: string | null;
    replyToId?: number | null;
    replyToContent?: string | null;
    replyToSenderName?: string | null;
    /** 來源 app code（'rotarycredit' / 'wahoot' / 'account-rotary'）— widget 注入 */
    sourceApp?: string;
    /** 由 SDK 自動產生，呼叫端不需要傳；保留 override 給冪等重試測試 */
    clientMessageId?: string;
}

export { type BlockRow, type ConversationDetail, type ConversationRow, type ConversationSummary, GlobalChatWidget, type GlobalChatWidgetProps, type HubMessage, type OpenSignal, type SendMessageInput, type UserSummary };
