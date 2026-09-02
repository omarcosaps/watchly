import type { Preferences, Session, WatchlistItem } from "@/lib/account/types"

export const STORAGE_KEY = "watchly-account-v1"

export type StoredAccount = {
  session: Session | null
  preferences: Preferences | null
  watchlist: WatchlistItem[]
}

export const emptyAccount = (): StoredAccount => {
  return {
    session: null,
    preferences: null,
    watchlist: [],
  }
}

const normalizeWatchlistItem = (item: WatchlistItem): WatchlistItem => {
  return {
    ...item,
    watched: item.watched === true,
  }
}

export const readAccount = (): StoredAccount => {
  if (typeof window === "undefined") return emptyAccount()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyAccount()

    const parsed = JSON.parse(raw) as Partial<StoredAccount>
    return {
      session: parsed.session ?? null,
      preferences: parsed.preferences ?? null,
      watchlist: Array.isArray(parsed.watchlist)
        ? parsed.watchlist.map(normalizeWatchlistItem)
        : [],
    }
  } catch {
    return emptyAccount()
  }
}

export const writeAccount = (account: StoredAccount) => {
  if (typeof window === "undefined") {
    throw new Error("Persistência local indisponível")
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account))
}

export const mutateAccount = (updater: (current: StoredAccount) => StoredAccount) => {
  const next = updater(readAccount())
  writeAccount(next)
  return next
}
