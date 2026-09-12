import { describe, expect, it } from "vitest"

import { heroCatalogParams } from "./hero-params"

describe("heroCatalogParams", () => {
  it("pede só a primeira página das tendências", () => {
    const params = heroCatalogParams()

    expect(params.get("page")).toBe("1")
    expect(params.get("sort")).toBe("trending")
  })

  it("não envia filtros da listagem", () => {
    const params = heroCatalogParams()

    expect([...params.keys()]).toEqual(["page", "sort"])
    expect(params.get("media")).toBeNull()
    expect(params.get("yearRange")).toBeNull()
    expect(params.get("filterProviders")).toBeNull()
    expect(params.get("genreMovie")).toBeNull()
    expect(params.get("genreTv")).toBeNull()
  })
})
