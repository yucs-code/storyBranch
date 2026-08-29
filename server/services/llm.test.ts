import assert from 'node:assert/strict'
import test from 'node:test'
import { LlmServiceError, parseBranchPlannerContent, planBranches } from './llm'

const validResult = {
  summary: '主角发现了新的异常线索。',
  branches: [
    {
      id: 'branch_1',
      title: '追查线索',
      description: '主角追踪现场留下的线索。',
      tone: '悬疑',
      risk: '可能惊动幕后人物',
    },
    {
      id: 'branch_2',
      title: '主动出击',
      description: '主角决定立刻打破当前僵局。',
      tone: '紧张',
      risk: '可能陷入对方圈套',
    },
    {
      id: 'branch_3',
      title: '寻求帮助',
      description: '主角向最信任的人坦白秘密。',
      tone: '情感',
      risk: '信任可能被利用',
    },
  ],
}

function expectPlannerError(content: string, reason: LlmServiceError['reason']) {
  assert.throws(
    () => parseBranchPlannerContent(content),
    (error: unknown) => error instanceof LlmServiceError && error.reason === reason,
  )
}

test('parses a valid Branch Planner JSON response', () => {
  assert.deepEqual(parseBranchPlannerContent(JSON.stringify(validResult)), validResult)
})

test('parses JSON wrapped in a markdown code fence', () => {
  const content = `模型结果：\n\`\`\`json\n${JSON.stringify(validResult)}\n\`\`\``
  assert.deepEqual(parseBranchPlannerContent(content), validResult)
})

test('rejects empty content', () => {
  expectPlannerError('   ', 'EMPTY_CONTENT')
})

test('rejects malformed JSON', () => {
  expectPlannerError('{"summary":', 'INVALID_JSON')
})

test('rejects a branches array whose length is not three', () => {
  expectPlannerError(
    JSON.stringify({ ...validResult, branches: validResult.branches.slice(0, 2) }),
    'INVALID_RESPONSE',
  )
})

test('rejects a branch with a missing required field', () => {
  const branches = validResult.branches.map((branch) => ({ ...branch }))
  const invalidBranch = branches[0] as Partial<(typeof branches)[number]>
  delete invalidBranch.tone

  expectPlannerError(
    JSON.stringify({ ...validResult, branches }),
    'INVALID_RESPONSE',
  )
})

test('rejects an invalid optional risk type', () => {
  const branches: unknown[] = validResult.branches.map((branch) => ({ ...branch }))
  branches[0] = { ...validResult.branches[0], risk: 123 }

  expectPlannerError(
    JSON.stringify({ ...validResult, branches }),
    'INVALID_RESPONSE',
  )
})

test('rejects a request when server LLM configuration is missing', async () => {
  const originalConfig = {
    apiKey: process.env.LLM_API_KEY,
    baseUrl: process.env.LLM_BASE_URL,
    model: process.env.LLM_MODEL,
  }

  delete process.env.LLM_API_KEY
  delete process.env.LLM_BASE_URL
  delete process.env.LLM_MODEL

  try {
    await assert.rejects(
      () => planBranches('故事背景', '当前剧情', []),
      (error: unknown) =>
        error instanceof LlmServiceError && error.reason === 'CONFIG_MISSING',
    )
  } finally {
    if (originalConfig.apiKey !== undefined) process.env.LLM_API_KEY = originalConfig.apiKey
    if (originalConfig.baseUrl !== undefined) process.env.LLM_BASE_URL = originalConfig.baseUrl
    if (originalConfig.model !== undefined) process.env.LLM_MODEL = originalConfig.model
  }
})
