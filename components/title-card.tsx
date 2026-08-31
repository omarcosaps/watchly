import Image from "next/image"
import Link from "next/link"

import { StarIcon } from "@/components/icons"
import { OfferStamps } from "@/components/offer-stamps"
import { WatchlistToggle } from "@/components/watchlist-toggle"
import { cn } from "@/lib/cn"
import type { CatalogItem } from "@/lib/catalog/types"
import { mediaLabel, tipoFromMedia } from "@/lib/media"
import { posterUrl } from "@/lib/tmdb/image"

type TitleCardProps = {
  item: CatalogItem
  showOffServiceHint?: boolean
}

export const TitleCard = ({ item, showOffServiceHint = false }: TitleCardProps) => {
  const href = `/titulo/${tipoFromMedia(item.mediaType)}/${item.tmdbId}`
  const src = posterUrl(item.posterPath)
  const meta = item.year
    ? `${item.year} · ${mediaLabel(item.mediaType)}`
    : mediaLabel(item.mediaType)

  return (
    <article className="group relative">
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
              className="object-cover transition-transform duration-still ease group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-sm text-mist">
              Sem pôster
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-ui group-hover:opacity-100 motion-reduce:opacity-0" />
          <OfferStamps offers={item.offers} />
          <RatingStamp value={item.voteAverage} />
        </div>
        <div className="mt-3">
          <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-paper">{item.title}</h2>
          <p className="mt-1 text-xs text-mist">{meta}</p>
          {showOffServiceHint && !item.onOwnServices ? (
            <p className="mt-1 text-xs text-mist">Fora dos seus serviços</p>
          ) : null}
        </div>
      </Link>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 aspect-[2/3] p-2">
        <div className="flex h-full items-end justify-end">
          <div
            className={cn(
              "pointer-events-auto opacity-100 transition-opacity duration-ui motion-reduce:transition-none",
              "[@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:opacity-0",
              "[@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-hover:opacity-100",
              "[@media(hover:hover)]:group-focus-within:pointer-events-auto [@media(hover:hover)]:group-focus-within:opacity-100",
            )}
          >
            <WatchlistToggle
              tmdbId={item.tmdbId}
              mediaType={item.mediaType}
              title={item.title}
              posterPath={item.posterPath}
              year={item.year}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

const RatingStamp = ({ value }: { value: number }) => {
  if (value <= 0) return null

  return (
    <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-paper backdrop-blur-md">
      <StarIcon className="h-3 w-3 text-gold" filled />
      <span className="sr-only">Nota </span>
      {value.toFixed(1)}
    </span>
  )
}
