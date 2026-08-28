import { Router } from 'express'
import type { Branch } from '../../src/types/story.ts'
import { LlmServiceError, planBranches } from '../services/llm.ts'
import { writeStory } from '../services/storyWriter.ts'

const storyRouter = Router()

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isBranch(value: unknown): value is Branch {
  if (!value || typeof value !== 'object') return false

  const branch = value as Record<string, unknown>

  return (
    isNonEmptyString(branch.id) &&
    isNonEmptyString(branch.title) &&
    isNonEmptyString(branch.description) &&
    isNonEmptyString(branch.tone)
  )
}

storyRouter.post('/branches', async (request, response) => {
  const { background, currentStory, history } = request.body ?? {}

  if (!isNonEmptyString(background) || !isNonEmptyString(currentStory)) {
    response.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: '故事背景和当前剧情不能为空。',
      },
    })
    return
  }

  if (!Array.isArray(history)) {
    response.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: '剧情历史必须是数组。',
      },
    })
    return
  }

  try {
    const result = await planBranches(background, currentStory, history)
    response.json(result)
  } catch (error) {
    const reason = error instanceof LlmServiceError ? error.reason : 'UNKNOWN'
    const status = reason === 'CONFIG_MISSING' ? 503 : reason === 'TIMEOUT' ? 504 : 502

    console.error(`Branch Planner failed: ${reason}`)
    response.status(status).json({
      error: {
        code: 'BRANCH_PLANNER_FAILED',
        message: '剧情方向生成失败，请稍后重试。',
      },
    })
  }
})

storyRouter.post('/continue', async (request, response) => {
  const { background, currentStory, history, selectedBranch } = request.body ?? {}

  if (!isNonEmptyString(background) || !isNonEmptyString(currentStory)) {
    response.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: '故事背景和当前剧情不能为空。',
      },
    })
    return
  }

  if (!Array.isArray(history) || !isBranch(selectedBranch)) {
    response.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: '剧情历史或所选剧情方向格式不正确。',
      },
    })
    return
  }

  try {
    const result = await writeStory(background, currentStory, history, selectedBranch)
    response.json(result)
  } catch (error) {
    const reason = error instanceof LlmServiceError ? error.reason : 'UNKNOWN'
    const status = reason === 'CONFIG_MISSING' ? 503 : reason === 'TIMEOUT' ? 504 : 502

    console.error(`Story Writer failed: ${reason}`)
    response.status(status).json({
      error: {
        code: 'STORY_WRITER_FAILED',
        message: '剧情续写失败，请稍后重试。',
      },
    })
  }
})

export default storyRouter
