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
  it("usa o rótulo de ainda não assistido", () => {
    expect(watchStatusLabel(false)).toBe("Ainda não assistido")
  })

  it("usa o rótulo de já assistido", () => {
    expect(watchStatusLabel(true)).toBe("Já assistido")
  })
})

describe("resolveWatchStatus", () => {
  it("não resolve status quando o título não está na watchlist", () => {
    expect(resolveWatchStatus(undefined)).toBeNull()
  })

  it("resolve ainda não assistido quando o item está guardado", () => {
    expect(resolveWatchStatus(saved)).toEqual({
      watched: false,
      label: "Ainda não assistido",
    })
  })

  it("resolve já assistido quando o item está marcado", () => {
    expect(resolveWatchStatus({ ...saved, watched: true })).toEqual({
      watched: true,
      label: "Já assistido",
    })
  })
})
