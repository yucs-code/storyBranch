import type {
  ApiErrorResponse,
  Branch,
  BranchesResponse,
  ContinueResponse,
  StoryNode,
} from '../../src/types/story'
import { LlmServiceError, planBranches } from '../services/llm'
import { writeStory } from '../services/storyWriter'

type StoryApiBody = BranchesResponse | ContinueResponse | ApiErrorResponse

export interface StoryApiResult {
  status: number
  body: StoryApiBody
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isBranch(value: unknown): value is Branch {
  if (!isRecord(value)) return false

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.description) &&
    isNonEmptyString(value.tone)
  )
}

function errorResult(status: number, code: string, message: string): StoryApiResult {
  return {
    status,
    body: {
      error: {
        code,
        message,
      },
    },
  }
}

function llmFailureStatus(error: unknown): number {
  const reason = error instanceof LlmServiceError ? error.reason : 'UNKNOWN'
  return reason === 'CONFIG_MISSING' ? 503 : reason === 'TIMEOUT' ? 504 : 502
}

export async function handleBranchesRequest(body: unknown): Promise<StoryApiResult> {
  const requestBody = isRecord(body) ? body : {}
  const { background, currentStory, history } = requestBody

  if (!isNonEmptyString(background) || !isNonEmptyString(currentStory)) {
    return errorResult(400, 'INVALID_REQUEST', '故事背景和当前剧情不能为空。')
  }

  if (!Array.isArray(history)) {
    return errorResult(400, 'INVALID_REQUEST', '剧情历史必须是数组。')
  }

  try {
    const result = await planBranches(background, currentStory, history as StoryNode[])
    return { status: 200, body: result }
  } catch (error) {
    const reason = error instanceof LlmServiceError ? error.reason : 'UNKNOWN'
    console.error(`Branch Planner failed: ${reason}`)
    return errorResult(
      llmFailureStatus(error),
      'BRANCH_PLANNER_FAILED',
      '剧情方向生成失败，请稍后重试。',
    )
  }
}

export async function handleContinueRequest(body: unknown): Promise<StoryApiResult> {
  const requestBody = isRecord(body) ? body : {}
  const { background, currentStory, history, selectedBranch } = requestBody

  if (!isNonEmptyString(background) || !isNonEmptyString(currentStory)) {
    return errorResult(400, 'INVALID_REQUEST', '故事背景和当前剧情不能为空。')
  }

  if (!Array.isArray(history) || !isBranch(selectedBranch)) {
    return errorResult(400, 'INVALID_REQUEST', '剧情历史或所选剧情方向格式不正确。')
  }

  try {
    const result = await writeStory(
      background,
      currentStory,
      history as StoryNode[],
      selectedBranch,
    )
    return { status: 200, body: result }
  } catch (error) {
    const reason = error instanceof LlmServiceError ? error.reason : 'UNKNOWN'
    console.error(`Story Writer failed: ${reason}`)
    return errorResult(
      llmFailureStatus(error),
      'STORY_WRITER_FAILED',
      '剧情续写失败，请稍后重试。',
    )
  }
}
