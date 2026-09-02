"use client"

import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { PlayIcon } from "@/components/icons"
import { RatingStars } from "@/components/rating-stars"
import { StatusPanel } from "@/components/status-panel"
import { TrailerDialog } from "@/components/trailer-dialog"
import { WatchlistToggle } from "@/components/watchlist-toggle"
import { WatchStatusToggle } from "@/components/watch-status-toggle"
import { fetchTitle } from "@/lib/api"
import { MONETIZATION_LABEL, type Offer, type TitleDetails } from "@/lib/catalog/types"
import { mediaFromTipo, mediaLabel } from "@/lib/media"
import { atmosphereUrl, logoUrl, posterUrl, profileUrl } from "@/lib/tmdb/image"
import { cn } from "@/lib/cn"

export default function TitlePage() {
  const params = useParams<{ tipo: string; id: string }>()
  const { preferences } = useAccount()
  const [details, setDetails] = useState<TitleDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [trailerOpen, setTrailerOpen] = useState(false)
  const mediaType = mediaFromTipo(params.tipo)

  const handleOpenTrailer = () => setTrailerOpen(true)
  const handleCloseTrailer = () => setTrailerOpen(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!preferences || !mediaType) return
      setError(null)

      try {
        const data = await fetchTitle(preferences, params.tipo, params.id)
        if (!cancelled) {
          setDetails(data)
          setTrailerOpen(false)
        }
      } catch (loadError) {
        if (!cancelled) {
          setDetails(null)
          setError(loadError instanceof Error ? loadError.message : "Não deu para abrir este título")
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [mediaType, params.id, params.tipo, preferences])

  if (!mediaType) {
    return <StatusPanel title="Título não encontrado" message="Esse endereço não é de filme nem de série." />
  }

  if (error) {
    return <StatusPanel title="Não deu para abrir" message={error} />
  }

  if (!details) {
    return <div className="min-h-[24rem] rounded-[28px] bg-panel" aria-hidden />
  }

  const ownOffers = details.offers.filter((offer) => offer.isOwn)
  const otherOffers = details.offers.filter((offer) => !offer.isOwn)
  const poster = posterUrl(details.posterPath, "w500")
  const still = atmosphereUrl(details.backdropPath, details.posterPath)

  return (
    <article>
      <section className="relative overflow-hidden rounded-[28px]">
        <div className="relative min-h-[22rem] md:min-h-[28rem]">
          {still ? (
            <Image
              src={still}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-panel" />
          )}
          <div className="scrim-hero absolute inset-0" />
          <div className="relative grid min-h-[22rem] items-end gap-8 p-6 md:min-h-[28rem] md:grid-cols-[200px_1fr] md:p-10 lg:grid-cols-[240px_1fr]">
            <div className="relative mx-auto aspect-[2/3] w-full max-w-48 overflow-hidden rounded-2xl shadow-[0_18px_40px_rgb(0_0_0/0.45)] md:mx-0 md:max-w-none">
              {poster ? (
                <Image src={poster} alt="" fill sizes="240px" className="object-cover" priority />
              ) : (
                <div className="flex h-full items-center justify-center bg-panel text-mist">
                  Sem pôster
                </div>
              )}
            </div>
            <div className="min-w-0 pb-1">
              <p className="text-sm text-paper/70">
                {mediaLabel(details.mediaType)}
                {details.year ? ` · ${details.year}` : ""}
                {details.runtimeMinutes ? ` · ${details.runtimeMinutes} min` : ""}
              </p>
              <h1 className="font-display mt-2 text-5xl italic leading-[0.95] tracking-tight text-paper md:text-7xl">
                {details.title}
              </h1>
              {details.originalTitle !== details.title ? (
                <p className="mt-2 text-sm text-mist">{details.originalTitle}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <RatingStars value={details.voteAverage} />
                <p className="text-sm text-mist">
                  {details.voteAverage ? details.voteAverage.toFixed(1) : "—"}
                  {details.genres.length > 0 ? ` · ${details.genres.join(", ")}` : ""}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {details.trailerKey ? (
                  <button
                    type="button"
                    onClick={handleOpenTrailer}
                    className="cta-primary inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold"
                  >
                    <PlayIcon className="h-4 w-4" />
                    Reproduzir trailer
                  </button>
                ) : null}
                <WatchlistToggle
                  tmdbId={details.tmdbId}
                  mediaType={details.mediaType}
                  title={details.title}
                  posterPath={details.posterPath}
                  year={details.year}
                  variant="pill"
                />
                <WatchStatusToggle
                  mediaType={details.mediaType}
                  tmdbId={details.tmdbId}
                  variant="pill"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {details.overview ? (
        <p className="mt-8 max-w-3xl text-base leading-relaxed text-paper/85 md:text-lg">
          {details.overview}
        </p>
      ) : (
        <p className="mt-8 text-mist">Sem sinopse em português.</p>
      )}

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Onde assistir</h2>
        {!details.availableInRegion ? (
          <p className="mt-4 text-mist">Sem disponibilidade neste país.</p>
        ) : (
          <div className="mt-5 flex flex-col gap-8">
            {ownOffers.length > 0 ? (
              <OfferGroup title="Seus streamings" offers={ownOffers} emphasized />
            ) : null}
            {otherOffers.length > 0 ? (
              <OfferGroup title="Outros no país" offers={otherOffers} />
            ) : null}
          </div>
        )}
      </section>
      <p className="mt-8">
        <a
          href={details.tmdbUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-mist underline-offset-4 hover:text-paper hover:underline"
        >
          Ver na TMDB
        </a>
      </p>
      {details.credits.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Elenco</h2>
          <ul className="hide-scrollbar mt-6 flex gap-5 overflow-x-auto pb-2">
            {details.credits.map((person) => {
              const src = profileUrl(person.profilePath)
              return (
                <li key={person.id} className="w-28 shrink-0 text-sm">
                  {src ? (
                    <Image
                      src={src}
                      alt=""
                      width={185}
                      height={278}
                      className="mb-3 aspect-[2/3] w-full rounded-2xl bg-panel object-cover"
                    />
                  ) : (
                    <div className="mb-3 aspect-[2/3] rounded-2xl bg-panel" />
                  )}
                  <p className="text-paper">{person.name}</p>
                  <p className="mt-0.5 text-mist">{person.character}</p>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
      {details.trailerKey ? (
        <TrailerDialog
          title={details.title}
          youtubeKey={details.trailerKey}
          open={trailerOpen}
          onClose={handleCloseTrailer}
        />
      ) : null}
    </article>
  )
}

const OfferGroup = ({
  title,
  offers,
  emphasized = false,
}: {
  title: string
  offers: Offer[]
  emphasized?: boolean
}) => {
  return (
    <div>
      <h3 className={cn("text-sm", emphasized ? "text-paper" : "text-mist")}>{title}</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {offers.map((offer) => {
          const src = logoUrl(offer.logoPath)
          return (
            <li
              key={`${offer.providerId}-${offer.monetization}`}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3",
                emphasized ? "bg-white/8 ring-1 ring-white/10" : "bg-white/4 ring-1 ring-white/6",
              )}
            >
              {src ? (
                <Image src={src} alt="" width={32} height={32} className="h-8 w-8 rounded-lg bg-paper" />
              ) : null}
              <span>{offer.providerName}</span>
              <span className="ml-auto text-sm text-mist">
                {MONETIZATION_LABEL[offer.monetization]}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
