import type { AcquisitionSource, Preferences, WatchlistItem } from "@/lib/account/types"

type StoredUser = {
  id: string
  email: string
  password: string
  acquisitionSource: AcquisitionSource
  preferences: Preferences | null
  watchlist: WatchlistItem[]
}

type QueryFilter = {
  column: string
  value: unknown
}

const rowKey = (mediaType: string, tmdbId: number) => `${mediaType}:${tmdbId}`

export const createAccountTestDouble = () => {
  const users = new Map<string, StoredUser>()
  let currentUserId: string | null = null
  let nextId = 1

  const currentUser = () => {
    if (!currentUserId) return null
    return users.get(currentUserId) ?? null
  }

  const authUser = () => {
    const user = currentUser()
    if (!user) return null
    return { id: user.id, email: user.email }
  }

  const matches = (row: Record<string, unknown>, filters: QueryFilter[]) => {
    return filters.every((filter) => row[filter.column] === filter.value)
  }

  const from = (table: string) => {
    const filters: QueryFilter[] = []
    let op: "select" | "insert" | "update" | "delete" | "upsert" = "select"
    let payload: Record<string, unknown> | null = null
    let wantSingle = false

    const builder = {
      select() {
        return builder
      },
      insert(row: Record<string, unknown>) {
        op = "insert"
        payload = row
        return builder
      },
      upsert(row: Record<string, unknown>) {
        op = "upsert"
        payload = row
        return builder
      },
      update(row: Record<string, unknown>) {
        op = "update"
        payload = row
        return builder
      },
      delete() {
        op = "delete"
        return builder
      },
      eq(column: string, value: unknown) {
        filters.push({ column, value })
        return builder
      },
      order() {
        return builder
      },
      maybeSingle: async () => builder.run(),
      single: async () => {
        wantSingle = true
        return builder.run()
      },
      then(resolve: (value: { data: unknown; error: { message: string } | null }) => void) {
        return builder.run().then(resolve)
      },
      run: async () => {
        const user = currentUser()

        if (table === "preferences") {
          if (op === "select") {
            return { data: user?.preferences
              ? {
                  user_id: user.id,
                  country: user.preferences.country,
                  provider_ids: user.preferences.providerIds,
                  updated_at: new Date().toISOString(),
                }
              : null, error: null }
          }

          if ((op === "upsert" || op === "insert") && payload && user) {
            user.preferences = {
              country: String(payload.country),
              providerIds: payload.provider_ids as number[],
            }
            return { data: null, error: null }
          }

          if (op === "delete" && user) {
            user.preferences = null
            return { data: null, error: null }
          }
        }

        if (table === "watchlist_items") {
          if (!user) {
            return { data: wantSingle ? null : [], error: { message: "not authenticated" } }
          }

          if (op === "select") {
            const data = user.watchlist.map((item) => ({
              id: rowKey(item.mediaType, item.tmdbId),
              user_id: user.id,
              tmdb_id: item.tmdbId,
              media_type: item.mediaType,
              title: item.title,
              poster_path: item.posterPath,
              year: item.year,
              watched: item.watched,
              created_at: item.createdAt,
            }))
            return { data, error: null }
          }

          if (op === "insert" && payload) {
            const item: WatchlistItem = {
              tmdbId: Number(payload.tmdb_id),
              mediaType: payload.media_type as WatchlistItem["mediaType"],
              title: String(payload.title),
              posterPath: (payload.poster_path as string | null) ?? null,
              year: (payload.year as number | null) ?? null,
              watched: payload.watched === true,
              createdAt: new Date().toISOString(),
            }
            const exists = user.watchlist.some((saved) => {
              return rowKey(saved.mediaType, saved.tmdbId) === rowKey(item.mediaType, item.tmdbId)
            })
            if (!exists) {
              user.watchlist = [item, ...user.watchlist]
            }
            const saved = user.watchlist.find((savedItem) => {
              return rowKey(savedItem.mediaType, savedItem.tmdbId) === rowKey(item.mediaType, item.tmdbId)
            })
            return {
              data: saved
                ? {
                    tmdb_id: saved.tmdbId,
                    media_type: saved.mediaType,
                    title: saved.title,
                    poster_path: saved.posterPath,
                    year: saved.year,
                    watched: saved.watched,
                    created_at: saved.createdAt,
                  }
                : null,
              error: null,
            }
          }

          if (op === "update" && payload) {
            user.watchlist = user.watchlist.map((item) => {
              const row = {
                user_id: user.id,
                media_type: item.mediaType,
                tmdb_id: item.tmdbId,
              }
              if (!matches(row, filters)) return item
              return {
                ...item,
                watched: payload?.watched === true,
              }
            })
            return { data: null, error: null }
          }

          if (op === "delete") {
            user.watchlist = user.watchlist.filter((item) => {
              const row = {
                user_id: user.id,
                media_type: item.mediaType,
                tmdb_id: item.tmdbId,
              }
              return !matches(row, filters)
            })
            return { data: null, error: null }
          }
        }

        return { data: null, error: null }
      },
    }

    return builder
  }

  const client = {
    auth: {
      signUp: async ({
        email,
        password,
        options,
      }: {
        email: string
        password: string
        options?: { data?: { acquisition_source?: string } }
      }) => {
        const exists = [...users.values()].some((user) => user.email === email)
        if (exists) {
          return { data: { user: null, session: null }, error: { message: "User already registered" } }
        }

        const user: StoredUser = {
          id: `user-${nextId}`,
          email,
          password,
          acquisitionSource: (options?.data?.acquisition_source ?? "amigo") as AcquisitionSource,
          preferences: null,
          watchlist: [],
        }
        nextId += 1
        users.set(user.id, user)
        currentUserId = user.id
        return {
          data: {
            user: { id: user.id, email: user.email },
            session: { user: { id: user.id, email: user.email } },
          },
          error: null,
        }
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const user = [...users.values()].find((item) => item.email === email)
        if (!user) {
          return { data: { user: null, session: null }, error: { message: "Invalid login credentials" } }
        }
        if (user.password !== password) {
          return { data: { user: null, session: null }, error: { message: "Invalid login credentials" } }
        }
        currentUserId = user.id
        return {
          data: {
            user: { id: user.id, email: user.email },
            session: { user: { id: user.id, email: user.email } },
          },
          error: null,
        }
      },
      signOut: async () => {
        currentUserId = null
        return { error: null }
      },
      getUser: async () => {
        return { data: { user: authUser() }, error: null }
      },
      getSession: async () => {
        const user = authUser()
        return {
          data: { session: user ? { user } : null },
          error: null,
        }
      },
      resetPasswordForEmail: async () => {
        return { data: {}, error: null }
      },
      updateUser: async ({ password }: { password: string }) => {
        const user = currentUser()
        if (!user) {
          return { data: { user: null }, error: { message: "not authenticated" } }
        }
        user.password = password
        return { data: { user: { id: user.id, email: user.email } }, error: null }
      },
      onAuthStateChange: () => {
        return { data: { subscription: { unsubscribe() {} } } }
      },
    },
    rpc: async (fn: string, args: { p_email?: string }) => {
      if (fn !== "email_registered") {
        return { data: null, error: { message: "unknown rpc" } }
      }
      return {
        data: [...users.values()].some((user) => user.email === args.p_email),
        error: null,
      }
    },
    from,
  }

  return client
}
