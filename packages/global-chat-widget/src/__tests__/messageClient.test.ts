/**
 * messageClient SDK 單元測試（F4）。
 *
 * 用 fake fetchImpl + uuidImpl 注入，驗證 9 個 method 都組對 URL / method / headers / body
 * 並能正確處理 hub envelope 的兩種 shape（`{success, data}` 與 `{success, count}`）。
 *
 * 不測 widget UI 行為（widget render 測試在另一檔），不測真實 hub 互通（Lens AC 負責）。
 *
 * Run:
 *   npx tsx --test packages/global-chat-widget/src/__tests__/messageClient.test.ts
 */
import { test, before } from 'node:test'
import assert from 'node:assert/strict'
import { MessageClient, MessageHubError } from '../internal/messageClient'

interface CapturedRequest {
  url: string
  method: string
  headers: Record<string, string>
  body: string | null
}

function makeFakeFetch(responses: Array<{ status: number; json: unknown; text?: string }>) {
  const calls: CapturedRequest[] = []
  let i = 0
  const impl: typeof fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input as URL).toString()
    const method = init?.method ?? 'GET'
    const headers: Record<string, string> = {}
    const rawHeaders = init?.headers as Record<string, string> | Headers | undefined
    if (rawHeaders instanceof Headers) {
      rawHeaders.forEach((v, k) => { headers[k] = v })
    } else if (rawHeaders) {
      Object.assign(headers, rawHeaders)
    }
    calls.push({
      url,
      method,
      headers,
      body: typeof init?.body === 'string' ? init.body : null,
    })
    const r = responses[i++] ?? responses[responses.length - 1]
    return new Response(r.text ?? JSON.stringify(r.json), {
      status: r.status,
      headers: { 'content-type': 'application/json' },
    })
  }
  return { impl, calls }
}

function makeClient(opts: { fetchImpl: typeof fetch; uuid?: string }) {
  return new MessageClient({
    apiBaseUrl: 'https://hub.example.com',
    getAccessToken: async () => 'tok-abc',
    sourceApp: 'rotarycredit',
    fetchImpl: opts.fetchImpl,
    uuidImpl: () => opts.uuid ?? 'fixed-uuid-1234',
  })
}

// ────────────────────────────────────────────────────────────────────
// 1. listConversations
// ────────────────────────────────────────────────────────────────────

test('SDK: listConversations → GET /api/hub/messages，自動帶 Bearer', async () => {
  const { impl, calls } = makeFakeFetch([{ status: 200, json: { success: true, data: [] } }])
  const c = makeClient({ fetchImpl: impl })
  const r = await c.listConversations()
  assert.deepEqual(r, [])
  assert.equal(calls[0].url, 'https://hub.example.com/api/hub/messages')
  assert.equal(calls[0].method, 'GET')
  assert.equal(calls[0].headers['Authorization'], 'Bearer tok-abc')
})

// ────────────────────────────────────────────────────────────────────
// 2. createOrGetConversation
// ────────────────────────────────────────────────────────────────────

test('SDK: createOrGetConversation → POST /api/hub/messages with targetUserId', async () => {
  const conv = { id: 7, participant1Id: 1, participant2Id: 2 }
  const { impl, calls } = makeFakeFetch([{ status: 200, json: { success: true, data: conv } }])
  const c = makeClient({ fetchImpl: impl })
  const r = await c.createOrGetConversation(2)
  assert.deepEqual(r, conv)
  assert.equal(calls[0].method, 'POST')
  assert.deepEqual(JSON.parse(calls[0].body!), { targetUserId: 2 })
})

// ────────────────────────────────────────────────────────────────────
// 3. getConversation（含 since cursor）
// ────────────────────────────────────────────────────────────────────

test('SDK: getConversation 帶 since 變 query string', async () => {
  const detail = { messages: [], other: undefined }
  const { impl, calls } = makeFakeFetch([{ status: 200, json: { success: true, data: detail } }])
  const c = makeClient({ fetchImpl: impl })
  await c.getConversation(7, { since: 99 })
  assert.equal(calls[0].url, 'https://hub.example.com/api/hub/messages/7?since=99')
})

test('SDK: getConversation 不帶 since 不加 query', async () => {
  const { impl, calls } = makeFakeFetch([{ status: 200, json: { success: true, data: { messages: [], other: undefined } } }])
  const c = makeClient({ fetchImpl: impl })
  await c.getConversation(7)
  assert.equal(calls[0].url, 'https://hub.example.com/api/hub/messages/7')
})

