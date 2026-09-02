import { describe, expect, it } from "vitest"

import { resolveWatchStatus, watchStatusLabel } from "@/lib/account/watch-status"
import type { WatchlistItem } from "@/lib/account/types"

const saved: WatchlistItem = {
  tmdbId: 1396,
  mediaType: "tv",
  title: "Dr. House",
  posterPath: "/house.jpg",
  year: 2004,
  createdAt: "2026-09-01T00:00:00.000Z",
  watched: false,
}

describe("watchStatusLabel", () => {
  it("usa o rótulo de ainda não assistir", () => {
    expect(watchStatusLabel(false)).toBe("Ainda não assistir")
  })

  it("usa o rótulo de já assistir", () => {
    expect(watchStatusLabel(true)).toBe("Já assistir")
  })
})

describe("resolveWatchStatus", () => {
  it("não resolve status quando o título não está na watchlist", () => {
    expect(resolveWatchStatus(undefined)).toBeNull()
  })

  it("resolve ainda não assistir quando o item está guardado", () => {
    expect(resolveWatchStatus(saved)).toEqual({
      watched: false,
      label: "Ainda não assistir",
    })
  })

  it("resolve já assistir quando o item está marcado", () => {
    expect(resolveWatchStatus({ ...saved, watched: true })).toEqual({
      watched: true,
      label: "Já assistir",
    })
  })
})
