import { getAccountClient } from "@/lib/account/supabase/client"
import { getAccountSnapshot, patchAccountSnapshot } from "@/lib/account/store"
import { AccountError, type Preferences } from "@/lib/account/types"

const normalizePreferences = (preferences: Preferences): Preferences => {
  const country = preferences.country.trim().toUpperCase()
  const providerIds = [...new Set(preferences.providerIds)].filter((id) => {
    return Number.isInteger(id) && id > 0
  })

  if (!/^[A-Z]{2}$/.test(country)) {
    throw new AccountError("providers_required", "Escolha um país")
  }

  if (providerIds.length < 1) {
    throw new AccountError("providers_required", "Escolha pelo menos um streaming")
  }

  return { country, providerIds }
}

const requireUserId = async () => {
  const supabase = getAccountClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AccountError("account_not_found", "Conta não encontrada. Crie uma conta primeiro.")
  }

  return { supabase, user }
}

export const savePreferences = async (preferences: Preferences): Promise<Preferences> => {
  const next = normalizePreferences(preferences)
  const { supabase, user } = await requireUserId()

  const { error } = await supabase.from("preferences").upsert(
    {
      user_id: user.id,
      country: next.country,
      provider_ids: next.providerIds,
    },
    { onConflict: "user_id" },
  )

  if (error) {
    throw error
  }

  patchAccountSnapshot({
    preferences: next,
    loadError: null,
  })

  return next
}

export const applyCountryChange = async (country: string, validProviderIds: number[]) => {
  const valid = new Set(validProviderIds)
  const current = getAccountSnapshot()
  const remaining = (current.preferences?.providerIds ?? []).filter((id) => valid.has(id))

  if (remaining.length === 0) {
    patchAccountSnapshot({
      preferences: null,
    })
    return null
  }

  return savePreferences({ country, providerIds: remaining })
}

export const clearPreferences = async () => {
  const { supabase, user } = await requireUserId()

  const { error } = await supabase.from("preferences").delete().eq("user_id", user.id)

  if (error) {
    throw error
  }

  patchAccountSnapshot({
    preferences: null,
  })
}
