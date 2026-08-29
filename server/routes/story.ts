import { Router } from 'express'
import {
  handleBranchesRequest,
  handleContinueRequest,
} from '../handlers/story'

const storyRouter = Router()

storyRouter.post('/branches', async (request, response) => {
  const result = await handleBranchesRequest(request.body)
  response.status(result.status).json(result.body)
})

storyRouter.post('/continue', async (request, response) => {
  const result = await handleContinueRequest(request.body)
  response.status(result.status).json(result.body)
})

export default storyRouter
