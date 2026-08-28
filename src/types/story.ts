export interface Branch {
  id: string
  title: string
  description: string
  tone: string
  risk?: string
}

export interface StoryNode {
  id: string
  parentId?: string
  title: string
  content: string
  summary: string
  branches: Branch[]
  selectedBranch?: Branch
  createdAt: number
}

export interface BranchesRequest {
  background: string
  /** 兼容现有 API 字段名；实际值是到目前为止累积形成的 fullStory。 */
  currentStory: string
  history: StoryNode[]
}

export interface BranchesResponse {
  summary: string
  branches: Branch[]
}

export interface ContinueRequest {
  background: string
  /** 兼容现有 API 字段名；实际值是到目前为止累积形成的 fullStory。 */
  currentStory: string
  history: StoryNode[]
  selectedBranch: Branch
}

export interface ContinueResponse {
  content: string
  summary: string
}

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
  }
}
