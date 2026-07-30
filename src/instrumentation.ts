import { logError } from "@/lib/logger"

// Next.js calls this for any error that escapes a route handler / RSC render
// without being caught elsewhere - a last-resort net so nothing vanishes
// silently. See https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
export async function onRequestError(
  error: unknown,
  request: { path: string; method: string },
  context: { routeType?: string }
) {
  logError("request.uncaught", error, {
    path: request.path,
    method: request.method,
    routeType: context.routeType,
  })
}
