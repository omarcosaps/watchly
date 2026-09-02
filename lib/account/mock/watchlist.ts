import { mutateAccount, readAccount } from "@/lib/account/mock/storage"
import type { WatchlistItem } from "@/lib/account/types"
import type { MediaType } from "@/lib/media"

const itemKey = (mediaType: MediaType, tmdbId: number) => {
  return `${mediaType}:${tmdbId}`
}

export const listWatchlist = () => {
  const { watchlist } = readAccount()
  return [...watchlist].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const isSaved = (mediaType: MediaType, tmdbId: number) => {
  return listWatchlist().some((item) => item.mediaType === mediaType && item.tmdbId === tmdbId)
}

export const addToWatchlist = (item: Omit<WatchlistItem, "createdAt" | "watched">) => {
  const nextItem: WatchlistItem = {
    ...item,
    watched: false,
    createdAt: new Date().toISOString(),
  }

  const account = mutateAccount((current) => {
    const exists = current.watchlist.some((saved) => {
      return itemKey(saved.mediaType, saved.tmdbId) === itemKey(item.mediaType, item.tmdbId)
    })

    if (exists) return current

    return {
      ...current,
      watchlist: [nextItem, ...current.watchlist],
    }
  })

  return account.watchlist.find((saved) => {
    return itemKey(saved.mediaType, saved.tmdbId) === itemKey(item.mediaType, item.tmdbId)
  }) as WatchlistItem
}

export const removeFromWatchlist = (mediaType: MediaType, tmdbId: number) => {
  mutateAccount((current) => ({
    ...current,
    watchlist: current.watchlist.filter((item) => {
      return itemKey(item.mediaType, item.tmdbId) !== itemKey(mediaType, tmdbId)
    }),
  }))
}

export const setWatchlistWatched = (
  mediaType: MediaType,
  tmdbId: number,
  watched: boolean,
) => {
  mutateAccount((current) => {
    const exists = current.watchlist.some((item) => {
      return itemKey(item.mediaType, item.tmdbId) === itemKey(mediaType, tmdbId)
    })

    if (!exists) return current

    return {
      ...current,
      watchlist: current.watchlist.map((item) => {
        if (itemKey(item.mediaType, item.tmdbId) !== itemKey(mediaType, tmdbId)) {
          return item
        }

        return {
          ...item,
          watched,
        }
      }),
    }
  })
}
