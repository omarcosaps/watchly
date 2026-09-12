"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { WatchlistToggle } from "@/components/watchlist-toggle"
import { GUEST_PREFERENCES } from "@/lib/account/types"
import { fetchTitle } from "@/lib/api"
import { cn } from "@/lib/cn"
import type { CatalogItem } from "@/lib/catalog/types"
import type { MediaType } from "@/lib/media"
import { tipoFromMedia } from "@/lib/media"
import { atmosphereUrl } from "@/lib/tmdb/image"

type HeroCarouselProps = {
  items: CatalogItem[]
}

export const HeroCarousel = ({ items }: HeroCarouselProps) => {
  const slides = items.slice(0, 5)
  const slideKey = slides.map((slide) => `${slide.mediaType}-${slide.tmdbId}`).join("|")
  const { preferences } = useAccount()
  const region = (preferences ?? GUEST_PREFERENCES).country
  const providerKey = (preferences ?? GUEST_PREFERENCES).providerIds.join(",")
  const [index, setIndex] = useState(0)
  const [overviews, setOverviews] = useState<Record<string, string>>({})
  const safeIndex = slides.length === 0 ? 0 : Math.min(index, slides.length - 1)
  const current = slides[safeIndex]

  useEffect(() => {
    if (slides.length < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const timer = window.setInterval(() => {
      setIndex((value) => (value === slides.length - 1 ? 0 : value + 1))
    }, 7000)

    return () => window.clearInterval(timer)
  }, [slides.length])

  useEffect(() => {
    let cancelled = false
    const catalogQuery = {
      country: region,
      providerIds: providerKey.split(",").filter(Boolean).map(Number),
    }

    const load = async () => {
      const entries = await Promise.all(
        slides.map(async (slide) => {
          const key = `${slide.mediaType}-${slide.tmdbId}`
          try {
            const details = await fetchTitle(
              catalogQuery,
              tipoFromMedia(slide.mediaType),
              String(slide.tmdbId),
            )
            return [key, details.overview] as const
          } catch {
            return [key, ""] as const
          }
        }),
      )

      if (!cancelled) setOverviews(Object.fromEntries(entries))
    }

    void load()
    return () => {
      cancelled = true
    }
  // slideKey identifica os slides; o array muda de identidade a cada render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerKey, region, slideKey])

  if (!current) return null

  const href = `/titulo/${tipoFromMedia(current.mediaType)}/${current.tmdbId}`
  const synopsis = overviews[`${current.mediaType}-${current.tmdbId}`]

  return (
    <section
      className="relative h-[64vh] min-h-[520px] overflow-hidden bg-void"
      aria-roledescription="carrossel"
    >
      {slides.map((slide, slideIndex) => {
        const still = atmosphereUrl(slide.backdropPath, slide.posterPath)
        return (
          <div
            key={`${slide.mediaType}-${slide.tmdbId}`}
            className="absolute inset-0 bg-void transition-opacity duration-1000 ease"
            style={{ opacity: slideIndex === index ? 1 : 0 }}
          >
            {still ? (
              <Image
                src={still}
                alt=""
                fill
                priority={slideIndex === 0}
                sizes="100vw"
                className="object-cover"
              />
            ) : null}
          </div>
        )
      })}
      <div className="hatch-hero pointer-events-none absolute inset-0" />
      <div className="scrim-hero pointer-events-none absolute inset-0" />

      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1280px] px-5 pb-[60px] sm:px-12">
        <span className="inline-block rounded-full border border-white/12 bg-[rgba(18,20,26,0.85)] px-[13px] py-[7px] text-[11px] font-bold tracking-[0.06em] text-paper uppercase">
          {heroKicker(current.mediaType, current.year)}
        </span>
        <h1 className="mt-5 mb-4 text-[clamp(38px,4.6vw,60px)] font-extrabold leading-none tracking-[-0.035em] text-shadow-[0_2px_30px_rgba(0,0,0,0.55)]">
          {current.title}
        </h1>
        {synopsis ? (
          <p className="mb-[26px] max-w-[640px] text-pretty text-base leading-[1.55] text-white/82">
            {synopsis}
          </p>
        ) : (
          <div className="mb-[26px]" />
        )}
        <div className="flex flex-wrap gap-3">
          <Link
            href={href}
            className="cta-primary inline-flex items-center rounded-full px-[26px] py-3.5 text-[15px] font-bold"
          >
            ▶&nbsp; Ver Detalhes
          </Link>
          <WatchlistToggle
            tmdbId={current.tmdbId}
            mediaType={current.mediaType}
            title={current.title}
            posterPath={current.posterPath}
            year={current.year}
            variant="pill"
          />
        </div>
        {slides.length > 1 ? (
          <div
            className="absolute right-5 bottom-[60px] flex items-center gap-[9px] sm:right-12"
            aria-label="Slides em destaque"
          >
            {slides.map((slide, slideIndex) => (
              <button
                key={`${slide.mediaType}-${slide.tmdbId}`}
                type="button"
                onClick={() => setIndex(slideIndex)}
                aria-label={`Mostrar ${slide.title}`}
                aria-current={slideIndex === index}
                className={cn(
                  "h-2 rounded-full transition-[width,background-color] duration-[250ms] ease",
                  slideIndex === index
                    ? "w-[22px] cursor-default bg-white"
                    : "w-2 cursor-pointer bg-white/35 hover:bg-white/55",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

const heroKicker = (mediaType: MediaType, year: number | null) => {
  const isNew = (year ?? 0) >= 2024
  if (mediaType === "movie") return isNew ? "Novo filme" : "Filme"
  return isNew ? "Nova série" : "Série"
}
