'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft, Reply, FileText, Paperclip, Smile, Send, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

// src/GlobalChatWidget.tsx

// src/internal/stickers.ts
var STICKER_CDN = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg";
var STICKERS = [
  { emoji: "\u{1F60A}", id: "1f60a" },
  { emoji: "\u{1F602}", id: "1f602" },
  { emoji: "\u{1F970}", id: "1f970" },
  { emoji: "\u{1F60E}", id: "1f60e" },
  { emoji: "\u{1F605}", id: "1f605" },
  { emoji: "\u{1F62D}", id: "1f62d" },
  { emoji: "\u{1F624}", id: "1f624" },
  { emoji: "\u{1F914}", id: "1f914" },
  { emoji: "\u{1F634}", id: "1f634" },
  { emoji: "\u{1F917}", id: "1f917" },
  { emoji: "\u{1F618}", id: "1f618" },
  { emoji: "\u{1F643}", id: "1f643" },
  { emoji: "\u{1F607}", id: "1f607" },
  { emoji: "\u{1F929}", id: "1f929" },
  { emoji: "\u{1F60B}", id: "1f60b" },
  { emoji: "\u{1F923}", id: "1f923" },
  { emoji: "\u{1F44D}", id: "1f44d" },
  { emoji: "\u{1F44E}", id: "1f44e" },
  { emoji: "\u{1F44F}", id: "1f44f" },
  { emoji: "\u{1F64F}", id: "1f64f" },
  { emoji: "\u{1F91D}", id: "1f91d" },
  { emoji: "\u{1F4AA}", id: "1f4aa" },
  { emoji: "\u{1F44B}", id: "1f44b" },
  { emoji: "\u{1F91E}", id: "1f91e" },
  { emoji: "\u{1F389}", id: "1f389" },
  { emoji: "\u{1F525}", id: "1f525" },
  { emoji: "\u{1F495}", id: "1f495" },
  { emoji: "\u{1F4AF}", id: "1f4af" },
  { emoji: "\u2B50", id: "2b50" },
  { emoji: "\u{1F3AF}", id: "1f3af" },
  { emoji: "\u{1F3C6}", id: "1f3c6" },
  { emoji: "\u{1F680}", id: "1f680" }
];
function stickerUrl(id) {
  return `${STICKER_CDN}/${id}.svg`;
}
function getStickerMatch(text) {
  return STICKERS.find((s) => s.emoji === text.trim()) ?? null;
}

