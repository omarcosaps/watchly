import { TitleCard } from "@/components/title-card"
import type { CatalogItem } from "@/lib/catalog/types"
import { cardEnterDelay } from "@/lib/motion"

const CATALOG_GRID_CLASS =
  "grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(176px,1fr))]"

type CatalogGridProps = {
  items: CatalogItem[]
  showOffServiceHint?: boolean
  muted?: boolean
  stagger?: boolean
  onNavigate?: (href: string) => void
}

export const CatalogGrid = ({
  items,
  showOffServiceHint,
  muted = false,
  stagger = false,
  onNavigate,
}: CatalogGridProps) => {
  return (
    <ul className={CATALOG_GRID_CLASS}>
      {items.map((item, index) => (
        <li
          key={`${item.mediaType}-${item.tmdbId}`}
          className={stagger ? "d-in" : undefined}
          style={stagger ? { animationDelay: cardEnterDelay(index) } : undefined}
        >
          <TitleCard
            item={item}
            showOffServiceHint={showOffServiceHint}
            muted={muted}
            onNavigate={onNavigate}
          />
        </li>
      ))}
    </ul>
  )
}

export const CatalogSkeleton = () => {
  return (
    <ul
      className={CATALOG_GRID_CLASS}
      aria-hidden
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <li key={index} className="aspect-[2/3] rounded-xl bg-white/4" />
      ))}
    </ul>
  )
}
