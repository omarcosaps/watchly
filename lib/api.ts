import type { Preferences } from "@/lib/account/types"
import { homeCatalogParams } from "@/lib/catalog/home-query"
import { heroCatalogParams } from "@/lib/catalog/hero-params"
import type { CatalogPage } from "@/lib/catalog/types"
import type { TitleDetails } from "@/lib/catalog/types"
import type { CountryOption, MergedGenre, WatchProvider } from "@/lib/catalog/types"
import { hrefSearch } from "@/lib/motion"

export const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)
  const data = (await response.json()) as { error?: string }
  if (!response.ok) {
    throw new Error(data.error ?? "Algo deu errado")
  }
  return data as T
}

export const preferenceQuery = (preferences: Preferences) => {
  const params = new URLSearchParams({
    region: preferences.country,
    providers: preferences.providerIds.join(","),
  })
  return params.toString()
}

type MetaPayload = { countries: CountryOption[]; genres: MergedGenre[] }
type ProvidersPayload = { providers: WatchProvider[] }

const catalogRequests = new Map<string, Promise<CatalogPage>>()
const catalogResults = new Map<string, CatalogPage>()
const titleRequests = new Map<string, Promise<TitleDetails>>()
const titleResults = new Map<string, TitleDetails>()
const providerRequests = new Map<string, Promise<ProvidersPayload>>()
const providerResults = new Map<string, ProvidersPayload>()
let metaRequest: Promise<MetaPayload> | null = null
let metaResult: MetaPayload | null = null

const catalogUrl = (preferences: Preferences, search: URLSearchParams) => {
  const params = new URLSearchParams(search)
  params.set("region", preferences.country)
  if (preferences.providerIds.length > 0) {
    params.set("providers", preferences.providerIds.join(","))
  }
  return `/api/catalog?${params.toString()}`
}

const titleRequestKey = (preferences: Preferences, tipo: string, id: string) => {
  return `${preferences.country}:${preferences.providerIds.join(",")}:${tipo}:${id}`
}

export const resetClientApiCache = () => {
  catalogRequests.clear()
  catalogResults.clear()
  titleRequests.clear()
  titleResults.clear()
  providerRequests.clear()
  providerResults.clear()
  metaRequest = null
  metaResult = null
}

export const peekCatalog = (preferences: Preferences, search: URLSearchParams) => {
  return catalogResults.get(catalogUrl(preferences, search)) ?? null
}

export const fetchCatalog = (
  preferences: Preferences,
  search: URLSearchParams,
) => {
  const key = catalogUrl(preferences, search)
  const resolved = catalogResults.get(key)
  if (resolved) return Promise.resolve(resolved)

  const cached = catalogRequests.get(key)
  if (cached) return cached

  const request = fetchJson<CatalogPage>(key)
    .then((data) => {
      catalogResults.set(key, data)
      return data
    })
    .catch((error: unknown) => {
      catalogRequests.delete(key)
      throw error
    })

  catalogRequests.set(key, request)
  return request
}

export const fetchSearch = (
  preferences: Preferences,
  query: string,
  page: number,
) => {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    region: preferences.country,
    providers: preferences.providerIds.join(","),
  })
  return fetchJson<CatalogPage>(`/api/search?${params.toString()}`)
}

export const peekTitle = (
  preferences: Preferences,
  tipo: string,
  id: string,
) => {
  return titleResults.get(titleRequestKey(preferences, tipo, id)) ?? null
}

export const fetchTitle = (
  preferences: Preferences,
  tipo: string,
  id: string,
) => {
  const key = titleRequestKey(preferences, tipo, id)
  const resolved = titleResults.get(key)
  if (resolved) return Promise.resolve(resolved)

  const cached = titleRequests.get(key)
  if (cached) return cached

  const request = fetchJson<TitleDetails>(
    `/api/title/${tipo}/${id}?${preferenceQuery(preferences)}`,
  )
    .then((data) => {
      titleResults.set(key, data)
      return data
    })
    .catch((error: unknown) => {
      titleRequests.delete(key)
      throw error
    })

  titleRequests.set(key, request)
  return request
}

export const peekProviders = (region: string) => {
  return providerResults.get(region) ?? null
}

export const fetchProviders = (region: string) => {
  const resolved = providerResults.get(region)
  if (resolved) return Promise.resolve(resolved)

  const cached = providerRequests.get(region)
  if (cached) return cached

  const request = fetchJson<ProvidersPayload>(
    `/api/watch-providers?region=${region}`,
  )
    .then((data) => {
      providerResults.set(region, data)
      return data
    })
    .catch((error: unknown) => {
      providerRequests.delete(region)
      throw error
    })

  providerRequests.set(region, request)
  return request
}

export const peekMeta = () => {
  return metaResult
}

export const fetchMeta = () => {
  if (metaResult) return Promise.resolve(metaResult)
  if (metaRequest) return metaRequest

  metaRequest = fetchJson<MetaPayload>("/api/meta")
    .then((data) => {
      metaResult = data
      return data
    })
    .catch((error: unknown) => {
      metaRequest = null
      throw error
    })

  return metaRequest
}

export const warmHome = (preferences: Preferences, href = "/") => {
  const search = hrefSearch(href)
  const heroPreferences = { country: preferences.country, providerIds: [] as number[] }
  const metaPromise = fetchMeta()

  return Promise.all([
    metaPromise,
    fetchProviders(preferences.country),
    fetchCatalog(heroPreferences, heroCatalogParams()),
    metaPromise.then((meta) =>
      fetchCatalog(preferences, homeCatalogParams(search, meta.genres, 1)),
    ),
  ])
}
