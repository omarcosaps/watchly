"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { ChevronIcon } from "@/components/icons"
import { WatchlistToggle } from "@/components/watchlist-toggle"
import { cn } from "@/lib/cn"
import type { CatalogItem } from "@/lib/catalog/types"
import { mediaLabel, tipoFromMedia } from "@/lib/media"
import { atmosphereUrl } from "@/lib/tmdb/image"

type HeroCarouselProps = {
  items: CatalogItem[]
}

export const HeroCarousel = ({ items }: HeroCarouselProps) => {
  const slides = items.slice(0, 5)
  const [index, setIndex] = useState(0)
  const current = slides[index]

  if (!current) return null

  const handlePrev = () => {
    setIndex((value) => (value === 0 ? slides.length - 1 : value - 1))
  }

  const handleNext = () => {
    setIndex((value) => (value === slides.length - 1 ? 0 : value + 1))
  }

  const href = `/titulo/${tipoFromMedia(current.mediaType)}/${current.tmdbId}`
  const still = atmosphereUrl(current.backdropPath, current.posterPath)

  return (
    <section className="relative overflow-hidden rounded-[28px]" aria-roledescription="carrossel">
      <div className="relative min-h-[22rem] md:min-h-[28rem] lg:min-h-[32rem]">
        {still ? (
          <Image
            key={still}
            src={still}
            alt=""
            fill
            priority
            loading="eager"
            sizes="(max-width: 1280px) 100vw, 70vw"
            className="still-layer object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-panel" />
        )}
        <div className="scrim-hero absolute inset-0" />

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="glass absolute top-1/2 left-4 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-paper md:inline-flex"
              aria-label="Título anterior"
            >
              <ChevronIcon className="h-5 w-5 rotate-180" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="glass absolute top-1/2 right-4 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-paper md:inline-flex"
              aria-label="Próximo título"
            >
              <ChevronIcon />
            </button>
          </>
        ) : null}

        <div className="relative flex min-h-[22rem] flex-col justify-end gap-8 p-6 md:min-h-[28rem] md:p-10 lg:min-h-[32rem]">
          <div
            key={`${current.mediaType}-${current.tmdbId}`}
            className="still-copy max-w-3xl"
          >
            <p className="text-sm text-paper/70">
              {mediaLabel(current.mediaType)}
              {current.year ? ` · ${current.year}` : ""}
            </p>
            <h1 className="font-display mt-2 line-clamp-3 text-5xl italic leading-[0.95] tracking-tight text-paper md:text-7xl">
              {current.title}
            </h1>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <WatchlistToggle
                tmdbId={current.tmdbId}
                mediaType={current.mediaType}
                title={current.title}
                posterPath={current.posterPath}
                year={current.year}
                variant="pill"
              />
              <Link
                href={href}
                className="cta-ember inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-semibold hover:bg-ember-glow"
              >
                Ver título
              </Link>
            </div>
            {slides.length > 1 ? (
              <div className="flex justify-center gap-2" aria-label="Slides em destaque">
                {slides.map((slide, slideIndex) => (
                  <button
                    key={`${slide.mediaType}-${slide.tmdbId}`}
                    type="button"
                    onClick={() => setIndex(slideIndex)}
                    aria-label={`Mostrar ${slide.title}`}
                    aria-current={slideIndex === index}
                    className={cn(
                      "h-2 rounded-full transition-[width,background-color] duration-ui ease",
                      slideIndex === index
                        ? "w-6 bg-ember"
                        : "w-2 bg-white/35",
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
