import { describe, expect, it } from "vitest"

import { parseSort } from "./params"

describe("parseSort", () => {
  it("aceita trending sem expor na grade", () => {
    expect(parseSort("trending")).toBe("trending")
    expect(parseSort("date")).toBe("date")
    expect(parseSort("unknown")).toBe("popularity")
  })
})
