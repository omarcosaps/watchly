import { afterEach, describe, expect, it, vi } from "vitest"

import { GUEST_PREFERENCES } from "@/lib/account/types"
import {
  fetchCatalog,
  fetchMeta,
  fetchProviders,
  peekCatalog,
  peekMeta,
  peekProviders,
  resetClientApiCache,
} from "@/lib/api"

const catalogPage = {
  page: 1,
  totalPages: 2,
  items: [],
}

const metaPayload = {
  countries: [{ code: "BR", name: "Brasil" }],
  genres: [{ name: "Ação", movieId: 28 }],
}

afterEach(() => {
  resetClientApiCache()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const stubJson = (payload: unknown) => {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => payload,
  })
}

describe("fetchCatalog", () => {
  it("devolve o mesmo resultado no peek e reusa a promise resolvida", async () => {
    const fetchMock = stubJson(catalogPage)
    vi.stubGlobal("fetch", fetchMock)

    const search = new URLSearchParams("page=1")
    expect(peekCatalog(GUEST_PREFERENCES, search)).toBeNull()

    const first = await fetchCatalog(GUEST_PREFERENCES, search)
    const second = await fetchCatalog(GUEST_PREFERENCES, search)

    expect(first).toEqual(catalogPage)
    expect(second).toBe(first)
    expect(peekCatalog(GUEST_PREFERENCES, search)).toBe(first)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("reusa a promise in-flight", async () => {
    let resolveJson: ((value: unknown) => void) | undefined
    const fetchMock = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveJson = (payload: unknown) => {
          resolve({
            ok: true,
            json: async () => payload,
          })
        }
      }),
    )
    vi.stubGlobal("fetch", fetchMock)

    const search = new URLSearchParams("page=1")
    const first = fetchCatalog(GUEST_PREFERENCES, search)
    const second = fetchCatalog(GUEST_PREFERENCES, search)
    expect(second).toBe(first)

    resolveJson?.(catalogPage)
    expect(await first).toEqual(catalogPage)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe("fetchMeta", () => {
  it("guarda o meta para o peek e não busca de novo", async () => {
    const fetchMock = stubJson(metaPayload)
    vi.stubGlobal("fetch", fetchMock)

    expect(peekMeta()).toBeNull()
    const first = await fetchMeta()
    const second = await fetchMeta()

    expect(first).toEqual(metaPayload)
    expect(second).toBe(first)
    expect(peekMeta()).toBe(first)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe("fetchProviders", () => {
  it("isola o cache por região", async () => {
    const fetchMock = stubJson({ providers: [] })
    vi.stubGlobal("fetch", fetchMock)

    expect(peekProviders("BR")).toBeNull()
    const brazil = await fetchProviders("BR")
    const again = await fetchProviders("BR")

    expect(again).toBe(brazil)
    expect(peekProviders("BR")).toBe(brazil)
    expect(peekProviders("US")).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
