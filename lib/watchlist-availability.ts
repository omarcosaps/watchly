import type { CatalogItem } from "@/lib/catalog/types"

export const uniqueProviderNames = (offers: CatalogItem["offers"]) => {
  return offers
    .map((offer) => offer.providerName)
    .filter((name, index, names) => names.indexOf(name) === index)
}

export const formatOfferNames = (names: string[]) => {
  if (names.length <= 2) return names.join(" · ")
  return `${names.slice(0, 2).join(" · ")} e mais`
}

export const availabilityLine = (item: CatalogItem, countryName: string) => {
  if (item.onOwnServices) {
    const names = formatOfferNames(
      uniqueProviderNames(item.offers.filter((offer) => offer.isOwn)),
    )
    return {
      label: names ? `Disponível em ${names}` : "Disponível nos provedores do país",
      color: "text-positive",
    }
  }

  if (item.offers.length > 0) {
    const names = formatOfferNames(uniqueProviderNames(item.offers))
    return {
      label: `Fora dos seus serviços — ${names}`,
      color: "text-white/55",
    }
  }

  return {
    label: `Sem oferta em ${countryName} no momento`,
    color: "text-alert",
  }
}
