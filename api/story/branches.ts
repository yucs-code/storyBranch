import { handleBranchesRequest } from '../../server/handlers/story.js'
import { handleWebFunctionRequest } from '../../server/handlers/webFunction.js'

export default {
  fetch(request: Request): Promise<Response> {
    return handleWebFunctionRequest(request, handleBranchesRequest)
  },
}
