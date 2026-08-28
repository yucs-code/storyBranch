import type {
  ApiErrorResponse,
  BranchesRequest,
  BranchesResponse,
  ContinueRequest,
  ContinueResponse,
} from '../types/story'

async function postJson<ResponseBody extends object>(url: string, body: unknown): Promise<ResponseBody> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const result = (await response.json()) as ResponseBody | ApiErrorResponse

  if (!response.ok) {
    const message = 'error' in result ? result.error.message : '请求失败。'
    throw new Error(message)
  }

  return result as ResponseBody
}

export function requestBranches(request: BranchesRequest): Promise<BranchesResponse> {
  return postJson<BranchesResponse>('/api/story/branches', request)
}

export function requestContinuation(request: ContinueRequest): Promise<ContinueResponse> {
  return postJson<ContinueResponse>('/api/story/continue', request)
}
