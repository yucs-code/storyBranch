import type { StoryApiResult } from './story.js'

type StoryRequestHandler = (body: unknown) => Promise<StoryApiResult>

function jsonResponse(result: StoryApiResult): Response {
  return Response.json(result.body, { status: result.status })
}

export async function handleWebFunctionRequest(
  request: Request,
  handler: StoryRequestHandler,
): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json(
      {
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: '仅支持 POST 请求。',
        },
      },
      {
        status: 405,
        headers: { Allow: 'POST' },
      },
    )
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return Response.json(
      {
        error: {
          code: 'INVALID_JSON',
          message: '请求内容不是有效的 JSON。',
        },
      },
      { status: 400 },
    )
  }

  return jsonResponse(await handler(body))
}
