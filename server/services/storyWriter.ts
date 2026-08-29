import type { Branch, ContinueResponse, StoryNode } from '../../src/types/story.js'
import {
  STORY_WRITER_SYSTEM_PROMPT,
  createStoryWriterUserPrompt,
} from '../prompts/storyWriter.js'
import {
  extractJsonText,
  LlmServiceError,
  requestChatCompletion,
} from './llm.js'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseStoryWriterContent(content: string): ContinueResponse {
  let parsed: unknown

  try {
    parsed = JSON.parse(extractJsonText(content))
  } catch (error) {
    if (error instanceof LlmServiceError) throw error
    throw new LlmServiceError('INVALID_JSON')
  }

  if (
    !isRecord(parsed) ||
    typeof parsed.content !== 'string' ||
    !parsed.content.trim() ||
    typeof parsed.summary !== 'string' ||
    !parsed.summary.trim()
  ) {
    throw new LlmServiceError('INVALID_RESPONSE')
  }

  return {
    content: parsed.content.trim(),
    summary: parsed.summary.trim(),
  }
}

export async function writeStory(
  background: string,
  currentStory: string,
  history: StoryNode[],
  selectedBranch: Branch,
): Promise<ContinueResponse> {
  const content = await requestChatCompletion([
    {
      role: 'system',
      content: STORY_WRITER_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: createStoryWriterUserPrompt(
        background,
        currentStory,
        history,
        selectedBranch,
      ),
    },
  ])

  return parseStoryWriterContent(content)
}
