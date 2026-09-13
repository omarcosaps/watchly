import { createBrowserSupabaseClient } from "@/lib/supabase/browser"

export const getAccountClient = () => {
  return createBrowserSupabaseClient()
}
