import { TitleCard } from "@/components/title-card"
import type { CatalogItem } from "@/lib/catalog/types"

type CatalogGridProps = {
  items: CatalogItem[]
  showOffServiceHint?: boolean
  muted?: boolean
}

export const CatalogGrid = ({ items, showOffServiceHint, muted = false }: CatalogGridProps) => {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(176px,1fr))] gap-x-4 gap-y-5">
      {items.map((item) => (
        <li key={`${item.mediaType}-${item.tmdbId}`}>
          <TitleCard item={item} showOffServiceHint={showOffServiceHint} muted={muted} />
        </li>
      ))}
    </ul>
  )
}

export const CatalogSkeleton = () => {
  return (
    <ul
      className="grid grid-cols-[repeat(auto-fill,minmax(176px,1fr))] gap-x-4 gap-y-5"
      aria-hidden
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <li key={index} className="aspect-[2/3] rounded-xl bg-white/4" />
      ))}
    </ul>
  )
}
