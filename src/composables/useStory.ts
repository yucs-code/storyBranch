import { computed, ref, watch } from 'vue'
import { requestBranches, requestContinuation } from '../services/storyApi'
import {
  clearStorySession,
  loadStorySession,
  saveStorySession,
} from '../services/storySession'
import type { Branch, StoryNode } from '../types/story'

type RequestPhase = 'idle' | 'planning' | 'writing' | 'planning-next'

interface StoryErrorState {
  source: 'planner' | 'writer'
  message: string
}

type RetryAction =
  | { type: 'initial-branches' }
  | { type: 'next-branches'; nodeId: string }
  | { type: 'story'; branch: Branch }

export function useStory() {
  const restoredSession = loadStorySession()
  const storyBackground = ref(restoredSession?.background ?? '')
  const fullStory = ref(restoredSession?.fullStory ?? '')
  const storyNodes = ref<StoryNode[]>(restoredSession?.storyNodes ?? [])
  const requestPhase = ref<RequestPhase>('idle')
  const validationMessage = ref('')
  const storyError = ref<StoryErrorState | null>(null)
  const retryAction = ref<RetryAction | null>(null)
  const storyAppendVersion = ref(0)
  let requestSequence = 0

  const currentNode = computed(() => storyNodes.value.at(-1))
  const currentBranches = computed(() => currentNode.value?.branches ?? [])
  const selectedBranch = computed(() => currentNode.value?.selectedBranch)
  const isBusy = computed(() => requestPhase.value !== 'idle')
  const branchesDisabled = computed(
    () => isBusy.value || retryAction.value?.type === 'story',
  )
  const statusMessage = computed(() => {
    if (requestPhase.value === 'planning') return 'AI 正在规划下一步剧情…'
    if (requestPhase.value === 'writing') return 'AI 正在根据这个方向继续故事…'
    if (requestPhase.value === 'planning-next') return 'AI 正在生成下一轮剧情方向…'
    return ''
  })
  const retryLabel = computed(() =>
    retryAction.value?.type === 'story' ? '重试续写' : '重新生成',
  )

  watch(
    [storyBackground, fullStory, storyNodes],
    () => {
      saveStorySession({
        background: storyBackground.value,
        fullStory: fullStory.value,
        storyNodes: storyNodes.value,
      })
    },
    { deep: true, flush: 'sync' },
  )

  function hasRequiredStory(): boolean {
    if (!storyBackground.value.trim() || !fullStory.value.trim()) {
      validationMessage.value = '请先填写故事背景和故事正文。'
      return false
    }

    validationMessage.value = ''
    return true
  }

  function startRequest(phase: RequestPhase): number {
    requestSequence += 1
    requestPhase.value = phase
    storyError.value = null
    retryAction.value = null
    validationMessage.value = ''
    return requestSequence
  }

  function finishRequest(requestId: number) {
    if (requestId === requestSequence) requestPhase.value = 'idle'
  }

  function setPlannerError(action: RetryAction) {
    storyError.value = {
      source: 'planner',
      message: '剧情方向生成失败，请重新尝试。',
    }
    retryAction.value = action
  }

  async function generateBranches() {
    if (isBusy.value) return

    storyError.value = null
    retryAction.value = null
    if (!hasRequiredStory()) return

    const targetNodeId = currentNode.value?.id
    const requestId = startRequest('planning')

    try {
      const planning = await requestBranches({
        background: storyBackground.value,
        currentStory: fullStory.value,
        history: targetNodeId ? storyNodes.value : [],
      })

      if (requestId !== requestSequence) return

      if (targetNodeId) {
        const targetNode = storyNodes.value.find((node) => node.id === targetNodeId)
        if (targetNode) {
          targetNode.summary = planning.summary
          targetNode.branches = planning.branches
        }
        return
      }

      const initialNode: StoryNode = {
        id: 'story_node_1',
        title: '故事开始',
        content: fullStory.value,
        summary: planning.summary,
        branches: planning.branches,
        createdAt: Date.now(),
      }

      storyNodes.value = [initialNode]
    } catch {
      if (requestId === requestSequence) {
        setPlannerError(
          targetNodeId
            ? { type: 'next-branches', nodeId: targetNodeId }
            : { type: 'initial-branches' },
        )
      }
    } finally {
      finishRequest(requestId)
    }
  }

  function selectBranch(branch: Branch) {
    if (!currentNode.value) return

    currentNode.value.selectedBranch = branch
  }

  async function continueWithBranch(branch: Branch) {
    if (isBusy.value || !currentNode.value || retryAction.value?.type === 'story') return

    await writeStoryAndPlanNext(branch)
  }

  async function writeStoryAndPlanNext(branch: Branch) {
    if (!currentNode.value || !hasRequiredStory()) return

    const parentNode = currentNode.value
    const nextRound = storyNodes.value.length + 1
    const requestId = startRequest('writing')

    selectBranch(branch)

    let continuation

    try {
      continuation = await requestContinuation({
        background: storyBackground.value,
        currentStory: fullStory.value,
        history: storyNodes.value,
        selectedBranch: branch,
      })
    } catch {
      if (requestId === requestSequence) {
        storyError.value = {
          source: 'writer',
          message: '剧情续写失败，请重新尝试。',
        }
        retryAction.value = { type: 'story', branch }
      }
      finishRequest(requestId)
      return
    }

    if (requestId !== requestSequence) return

    const nextNode: StoryNode = {
      id: `story_node_${nextRound}`,
      parentId: parentNode.id,
      title: branch.title,
      content: continuation.content,
      summary: continuation.summary,
      branches: [],
      createdAt: Date.now(),
    }

    const nextNodeIndex = storyNodes.value.push(nextNode) - 1
    const previousStory = fullStory.value.trimEnd()
    const newContent = continuation.content.trim()
    fullStory.value = previousStory ? `${previousStory}\n\n${newContent}` : newContent
    storyAppendVersion.value += 1

    requestPhase.value = 'planning-next'

    try {
      const planning = await requestBranches({
        background: storyBackground.value,
        currentStory: fullStory.value,
        history: storyNodes.value,
      })

      if (requestId !== requestSequence) return

      storyNodes.value[nextNodeIndex].branches = planning.branches
    } catch {
      if (requestId === requestSequence) {
        setPlannerError({ type: 'next-branches', nodeId: nextNode.id })
      }
    } finally {
      finishRequest(requestId)
    }
  }

  async function retryNextBranches(nodeId: string) {
    if (isBusy.value || !hasRequiredStory()) return

    const requestId = startRequest('planning-next')

    try {
      const planning = await requestBranches({
        background: storyBackground.value,
        currentStory: fullStory.value,
        history: storyNodes.value,
      })

      if (requestId !== requestSequence) return

      const node = storyNodes.value.find((storyNode) => storyNode.id === nodeId)
      if (node) node.branches = planning.branches
    } catch {
      if (requestId === requestSequence) {
        setPlannerError({ type: 'next-branches', nodeId })
      }
    } finally {
      finishRequest(requestId)
    }
  }

  async function retryLastAction() {
    if (isBusy.value || !retryAction.value) return

    const action = retryAction.value

    if (action.type === 'initial-branches') {
      await generateBranches()
      return
    }

    if (action.type === 'story') {
      await writeStoryAndPlanNext(action.branch)
      return
    }

    await retryNextBranches(action.nodeId)
  }

  function resetStory() {
    requestSequence += 1
    requestPhase.value = 'idle'
    validationMessage.value = ''
    storyError.value = null
    retryAction.value = null
    storyAppendVersion.value = 0
    storyBackground.value = ''
    fullStory.value = ''
    storyNodes.value = []
    clearStorySession()
  }

  return {
    storyBackground,
    fullStory,
    storyNodes,
    currentBranches,
    selectedBranch,
    requestPhase,
    validationMessage,
    storyError,
    isBusy,
    branchesDisabled,
    statusMessage,
    retryLabel,
    storyAppendVersion,
    generateBranches,
    continueWithBranch,
    retryLastAction,
    resetStory,
  }
}
