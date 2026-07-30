function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message, name: error.name, stack: error.stack }
  }
  // Some SDKs (e.g. Cloudinary) reject with plain objects rather than
  // real Error instances - String(error) would collapse those to the
  // useless "[object Object]", so spread whatever fields it actually has.
  if (typeof error === "object" && error !== null) {
    return { ...error }
  }
  return { message: String(error) }
}

/**
 * Structured error logging. Emits a single-line JSON object so log
 * aggregators (Vercel logs, Better Stack, Datadog, etc.) can parse and
 * filter on `context` instead of grepping free-text strings.
 */
export function logError(context: string, error: unknown, meta?: Record<string, unknown>) {
  const entry = {
    level: "error" as const,
    context,
    timestamp: new Date().toISOString(),
    error: serializeError(error),
    ...(meta ? { meta } : {}),
  }
  console.error(JSON.stringify(entry))
}
