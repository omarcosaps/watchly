import { describe, expect, it } from "vitest"

import { homeCatalogParams } from "./home-query"

const genres = [
  { name: "Aventura", movieId: 12, tvId: 10759 },
]

describe("homeCatalogParams", () => {
  it("manda só a página quando não há filtro", () => {
    const params = homeCatalogParams(new URLSearchParams(), genres, 1)

    expect([...params.entries()]).toEqual([["page", "1"]])
  })

  it("traduz media e gênero da URL", () => {
    const params = homeCatalogParams(
      new URLSearchParams("media=movie&genre=Aventura"),
      genres,
      1,
    )

    expect(params.get("media")).toBe("movie")
    expect(params.get("genreMovie")).toBe("12")
    expect(params.get("genreTv")).toBe("10759")
    expect(params.get("genre")).toBeNull()
  })
})
