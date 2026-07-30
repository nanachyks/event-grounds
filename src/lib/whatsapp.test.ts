import { describe, it, expect } from "vitest"
import { buildWhatsAppLink } from "./whatsapp"

describe("buildWhatsAppLink", () => {
  it("strips non-digit characters from the phone number", () => {
    const link = buildWhatsAppLink("+233 50 123 4567", "Hi")
    expect(link).toBe("https://wa.me/233501234567?text=Hi")
  })

  it("URL-encodes the message", () => {
    const link = buildWhatsAppLink("233501234567", "Hi there! Is this available?")
    expect(link).toBe("https://wa.me/233501234567?text=Hi%20there!%20Is%20this%20available%3F")
  })
})
