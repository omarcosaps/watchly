import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "@/lib/supabase/database.types"
import { getSupabaseKey, getSupabaseUrl } from "@/lib/supabase/env"

export const createBrowserSupabaseClient = () => {
  const url = getSupabaseUrl()
  const key = getSupabaseKey()

  if (!url || !key) {
    throw new Error("Supabase não configurado")
  }

  return createBrowserClient<Database>(url, key)
}
