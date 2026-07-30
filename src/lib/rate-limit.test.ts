import { describe, it, expect, vi, afterEach } from "vitest"
import { rateLimit, getClientIp } from "./rate-limit"

describe("rateLimit", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("allows requests up to the limit, then blocks", async () => {
    const key = `test-${Math.random()}`
    expect(await rateLimit(key, 2, 60_000)).toEqual({ allowed: true, retryAfterSeconds: 0 })
    expect(await rateLimit(key, 2, 60_000)).toEqual({ allowed: true, retryAfterSeconds: 0 })

    const third = await rateLimit(key, 2, 60_000)
    expect(third.allowed).toBe(false)
    expect(third.retryAfterSeconds).toBeGreaterThan(0)
  })

  it("resets the count once the window has passed", async () => {
    vi.useFakeTimers()
    const key = `test-${Math.random()}`

    expect((await rateLimit(key, 1, 1000)).allowed).toBe(true)
    expect((await rateLimit(key, 1, 1000)).allowed).toBe(false)

    vi.advanceTimersByTime(1001)

    expect((await rateLimit(key, 1, 1000)).allowed).toBe(true)
  })

  it("tracks separate keys independently", async () => {
    const keyA = `a-${Math.random()}`
    const keyB = `b-${Math.random()}`

    expect((await rateLimit(keyA, 1, 60_000)).allowed).toBe(true)
    expect((await rateLimit(keyA, 1, 60_000)).allowed).toBe(false)
    expect((await rateLimit(keyB, 1, 60_000)).allowed).toBe(true)
  })
})

describe("getClientIp", () => {
  it("prefers x-forwarded-for and takes the first address", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    })
    expect(getClientIp(request)).toBe("1.2.3.4")
  })

  it("falls back to x-real-ip", () => {
    const request = new Request("https://example.com", {
      headers: { "x-real-ip": "9.8.7.6" },
    })
    expect(getClientIp(request)).toBe("9.8.7.6")
  })

  it("falls back to 'unknown' when no IP header is present", () => {
    const request = new Request("https://example.com")
    expect(getClientIp(request)).toBe("unknown")
  })
})
