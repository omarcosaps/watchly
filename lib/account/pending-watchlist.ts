import type { MediaType } from "@/lib/media"

const STORAGE_KEY = "watchly-pending-wl"

export type PendingWatchlist = {
  tmdbId: number
  mediaType: MediaType
  title: string
  posterPath: string | null
  year: number | null
}

export const setPendingWatchlist = (item: PendingWatchlist) => {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(item))
}

export const consumePendingWatchlist = (): PendingWatchlist | null => {
  if (typeof window === "undefined") return null

  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  window.sessionStorage.removeItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as PendingWatchlist
  } catch {
    return null
  }
}

export const clearPendingWatchlist = () => {
  if (typeof window === "undefined") return
  window.sessionStorage.removeItem(STORAGE_KEY)
}

export const loginHref = (intent: "watchlist" | "save" = "save") => {
  return `/login?intent=${intent}`
}
