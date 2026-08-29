import { handleBranchesRequest } from '../../server/handlers/story.ts'
import { handleWebFunctionRequest } from '../../server/handlers/webFunction.ts'

export default {
  fetch(request: Request): Promise<Response> {
    return handleWebFunctionRequest(request, handleBranchesRequest)
  },
}
