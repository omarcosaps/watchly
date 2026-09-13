import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { resetAccountSnapshot } from "@/lib/account/store"
import { createAccountTestDouble } from "@/lib/account/test-double"
import { resolveWatchStatus } from "@/lib/account/watch-status"

const testDouble = createAccountTestDouble()

vi.mock("@/lib/account/supabase/client", () => ({
  getAccountClient: () => testDouble,
}))

import { signUp } from "@/lib/account/session"
import {
  addToWatchlist,
  listWatchlist,
  removeFromWatchlist,
  setWatchlistWatched,
} from "@/lib/account/watchlist"

const dune = {
  tmdbId: 438631,
  mediaType: "movie" as const,
  title: "Duna",
  posterPath: "/duna.jpg",
  year: 2021,
}

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

beforeEach(async () => {
  resetAccountSnapshot()
  Object.assign(testDouble, createAccountTestDouble())
  await signUp("qa@watchly.app", "123456", "amigo")
})

afterEach(() => {
  resetAccountSnapshot()
})

describe("addToWatchlist", () => {
  it("guarda o título como ainda não assistido", async () => {
    await addToWatchlist(dune)

    expect(listWatchlist()[0]?.watched).toBe(false)
  })

  it("ignora watched true passado pelo caller", async () => {
    await addToWatchlist({ ...dune, watched: true } as typeof dune)

    expect(listWatchlist()[0]?.watched).toBe(false)
  })

  it("libera o status do detalhe assim que o título é guardado", async () => {
    await addToWatchlist(dune)

    expect(resolveWatchStatus(listWatchlist()[0])).toEqual({
      watched: false,
      label: "Ainda não assistido",
    })
  })
})

describe("setWatchlistWatched", () => {
  it("marca só o item pedido como já assistido", async () => {
    await addToWatchlist(dune)
    await addToWatchlist(arrival)

    await setWatchlistWatched(dune.mediaType, dune.tmdbId, true)

    const items = listWatchlist()
    expect(items.find((item) => item.tmdbId === dune.tmdbId)?.watched).toBe(true)
    expect(items.find((item) => item.tmdbId === arrival.tmdbId)?.watched).toBe(false)
  })

  it("volta o item para ainda não assistido", async () => {
    await addToWatchlist(dune)
    await setWatchlistWatched(dune.mediaType, dune.tmdbId, true)
    await setWatchlistWatched(dune.mediaType, dune.tmdbId, false)

    expect(listWatchlist()[0]?.watched).toBe(false)
  })

  it("não cria item quando o título não está na lista", async () => {
    await setWatchlistWatched(dune.mediaType, dune.tmdbId, true)

    expect(listWatchlist()).toEqual([])
  })

  it("mantém status independente entre filme e série com o mesmo id", async () => {
    await addToWatchlist(dune)
    await addToWatchlist(severance)

    await setWatchlistWatched("movie", 438631, true)

    const items = listWatchlist()
    expect(items.find((item) => item.mediaType === "movie")?.watched).toBe(true)
    expect(items.find((item) => item.mediaType === "tv")?.watched).toBe(false)
  })

  it("não muda a ordem da lista", async () => {
    await addToWatchlist(dune)
    await addToWatchlist(arrival)

    await setWatchlistWatched(dune.mediaType, dune.tmdbId, true)

    expect(listWatchlist().map((item) => item.tmdbId)).toEqual([
      arrival.tmdbId,
      dune.tmdbId,
    ])
  })
})

describe("removeFromWatchlist", () => {
  it("ao guardar de novo, o status volta para ainda não assistido", async () => {
    await addToWatchlist(dune)
    await setWatchlistWatched(dune.mediaType, dune.tmdbId, true)
    await removeFromWatchlist(dune.mediaType, dune.tmdbId)
    await addToWatchlist(dune)

    expect(listWatchlist()[0]?.watched).toBe(false)
  })

  it("depois de tirar da lista, o detalhe não tem status para mostrar", async () => {
    await addToWatchlist(dune)
    await setWatchlistWatched(dune.mediaType, dune.tmdbId, true)
    await removeFromWatchlist(dune.mediaType, dune.tmdbId)

    const remaining = listWatchlist().find((item) => {
      return item.mediaType === dune.mediaType && item.tmdbId === dune.tmdbId
    })

    expect(resolveWatchStatus(remaining)).toBeNull()
  })
})
