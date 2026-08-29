import express from 'express'
import type { ErrorRequestHandler } from 'express'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import storyRouter from './routes/story.ts'

const app = express()
const port = Number(process.env.PORT) || 3001
const distPath = fileURLToPath(new URL('../dist', import.meta.url))
const indexPath = path.join(distPath, 'index.html')

app.use(express.json({ limit: '1mb' }))
app.use('/api/story', storyRouter)

app.use('/api', (_request, response) => {
  response.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: '请求的 API 不存在。',
    },
  })
})

if (existsSync(indexPath)) {
  app.use(express.static(distPath))
  app.get(/.*/, (request, response, next) => {
    if (!request.accepts('html')) {
      next()
      return
    }

    response.sendFile(indexPath)
  })
}

app.use((_request, response) => {
  response.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: '请求的 API 不存在。',
    },
  })
})

const handleError: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof SyntaxError) {
    response.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: '请求内容不是有效的 JSON。',
      },
    })
    return
  }

  console.error('Unexpected server error:', error)
  response.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: '服务暂时不可用，请稍后重试。',
    },
  })
}

app.use(handleError)

app.listen(port, '0.0.0.0', () => {
  console.log(`StoryBranch server listening on port ${port}`)
})
