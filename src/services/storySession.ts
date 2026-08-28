import type { Branch, StoryNode } from '../types/story'

export const STORY_SESSION_KEY = 'storybranch:session'

interface StorySessionV1 {
  version: 1
  background: string
  fullStory: string
  storyNodes: StoryNode[]
}

type StorySessionState = Omit<StorySessionV1, 'version'>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isBranch(value: unknown): value is Branch {
  if (!isRecord(value)) return false

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    typeof value.tone === 'string' &&
    (value.risk === undefined || typeof value.risk === 'string')
  )
}

function isStoryNode(value: unknown): value is StoryNode {
  if (!isRecord(value)) return false

  return (
    typeof value.id === 'string' &&
    (value.parentId === undefined || typeof value.parentId === 'string') &&
    typeof value.title === 'string' &&
    typeof value.content === 'string' &&
    typeof value.summary === 'string' &&
    Array.isArray(value.branches) &&
    value.branches.every(isBranch) &&
    (value.selectedBranch === undefined || isBranch(value.selectedBranch)) &&
    typeof value.createdAt === 'number' &&
    Number.isFinite(value.createdAt)
  )
}

function isStorySession(value: unknown): value is StorySessionV1 {
  if (!isRecord(value)) return false

  return (
    value.version === 1 &&
    typeof value.background === 'string' &&
    typeof value.fullStory === 'string' &&
    Array.isArray(value.storyNodes) &&
    value.storyNodes.every(isStoryNode)
  )
}

function removeStoredSession(): void {
  try {
    window.localStorage.removeItem(STORY_SESSION_KEY)
  } catch {
    // localStorage 不可用时保持内存状态可用。
  }
}

export function loadStorySession(): StorySessionState | null {
  if (typeof window === 'undefined') return null

  try {
    const rawSession = window.localStorage.getItem(STORY_SESSION_KEY)
    if (!rawSession) return null

    const parsedSession: unknown = JSON.parse(rawSession)
    if (!isStorySession(parsedSession)) {
      removeStoredSession()
      return null
    }

    return {
      background: parsedSession.background,
      fullStory: parsedSession.fullStory,
      storyNodes: parsedSession.storyNodes,
    }
  } catch {
    removeStoredSession()
    return null
  }
}

export function saveStorySession(state: StorySessionState): void {
  if (typeof window === 'undefined') return

  try {
    const session: StorySessionV1 = {
      version: 1,
      ...state,
    }

    window.localStorage.setItem(STORY_SESSION_KEY, JSON.stringify(session))
  } catch {
    // 写入失败不应中断当前创作流程。
  }
}

export function clearStorySession(): void {
  if (typeof window === 'undefined') return
  removeStoredSession()
}
