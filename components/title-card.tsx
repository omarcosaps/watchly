import Image from "next/image"
import Link from "next/link"

import { OfferStamps } from "@/components/offer-stamps"
import { WatchlistToggle } from "@/components/watchlist-toggle"
import type { CatalogItem } from "@/lib/catalog/types"
import { mediaLabel, tipoFromMedia } from "@/lib/media"
import { posterUrl } from "@/lib/tmdb/image"
import { cn } from "@/lib/cn"

type TitleCardProps = {
  item: CatalogItem
  distinguishOwn?: boolean
}

export const TitleCard = ({ item, distinguishOwn = false }: TitleCardProps) => {
  const href = `/titulo/${tipoFromMedia(item.mediaType)}/${item.tmdbId}`
  const src = posterUrl(item.posterPath)
  const muted = distinguishOwn && !item.onOwnServices

  return (
    <article className={cn("group relative", muted && "opacity-55")}>
      <Link
        href={href}
        className="block focus-visible:outline-offset-4"
        aria-label={`${item.title}, ${mediaLabel(item.mediaType)}`}
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-[18px] bg-panel shadow-[0_12px_28px_rgb(0_0_0/0.28)]">
          {src ? (
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-sm text-mist">
              Sem pôster
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:opacity-0" />
          <OfferStamps offers={item.offers} />
        </div>
        <div className="mt-3">
          <h2 className="text-sm font-semibold leading-snug text-paper">{item.title}</h2>
          <p className="mt-1 text-xs text-mist">
            {mediaLabel(item.mediaType)}
            {item.year ? ` · ${item.year}` : ""}
          </p>
        </div>
      </Link>
      <div className="absolute top-2 right-2 z-10">
        <WatchlistToggle
          tmdbId={item.tmdbId}
          mediaType={item.mediaType}
          title={item.title}
          posterPath={item.posterPath}
          year={item.year}
        />
      </div>
    </article>
  )
}
