export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
  interactionId?: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  archived?: boolean
  pinned?: boolean
}

export interface ChatSessionStats {
  totalSessions: number
  activeSessions: number
  archivedSessions: number
  totalMessages: number
  averageMessagesPerSession: number
}

export interface ChatSessionFilters {
  showArchived?: boolean
  showPinned?: boolean
  searchTerm?: string
}
