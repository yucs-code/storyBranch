import type { Branch, StoryNode } from '../../src/types/story'

export const STORY_WRITER_SYSTEM_PROMPT = `你是一名专业故事编剧。

请根据故事背景、到目前为止已经形成的完整故事正文、已有剧情节点摘要、用户之前的选择和本次选择的剧情方向，继续创作下一段故事。

要求：
1. 自然承接前文；
2. 保持已有角色和设定一致；
3. 必须推动剧情发展；
4. 不要一次解决当前所有冲突；
5. 保留下一步剧情继续发展的空间；
6. 不随意增加与前文冲突的设定；
7. content 正文严格控制在 300～500 个汉字，最多不得超过 500 个汉字，请在输出前自行检查长度；
8. 严格按照用户选择的剧情方向续写；
9. 同时生成一句简短剧情摘要，用于剧情树展示；
10. 返回严格 JSON，不要输出 JSON 之外的任何内容。

返回结构必须为：
{
  "content": "...",
  "summary": "..."
}`

export function createStoryWriterUserPrompt(
  background: string,
  currentStory: string,
  history: StoryNode[],
  selectedBranch: Branch,
): string {
  const storySummaries = history.map((node) => ({
    title: node.title,
    summary: node.summary,
  }))

  const previousChoices = history
    .slice(0, -1)
    .filter((node) => node.selectedBranch)
    .map((node) => ({
      title: node.selectedBranch?.title,
      description: node.selectedBranch?.description,
    }))

  return `请根据以下故事信息续写下一段剧情：

${JSON.stringify(
    {
      background,
      fullStory: currentStory,
      storySummaries,
      previousChoices,
      selectedBranch: {
        id: selectedBranch.id,
        title: selectedBranch.title,
        description: selectedBranch.description,
        tone: selectedBranch.tone,
        risk: selectedBranch.risk,
      },
    },
    null,
    2,
  )}`
}
