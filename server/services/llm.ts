import type { Branch, BranchesResponse, StoryNode } from '../../src/types/story.ts'
import {
  BRANCH_PLANNER_SYSTEM_PROMPT,
  createBranchPlannerUserPrompt,
} from '../prompts/branchPlanner.ts'

const LLM_TIMEOUT_MS = 30_000

type LlmFailureReason =
  | 'CONFIG_MISSING'
  | 'REQUEST_FAILED'
  | 'TIMEOUT'
  | 'EMPTY_CONTENT'
  | 'INVALID_JSON'
  | 'INVALID_RESPONSE'

export interface ChatMessage {
  role: 'system' | 'user'
  content: string
}

interface LlmConfig {
  apiKey: string
  baseUrl: string
  model: string
}

export class LlmServiceError extends Error {
  readonly reason: LlmFailureReason

  constructor(reason: LlmFailureReason) {
    super(reason)
    this.name = 'LlmServiceError'
    this.reason = reason
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readConfig(): LlmConfig {
  const apiKey = process.env.LLM_API_KEY?.trim()
  const baseUrl = process.env.LLM_BASE_URL?.trim()
  const model = process.env.LLM_MODEL?.trim()

  if (!apiKey || !baseUrl || !model) {
    throw new LlmServiceError('CONFIG_MISSING')
  }

  return { apiKey, baseUrl, model }
}

function createChatCompletionsUrl(baseUrl: string): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')

  return normalizedBaseUrl.endsWith('/chat/completions')
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/chat/completions`
}

function readMessageContent(payload: unknown): string {
  if (!isRecord(payload) || !Array.isArray(payload.choices)) {
    throw new LlmServiceError('INVALID_RESPONSE')
  }

  const firstChoice = payload.choices[0]

  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    throw new LlmServiceError('INVALID_RESPONSE')
  }

  const { content } = firstChoice.message

  if (typeof content === 'string') return content.trim()

  if (Array.isArray(content)) {
    return content
      .map((part) => (isRecord(part) && typeof part.text === 'string' ? part.text : ''))
      .join('')
      .trim()
  }

  throw new LlmServiceError('EMPTY_CONTENT')
}

export async function requestChatCompletion(messages: ChatMessage[]): Promise<string> {
  const config = readConfig()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS)

  try {
    const response = await fetch(createChatCompletionsUrl(config.baseUrl), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new LlmServiceError('REQUEST_FAILED')
    }

    let payload: unknown

    try {
      payload = await response.json()
    } catch {
      throw new LlmServiceError('INVALID_RESPONSE')
    }

    const content = readMessageContent(payload)

    if (!content) {
      throw new LlmServiceError('EMPTY_CONTENT')
    }

    return content
  } catch (error) {
    if (error instanceof LlmServiceError) throw error

    if (error instanceof Error && error.name === 'AbortError') {
      throw new LlmServiceError('TIMEOUT')
    }

    throw new LlmServiceError('REQUEST_FAILED')
  } finally {
    clearTimeout(timeout)
  }
}

export function extractJsonText(content: string): string {
  const trimmedContent = content.trim()

  if (!trimmedContent) {
    throw new LlmServiceError('EMPTY_CONTENT')
  }

  const fencedJson = trimmedContent.match(/```(?:json)?\s*([\s\S]*?)```/i)
  return (fencedJson?.[1] ?? trimmedContent).trim()
}

function normalizeBranch(value: unknown): Branch {
  if (!isRecord(value)) {
    throw new LlmServiceError('INVALID_RESPONSE')
  }

  const requiredFields = [value.id, value.title, value.description, value.tone]

  if (
    requiredFields.some(
      (field) => typeof field !== 'string' || field.trim().length === 0,
    )
  ) {
    throw new LlmServiceError('INVALID_RESPONSE')
  }

  if (value.risk !== undefined && typeof value.risk !== 'string') {
    throw new LlmServiceError('INVALID_RESPONSE')
  }

  const branch: Branch = {
    id: (value.id as string).trim(),
    title: (value.title as string).trim(),
    description: (value.description as string).trim(),
    tone: (value.tone as string).trim(),
  }

  if (typeof value.risk === 'string' && value.risk.trim()) {
    branch.risk = value.risk.trim()
  }

  return branch
}

export function parseBranchPlannerContent(content: string): BranchesResponse {
  let parsed: unknown

  try {
    parsed = JSON.parse(extractJsonText(content))
  } catch (error) {
    if (error instanceof LlmServiceError) throw error
    throw new LlmServiceError('INVALID_JSON')
  }

  if (
    !isRecord(parsed) ||
    typeof parsed.summary !== 'string' ||
    !parsed.summary.trim() ||
    !Array.isArray(parsed.branches) ||
    parsed.branches.length !== 3
  ) {
    throw new LlmServiceError('INVALID_RESPONSE')
  }

  return {
    summary: parsed.summary.trim(),
    branches: parsed.branches.map(normalizeBranch),
  }
}

export async function planBranches(
  background: string,
  currentStory: string,
  history: StoryNode[],
): Promise<BranchesResponse> {
  const content = await requestChatCompletion([
    {
      role: 'system',
      content: BRANCH_PLANNER_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: createBranchPlannerUserPrompt(background, currentStory, history),
    },
  ])

  return parseBranchPlannerContent(content)
}