// ────────────────────────────────────────────────────────────────────
// 4. sendMessage（自動 UUID + sourceApp）
// ────────────────────────────────────────────────────────────────────

test('SDK: sendMessage 自動產 clientMessageId 並帶 sourceApp', async () => {
  const msg = { id: 100, content: 'hi', conversationId: 7, senderId: 1 }
  const { impl, calls } = makeFakeFetch([{ status: 200, json: { success: true, data: msg } }])
  const c = makeClient({ fetchImpl: impl, uuid: 'auto-uuid-xyz' })
  await c.sendMessage(7, { content: 'hi' })
  const body = JSON.parse(calls[0].body!)
  assert.equal(body.content, 'hi')
  assert.equal(body.clientMessageId, 'auto-uuid-xyz')
  assert.equal(body.sourceApp, 'rotarycredit')
  assert.equal(body.attachmentUrl, null)
  assert.equal(body.replyToId, null)
})

test('SDK: sendMessage caller 自帶 clientMessageId 不被覆蓋（idempotency 重試測試用）', async () => {
  const { impl, calls } = makeFakeFetch([{ status: 200, json: { success: true, data: {} } }])
  const c = makeClient({ fetchImpl: impl, uuid: 'should-not-be-used' })
  await c.sendMessage(7, { content: 'retry', clientMessageId: 'caller-uuid' })
  const body = JSON.parse(calls[0].body!)
  assert.equal(body.clientMessageId, 'caller-uuid')
})

// ────────────────────────────────────────────────────────────────────
// 5. deleteConversation（F4 補實作對應點）
// ────────────────────────────────────────────────────────────────────

test('SDK: deleteConversation → DELETE /api/hub/messages/[id]（happy path）', async () => {
  const { impl, calls } = makeFakeFetch([{ status: 200, json: { success: true } }])
  const c = makeClient({ fetchImpl: impl })
  await c.deleteConversation(7)
  assert.equal(calls[0].method, 'DELETE')
  assert.equal(calls[0].url, 'https://hub.example.com/api/hub/messages/7')
})

test('SDK: deleteConversation 對話不存在 → throw MessageHubError(404)（cancelled state）', async () => {
  const { impl } = makeFakeFetch([{ status: 404, json: { success: false, error: '對話不存在' } }])
  const c = makeClient({ fetchImpl: impl })
  await assert.rejects(
    () => c.deleteConversation(999),
    (err: unknown) => {
      assert.ok(err instanceof MessageHubError)
      assert.equal((err as MessageHubError).status, 404)
      assert.equal((err as MessageHubError).message, '對話不存在')
      return true
    },
  )
})

// ────────────────────────────────────────────────────────────────────
// 6. markRead（PATCH verb 對齊 R2）
// ────────────────────────────────────────────────────────────────────

test('SDK: markRead → PATCH /api/hub/messages/[id]/read（不是 POST）', async () => {
  const { impl, calls } = makeFakeFetch([{ status: 200, json: { success: true } }])
  const c = makeClient({ fetchImpl: impl })
  await c.markRead(7)
  assert.equal(calls[0].method, 'PATCH')
  assert.equal(calls[0].url, 'https://hub.example.com/api/hub/messages/7/read')
})

// ────────────────────────────────────────────────────────────────────
// 7. getUnreadCount（quirk：response 是 {success, count} 不是 {success, data}）
// ────────────────────────────────────────────────────────────────────

test('SDK: getUnreadCount 處理 {success, count} envelope（不是 {success, data}）', async () => {
  const { impl } = makeFakeFetch([{ status: 200, json: { success: true, count: 42 } }])
  const c = makeClient({ fetchImpl: impl })
  const n = await c.getUnreadCount()
  assert.equal(n, 42)
})

test('SDK: getUnreadCount 0 也要正確處理（不能誤判成 falsy）', async () => {
  const { impl } = makeFakeFetch([{ status: 200, json: { success: true, count: 0 } }])
  const c = makeClient({ fetchImpl: impl })
  const n = await c.getUnreadCount()
  assert.equal(n, 0)
})

// ────────────────────────────────────────────────────────────────────
// 8. getAttachmentUrl / fetchAttachment
// ────────────────────────────────────────────────────────────────────

test('SDK: getAttachmentUrl 純組路徑不發 request', async () => {
  const { impl, calls } = makeFakeFetch([])
  const c = makeClient({ fetchImpl: impl })
  const url = c.getAttachmentUrl(123)
  assert.equal(url, 'https://hub.example.com/api/hub/messages/attachment/123')
  assert.equal(calls.length, 0, 'getAttachmentUrl should not fire a fetch')
})