// src/internal/messageClient.ts
var MessageHubError = class extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "MessageHubError";
  }
  status;
  code;
};
function defaultUuid() {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
var MessageClient = class {
  apiBaseUrl;
  getAccessToken;
  sourceApp;
  fetchImpl;
  uuidImpl;
  constructor(config) {
    this.apiBaseUrl = config.apiBaseUrl.replace(/\/+$/, "");
    this.getAccessToken = config.getAccessToken;
    this.sourceApp = config.sourceApp;
    this.fetchImpl = config.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.uuidImpl = config.uuidImpl ?? defaultUuid;
  }
  // ── Internal helper ────────────────────────────────────────────────
  async authHeaders() {
    const token = await this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  /**
   * Standard JSON envelope handler。處理 hub 標準 `{success, data, error, code}` 格式。
   * Throws MessageHubError on failure；回 data on success。
   */
  async requestJson(path, init = {}, envelopeKey = "data") {
    const url = `${this.apiBaseUrl}${path}`;
    const auth = await this.authHeaders();
    const res = await this.fetchImpl(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...auth,
        ...init.headers ?? {}
      }
    });
    let body = {};
    try {
      body = await res.json();
    } catch {
      throw new MessageHubError(
        `Hub \u56DE\u61C9\u975E JSON\uFF08status=${res.status}\uFF09`,
        res.status
      );
    }
    if (!res.ok || body.success === false) {
      throw new MessageHubError(
        body.error ?? `Hub \u8ACB\u6C42\u5931\u6557\uFF08status=${res.status}\uFF09`,
        res.status,
        body.code
      );
    }
    if (envelopeKey === "count") {
      return body.count;
    }
    return body.data;
  }
  // ── 1. listConversations ──────────────────────────────────────────
  /** GET /api/hub/messages — 列出對話清單 + 最新訊息 + 未讀數 */
  async listConversations() {
    return this.requestJson("/api/hub/messages");
  }
  // ── 2. createOrGetConversation ────────────────────────────────────
  /**
   * POST /api/hub/messages — 建立或取得既有對話。
   * 雙向找，restore my soft-delete view if previously deleted。
   */
  async createOrGetConversation(targetUserId) {
    return this.requestJson("/api/hub/messages", {
      method: "POST",
      body: JSON.stringify({ targetUserId })
    });
  }
  // ── 3. getConversation ────────────────────────────────────────────
  /**
   * GET /api/hub/messages/[id]?since=N — 列訊息。
   * `since` 為訊息 id cursor，poll 時帶上一次最大 id。
   */
  async getConversation(conversationId, opts = {}) {
    const qs = opts.since != null ? `?since=${opts.since}` : "";
    return this.requestJson(`/api/hub/messages/${conversationId}${qs}`);
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
  async sendMessage(conversationId, input) {
    const clientMessageId = input.clientMessageId ?? this.uuidImpl();
    const sourceApp = input.sourceApp ?? this.sourceApp;
    return this.requestJson(`/api/hub/messages/${conversationId}`, {
      method: "POST",
      body: JSON.stringify({
        content: input.content ?? "",
        attachmentUrl: input.attachmentUrl ?? null,
        attachmentName: input.attachmentName ?? null,
        attachmentType: input.attachmentType ?? null,
        replyToId: input.replyToId ?? null,
        replyToContent: input.replyToContent ?? null,
        replyToSenderName: input.replyToSenderName ?? null,
        clientMessageId,
        sourceApp: sourceApp ?? null
      })
    });
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
  async deleteConversation(conversationId) {
    await this.requestJson(`/api/hub/messages/${conversationId}`, {
      method: "DELETE"
    });
  }
  // ── 6. markRead ───────────────────────────────────────────────────
  /**
   * PATCH /api/hub/messages/[id]/read — 標記對方來訊為已讀。
   *
   * Verb 是 PATCH 不是 POST（R2 對等性，rotarycredit 用 PATCH）。
   */
  async markRead(conversationId) {
    await this.requestJson(`/api/hub/messages/${conversationId}/read`, {
      method: "PATCH"
    });
  }
  // ── 7. getUnreadCount ─────────────────────────────────────────────
  /**
   * GET /api/hub/messages/unread — 全域未讀數。
   *
   * Quirk：response shape 是 `{ success, count }`，不是 `{ success, data }`。
   */
  async getUnreadCount() {
    return this.requestJson("/api/hub/messages/unread", {}, "count");
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
  getAttachmentUrl(attachmentId) {
    return `${this.apiBaseUrl}/api/hub/messages/attachment/${attachmentId}`;
  }
  /**
   * 真正下載附件 BLOB（含 Authorization header）。
   * Caller 自行 createObjectURL / revokeObjectURL。
   */
  async fetchAttachment(attachmentId) {
    const url = this.getAttachmentUrl(attachmentId);
    const auth = await this.authHeaders();
    const res = await this.fetchImpl(url, { headers: auth });
    if (!res.ok) {
      throw new MessageHubError(
        `\u4E0B\u8F09\u9644\u4EF6\u5931\u6557\uFF08status=${res.status}\uFF09`,
        res.status
      );
    }
    return res.blob();
  }
  // ── 9. blockUser / unblockUser ────────────────────────────────────
  /** POST /api/hub/blocks — 加封鎖；冪等（重複封同人回現有 row） */
  async blockUser(targetUserId) {
    return this.requestJson("/api/hub/blocks", {
      method: "POST",
      body: JSON.stringify({ targetUserId })
    });
  }
  /** DELETE /api/hub/blocks/[blocked_id] — 解封；冪等（不存在也回 success） */
  async unblockUser(blockedUserId) {
    await this.requestJson(`/api/hub/blocks/${blockedUserId}`, {
      method: "DELETE"
    });
  }
};

// src/GlobalChatWidget.tsx
var ONLINE_MS = 45 * 1e3;
function isOnline(lastSeenAt) {
  if (!lastSeenAt) return false;
  return Date.now() - (/* @__PURE__ */ new Date(lastSeenAt.replace(" ", "T") + "Z")).getTime() < ONLINE_MS;
}
function GlobalChatWidget({
  apiBaseUrl,
  getAccessToken,
  sourceApp,
  myUserId,
  pathname = "",
  onOpenFullPage,
  onOpenInbox,
  onUnreadChange,
  onUploadAttachment
}) {
  const clientRef = useRef(null);
  if (!clientRef.current || clientRef.current.__apiBaseUrl !== apiBaseUrl) {
    clientRef.current = new MessageClient({ apiBaseUrl, getAccessToken, sourceApp });
    clientRef.current.__apiBaseUrl = apiBaseUrl;
  }
  const client = clientRef.current;
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [convs, setConvs] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [stickerOpen, setStickerOpen] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const lastIdRef = useRef(0);
  const isSendingRef = useRef(false);
  const isAtBottomRef = useRef(true);
  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const openRef = useRef(false);
  const dismissedRef = useRef(false);
  const prevUnreadRef = useRef(-1);
  const prevHiddenRef = useRef(true);
  const hidden = pathname.startsWith("/messages");
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  const refreshUnread = useCallback(async () => {
    try {
      const n = await client.getUnreadCount();
      setUnread(n);
      onUnreadChange?.(n);
    } catch {
    }
  }, [client, onUnreadChange]);
  useEffect(() => {
    if (!myUserId) return;
    refreshUnread();
    const t = setInterval(refreshUnread, 3e4);
    return () => clearInterval(t);
  }, [myUserId, refreshUnread]);
  useEffect(() => {
    if (prevHiddenRef.current && !hidden) {
      setOpen(false);
      setActiveConvId(null);
      setMsgs([]);
      setConvs([]);
      refreshUnread();
    }
    prevHiddenRef.current = hidden;
  }, [hidden, refreshUnread]);
  useEffect(() => {
    const prev = prevUnreadRef.current;
    prevUnreadRef.current = unread;
    if (hidden) return;
    if (openRef.current) return;
    if (unread === 0) {
      dismissedRef.current = false;
      return;
    }
    const isNewMessages = prev === -1 || unread > prev;
    if (isNewMessages) dismissedRef.current = false;
    if (dismissedRef.current) return;
    if (!isNewMessages) return;
    client.listConversations().then((allConvs) => {
      const unreadConvs = allConvs.filter((c) => c.unreadCount > 0);
      if (unreadConvs.length === 1) {
        setConvs(allConvs);
        setOpen(true);
        openConv(unreadConvs[0].id);
      } else if (unreadConvs.length > 1) {
        onOpenInbox?.();
      }
    }).catch(() => {
    });
  }, [unread, hidden]);
  const fetchConvs = useCallback(() => {
    client.listConversations().then(setConvs).catch(() => {
    });
  }, [client]);
  useEffect(() => {
    if (open && !activeConvId) fetchConvs();
  }, [open, activeConvId, fetchConvs]);
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs]);
  function handleScroll() {
    const el = scrollContainerRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }
  const poll = useCallback(async () => {
    if (!activeConvId) return;
    try {
      const detail = await client.getConversation(activeConvId, { since: lastIdRef.current });
      const newMsgs = detail.messages;
      if (newMsgs.length > 0) {
        setMsgs((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const toAdd = newMsgs.filter((m) => !seen.has(m.id));
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
        });
        lastIdRef.current = newMsgs.at(-1).id;
      }
    } catch {
    }
  }, [activeConvId, client]);
  useEffect(() => {
    if (!activeConvId) return;
    const t = setInterval(poll, 2e3);
    return () => clearInterval(t);
  }, [poll, activeConvId]);
  useEffect(() => {
    if (!activeConvId) return;
    const t = setInterval(() => {
      client.getConversation(activeConvId).then((d) => {
        setMsgs(d.messages);
        lastIdRef.current = d.messages.at(-1)?.id ?? lastIdRef.current;
      }).catch(() => {
      });
    }, 3e4);
    return () => clearInterval(t);
  }, [activeConvId, client]);
  useEffect(() => {
    if (pendingFile?.type.startsWith("image/")) {
      const url = URL.createObjectURL(pendingFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [pendingFile]);
  function openConv(convId) {
    setActiveConvId(convId);
    setMsgs([]);
    lastIdRef.current = 0;
    isAtBottomRef.current = true;
    client.getConversation(convId).then((d) => {
      setMsgs(d.messages);
      lastIdRef.current = d.messages.at(-1)?.id ?? 0;
    }).catch(() => {
    });
    client.markRead(convId).catch(() => {
    });
    setTimeout(refreshUnread, 300);
  }
  async function send() {
    if (!activeConvId) return;
    const content = draft.trim();
    if (!content && !pendingFile || isSendingRef.current) return;
    isSendingRef.current = true;
    setUploading(true);
    setDraft("");
    const fileToSend = pendingFile;
    const replyTarget = replyTo;
    setPendingFile(null);
    setReplyTo(null);
    try {
      let attachmentUrl = null;
      let attachmentName = null;
      let attachmentType = null;
      if (fileToSend) {
        if (!onUploadAttachment) {
          setUploadError("host app \u672A\u63D0\u4F9B onUploadAttachment \u8655\u7406\u51FD\u5F0F");
          return;
        }
        try {
          const uploaded = await onUploadAttachment(fileToSend);
          attachmentUrl = uploaded.url;
          attachmentName = uploaded.name;
          attachmentType = uploaded.type;
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : "\u4E0A\u50B3\u5931\u6557");
          return;
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
          replyToSenderName: replyTarget ? activeConv && replyTarget.senderId === activeConv.other.id ? activeConv.other.contactName : "\u4F60" : null
        });
        isAtBottomRef.current = true;
        setMsgs((prev) => [...prev, msg]);
        lastIdRef.current = msg.id;
      } catch (err) {
        if (err instanceof MessageHubError) {
          setUploadError(err.message);
        }
      }
    } finally {
      isSendingRef.current = false;
      setUploading(false);
      inputRef.current?.focus();
    }
  }
  async function sendSticker(emoji) {
    if (!activeConvId || isSendingRef.current) return;
    isSendingRef.current = true;
    setStickerOpen(false);
    try {
      const msg = await client.sendMessage(activeConvId, { content: emoji });
      isAtBottomRef.current = true;
      setMsgs((prev) => [...prev, msg]);
      lastIdRef.current = msg.id;
    } catch {
    } finally {
      isSendingRef.current = false;
      inputRef.current?.focus();
    }
  }
  function backToList() {
    setActiveConvId(null);
    setMsgs([]);
    setReplyTo(null);
    setStickerOpen(false);
    fetchConvs();
  }
  if (!mounted || hidden || !myUserId) return null;
  const activeConv = convs.find((c) => c.id === activeConvId);
  const lightbox = lightboxUrl ? createPortal(
    /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[200] bg-black/80 flex items-center justify-center", onClick: () => setLightboxUrl(null) }, /* @__PURE__ */ React.createElement("button", { className: "absolute top-4 right-4 text-white hover:text-gray-300" }, /* @__PURE__ */ React.createElement(X, { size: 28 })), /* @__PURE__ */ React.createElement("img", { src: lightboxUrl, alt: "\u5168\u5716", className: "max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl", onClick: (e) => e.stopPropagation() })),
    document.body
  ) : null;
  const widget = /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2" }, open && /* @__PURE__ */ React.createElement("div", { className: "w-80 bg-white rounded-xl shadow-2xl border flex flex-col overflow-hidden", style: { height: "420px" } }, /* @__PURE__ */ React.createElement("div", { className: "px-3 py-2.5 bg-blue-700 text-white flex items-center justify-between shrink-0" }, activeConvId ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 min-w-0" }, /* @__PURE__ */ React.createElement("button", { onClick: backToList, className: "hover:text-blue-200 shrink-0" }, /* @__PURE__ */ React.createElement(ArrowLeft, { size: 14 })), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setOpen(false);
        if (activeConvId && onOpenFullPage) onOpenFullPage(activeConvId);
      },
      className: "flex items-center gap-1 hover:underline text-left min-w-0"
    },
    /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium truncate" }, activeConv?.other.rotaryClubName ?? "")
  )), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setOpen(false);
    dismissedRef.current = true;
  }, className: "hover:text-blue-200 shrink-0 ml-1" }, /* @__PURE__ */ React.createElement(X, { size: 15 }))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium" }, "\u79C1\u4EBA\u8A0A\u606F"), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setOpen(false);
    dismissedRef.current = true;
  }, className: "hover:text-blue-200" }, /* @__PURE__ */ React.createElement(X, { size: 15 })))), !activeConvId && /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto divide-y divide-gray-100" }, convs.length === 0 && /* @__PURE__ */ React.createElement("p", { className: "text-center text-sm text-gray-400 py-10" }, "\u5C1A\u7121\u5C0D\u8A71"), convs.map((conv) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: conv.id,
      onClick: () => openConv(conv.id),
      className: "w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 text-left transition-colors"
    },
    /* @__PURE__ */ React.createElement("div", { className: "relative shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-semibold text-sm" }, conv.other.rotaryClubName.slice(0, 1)), isOnline(conv.other.lastSeenAt) && /* @__PURE__ */ React.createElement("span", { className: "absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" })),
    /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-gray-900 truncate" }, conv.other.rotaryClubName), conv.latestMessage?.createdAt && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-gray-400 shrink-0 ml-1" }, formatDistanceToNow(/* @__PURE__ */ new Date(conv.latestMessage.createdAt.replace(" ", "T") + "Z"), { locale: zhTW, addSuffix: true }))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mt-0.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-gray-500 truncate" }, conv.latestMessage?.content ?? "\u5C1A\u7121\u8A0A\u606F"), conv.unreadCount > 0 && /* @__PURE__ */ React.createElement("span", { className: "ml-1 shrink-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1" }, conv.unreadCount > 99 ? "99+" : conv.unreadCount)))
  ))), activeConvId && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { ref: scrollContainerRef, onScroll: handleScroll, className: "flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-gray-50" }, msgs.length === 0 && /* @__PURE__ */ React.createElement("p", { className: "text-center text-xs text-gray-400 py-6" }, "\u958B\u59CB\u50B3\u9001\u7B2C\u4E00\u5247\u8A0A\u606F\u5427\uFF01"), msgs.map((msg) => {
    const isMine = activeConv ? msg.senderId !== activeConv.other.id : false;
    return /* @__PURE__ */ React.createElement("div", { key: msg.id, className: `group flex flex-col ${isMine ? "items-end" : "items-start"}` }, /* @__PURE__ */ React.createElement("div", { className: `flex items-end gap-1 ${isMine ? "flex-row-reverse" : "flex-row"}` }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setReplyTo(msg);
          inputRef.current?.focus();
        },
        className: "opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-blue-500 shrink-0 mb-1",
        title: "\u56DE\u8986"
      },
      /* @__PURE__ */ React.createElement(Reply, { size: 12 })
    ), /* @__PURE__ */ React.createElement("div", { className: `max-w-[80%] px-2.5 py-1.5 rounded-xl text-sm ${isMine ? "bg-blue-600 text-white" : "bg-white shadow-sm text-gray-900"}` }, msg.replyToContent != null && /* @__PURE__ */ React.createElement("div", { className: `mb-1 px-1.5 py-1 rounded text-xs border-l-2 ${isMine ? "border-blue-300 bg-blue-500 text-blue-100" : "border-gray-300 bg-gray-100 text-gray-500"}` }, /* @__PURE__ */ React.createElement("p", { className: "font-medium" }, msg.replyToSenderName), /* @__PURE__ */ React.createElement("p", { className: "truncate" }, msg.replyToContent || "\u9644\u4EF6")), msg.content && (() => {
      const sm = getStickerMatch(msg.content);
      return sm ? /* @__PURE__ */ React.createElement("img", { src: stickerUrl(sm.id), alt: sm.emoji, className: "w-14 h-14" }) : /* @__PURE__ */ React.createElement("p", { className: "whitespace-pre-wrap break-words" }, msg.content);
    })(), msg.attachmentUrl ? msg.attachmentType?.startsWith("image/") ? /* @__PURE__ */ React.createElement("button", { onClick: () => setLightboxUrl(msg.attachmentUrl), className: "mt-1 block" }, /* @__PURE__ */ React.createElement("img", { src: msg.attachmentUrl, alt: msg.attachmentName ?? "\u5716\u7247", className: "max-w-[160px] max-h-[160px] rounded-lg object-cover cursor-zoom-in hover:opacity-90 transition-opacity" })) : /* @__PURE__ */ React.createElement(
      "a",
      {
        href: msg.attachmentUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        className: `flex items-center gap-1.5 mt-1 text-xs ${isMine ? "text-blue-100 hover:text-white" : "text-gray-600 hover:text-gray-900"}`
      },
      /* @__PURE__ */ React.createElement(FileText, { size: 12 }),
      /* @__PURE__ */ React.createElement("span", { className: "truncate max-w-[120px]" }, msg.attachmentName ?? "\u9644\u4EF6")
    ) : !msg.content && msg.replyToContent == null && /* @__PURE__ */ React.createElement("p", { className: "text-xs opacity-60" }, "\u9644\u4EF6\u5DF2\u904E\u671F"))), isMine && msg.readAt && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-gray-400 mt-0.5 px-1" }, "\u5DF2\u8B80"));
  }), /* @__PURE__ */ React.createElement("div", { ref: bottomRef })), replyTo && /* @__PURE__ */ React.createElement("div", { className: "px-2 py-1.5 bg-blue-50 border-t flex items-center gap-2 text-xs shrink-0" }, /* @__PURE__ */ React.createElement(Reply, { size: 11, className: "text-blue-500 shrink-0" }), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-blue-600 font-medium" }, replyTo.replyToSenderName ?? (activeConv && replyTo.senderId === activeConv.other.id ? activeConv.other.contactName : "\u4F60")), /* @__PURE__ */ React.createElement("p", { className: "text-gray-500 truncate" }, replyTo.content || replyTo.attachmentName || "\u9644\u4EF6")), /* @__PURE__ */ React.createElement("button", { onClick: () => setReplyTo(null), className: "hover:text-red-500 shrink-0" }, /* @__PURE__ */ React.createElement(X, { size: 11 }))), pendingFile && /* @__PURE__ */ React.createElement("div", { className: "px-2 py-1.5 bg-blue-50 border-t shrink-0" }, previewUrl ? /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-2" }, /* @__PURE__ */ React.createElement("img", { src: previewUrl, alt: "\u9810\u89BD", className: "max-h-[80px] max-w-[120px] rounded-lg object-cover border border-blue-200" }), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0 mt-0.5" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-blue-700 truncate" }, pendingFile.name), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-blue-400 mt-0.5" }, "\u6309\u9001\u51FA\u9375\u4E0A\u50B3")), /* @__PURE__ */ React.createElement("button", { onClick: () => setPendingFile(null), className: "shrink-0 text-gray-400 hover:text-red-500" }, /* @__PURE__ */ React.createElement(X, { size: 12 }))) : /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-xs text-blue-700" }, /* @__PURE__ */ React.createElement(FileText, { size: 12 }), /* @__PURE__ */ React.createElement("span", { className: "flex-1 truncate" }, pendingFile.name), /* @__PURE__ */ React.createElement("button", { onClick: () => setPendingFile(null), className: "hover:text-red-500" }, /* @__PURE__ */ React.createElement(X, { size: 12 })))), uploadError && /* @__PURE__ */ React.createElement("div", { className: "px-2 py-1.5 bg-red-50 border-t flex items-center gap-1.5 text-xs text-red-600 shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "flex-1" }, uploadError), /* @__PURE__ */ React.createElement("button", { onClick: () => setUploadError(null), className: "hover:text-red-800" }, /* @__PURE__ */ React.createElement(X, { size: 11 }))), stickerOpen && /* @__PURE__ */ React.createElement("div", { className: "px-2 py-2 border-t bg-white grid grid-cols-8 gap-1 shrink-0" }, STICKERS.map((s) => /* @__PURE__ */ React.createElement("button", { key: s.id, onClick: () => sendSticker(s.emoji), className: "hover:bg-gray-100 rounded-lg p-0.5 transition-colors flex items-center justify-center" }, /* @__PURE__ */ React.createElement("img", { src: stickerUrl(s.id), alt: s.emoji, className: "w-7 h-7" })))), /* @__PURE__ */ React.createElement("div", { className: "px-2 py-2 border-t flex gap-1.5 shrink-0 bg-white" }, /* @__PURE__ */ React.createElement("input", { ref: fileInputRef, type: "file", className: "hidden", onChange: (e) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 3 * 1024 * 1024) {
      setUploadError("\u6A94\u6848\u5927\u5C0F\u4E0D\u53EF\u8D85\u904E 3 MB");
      e.target.value = "";
      return;
    }
    setPendingFile(file);
  } }), /* @__PURE__ */ React.createElement("button", { onClick: () => fileInputRef.current?.click(), className: "shrink-0 p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors", title: "\u9644\u52A0\u6A94\u6848" }, /* @__PURE__ */ React.createElement(Paperclip, { size: 15 })), /* @__PURE__ */ React.createElement("button", { onClick: () => setStickerOpen((o) => !o), className: `shrink-0 p-1.5 rounded-lg transition-colors ${stickerOpen ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-600"}`, title: "\u8CBC\u5716" }, /* @__PURE__ */ React.createElement(Smile, { size: 15 })), /* @__PURE__ */ React.createElement(
    "input",
    {
      ref: inputRef,
      className: "flex-1 text-sm border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500",
      placeholder: "\u8F38\u5165\u8A0A\u606F\u2026",
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          send();
        }
      },
      autoFocus: true
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: send,
      disabled: !draft.trim() && !pendingFile || uploading,
      className: "p-2 bg-blue-600 text-white rounded-lg disabled:opacity-40 hover:bg-blue-700 transition-colors"
    },
    /* @__PURE__ */ React.createElement(Send, { size: 14 })
  )))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        if (open) dismissedRef.current = true;
        setOpen((o) => !o);
      },
      className: "w-12 h-12 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-lg flex items-center justify-center transition-colors relative"
    },
    /* @__PURE__ */ React.createElement(MessageCircle, { size: 22 }),
    unread > 0 && /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none" }, unread > 99 ? "99+" : unread)
  ));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, lightbox, createPortal(widget, document.body));
}

export { GlobalChatWidget };
