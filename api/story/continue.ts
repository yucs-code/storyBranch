import { handleContinueRequest } from '../../server/handlers/story'
import { handleWebFunctionRequest } from '../../server/handlers/webFunction'

export default {
  fetch(request: Request): Promise<Response> {
    return handleWebFunctionRequest(request, handleContinueRequest)
  },
}