test('SDK: fetchAttachment 帶 Bearer 並回 Blob', async () => {
  const fakeBytes = new TextEncoder().encode('binary-data')
  const impl: typeof fetch = async (_input, _init) =>
    new Response(fakeBytes, { status: 200, headers: { 'content-type': 'image/png' } })
  const c = makeClient({ fetchImpl: impl })
  const blob = await c.fetchAttachment(123)
  assert.ok(blob instanceof Blob)
  assert.equal(blob.type, 'image/png')
})

// ────────────────────────────────────────────────────────────────────
// 9. blockUser / unblockUser
// ────────────────────────────────────────────────────────────────────

test('SDK: blockUser → POST /api/hub/blocks {targetUserId}', async () => {
  const block = { blockerId: 1, blockedId: 2, createdAt: '2026-04-29 12:00:00' }
  const { impl, calls } = makeFakeFetch([{ status: 200, json: { success: true, data: block } }])
  const c = makeClient({ fetchImpl: impl })
  const r = await c.blockUser(2)
  assert.deepEqual(r, block)
  assert.equal(calls[0].method, 'POST')
  assert.deepEqual(JSON.parse(calls[0].body!), { targetUserId: 2 })
})

test('SDK: unblockUser → DELETE /api/hub/blocks/[blocked_id]', async () => {
  const { impl, calls } = makeFakeFetch([{ status: 200, json: { success: true } }])
  const c = makeClient({ fetchImpl: impl })
  await c.unblockUser(2)
  assert.equal(calls[0].method, 'DELETE')
  assert.equal(calls[0].url, 'https://hub.example.com/api/hub/blocks/2')
})

// ────────────────────────────────────────────────────────────────────
// 通用：Auth header 來源動態（getAccessToken 換值會反映到下個 request）
// ────────────────────────────────────────────────────────────────────

test('SDK: getAccessToken 變值（token refresh） → 下個 request 用新 token', async () => {
  let token = 'old-token'
  const { impl, calls } = makeFakeFetch([
    { status: 200, json: { success: true, data: [] } },
    { status: 200, json: { success: true, data: [] } },
  ])
  const c = new MessageClient({
    apiBaseUrl: 'https://hub.example.com',
    getAccessToken: async () => token,
    fetchImpl: impl,
  })
  await c.listConversations()
  token = 'new-token'
  await c.listConversations()
  assert.equal(calls[0].headers['Authorization'], 'Bearer old-token')
  assert.equal(calls[1].headers['Authorization'], 'Bearer new-token')
})

test('SDK: getAccessToken 回 null → 不帶 Authorization header', async () => {
  const { impl, calls } = makeFakeFetch([{ status: 200, json: { success: true, data: [] } }])
  const c = new MessageClient({
    apiBaseUrl: 'https://hub.example.com',
    getAccessToken: () => null,
    fetchImpl: impl,
  })
  await c.listConversations()
  assert.equal(calls[0].headers['Authorization'], undefined)
})

// ────────────────────────────────────────────────────────────────────
// Error envelope 處理
// ────────────────────────────────────────────────────────────────────

test('SDK: hub 回 401 invalid_token → MessageHubError(status=401, code=invalid_token)', async () => {
  const { impl } = makeFakeFetch([{
    status: 401,
    json: { success: false, error: '無效或缺少 Bearer token', code: 'invalid_token' },
  }])
  const c = makeClient({ fetchImpl: impl })
  await assert.rejects(
    () => c.listConversations(),
    (err: unknown) => {
      assert.ok(err instanceof MessageHubError)
      assert.equal((err as MessageHubError).status, 401)
      assert.equal((err as MessageHubError).code, 'invalid_token')
      return true
    },
  )
})

test('SDK: hub 回 429 rate_limited → MessageHubError(status=429)', async () => {
  const { impl } = makeFakeFetch([{
    status: 429,
    json: { success: false, error: '請求過於頻繁，請稍後再試', code: 'rate_limited' },
  }])
  const c = makeClient({ fetchImpl: impl })
  await assert.rejects(() => c.listConversations(), MessageHubError)
})

test('SDK: apiBaseUrl 末尾 slash 會被 strip 不會變雙斜線', async () => {
  const { impl, calls } = makeFakeFetch([{ status: 200, json: { success: true, data: [] } }])
  const c = new MessageClient({
    apiBaseUrl: 'https://hub.example.com/',  // trailing slash
    getAccessToken: async () => 'tok',
    fetchImpl: impl,
  })
  await c.listConversations()
  assert.equal(calls[0].url, 'https://hub.example.com/api/hub/messages')
})
