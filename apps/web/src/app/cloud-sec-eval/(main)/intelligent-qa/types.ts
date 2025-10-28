/**
 * 消息角色类型
 */
export type MessageRole = 'user' | 'assistant'

/**
 * 消息接口
 */
export interface Message {
  /** 消息唯一标识 */
  id: string
  /** 消息角色 */
  role: MessageRole
  /** 消息内容 */
  content: string
  /** 创建时间戳 */
  timestamp: number
}

/**
 * 推荐问题接口
 */
export interface SuggestedQuestion {
  /** 问题唯一标识 */
  id: string
  /** 问题文本 */
  text: string
  /** 问题分类（可选） */
  category?: string
}

/**
 * 问答对接口
 */
export interface QAPair {
  /** 问题 */
  question: string
  /** 答案 */
  answer: string
  /** 关键词（用于匹配） */
  keywords?: string[]
}
