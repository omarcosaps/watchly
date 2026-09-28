import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database } from "@/lib/supabase/database.types"
import { getSupabaseKey, getSupabaseUrl } from "@/lib/supabase/env"

const SESSION_REFRESH_BUDGET_MS = 2000
const SESSION_REFRESH_COOLDOWN_MS = 30_000

let sessionRefreshPausedUntil = 0

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = getSupabaseUrl()
  const key = getSupabaseKey()

  if (!url || !key) {
    return supabaseResponse
  }

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
        Object.entries(headers).forEach(([headerName, headerValue]) => {
          supabaseResponse.headers.set(headerName, headerValue)
        })
      },
    },
  })

  if (Date.now() < sessionRefreshPausedUntil) {
    return supabaseResponse
  }

  let settled = false
  const refresh = (async () => {
    try {
      const { error } = await supabase.auth.getUser()
      settled = true
      if (error?.name === "AuthRetryableFetchError") {
        sessionRefreshPausedUntil = Date.now() + SESSION_REFRESH_COOLDOWN_MS
      }
    } catch {
      settled = true
      sessionRefreshPausedUntil = Date.now() + SESSION_REFRESH_COOLDOWN_MS
    }
  })()

  const budget = new Promise<"timeout">((resolve) => {
    setTimeout(() => resolve("timeout"), SESSION_REFRESH_BUDGET_MS)
  })
  const winner = await Promise.race([refresh.then(() => "done" as const), budget])

  if (winner === "timeout" && !settled) {
    sessionRefreshPausedUntil = Date.now() + SESSION_REFRESH_COOLDOWN_MS
  }

  return supabaseResponse
}
