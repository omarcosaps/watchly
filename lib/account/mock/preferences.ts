import { mutateAccount, readAccount } from "@/lib/account/mock/storage"
import { AccountError, type Preferences } from "@/lib/account/types"

export const savePreferences = (preferences: Preferences): Preferences => {
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

  const next = { country, providerIds }

  mutateAccount((current) => ({
    ...current,
    preferences: next,
  }))

  return next
}

export const applyCountryChange = (country: string, validProviderIds: number[]) => {
  const valid = new Set(validProviderIds)
  const current = readAccount()
  const remaining = (current.preferences?.providerIds ?? []).filter((id) => valid.has(id))

  if (remaining.length === 0) {
    mutateAccount((stored) => ({
      ...stored,
      preferences: null,
    }))
    return null
  }

  return savePreferences({ country, providerIds: remaining })
}

export const clearPreferences = () => {
  mutateAccount((current) => ({
    ...current,
    preferences: null,
  }))
}
