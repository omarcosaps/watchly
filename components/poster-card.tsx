import Image from "next/image"
import Link from "next/link"

import { RatingStars } from "@/components/rating-stars"
import { WatchlistToggle } from "@/components/watchlist-toggle"
import type { CatalogItem } from "@/lib/catalog/types"
import { mediaLabel, tipoFromMedia } from "@/lib/media"
import { posterUrl } from "@/lib/tmdb/image"

type PosterCardProps = {
  item: CatalogItem
}

export const PosterCard = ({ item }: PosterCardProps) => {
  const href = `/titulo/${tipoFromMedia(item.mediaType)}/${item.tmdbId}`
  const src = posterUrl(item.posterPath, "w500")
  const offer = item.offers.find((entry) => entry.isOwn) ?? item.offers[0]

  return (
    <article className="group relative w-[13.5rem] shrink-0 sm:w-[15.5rem]">
      <div className="relative aspect-[2/3] overflow-hidden rounded-[22px] bg-panel shadow-[0_18px_40px_rgb(0_0_0/0.35)]">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="248px"
            className="object-cover transition-transform duration-still ease group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-mist">
            Sem pôster
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/55" />
        <div className="absolute inset-x-0 top-0 p-4">
          <h2 className="font-display line-clamp-3 text-[1.65rem] leading-tight italic text-paper">
            {item.title}
          </h2>
          <div className="mt-2">
            <RatingStars value={item.voteAverage} />
          </div>
          <p className="mt-2 text-xs text-paper/75">
            {mediaLabel(item.mediaType)}
            {item.year ? ` · ${item.year}` : ""}
            {offer ? ` · ${offer.providerName}` : ""}
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3">
          <WatchlistToggle
            tmdbId={item.tmdbId}
            mediaType={item.mediaType}
            title={item.title}
            posterPath={item.posterPath}
            year={item.year}
            variant="plus"
          />
          <Link
            href={href}
            className="cta-ember inline-flex h-11 flex-1 items-center justify-center rounded-full text-sm font-semibold hover:bg-ember-glow"
          >
            Ver
          </Link>
        </div>
      </div>
    </article>
  )
}
