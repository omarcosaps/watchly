"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import { applyCountryChange, savePreferences } from "@/lib/account/preferences"
import {
  confirmEmail,
  requestPasswordReset,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from "@/lib/account/session"
import {
  getAccountSnapshot,
  getServerAccountSnapshot,
  patchAccountSnapshot,
  subscribeAccount,
} from "@/lib/account/store"
import { hydrateAccount, listenAccountAuth } from "@/lib/account/supabase/load"
import type { Preferences, Session, WatchlistItem } from "@/lib/account/types"
import {
  addToWatchlist,
  isSaved as isWatchlistSaved,
  removeFromWatchlist,
  setWatchlistWatched,
} from "@/lib/account/watchlist"
import type { MediaType } from "@/lib/media"

type AccountContextValue = {
  ready: boolean
  accountReady: boolean
  loadError: string | null
  session: Session | null
  preferences: Preferences | null
  watchlist: WatchlistItem[]
  retryAccount: () => Promise<void>
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
  const account = useSyncExternalStore(
    subscribeAccount,
    getAccountSnapshot,
    getServerAccountSnapshot,
  )

  useEffect(() => {
    let cancelled = false
    let unsubscribe = () => {}

    const start = async () => {
      try {
        await hydrateAccount()
        if (cancelled) return
        unsubscribe = listenAccountAuth()
      } catch (error) {
        if (cancelled) return
        patchAccountSnapshot({
          session: null,
          preferences: null,
          watchlist: [],
          ready: true,
          accountReady: true,
          loadError: error instanceof Error ? error.message : "Supabase não configurado",
        })
      }
    }

    void start()

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const retryAccount = useCallback(async () => {
    await hydrateAccount()
  }, [])

  const value = useMemo<AccountContextValue>(() => {
    return {
      ready: account.ready,
      accountReady: account.accountReady,
      loadError: account.loadError,
      session: account.session,
      preferences: account.preferences,
      watchlist: account.watchlist,
      retryAccount,
      signUp,
      signIn,
      signOut,
      confirmEmail,
      requestPasswordReset,
      updatePassword,
      savePreferences,
      applyCountryChange,
      addToWatchlist,
      removeFromWatchlist,
      setWatchlistWatched,
      isSaved: isWatchlistSaved,
    }
  }, [account, retryAccount])

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export const useAccount = () => {
  const context = useContext(AccountContext)
  if (!context) {
    throw new Error("useAccount precisa do AccountProvider")
  }
  return context
}
