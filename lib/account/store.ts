import type { Preferences, Session, WatchlistItem } from "@/lib/account/types"

export type AccountSnapshot = {
  session: Session | null
  preferences: Preferences | null
  watchlist: WatchlistItem[]
  ready: boolean
  accountReady: boolean
  loadError: string | null
}

const listeners = new Set<() => void>()

const emptySnapshot = (): AccountSnapshot => {
  return {
    session: null,
    preferences: null,
    watchlist: [],
    ready: false,
    accountReady: false,
    loadError: null,
  }
}

const serverSnapshot = emptySnapshot()

let snapshot = emptySnapshot()

const emit = () => {
  listeners.forEach((listener) => listener())
}

export const subscribeAccount = (onStoreChange: () => void) => {
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}

export const getAccountSnapshot = () => snapshot

export const getServerAccountSnapshot = () => serverSnapshot

export const setAccountSnapshot = (next: AccountSnapshot) => {
  snapshot = next
  emit()
}

export const patchAccountSnapshot = (partial: Partial<AccountSnapshot>) => {
  snapshot = {
    ...snapshot,
    ...partial,
  }
  emit()
}

export const resetAccountSnapshot = () => {
  snapshot = emptySnapshot()
  emit()
}

export const sortWatchlist = (items: WatchlistItem[]) => {
  return [...items].sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}
