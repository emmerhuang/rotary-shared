/**
 * @rotary/global-chat-widget — public exports.
 *
 * Host app（rotarycredit / wahoot / account-rotary）只 import 這個檔案。
 * `internal/*` 是實作細節，不對 host 暴露。
 */

export { GlobalChatWidget } from './GlobalChatWidget'
export type { GlobalChatWidgetProps } from './GlobalChatWidget'

// 對外暴露 wire types — host 拿來型別化 onUnreadChange 之類的 callback 參數
export type {
  ConversationSummary,
  ConversationRow,
  HubMessage,
  UserSummary,
  ConversationDetail,
  BlockRow,
  SendMessageInput,
} from './internal/messageClient'
