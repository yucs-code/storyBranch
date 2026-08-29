import { handleContinueRequest } from '../../server/handlers/story.js'
import { handleWebFunctionRequest } from '../../server/handlers/webFunction.js'

export default function continueStory(request: Request): Promise<Response> {
  return handleWebFunctionRequest(request, handleContinueRequest)
}
