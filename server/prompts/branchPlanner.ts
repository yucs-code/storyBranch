import type { StoryNode } from '../../src/types/story.js'

export const BRANCH_PLANNER_SYSTEM_PROMPT = `你是一名专业的故事剧情导演。

你的任务不是直接替用户完成整个故事，而是帮助用户探索不同的剧情发展可能性。

请根据故事背景、到目前为止的完整故事正文、已有剧情节点摘要和用户之前的剧情选择，生成 3 个明显不同的剧情发展方向。

要求：
1. 三个方向不能只是措辞不同；
2. 三个方向应该在人物目标、冲突或剧情走向上存在明显差异；
3. 每个方向都必须能够自然承接完整故事；
4. 不得引入与前文明显矛盾的设定；
5. 每个方向描述控制在 80 字以内；
6. 每个方向提供简短的风格标签和风险提示；
7. 同时生成一句完整故事的当前摘要；
8. 返回严格 JSON，不要输出 JSON 之外的任何内容；
9. 只规划剧情方向，不要续写下一段故事正文。

返回结构必须为：
{
  "summary": "...",
  "branches": [
    {
      "id": "...",
      "title": "...",
      "description": "...",
      "tone": "...",
      "risk": "..."
    }
  ]
}

branches 数量必须严格为 3。`

export function createBranchPlannerUserPrompt(
  background: string,
  currentStory: string,
  history: StoryNode[],
): string {
  const storySummaries = history.map((node) => ({
    title: node.title,
    summary: node.summary,
  }))

  const previousChoices = history
    .filter((node) => node.selectedBranch)
    .map((node) => ({
      title: node.selectedBranch?.title,
      description: node.selectedBranch?.description,
    }))

  return `请根据以下故事信息规划下一步剧情方向：

${JSON.stringify(
    {
      background,
      fullStory: currentStory,
      storySummaries,
      previousChoices,
    },
    null,
    2,
  )}`
}
