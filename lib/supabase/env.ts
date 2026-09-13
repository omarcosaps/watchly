export const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
}

export const getSupabaseKey = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    ""
  )
}

export const hasSupabaseConfig = () => {
  return Boolean(getSupabaseUrl() && getSupabaseKey())
}
