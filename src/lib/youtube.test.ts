import { describe, it, expect } from "vitest"
import { getYouTubeEmbedUrl } from "./youtube"

describe("getYouTubeEmbedUrl", () => {
  it("returns null for a missing url", () => {
    expect(getYouTubeEmbedUrl(null)).toBeNull()
    expect(getYouTubeEmbedUrl(undefined)).toBeNull()
    expect(getYouTubeEmbedUrl("")).toBeNull()
  })

  it("converts a standard watch url", () => {
    expect(getYouTubeEmbedUrl("https://www.youtube.com/watch?v=abc123XYZ_-")).toBe("https://www.youtube.com/embed/abc123XYZ_-")
  })

  it("converts a youtu.be short url", () => {
    expect(getYouTubeEmbedUrl("https://youtu.be/abc123XYZ_-")).toBe("https://www.youtube.com/embed/abc123XYZ_-")
  })

  it("passes through an already-embed url", () => {
    expect(getYouTubeEmbedUrl("https://www.youtube.com/embed/abc123XYZ_-")).toBe("https://www.youtube.com/embed/abc123XYZ_-")
  })

  it("converts a shorts url", () => {
    expect(getYouTubeEmbedUrl("https://www.youtube.com/shorts/abc123XYZ_-")).toBe("https://www.youtube.com/embed/abc123XYZ_-")
  })

  it("returns null for a non-YouTube url", () => {
    expect(getYouTubeEmbedUrl("https://example.com/video/123")).toBeNull()
  })
})
