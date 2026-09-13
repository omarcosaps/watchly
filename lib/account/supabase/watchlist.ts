import { getAccountClient } from "@/lib/account/supabase/client"
import { getAccountSnapshot, patchAccountSnapshot, sortWatchlist } from "@/lib/account/store"
import { AccountError, type WatchlistItem } from "@/lib/account/types"
import type { MediaType } from "@/lib/media"

const itemKey = (mediaType: MediaType, tmdbId: number) => {
  return `${mediaType}:${tmdbId}`
}

const requireUserId = async () => {
  const supabase = getAccountClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AccountError("account_not_found", "Conta não encontrada. Crie uma conta primeiro.")
  }

  return { supabase, user }
}

export const listWatchlist = () => {
  return sortWatchlist(getAccountSnapshot().watchlist)
}

export const isSaved = (mediaType: MediaType, tmdbId: number) => {
  return listWatchlist().some((item) => item.mediaType === mediaType && item.tmdbId === tmdbId)
}

export const addToWatchlist = async (item: Omit<WatchlistItem, "createdAt" | "watched">) => {
  const existing = listWatchlist().find((saved) => {
    return itemKey(saved.mediaType, saved.tmdbId) === itemKey(item.mediaType, item.tmdbId)
  })

  if (existing) return existing

  const optimistic: WatchlistItem = {
    tmdbId: item.tmdbId,
    mediaType: item.mediaType,
    title: item.title,
    posterPath: item.posterPath,
    year: item.year,
    watched: false,
    createdAt: new Date().toISOString(),
  }

  patchAccountSnapshot({
    watchlist: sortWatchlist([optimistic, ...getAccountSnapshot().watchlist]),
  })

  try {
    const { supabase, user } = await requireUserId()
    const { data, error } = await supabase
      .from("watchlist_items")
      .insert({
        user_id: user.id,
        tmdb_id: item.tmdbId,
        media_type: item.mediaType,
        title: item.title,
        poster_path: item.posterPath,
        year: item.year,
        watched: false,
      })
      .select("tmdb_id, media_type, title, poster_path, year, watched, created_at")
      .single()

    if (error) {
      throw error
    }

    const saved: WatchlistItem = {
      tmdbId: data.tmdb_id,
      mediaType: data.media_type,
      title: data.title,
      posterPath: data.poster_path,
      year: data.year,
      createdAt: data.created_at,
      watched: data.watched === true,
    }

    patchAccountSnapshot({
      watchlist: sortWatchlist(
        getAccountSnapshot().watchlist.map((current) => {
          if (itemKey(current.mediaType, current.tmdbId) !== itemKey(saved.mediaType, saved.tmdbId)) {
            return current
          }
          return saved
        }),
      ),
    })

    return saved
  } catch (persistError) {
    patchAccountSnapshot({
      watchlist: getAccountSnapshot().watchlist.filter((current) => {
        return itemKey(current.mediaType, current.tmdbId) !== itemKey(item.mediaType, item.tmdbId)
      }),
    })
    throw persistError
  }
}

export const removeFromWatchlist = async (mediaType: MediaType, tmdbId: number) => {
  const previous = getAccountSnapshot().watchlist

  patchAccountSnapshot({
    watchlist: previous.filter((item) => {
      return itemKey(item.mediaType, item.tmdbId) !== itemKey(mediaType, tmdbId)
    }),
  })

  try {
    const { supabase, user } = await requireUserId()
    const { error } = await supabase
      .from("watchlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("media_type", mediaType)
      .eq("tmdb_id", tmdbId)

    if (error) {
      throw error
    }
  } catch (persistError) {
    patchAccountSnapshot({
      watchlist: previous,
    })
    throw persistError
  }
}

export const setWatchlistWatched = async (
  mediaType: MediaType,
  tmdbId: number,
  watched: boolean,
) => {
  const previous = getAccountSnapshot().watchlist
  const exists = previous.some((item) => {
    return itemKey(item.mediaType, item.tmdbId) === itemKey(mediaType, tmdbId)
  })

  if (!exists) return

  patchAccountSnapshot({
    watchlist: previous.map((item) => {
      if (itemKey(item.mediaType, item.tmdbId) !== itemKey(mediaType, tmdbId)) {
        return item
      }

      return {
        ...item,
        watched,
      }
    }),
  })

  try {
    const { supabase, user } = await requireUserId()
    const { error } = await supabase
      .from("watchlist_items")
      .update({ watched })
      .eq("user_id", user.id)
      .eq("media_type", mediaType)
      .eq("tmdb_id", tmdbId)

    if (error) {
      throw error
    }
  } catch (persistError) {
    patchAccountSnapshot({
      watchlist: previous,
    })
    throw persistError
  }
}
