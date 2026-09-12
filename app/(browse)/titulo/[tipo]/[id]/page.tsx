"use client"

import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { StatusPanel } from "@/components/status-panel"
import { WatchlistToggle } from "@/components/watchlist-toggle"
import { WatchStatusToggle } from "@/components/watch-status-toggle"
import { GUEST_PREFERENCES, PRODUCT_COUNTRIES } from "@/lib/account/types"
import { fetchTitle } from "@/lib/api"
import { MONETIZATION_LABEL, type Offer, type TitleDetails } from "@/lib/catalog/types"
import { mediaFromTipo, mediaLabel } from "@/lib/media"
import { atmosphereUrl, logoUrl, posterUrl, profileUrl } from "@/lib/tmdb/image"
import { cn } from "@/lib/cn"

const countryName = (code: string) => {
  return PRODUCT_COUNTRIES.find((country) => country.code === code)?.name ?? code
}

export default function TitlePage() {
  const router = useRouter()
  const params = useParams<{ tipo: string; id: string }>()
  const { preferences } = useAccount()
  const catalogPreferences = preferences ?? GUEST_PREFERENCES
  const [details, setDetails] = useState<TitleDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mediaType = mediaFromTipo(params.tipo)
  const regionName = countryName(catalogPreferences.country)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!mediaType) return
      setError(null)

      try {
        const data = await fetchTitle(catalogPreferences, params.tipo, params.id)
        if (!cancelled) setDetails(data)
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
  }, [catalogPreferences, mediaType, params.id, params.tipo])

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
  const hasOwnServices = catalogPreferences.providerIds.length > 0
  const otherLabel = ownOffers.length
    ? `Também disponível em ${regionName}`
    : `Disponível em ${regionName} (fora dos seus serviços)`

  return (
    <article>
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 text-sm font-semibold text-mist hover:text-paper"
      >
        ← Voltar
      </button>
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
                {details.genres.length > 0 ? ` · ${details.genres.join(", ")}` : ""}
              </p>
              <h1 className="mt-2 text-4xl font-semibold leading-[0.95] tracking-tight text-paper md:text-6xl">
                {details.title}
              </h1>
              <p className="mt-4 text-sm text-mist">
                ★ {details.voteAverage ? details.voteAverage.toFixed(1) : "—"}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <WatchlistToggle
                  tmdbId={details.tmdbId}
                  mediaType={details.mediaType}
                  title={details.title}
                  posterPath={details.posterPath}
                  year={details.year}
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

      <WatchStatusToggle
        mediaType={details.mediaType}
        tmdbId={details.tmdbId}
        variant="segmented"
      />

      {details.credits.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Elenco</h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {details.credits.slice(0, 8).map((person) => {
              const src = profileUrl(person.profilePath)
              const initials = person.name
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()

              return (
                <li key={person.id} className="text-sm">
                  {src ? (
                    <Image
                      src={src}
                      alt=""
                      width={185}
                      height={278}
                      className="mb-3 aspect-[2/3] w-full rounded-2xl bg-panel object-cover"
                    />
                  ) : (
                    <div className="mb-3 flex aspect-[2/3] items-center justify-center rounded-2xl bg-panel text-xs font-semibold text-mist">
                      {initials}
                    </div>
                  )}
                  <p className="text-paper">{person.name}</p>
                  <p className="mt-0.5 text-mist">{person.character || "—"}</p>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Onde assistir · {regionName}</h2>
        {!details.availableInRegion ? (
          <p className="mt-4 max-w-xl rounded-xl bg-white/5 px-5 py-4 text-sm text-mist">
            Este título não está disponível em nenhum serviço em {regionName} no momento.
          </p>
        ) : (
          <div className="mt-5 flex flex-col gap-8">
            {hasOwnServices && ownOffers.length > 0 ? (
              <OfferGroup title="Nos seus streamings" offers={ownOffers} emphasized />
            ) : null}
            {otherOffers.length > 0 ? (
              <OfferGroup
                title={hasOwnServices ? otherLabel : `Disponível em ${regionName}`}
                offers={otherOffers}
              />
            ) : null}
          </div>
        )}
      </section>
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
                emphasized ? "bg-white/6" : "bg-white/3 opacity-80",
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
