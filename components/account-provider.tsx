"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import { readAccount } from "@/lib/account/mock/storage"
import { applyCountryChange, savePreferences } from "@/lib/account/preferences"
import {
  confirmEmail,
  requestPasswordReset,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from "@/lib/account/session"
import type { Preferences, Session, WatchlistItem } from "@/lib/account/types"
import {
  addToWatchlist,
  isSaved,
  removeFromWatchlist,
  setWatchlistWatched,
} from "@/lib/account/watchlist"
import type { MediaType } from "@/lib/media"

const subscribe = (onStoreChange: () => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === "watchly-account-v1") onStoreChange()
  }

  window.addEventListener("watchly-account", onStoreChange)
  window.addEventListener("storage", handleStorage)
  return () => {
    window.removeEventListener("watchly-account", onStoreChange)
    window.removeEventListener("storage", handleStorage)
  }
}

const getSnapshot = () => JSON.stringify(readAccount())

const getServerSnapshot = () => {
  return JSON.stringify({ session: null, preferences: null, watchlist: [] })
}

const emit = () => {
  window.dispatchEvent(new Event("watchly-account"))
}

type AccountContextValue = {
  ready: boolean
  session: Session | null
  preferences: Preferences | null
  watchlist: WatchlistItem[]
  signUp: typeof signUp
  signIn: typeof signIn
  signOut: typeof signOut
  confirmEmail: typeof confirmEmail
  requestPasswordReset: typeof requestPasswordReset
  updatePassword: typeof updatePassword
  savePreferences: typeof savePreferences
  applyCountryChange: typeof applyCountryChange
  addToWatchlist: typeof addToWatchlist
  removeFromWatchlist: typeof removeFromWatchlist
  setWatchlistWatched: typeof setWatchlistWatched
  isSaved: (mediaType: MediaType, tmdbId: number) => boolean
}

const AccountContext = createContext<AccountContextValue | null>(null)

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const account = useMemo(() => JSON.parse(snapshot) as ReturnType<typeof readAccount>, [snapshot])

  const wrap = useCallback(<T extends unknown[], R>(fn: (...args: T) => R) => {
    return (...args: T) => {
      const result = fn(...args)
      emit()
      return result
    }
  }, [])

  const value = useMemo<AccountContextValue>(() => {
    const watchlist = [...account.watchlist].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    return {
      ready,
      session: account.session,
      preferences: account.preferences,
      watchlist,
      signUp: wrap(signUp),
      signIn: wrap(signIn),
      signOut: wrap(signOut),
      confirmEmail: wrap(confirmEmail),
      requestPasswordReset: wrap(requestPasswordReset),
      updatePassword: wrap(updatePassword),
      savePreferences: wrap(savePreferences),
      applyCountryChange: wrap(applyCountryChange),
      addToWatchlist: wrap(addToWatchlist),
      removeFromWatchlist: wrap(removeFromWatchlist),
      setWatchlistWatched: wrap(setWatchlistWatched),
      isSaved,
    }
  }, [account.preferences, account.session, account.watchlist, ready, wrap])

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export const useAccount = () => {
  const context = useContext(AccountContext)
  if (!context) {
    throw new Error("useAccount precisa do AccountProvider")
  }
  return context
}
