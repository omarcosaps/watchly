import { uniqueMonetization } from "@/lib/catalog/offers"
import { MONETIZATION_STAMP, type Offer } from "@/lib/catalog/types"
import type { MonetizationType } from "@/lib/catalog/params"

type OfferStampsProps = {
  offers: Offer[]
}

export const OfferStamps = ({ offers }: OfferStampsProps) => {
  const types = uniqueMonetization(offers)

  if (types.length === 0) return null

  return (
    <ul className="pointer-events-none absolute bottom-2 left-2 flex flex-wrap gap-1">
      {types.map((type: MonetizationType) => (
        <li
          key={type}
          className="rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-paper backdrop-blur-md"
        >
          {MONETIZATION_STAMP[type]}
        </li>
      ))}
    </ul>
  )
}
