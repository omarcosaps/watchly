import { describe, expect, it } from "vitest"

import { cardEnterDelay, isModifiedClick } from "@/lib/motion"

describe("cardEnterDelay", () => {
  it("staggers the first twelve cards and caps afterwards", () => {
    expect(cardEnterDelay(0)).toBe("0.400s")
    expect(cardEnterDelay(1)).toBe("0.435s")
    expect(cardEnterDelay(11)).toBe("0.785s")
    expect(cardEnterDelay(12)).toBe("0.785s")
  })
})

describe("isModifiedClick", () => {
  it("ignores modified and non-primary clicks", () => {
    const base = {
      altKey: false,
      button: 0,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
    }

    expect(isModifiedClick(base)).toBe(false)
    expect(isModifiedClick({ ...base, metaKey: true })).toBe(true)
    expect(isModifiedClick({ ...base, button: 1 })).toBe(true)
  })
})
