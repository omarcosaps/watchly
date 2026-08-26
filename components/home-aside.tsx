"use client"

import Image from "next/image"
import Link from "next/link"

import { useAccount } from "@/components/account-provider"
import { ChevronIcon } from "@/components/icons"
import { RatingStars } from "@/components/rating-stars"
import type { CatalogItem, MergedGenre } from "@/lib/catalog/types"
import { mediaLabel, tipoFromMedia } from "@/lib/media"
import { atmosphereUrl, posterUrl } from "@/lib/tmdb/image"

type HomeAsideProps = {
  items: CatalogItem[]
  genres: MergedGenre[]
}

export const HomeAside = ({ items, genres }: HomeAsideProps) => {
  const { watchlist, removeFromWatchlist } = useAccount()
  const saved = watchlist.slice(0, 3)
  const topRated = [...items]
    .filter((item) => item.voteAverage > 0)
    .sort((a, b) => b.voteAverage - a.voteAverage)
    .slice(0, 3)
  const genreTiles = genres.slice(0, 4)
  const textures = items
    .map((item) => atmosphereUrl(item.backdropPath, item.posterPath))
    .filter((src): src is string => Boolean(src))

  return (
    <aside className="flex w-full flex-col gap-8 xl:w-[19.5rem] xl:shrink-0">
      <RailSection title="Watchlist" href="/watchlist">
        {saved.length === 0 ? (
          <p className="text-sm text-mist">Guarde um título para ver aqui.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {saved.map((item) => {
              const src = posterUrl(item.posterPath)
              const href = `/titulo/${tipoFromMedia(item.mediaType)}/${item.tmdbId}`
              return (
                <li key={`${item.mediaType}-${item.tmdbId}`}>
                  <article className="flex gap-3 rounded-2xl bg-white/4 p-2 ring-1 ring-white/6">
                    <div className="relative h-[4.75rem] w-[4.25rem] shrink-0 overflow-hidden rounded-xl bg-panel">
                      {src ? (
                        <Image src={src} alt="" fill sizes="68px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <h3 className="truncate text-sm font-semibold text-paper">{item.title}</h3>
                      <p className="mt-0.5 text-xs text-mist">
                        {mediaLabel(item.mediaType)}
                        {item.year ? ` · ${item.year}` : ""}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => removeFromWatchlist(item.mediaType, item.tmdbId)}
                          className="h-8 rounded-full bg-white/8 px-3 text-xs text-paper"
                        >
                          Tirar
                        </button>
                        <Link
                          href={href}
                          className="cta-ember inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold"
                        >
                          Ver
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </RailSection>

      <RailSection title="Melhor nota" href="/?sort=vote">
        {topRated.length === 0 ? (
          <p className="text-sm text-mist">As notas aparecem com o catálogo.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {topRated.map((item) => {
              const src = posterUrl(item.posterPath)
              const href = `/titulo/${tipoFromMedia(item.mediaType)}/${item.tmdbId}`
              return (
                <li key={`${item.mediaType}-${item.tmdbId}`}>
                  <Link
                    href={href}
                    className="flex gap-3 rounded-2xl bg-white/4 p-2 ring-1 ring-white/6 transition-colors duration-200 hover:bg-white/8"
                  >
                    <div className="relative h-[4.75rem] w-[4.25rem] shrink-0 overflow-hidden rounded-xl bg-panel">
                      {src ? (
                        <Image src={src} alt="" fill sizes="68px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <h3 className="truncate text-sm font-semibold text-paper">{item.title}</h3>
                      <div className="mt-1">
                        <RatingStars value={item.voteAverage} />
                      </div>
                      <p className="mt-1 text-xs text-mist">
                        {mediaLabel(item.mediaType)}
                        {item.year ? ` · ${item.year}` : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </RailSection>

      <RailSection title="Gêneros">
        {genreTiles.length === 0 ? (
          <p className="text-sm text-mist">Os gêneros carregam com o catálogo.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-2">
            {genreTiles.map((genre, index) => {
              const texture = textures[index % Math.max(textures.length, 1)] ?? null
              return (
                <li key={genre.name}>
                  <Link
                    href={`/?genre=${encodeURIComponent(genre.name)}`}
                    className="relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl bg-panel p-3"
                  >
                    {texture ? (
                      <Image src={texture} alt="" fill sizes="140px" className="object-cover" />
                    ) : null}
                    <span className="absolute inset-0 bg-black/45" />
                    <span className="relative text-sm font-semibold text-paper">{genre.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </RailSection>
    </aside>
  )
}

const RailSection = ({
  title,
  href,
  children,
}: {
  title: string
  href?: string
  children: React.ReactNode
}) => {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-paper">{title}</h2>
        {href ? (
          <Link href={href} className="inline-flex items-center gap-1 text-xs text-mist hover:text-paper">
            Ver mais
            <ChevronIcon className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  )
}
