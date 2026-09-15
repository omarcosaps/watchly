import Image from "next/image"
import Link from "next/link"
import type { MouseEvent } from "react"

import { cn } from "@/lib/cn"
import type { CatalogItem } from "@/lib/catalog/types"
import { mediaLabel, tipoFromMedia } from "@/lib/media"
import { isModifiedClick } from "@/lib/motion"
import { posterUrl } from "@/lib/tmdb/image"

type TitleCardProps = {
  item: CatalogItem
  showOffServiceHint?: boolean
  muted?: boolean
  onNavigate?: (href: string) => void
}

export const TitleCard = ({
  item,
  showOffServiceHint = false,
  muted = false,
  onNavigate,
}: TitleCardProps) => {
  const href = `/titulo/${tipoFromMedia(item.mediaType)}/${item.tmdbId}`

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate || isModifiedClick(event)) return
    event.preventDefault()
    onNavigate(href)
  }
  const src = posterUrl(item.posterPath)
  const meta = item.year
    ? `${item.year} · ${mediaLabel(item.mediaType)}`
    : mediaLabel(item.mediaType)
  const providers = showOffServiceHint && !item.onOwnServices
    ? "Fora dos seus serviços"
    : item.offers
        .filter((offer) => (showOffServiceHint ? offer.isOwn : true))
        .map((offer) => offer.providerName)
        .filter((name, index, names) => names.indexOf(name) === index)
        .slice(0, 3)
        .join(" · ")

  return (
    <article
      className={cn(
        "transition-transform duration-[180ms] ease hover:-translate-y-1",
        muted && "opacity-75 hover:opacity-100",
      )}
    >
      <Link
        href={href}
        onClick={handleClick}
        className="block"
        aria-label={`${item.title}, ${mediaLabel(item.mediaType)}`}
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/7 bg-[#15161c]">
          {src ? (
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 176px"
              className="object-cover"
            />
          ) : (
            <>
              <div className="hatch absolute inset-0" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-3.5 text-center">
                <div className="text-[17px] font-extrabold leading-[1.15] tracking-[-0.02em] text-shadow-[0_1px_12px_rgba(0,0,0,0.4)]">
                  {item.title}
                </div>
                <div className="mt-2 font-mono text-[10px] tracking-[0.12em] text-white/55">
                  {mediaLabel(item.mediaType).toUpperCase()}
                  {item.year ? ` · ${item.year}` : ""}
                </div>
              </div>
            </>
          )}
          <RatingStamp value={item.voteAverage} />
        </div>
        <h2 className="mt-[9px] truncate text-[13.5px] font-semibold">{item.title}</h2>
        <p className="mt-0.5 text-[11.5px] text-mute">{meta}</p>
        {providers ? (
          <p className="mt-0.5 truncate text-[11px] text-white/60">{providers}</p>
        ) : null}
      </Link>
    </article>
  )
}

const RatingStamp = ({ value }: { value: number }) => {
  if (value <= 0) return null

  return (
    <span className="absolute top-2 right-2 z-[1] rounded-[5px] bg-black/45 px-[7px] py-1 text-[10.5px] font-bold text-white/85">
      ★ {value.toFixed(1)}
    </span>
  )
}
