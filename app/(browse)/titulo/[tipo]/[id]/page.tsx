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

const KIND_STYLE: Record<Offer["monetization"], string> = {
  flatrate: "bg-[oklch(0.8_0.15_155)] text-void",
  free: "bg-[oklch(0.8_0.13_195)] text-void",
  ads: "bg-[oklch(0.82_0.13_85)] text-void",
  rent: "bg-[oklch(0.76_0.11_250)] text-void",
  buy: "bg-[oklch(0.74_0.13_310)] text-void",
}

export default function TitlePage() {
  const router = useRouter()
  const params = useParams<{ tipo: string; id: string }>()
  const { preferences } = useAccount()
  const catalogPreferences = preferences ?? GUEST_PREFERENCES
  const [details, setDetails] = useState<TitleDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mediaType = mediaFromTipo(params.tipo)
  const region = catalogPreferences.country
  const providerKey = catalogPreferences.providerIds.join(",")
  const regionName = countryName(region)

  useEffect(() => {
    let cancelled = false
    const catalogQuery = {
      country: region,
      providerIds: providerKey.split(",").filter(Boolean).map(Number),
    }

    const load = async () => {
      if (!mediaType) return
      setError(null)

      try {
        const data = await fetchTitle(catalogQuery, params.tipo, params.id)
        if (!cancelled) setDetails(data)
      } catch (loadError) {
        if (!cancelled) {
          let hadSameTitle = false
          setDetails((current) => {
            const sameTitle =
              current !== null &&
              String(current.tmdbId) === params.id &&
              current.mediaType === mediaType
            hadSameTitle = sameTitle
            return sameTitle ? current : null
          })
          if (!hadSameTitle) {
            setError(loadError instanceof Error ? loadError.message : "Não deu para abrir este título")
          }
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [mediaType, params.id, params.tipo, providerKey, region])

  if (!mediaType) {
    return (
      <div className="px-5 pt-[110px] pb-[70px] sm:px-12">
        <StatusPanel title="Título não encontrado" message="Esse endereço não é de filme nem de série." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-5 pt-[110px] pb-[70px] sm:px-12">
        <StatusPanel title="Não deu para abrir" message={error} />
      </div>
    )
  }

  if (!details) {
    return <div className="h-[44vh] min-h-[340px] bg-white/4" aria-hidden />
  }

  const ownOffers = details.offers.filter((offer) => offer.isOwn)
  const otherOffers = details.offers.filter((offer) => !offer.isOwn)
  const poster = posterUrl(details.posterPath, "w500")
  const still = atmosphereUrl(details.backdropPath, details.posterPath)
  const hasOwnServices = catalogPreferences.providerIds.length > 0
  const otherLabel = ownOffers.length
    ? `Também disponível em ${regionName}`
    : `Disponível em ${regionName} (fora dos seus serviços)`
  const meta = [
    mediaLabel(details.mediaType),
    details.year,
    details.genres.length > 0 ? details.genres.join(", ") : null,
    `★ ${details.voteAverage ? details.voteAverage.toFixed(1) : "—"}`,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <article>
      <div className="relative h-[44vh] min-h-[340px] overflow-hidden bg-[#15161c]">
        {still ? (
          <Image src={still} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : null}
        <div className="hatch-hero absolute inset-0" />
        <div className="scrim-detail absolute inset-0" />
      </div>

      <div className="relative mx-auto mt-[-170px] max-w-[1080px] px-5 pb-[70px] sm:px-12">
        <button
          type="button"
          onClick={() => router.back()}
          className="cta-secondary mb-[22px] rounded-full px-4 py-[9px] text-[13px] font-semibold backdrop-blur-[8px]"
        >
          ← Voltar
        </button>

        <div className="flex flex-wrap items-start gap-9">
          <div className="relative aspect-[2/3] w-[230px] flex-none overflow-hidden rounded-[14px] border border-white/12 bg-[#15161c] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            {poster ? (
              <Image src={poster} alt="" fill sizes="230px" className="object-cover" priority />
            ) : (
              <>
                <div className="hatch absolute inset-0" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-[18px] text-center">
                  <div className="text-[23px] font-extrabold leading-[1.15] tracking-[-0.02em]">
                    {details.title}
                  </div>
                  <div className="mt-2.5 font-mono text-[10.5px] tracking-[0.12em] text-white/55">
                    {mediaLabel(details.mediaType).toUpperCase()}
                    {details.year ? ` · ${details.year}` : ""}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="mt-1.5 mb-2.5 text-[42px] leading-[1.05] font-black tracking-[-0.03em]">
              {details.title}
            </h1>
            <p className="mb-4 text-sm font-medium text-white/65">{meta}</p>
            {details.overview ? (
              <p className="mb-[26px] max-w-[600px] text-pretty text-[15px] leading-[1.6] text-white/85">
                {details.overview}
              </p>
            ) : (
              <p className="mb-[26px] max-w-[600px] text-[15px] leading-[1.6] text-mute">
                Sem sinopse em português.
              </p>
            )}

            <WatchStatusToggle
              mediaType={details.mediaType}
              tmdbId={details.tmdbId}
              variant="detail"
            />

            <div className="mb-9">
              <WatchlistToggle
                tmdbId={details.tmdbId}
                mediaType={details.mediaType}
                title={details.title}
                posterPath={details.posterPath}
                year={details.year}
                variant="primary"
              />
            </div>

            <h2 className="mb-4 text-xl font-extrabold tracking-[-0.02em]">
              Onde assistir · {regionName}
            </h2>
            {!details.availableInRegion ? (
              <p className="max-w-[600px] rounded-xl bg-white/5 px-5 py-[18px] text-sm text-white/65">
                Este título não está disponível em nenhum serviço em {regionName} no momento.
              </p>
            ) : (
              <div>
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

            {details.credits.length > 0 ? (
              <section>
                <h2 className="mt-9 mb-4 text-xl font-extrabold tracking-[-0.02em]">Elenco</h2>
                <ul className="grid max-w-[600px] grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-x-4 gap-y-5">
                  {details.credits.slice(0, 8).map((person) => {
                    const src = profileUrl(person.profilePath)
                    const initials = person.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()

                    return (
                      <li key={person.id}>
                        <div className="relative aspect-[1/1.28] overflow-hidden rounded-2xl bg-[#15161c]">
                          {src ? (
                            <Image
                              src={src}
                              alt=""
                              fill
                              sizes="104px"
                              className="object-cover object-top"
                            />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold tracking-[-0.02em] text-white/50">
                              {initials}
                            </span>
                          )}
                        </div>
                        <p className="mt-[11px] text-sm leading-[1.25] font-semibold text-pretty text-paper">
                          {person.name}
                        </p>
                        <p className="mt-1 text-[13.5px] leading-[1.25] text-pretty text-white/42">
                          {person.character || "—"}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </div>
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
    <div className={emphasized ? "mb-5" : ""}>
      <h3
        className={cn(
          "mb-2 text-[11px] font-bold tracking-[0.09em] uppercase",
          emphasized ? "text-positive" : "text-mute",
        )}
      >
        {title}
      </h3>
      <ul className="flex max-w-[600px] flex-col gap-2">
        {offers.map((offer) => {
          const src = logoUrl(offer.logoPath)
          return (
            <li
              key={`${offer.providerId}-${offer.monetization}`}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3",
                emphasized ? "bg-white/6" : "bg-white/3 opacity-80",
              )}
            >
              {src ? (
                <Image
                  src={src}
                  alt=""
                  width={34}
                  height={34}
                  className="h-[34px] w-[34px] flex-none rounded-[9px] bg-[#0f1116] object-cover"
                />
              ) : (
                <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] bg-[#0f1116] text-[10px] font-bold text-white/70">
                  {offer.providerName.slice(0, 2).toUpperCase()}
                </span>
              )}
              <span className="flex-1 text-sm font-semibold">{offer.providerName}</span>
              <span
                className={cn(
                  "rounded-[5px] px-[9px] py-1 text-[11px] font-bold",
                  emphasized
                    ? KIND_STYLE[offer.monetization]
                    : "bg-white/14 text-white/85",
                )}
              >
                {MONETIZATION_LABEL[offer.monetization]}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
