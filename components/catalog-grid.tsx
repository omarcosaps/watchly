import type { ReactNode } from "react"

import { TitleCard } from "@/components/title-card"
import type { CatalogItem } from "@/lib/catalog/types"

type CatalogGridProps = {
  items: CatalogItem[]
  showOffServiceHint?: boolean
  posterStamp?: (item: CatalogItem) => ReactNode
}

export const CatalogGrid = ({ items, showOffServiceHint, posterStamp }: CatalogGridProps) => {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((item) => (
        <li key={`${item.mediaType}-${item.tmdbId}`}>
          <TitleCard
            item={item}
            showOffServiceHint={showOffServiceHint}
            posterStamp={posterStamp?.(item)}
          />
        </li>
      ))}
    </ul>
  )
}

export const CatalogSkeleton = () => {
  return (
    <ul
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
      aria-hidden
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <li key={index} className="aspect-[2/3] rounded-[18px] bg-panel" />
      ))}
    </ul>
  )
}
