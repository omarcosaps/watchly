import { MONETIZATION_TYPES, type MonetizationType } from "@/lib/catalog/params"
import type { Offer } from "@/lib/catalog/types"
import type { TmdbRegionOffers } from "@/lib/tmdb/types"

export const extractOffers = (
  regionOffers: TmdbRegionOffers | undefined,
  ownProviderIds: number[],
  onlyOwn: boolean,
): Offer[] => {
  if (!regionOffers) return []

  const own = new Set(ownProviderIds)
  const offers: Offer[] = []

  MONETIZATION_TYPES.forEach((monetization: MonetizationType) => {
    const list = regionOffers[monetization] ?? []

    list.forEach((provider) => {
      const isOwn = own.has(provider.provider_id)
      if (onlyOwn && !isOwn) return

      offers.push({
        providerId: provider.provider_id,
        providerName: provider.provider_name,
        logoPath: provider.logo_path,
        monetization,
        isOwn,
      })
    })
  })

  return offers
}

export const uniqueMonetization = (offers: Offer[]) => {
  const seen = new Set<MonetizationType>()
  const ordered: MonetizationType[] = []

  offers.forEach((offer) => {
    if (seen.has(offer.monetization)) return
    seen.add(offer.monetization)
    ordered.push(offer.monetization)
  })

  return ordered
}
