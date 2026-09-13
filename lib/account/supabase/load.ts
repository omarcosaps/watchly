import { getAccountClient } from "@/lib/account/supabase/client"
import { patchAccountSnapshot, sortWatchlist } from "@/lib/account/store"
import type { Preferences, Session, WatchlistItem } from "@/lib/account/types"
import type { Database } from "@/lib/supabase/database.types"

type WatchlistRow = Database["public"]["Tables"]["watchlist_items"]["Row"]
type PreferencesRow = Database["public"]["Tables"]["preferences"]["Row"]

const toSession = (email: string | undefined): Session | null => {
  if (!email) return null
  return {
    email,
    status: "authenticated",
  }
}

const toPreferences = (row: PreferencesRow | null): Preferences | null => {
  if (!row) return null
  return {
    country: row.country,
    providerIds: row.provider_ids,
  }
}

const toWatchlistItem = (row: WatchlistRow): WatchlistItem => {
  return {
    tmdbId: row.tmdb_id,
    mediaType: row.media_type,
    title: row.title,
    posterPath: row.poster_path,
    year: row.year,
    createdAt: row.created_at,
    watched: row.watched === true,
  }
}

export const loadAccountForUser = async (userId: string, email: string) => {
  const supabase = getAccountClient()

  const [preferencesResult, watchlistResult] = await Promise.all([
    supabase.from("preferences").select("country, provider_ids, user_id, updated_at").eq("user_id", userId).maybeSingle(),
    supabase
      .from("watchlist_items")
      .select("id, user_id, tmdb_id, media_type, title, poster_path, year, watched, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ])

  if (preferencesResult.error) {
    throw preferencesResult.error
  }

  if (watchlistResult.error) {
    throw watchlistResult.error
  }

  patchAccountSnapshot({
    session: toSession(email),
    preferences: toPreferences(preferencesResult.data),
    watchlist: sortWatchlist((watchlistResult.data ?? []).map(toWatchlistItem)),
    ready: true,
    accountReady: true,
    loadError: null,
  })
}

export const loadGuestAccount = () => {
  patchAccountSnapshot({
    session: null,
    preferences: null,
    watchlist: [],
    ready: true,
    accountReady: true,
    loadError: null,
  })
}

export const hydrateAccount = async () => {
  const supabase = getAccountClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    patchAccountSnapshot({
      session: null,
      preferences: null,
      watchlist: [],
      ready: true,
      accountReady: true,
      loadError: error.message,
    })
    return
  }

  if (!session?.user) {
    loadGuestAccount()
    return
  }

  try {
    await loadAccountForUser(session.user.id, session.user.email ?? "")
  } catch (loadError) {
    patchAccountSnapshot({
      session: toSession(session.user.email),
      ready: true,
      accountReady: false,
      loadError: loadError instanceof Error ? loadError.message : "Não deu para carregar a conta",
    })
  }
}

export const listenAccountAuth = () => {
  const supabase = getAccountClient()
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "INITIAL_SESSION") return

    if (event === "SIGNED_OUT" || !session?.user) {
      loadGuestAccount()
      return
    }

    if (event === "TOKEN_REFRESHED") return

    void loadAccountForUser(session.user.id, session.user.email ?? "").catch((loadError: unknown) => {
      patchAccountSnapshot({
        session: toSession(session.user.email),
        ready: true,
        accountReady: false,
        loadError: loadError instanceof Error ? loadError.message : "Não deu para carregar a conta",
      })
    })
  })

  return () => {
    subscription.unsubscribe()
  }
}
