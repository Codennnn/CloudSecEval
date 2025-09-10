import { useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import type { ChatMessage, ChatSession, ChatSessionFilters, ChatSessionStats } from '~/types/chat'

import { useLocalStorageArray } from './useLocalStorage'

const STORAGE_KEY = 'doc-chat-sessions'
const MAX_SESSIONS = 100 // 最多保存 100 个会话

// 生成会话 ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// 生成会话标题（基于第一条用户消息）
function generateSessionTitle(messages: ChatMessage[]): string {
  const firstUserMessage = messages.find((msg) => msg.role === 'user')

  if (!firstUserMessage) {
    return '新对话'
  }

  const content = firstUserMessage.content.trim()

  if (content.length <= 30) {
    return content
  }

  return `${content.substring(0, 30)}...`
}

export function useChatSessions() {
  const [sessions, setSessions, removeSessions, isLoading] = useLocalStorageArray<ChatSession>(
    STORAGE_KEY,
    {
      defaultValue: [],
      onError: (error, operation) => {
        console.warn(`聊天会话 ${operation} 操作失败：`, error)
      },
    },
  )

  const sessionsArray = useMemo(() => sessions ?? [], [sessions])

  // 创建新会话
  const createSession = useEvent((initialMessages: ChatMessage[] = []): ChatSession => {
    const now = Date.now()
    const newSession: ChatSession = {
      id: generateSessionId(),
      title: generateSessionTitle(initialMessages),
      messages: initialMessages,
      createdAt: now,
      updatedAt: now,
      archived: false,
      pinned: false,
    }

    setSessions((prev) => {
      const updated = [newSession, ...(prev ?? [])]

      // 保持最大会话数限制，删除最旧的未置顶会话
      if (updated.length > MAX_SESSIONS) {
        const sorted = updated.sort((a, b) => {
          if (a.pinned && !b.pinned) {
            return -1
          }

          if (!a.pinned && b.pinned) {
            return 1
          }

          return b.updatedAt - a.updatedAt
        })

        return sorted.slice(0, MAX_SESSIONS)
      }

      return updated
    })

    return newSession
  })

  // 添加消息到会话
  const appendMessage = useEvent((sessionId: string, message: ChatMessage) => {
    setSessions((prev) => {
      const updated = (prev ?? []).map((session) => {
        if (session.id === sessionId) {
          const messageWithTimestamp = {
            ...message,
            timestamp: message.timestamp ?? Date.now(),
          }
          const updatedMessages = [...session.messages, messageWithTimestamp]

          return {
            ...session,
            messages: updatedMessages,
            title: session.title === '新对话' ? generateSessionTitle(updatedMessages) : session.title,
            updatedAt: Date.now(),
          }
        }

        return session
      })

      // 将更新的会话移到最前面
      const targetIndex = updated.findIndex((s) => s.id === sessionId)

      if (targetIndex > 0) {
        const targetSession = updated[targetIndex]
        updated.splice(targetIndex, 1)
        updated.unshift(targetSession)
      }

      return updated
    })
  })

  // 批量添加消息到会话
  const appendMessages = useEvent((sessionId: string, messages: ChatMessage[]) => {
    if (messages.length === 0) {
      return
    }

    setSessions((prev) => {
      const updated = (prev ?? []).map((session) => {
        if (session.id === sessionId) {
          const messagesWithTimestamp = messages.map((msg) => ({
            ...msg,
            timestamp: msg.timestamp ?? Date.now(),
          }))
          const updatedMessages = [...session.messages, ...messagesWithTimestamp]

          return {
            ...session,
            messages: updatedMessages,
            title: session.title === '新对话' ? generateSessionTitle(updatedMessages) : session.title,
            updatedAt: Date.now(),
          }
        }

        return session
      })

      // 将更新的会话移到最前面
      const targetIndex = updated.findIndex((s) => s.id === sessionId)

      if (targetIndex > 0) {
        const targetSession = updated[targetIndex]
        updated.splice(targetIndex, 1)
        updated.unshift(targetSession)
      }

      return updated
    })
  })

  // 更新会话标题
  const renameSession = useEvent((sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      (prev ?? []).map((session) =>
        session.id === sessionId
          ? { ...session, title: newTitle.trim() || '新对话', updatedAt: Date.now() }
          : session,
      ),
    )
  })

  // 置顶/取消置顶会话
  const togglePinSession = useEvent((sessionId: string) => {
    setSessions((prev) =>
      (prev ?? []).map((session) =>
        session.id === sessionId
          ? { ...session, pinned: !session.pinned, updatedAt: Date.now() }
          : session,
      ),
    )
  })

  // 归档会话（软删除）
  const archiveSession = useEvent((sessionId: string) => {
    setSessions((prev) =>
      (prev ?? []).map((session) =>
        session.id === sessionId
          ? { ...session, archived: true, updatedAt: Date.now() }
          : session,
      ),
    )
  })

  // 恢复归档的会话
  const restoreSession = useEvent((sessionId: string) => {
    setSessions((prev) =>
      (prev ?? []).map((session) =>
        session.id === sessionId
          ? { ...session, archived: false, updatedAt: Date.now() }
          : session,
      ),
    )
  })

  // 永久删除会话
  const deleteSession = useEvent((sessionId: string) => {
    setSessions((prev) => (prev ?? []).filter((session) => session.id !== sessionId))
  })

  // 清空所有会话
  const clearAllSessions = useEvent(() => {
    removeSessions()
  })

  // 获取会话
  const getSession = useEvent((sessionId: string): ChatSession | undefined => {
    return sessionsArray.find((session) => session.id === sessionId)
  })

  // 过滤会话（纯函数，可以在渲染期间调用）
  const filterSessions = (filters: ChatSessionFilters = {}): ChatSession[] => {
    let filtered = sessionsArray

    // 过滤归档状态
    if (!filters.showArchived) {
      filtered = filtered.filter((session) => !session.archived)
    }

    // 过滤置顶状态
    if (filters.showPinned) {
      filtered = filtered.filter((session) => session.pinned)
    }

    // 搜索过滤
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter((session) =>
        session.title.toLowerCase().includes(searchLower)
        || session.messages.some((msg) => msg.content.toLowerCase().includes(searchLower)),
      )
    }

    // 排序：置顶的在前，然后按更新时间降序
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) {
        return -1
      }

      if (!a.pinned && b.pinned) {
        return 1
      }

      return b.updatedAt - a.updatedAt
    })
  }

  // 获取统计信息（纯函数，可以在渲染期间调用）
  const getStats = (): ChatSessionStats => {
    const totalSessions = sessionsArray.length
    const activeSessions = sessionsArray.filter((s) => !s.archived).length
    const archivedSessions = sessionsArray.filter((s) => s.archived).length
    const totalMessages = sessionsArray.reduce((sum, s) => sum + s.messages.length, 0)
    const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0

    return {
      totalSessions,
      activeSessions,
      archivedSessions,
      totalMessages,
      averageMessagesPerSession,
    }
  }

  // 获取最近的会话
  const getRecentSessions = useEvent((limit?: number): ChatSession[] => {
    return filterSessions({ showArchived: false })
      .slice(0, limit ?? 10)
  })

  return {
    sessions: sessionsArray,
    isLoading,
    createSession,
    appendMessage,
    appendMessages,
    renameSession,
    togglePinSession,
    archiveSession,
    restoreSession,
    deleteSession,
    clearAllSessions,
    getSession,
    filterSessions,
    getStats,
    getRecentSessions,
  }
}
