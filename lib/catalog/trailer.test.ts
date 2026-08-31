import { describe, expect, it } from "vitest"

import { pickYoutubeTrailer, pickYoutubeTrailerKey } from "./trailer"
import type { TmdbVideo } from "@/lib/tmdb/types"

const video = (overrides: Partial<TmdbVideo>): TmdbVideo => {
  return {
    key: "abc",
    site: "YouTube",
    type: "Trailer",
    official: false,
    ...overrides,
  }
}

describe("pickYoutubeTrailer", () => {
  it("prefere trailer oficial no YouTube", () => {
    const url = pickYoutubeTrailer([
      video({ key: "teaser", type: "Teaser", official: true }),
      video({ key: "nao-oficial", official: false }),
      video({ key: "oficial", official: true }),
    ])

    expect(url).toBe("https://www.youtube.com/watch?v=oficial")
    expect(
      pickYoutubeTrailerKey([
        video({ key: "teaser", type: "Teaser", official: true }),
        video({ key: "nao-oficial", official: false }),
        video({ key: "oficial", official: true }),
      ]),
    ).toBe("oficial")
  })

  it("cai no trailer comum e depois no teaser", () => {
    expect(
      pickYoutubeTrailer([
        video({ key: "vimeo", site: "Vimeo", official: true }),
        video({ key: "comum" }),
      ]),
    ).toBe("https://www.youtube.com/watch?v=comum")

    expect(pickYoutubeTrailer([video({ key: "teaser", type: "Teaser" })])).toBe(
      "https://www.youtube.com/watch?v=teaser",
    )
  })

  it("ignora chave vazia e devolve null sem YouTube", () => {
    expect(pickYoutubeTrailer([video({ key: "   " })])).toBeNull()
    expect(pickYoutubeTrailer([video({ site: "Vimeo", official: true })])).toBeNull()
  })
})
