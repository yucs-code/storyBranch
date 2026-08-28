import assert from 'node:assert/strict'
import test from 'node:test'
import { LlmServiceError } from './llm.ts'
import { parseStoryWriterContent } from './storyWriter.ts'

const validResult = {
  content: '主角沿着选定方向继续调查，新的线索让局势变得更加复杂。',
  summary: '新的线索让调查进入更危险的阶段。',
}

function expectWriterError(content: string, reason: LlmServiceError['reason']) {
  assert.throws(
    () => parseStoryWriterContent(content),
    (error: unknown) => error instanceof LlmServiceError && error.reason === reason,
  )
}

test('parses a valid Story Writer JSON response', () => {
  assert.deepEqual(parseStoryWriterContent(JSON.stringify(validResult)), validResult)
})

test('parses Story Writer JSON wrapped in a markdown code fence', () => {
  const content = `模型结果：\n\`\`\`json\n${JSON.stringify(validResult)}\n\`\`\``
  assert.deepEqual(parseStoryWriterContent(content), validResult)
})

test('rejects empty Story Writer content', () => {
  expectWriterError('   ', 'EMPTY_CONTENT')
})

test('rejects malformed Story Writer JSON', () => {
  expectWriterError('{"content":', 'INVALID_JSON')
})

test('rejects a missing content field', () => {
  expectWriterError(
    JSON.stringify({ summary: validResult.summary }),
    'INVALID_RESPONSE',
  )
})

test('rejects a missing summary field', () => {
  expectWriterError(
    JSON.stringify({ content: validResult.content }),
    'INVALID_RESPONSE',
  )
})

test('rejects non-string Story Writer fields', () => {
  expectWriterError(
    JSON.stringify({ content: 123, summary: [] }),
    'INVALID_RESPONSE',
  )
})
