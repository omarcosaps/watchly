"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react"

import { useAccount } from "@/components/account-provider"
import { WatchlistToggle } from "@/components/watchlist-toggle"
import { GUEST_PREFERENCES } from "@/lib/account/types"
import { fetchTitle } from "@/lib/api"
import { pickHeroSynopsis } from "@/lib/catalog/hero-synopsis"
import { cn } from "@/lib/cn"
import type { CatalogItem } from "@/lib/catalog/types"
import type { MediaType } from "@/lib/media"
import { tipoFromMedia } from "@/lib/media"
import { HERO_SEEN_MS, isModifiedClick, prefersReducedMotion } from "@/lib/motion"
import { atmosphereUrl } from "@/lib/tmdb/image"

type HeroCarouselProps = {
  items: CatalogItem[]
  onNavigate?: (href: string) => void
}

export const HeroCarousel = ({ items, onNavigate }: HeroCarouselProps) => {
  const slides = items.slice(0, 5)
  const slideKey = slides.map((slide) => `${slide.mediaType}-${slide.tmdbId}`).join("|")
  const { preferences } = useAccount()
  const region = (preferences ?? GUEST_PREFERENCES).country
  const providerKey = (preferences ?? GUEST_PREFERENCES).providerIds.join(",")
  const [index, setIndex] = useState(0)
  const [overviews, setOverviews] = useState<Record<string, string>>({})
  const [heroSynopsis, setHeroSynopsis] = useState("")
  const measureRef = useRef<HTMLParagraphElement>(null)
  const heroSeenRef = useRef(false)
  const heroSeenTimerRef = useRef<number | null>(null)
  const [heroSeen, setHeroSeen] = useState(false)
  const safeIndex = slides.length === 0 ? 0 : Math.min(index, slides.length - 1)
  const current = slides[safeIndex]
  const heroEnter = !heroSeen

  useEffect(() => {
    if (slides.length < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const timer = window.setInterval(() => {
      setIndex((value) => (value === slides.length - 1 ? 0 : value + 1))
    }, 7000)

    return () => window.clearInterval(timer)
  }, [slides.length])

  useEffect(() => {
    if (heroSeenRef.current || heroSeenTimerRef.current !== null) return
    if (prefersReducedMotion()) {
      heroSeenRef.current = true
      setHeroSeen(true)
      return
    }

    heroSeenTimerRef.current = window.setTimeout(() => {
      heroSeenRef.current = true
      heroSeenTimerRef.current = null
      setHeroSeen(true)
    }, HERO_SEEN_MS)

    return () => {
      if (heroSeenTimerRef.current !== null) {
        window.clearTimeout(heroSeenTimerRef.current)
        heroSeenTimerRef.current = null
      }
    }
  }, [])

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

  const synopsis = current
    ? overviews[`${current.mediaType}-${current.tmdbId}`]
    : undefined

  useLayoutEffect(() => {
    const measure = measureRef.current
    if (!measure) return

    const fitsThreeLines = (text: string) => {
      measure.textContent = text
      const lineHeight = Number.parseFloat(getComputedStyle(measure).lineHeight)
      if (!Number.isFinite(lineHeight) || lineHeight <= 0) return false
      return measure.scrollHeight <= lineHeight * 3 + 1
    }

    const updateSynopsis = () => {
      if (!synopsis) {
        setHeroSynopsis("")
        return
      }

      const next = pickHeroSynopsis(synopsis, fitsThreeLines)
      setHeroSynopsis((currentText) => (currentText === next ? currentText : next))
    }

    updateSynopsis()
    const observer = new ResizeObserver(updateSynopsis)
    observer.observe(measure)
    return () => observer.disconnect()
  }, [synopsis])

  if (!current) return null

  const href = `/titulo/${tipoFromMedia(current.mediaType)}/${current.tmdbId}`

  const handleDetailsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate || isModifiedClick(event)) return
    event.preventDefault()
    onNavigate(href)
  }

  return (
    <section
      className="hero-frame relative overflow-hidden bg-void"
      aria-roledescription="carrossel"
    >
      <div className="d-back absolute inset-0">
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
      </div>
      <div className="hatch-hero pointer-events-none absolute inset-0" />
      <div className="scrim-hero pointer-events-none absolute inset-0" />

      <div className="hero-copy relative mx-auto max-w-[1280px] px-5 pb-6 sm:absolute sm:inset-x-0 sm:bottom-0 sm:px-12 sm:pb-[60px]">
        <span
          className={cn(
            "inline-block rounded-full border border-white/12 bg-[rgba(18,20,26,0.85)] px-[13px] py-[7px] text-[11px] font-bold tracking-[0.06em] text-paper uppercase",
            heroEnter && "d-in",
          )}
          style={heroEnter ? { animationDelay: "0.10s" } : undefined}
        >
          {heroKicker(current.mediaType, current.year)}
        </span>
        <h1
          className={cn(
            "mt-4 mb-3 text-[clamp(32px,8vw,38px)] font-extrabold leading-none tracking-[-0.035em] text-shadow-[0_2px_30px_rgba(0,0,0,0.55)] sm:mt-5 sm:mb-4 sm:text-[clamp(38px,4.6vw,60px)]",
            heroEnter && "d-in",
          )}
          style={heroEnter ? { animationDelay: "0.16s" } : undefined}
        >
          {current.title}
        </h1>
        <p
          ref={measureRef}
          aria-hidden
          className={cn(
            HERO_SYNOPSIS_CLASS,
            "pointer-events-none invisible absolute w-full",
          )}
        />
        {heroSynopsis ? (
          <p
            className={cn(
              HERO_SYNOPSIS_CLASS,
              "mb-4 text-white/82 max-sm:line-clamp-2 sm:mb-[26px]",
              heroEnter && "d-in",
            )}
            style={heroEnter ? { animationDelay: "0.22s" } : undefined}
          >
            {heroSynopsis}
          </p>
        ) : (
          <div className="mb-4 sm:mb-[26px]" />
        )}
        <div
          className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap", heroEnter && "d-in")}
          style={heroEnter ? { animationDelay: "0.28s" } : undefined}
        >
          <Link
            href={href}
            onClick={handleDetailsClick}
            className="cta-primary inline-flex w-full items-center justify-center rounded-full px-[26px] py-3.5 text-[15px] font-bold sm:w-auto"
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
            className="w-full justify-center sm:w-auto"
          />
        </div>
        {slides.length > 1 ? (
          <div
            className={cn(
              "mt-4 flex items-center gap-[9px] sm:absolute sm:right-12 sm:bottom-[60px] sm:mt-0",
              heroEnter && "d-in",
            )}
            style={heroEnter ? { animationDelay: "0.36s" } : undefined}
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

const HERO_SYNOPSIS_CLASS = "max-w-[640px] text-pretty text-sm leading-[1.55] sm:text-base"

const heroKicker = (mediaType: MediaType, year: number | null) => {
  const isNew = (year ?? 0) >= 2024
  if (mediaType === "movie") return isNew ? "Novo filme" : "Filme"
  return isNew ? "Nova série" : "Série"
}
