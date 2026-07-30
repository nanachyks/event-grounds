import type { Instrumentation } from "next"
import { logError } from "@/lib/logger"

// Next.js calls this once per server/edge runtime instance at startup - the
// hook Sentry's Next.js SDK expects its init calls to run from.
// See https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config")
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config")
  }
}

// Next.js calls this for any error that escapes a route handler / RSC render
// without being caught elsewhere - a last-resort net so nothing vanishes
// silently. See https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  logError("request.uncaught", error, {
    path: request.path,
    method: request.method,
    routeType: context.routeType,
  })

  if (process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/nextjs")
    Sentry.captureRequestError(error, request, context)
  }
}
