import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { STORAGE_KEY } from "@/lib/account/mock/storage"
import {
  addToWatchlist,
  listWatchlist,
  removeFromWatchlist,
  setWatchlistWatched,
} from "@/lib/account/watchlist"
import { resolveWatchStatus } from "@/lib/account/watch-status"

const dune = {
  tmdbId: 438631,
  mediaType: "movie" as const,
  title: "Duna",
  posterPath: "/duna.jpg",
  year: 2021,
}

const createMemoryStorage = () => {
  const data = new Map<string, string>()

  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
    removeItem: (key: string) => {
      data.delete(key)
    },
    clear: () => {
      data.clear()
    },
  }
}

beforeEach(() => {
  vi.stubGlobal("window", { localStorage: createMemoryStorage() })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("addToWatchlist", () => {
  it("guarda o título como ainda não assistido", () => {
    addToWatchlist(dune)

    expect(listWatchlist()[0]?.watched).toBe(false)
  })

  it("ignora watched true passado pelo caller", () => {
    addToWatchlist({ ...dune, watched: true } as typeof dune)

    expect(listWatchlist()[0]?.watched).toBe(false)
  })

  it("libera o status do detalhe assim que o título é guardado", () => {
    addToWatchlist(dune)

    expect(resolveWatchStatus(listWatchlist()[0])).toEqual({
      watched: false,
      label: "Ainda não assistir",
    })
  })
})

describe("listWatchlist", () => {
  it("trata item antigo sem watched como ainda não assistido", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        session: null,
        preferences: null,
        watchlist: [
          {
            tmdbId: dune.tmdbId,
            mediaType: dune.mediaType,
            title: dune.title,
            posterPath: dune.posterPath,
            year: dune.year,
            createdAt: "2026-09-01T00:00:00.000Z",
          },
        ],
      }),
    )

    expect(listWatchlist()[0]?.watched).toBe(false)
  })
})

const severance = {
  tmdbId: 438631,
  mediaType: "tv" as const,
  title: "Separação",
  posterPath: "/severance.jpg",
  year: 2022,
}

const arrival = {
  tmdbId: 329865,
  mediaType: "movie" as const,
  title: "A Chegada",
  posterPath: "/arrival.jpg",
  year: 2016,
}

describe("setWatchlistWatched", () => {
  it("marca só o item pedido como já assistido", () => {
    addToWatchlist(dune)
    addToWatchlist(arrival)

    setWatchlistWatched(dune.mediaType, dune.tmdbId, true)

    const items = listWatchlist()
    expect(items.find((item) => item.tmdbId === dune.tmdbId)?.watched).toBe(true)
    expect(items.find((item) => item.tmdbId === arrival.tmdbId)?.watched).toBe(false)
  })

  it("volta o item para ainda não assistido", () => {
    addToWatchlist(dune)
    setWatchlistWatched(dune.mediaType, dune.tmdbId, true)
    setWatchlistWatched(dune.mediaType, dune.tmdbId, false)

    expect(listWatchlist()[0]?.watched).toBe(false)
  })

  it("não cria item quando o título não está na lista", () => {
    setWatchlistWatched(dune.mediaType, dune.tmdbId, true)

    expect(listWatchlist()).toEqual([])
  })

  it("mantém status independente entre filme e série com o mesmo id", () => {
    addToWatchlist(dune)
    addToWatchlist(severance)

    setWatchlistWatched("movie", 438631, true)

    const items = listWatchlist()
    expect(items.find((item) => item.mediaType === "movie")?.watched).toBe(true)
    expect(items.find((item) => item.mediaType === "tv")?.watched).toBe(false)
  })

  it("não muda a ordem da lista", () => {
    addToWatchlist(dune)
    addToWatchlist(arrival)

    setWatchlistWatched(dune.mediaType, dune.tmdbId, true)

    expect(listWatchlist().map((item) => item.tmdbId)).toEqual([
      arrival.tmdbId,
      dune.tmdbId,
    ])
  })
})

describe("removeFromWatchlist", () => {
  it("ao guardar de novo, o status volta para ainda não assistido", () => {
    addToWatchlist(dune)
    setWatchlistWatched(dune.mediaType, dune.tmdbId, true)
    removeFromWatchlist(dune.mediaType, dune.tmdbId)
    addToWatchlist(dune)

    expect(listWatchlist()[0]?.watched).toBe(false)
  })

  it("depois de tirar da lista, o detalhe não tem status para mostrar", () => {
    addToWatchlist(dune)
    setWatchlistWatched(dune.mediaType, dune.tmdbId, true)
    removeFromWatchlist(dune.mediaType, dune.tmdbId)

    const remaining = listWatchlist().find((item) => {
      return item.mediaType === dune.mediaType && item.tmdbId === dune.tmdbId
    })

    expect(resolveWatchStatus(remaining)).toBeNull()
  })
})
