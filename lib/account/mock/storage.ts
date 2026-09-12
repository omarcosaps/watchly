import type {
  AcquisitionSource,
  Preferences,
  Session,
  WatchlistItem,
} from "@/lib/account/types"

export const STORAGE_KEY = "watchly-account-v2"
const LEGACY_STORAGE_KEY = "watchly-account-v1"

export type StoredUser = {
  password: string
  acquisitionSource: AcquisitionSource | null
  preferences: Preferences | null
  watchlist: WatchlistItem[]
}

export type StoredState = {
  session: Session | null
  accounts: Record<string, StoredUser>
}

export type StoredAccount = {
  session: Session | null
  preferences: Preferences | null
  watchlist: WatchlistItem[]
}

export const emptyState = (): StoredState => {
  return {
    session: null,
    accounts: {},
  }
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

const normalizeUser = (user: Partial<StoredUser> | undefined): StoredUser => {
  return {
    password: user?.password ?? "",
    acquisitionSource: user?.acquisitionSource ?? null,
    preferences: user?.preferences ?? null,
    watchlist: Array.isArray(user?.watchlist)
      ? user.watchlist.map(normalizeWatchlistItem)
      : [],
  }
}

export const viewAccount = (state: StoredState): StoredAccount => {
  const email = state.session?.email
  const user = email ? state.accounts[email] : undefined

  return {
    session: state.session,
    preferences: user?.preferences ?? null,
    watchlist: user?.watchlist ?? [],
  }
}

const migrateLegacy = (raw: string): StoredState | null => {
  try {
    const parsed = JSON.parse(raw) as Partial<StoredAccount> & Partial<StoredState>
    if (parsed.accounts && typeof parsed.accounts === "object") {
      return {
        session: parsed.session ?? null,
        accounts: Object.fromEntries(
          Object.entries(parsed.accounts).map(([email, user]) => {
            return [email, normalizeUser(user)]
          }),
        ),
      }
    }

    const email = parsed.session?.email
    if (!email && !parsed.watchlist?.length && !parsed.preferences) {
      return emptyState()
    }

    const accounts: Record<string, StoredUser> = {}
    if (email) {
      accounts[email] = normalizeUser({
        preferences: parsed.preferences,
        watchlist: parsed.watchlist,
      })
    }

    return {
      session: parsed.session
        ? { email: parsed.session.email, status: "authenticated" }
        : null,
      accounts,
    }
  } catch {
    return null
  }
}

export const readState = (): StoredState => {
  if (typeof window === "undefined") return emptyState()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const migrated = migrateLegacy(raw)
      return migrated ?? emptyState()
    }

    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!legacy) return emptyState()

    const migrated = migrateLegacy(legacy)
    if (!migrated) return emptyState()

    writeState(migrated)
    return migrated
  } catch {
    return emptyState()
  }
}

export const writeState = (state: StoredState) => {
  if (typeof window === "undefined") {
    throw new Error("Persistência local indisponível")
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const readAccount = (): StoredAccount => {
  return viewAccount(readState())
}

export const writeAccount = (account: StoredAccount) => {
  const state = readState()
  const email = account.session?.email ?? state.session?.email
  const accounts = { ...state.accounts }

  if (email) {
    accounts[email] = {
      ...normalizeUser(accounts[email]),
      preferences: account.preferences,
      watchlist: account.watchlist.map(normalizeWatchlistItem),
    }
  }

  writeState({
    session: account.session,
    accounts,
  })
}

export const mutateState = (updater: (current: StoredState) => StoredState) => {
  const next = updater(readState())
  writeState(next)
  return next
}

export const mutateAccount = (updater: (current: StoredAccount) => StoredAccount) => {
  const next = updater(readAccount())
  writeAccount(next)
  return next
}
