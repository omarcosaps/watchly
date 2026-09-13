import type { Preferences } from "@/lib/account/types"
import type { CatalogPage } from "@/lib/catalog/types"
import type { TitleDetails } from "@/lib/catalog/types"
import type { CountryOption, MergedGenre, WatchProvider } from "@/lib/catalog/types"

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

export const fetchCatalog = (
  preferences: Preferences,
  search: URLSearchParams,
) => {
  const params = new URLSearchParams(search)
  params.set("region", preferences.country)
  if (preferences.providerIds.length > 0) {
    params.set("providers", preferences.providerIds.join(","))
  }
  return fetchJson<CatalogPage>(`/api/catalog?${params.toString()}`)
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

const titleRequests = new Map<string, Promise<TitleDetails>>()
const titleResults = new Map<string, TitleDetails>()

const titleRequestKey = (preferences: Preferences, tipo: string, id: string) => {
  return `${preferences.country}:${preferences.providerIds.join(",")}:${tipo}:${id}`
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

export const fetchProviders = (region: string) => {
  return fetchJson<{ providers: WatchProvider[] }>(
    `/api/watch-providers?region=${region}`,
  )
}

export const fetchMeta = () => {
  return fetchJson<{ countries: CountryOption[]; genres: MergedGenre[] }>("/api/meta")
}
