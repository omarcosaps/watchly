"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { usePageMotionOptional } from "@/components/page-motion"
import { ProviderPicker } from "@/components/provider-picker"
import { fetchProviders } from "@/lib/api"
import { AccountError, ACCOUNT_ERROR_COPY, PRODUCT_COUNTRIES } from "@/lib/account/types"
import { toOnboardingProviders } from "@/lib/catalog/onboarding-providers"
import type { WatchProvider } from "@/lib/catalog/types"
import { cn } from "@/lib/cn"

type PreferencesFormProps = {
  submitLabel: string
  redirectTo?: string
  showAccount?: boolean
  showLogout?: boolean
  layout?: "default" | "onboarding"
  enter?: boolean
  onSaved?: () => void
}

export const PreferencesForm = ({
  submitLabel,
  redirectTo = "/",
  showAccount = false,
  showLogout = false,
  layout = "default",
  enter = false,
  onSaved,
}: PreferencesFormProps) => {
  const router = useRouter()
  const account = useAccount()
  const pageMotion = usePageMotionOptional()
  const [providers, setProviders] = useState<WatchProvider[]>([])
  const [country, setCountry] = useState(account.preferences?.country ?? "BR")
  const [selectedIds, setSelectedIds] = useState<number[]>(account.preferences?.providerIds ?? [])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loadedCountry, setLoadedCountry] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const loading = loadedCountry !== country

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await fetchProviders(country)
        if (cancelled) return
        const visibleProviders = toOnboardingProviders(data.providers)
        setProviders(visibleProviders)
        const valid = new Set(visibleProviders.map((provider) => provider.id))
        setSelectedIds((current) => current.filter((id) => valid.has(id)))
        setLoadedCountry(country)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Não deu para carregar os streamings")
          setLoadedCountry(country)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [country])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      await account.savePreferences({ country, providerIds: selectedIds })
      if (onSaved) {
        onSaved()
        return
      }
      if (showAccount) {
        setSuccess("Preferências salvas. Sua watchlist continua intacta.")
        return
      }
      router.replace(redirectTo)
    } catch (saveError) {
      if (saveError instanceof AccountError) {
        setError(ACCOUNT_ERROR_COPY[saveError.code])
        return
      }
      setError("Não deu para salvar as preferências")
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    const goHome = async () => {
      await account.signOut()
      router.replace("/")
    }
    if (pageMotion) {
      pageMotion.leaveThen(() => {
        void goHome()
      })
      return
    }
    void goHome()
  }

  return (
    <form onSubmit={handleSubmit}>
      {showAccount && account.session ? (
        <p
          className={cn("mb-[30px] text-sm text-white/50", enter && "d-in")}
          style={enter ? { animationDelay: "0.06s" } : undefined}
        >
          Conectado como{" "}
          <strong className="font-semibold text-white/80">{account.session.email}</strong>. Trocar
          país ou streamings não apaga sua watchlist.
        </p>
      ) : null}
      <fieldset className={enter ? "d-in" : undefined} style={enter ? { animationDelay: "0.10s" } : undefined}>
        <legend className="mb-2.5 text-[11px] font-bold tracking-[0.09em] text-mute uppercase">
          País
        </legend>
        <div className="mb-7 flex flex-wrap gap-2">
          {PRODUCT_COUNTRIES.map((item) => {
            const selected = country === item.code
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setCountry(item.code)
                  setSuccess(null)
                }}
                aria-pressed={selected}
                className={cn(
                  "rounded-full border bg-transparent px-5 py-2.5 text-sm font-semibold transition-colors duration-[150ms]",
                  selected
                    ? "cursor-default border-white/75 text-white hover:border-white"
                    : "cursor-pointer border-white/16 text-white/60 hover:border-white/50 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.name}
              </button>
            )
          })}
        </div>
      </fieldset>
      <fieldset className={enter ? "d-in" : undefined} style={enter ? { animationDelay: "0.16s" } : undefined}>
        <legend className="mb-2.5 text-[11px] font-bold tracking-[0.09em] text-mute uppercase">
          Seus streamings
        </legend>
        {loading ? (
          <p className="text-[13.5px] text-mute">Carregando streamings…</p>
        ) : (
          <ProviderPicker
            providers={providers}
            selectedIds={selectedIds}
            onChange={(ids) => {
              setSelectedIds(ids)
              setSuccess(null)
            }}
          />
        )}
      </fieldset>
      {error ? (
        <p className="mt-4 text-[13.5px] text-alert" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 text-[13.5px] text-positive" role="status">
          {success}
        </p>
      ) : null}
      <div
        className={cn(
          "flex items-center gap-4",
          layout === "onboarding" ? "mt-7" : "mt-6",
          enter && "d-in",
        )}
        style={enter ? { animationDelay: "0.22s" } : undefined}
      >
        <button
          type="submit"
          disabled={selectedIds.length < 1 || loading || saving}
          aria-busy={saving}
          className={cn(
            "rounded-full font-bold transition-colors duration-[150ms]",
            layout === "onboarding"
              ? selectedIds.length < 1 || loading || saving
                ? "cursor-not-allowed bg-white/10 px-[26px] py-3.5 text-[15px] text-white/40 opacity-55"
                : "cta-primary px-[26px] py-3.5 text-[15px]"
              : "cta-primary px-[22px] py-3 text-sm disabled:cursor-not-allowed disabled:opacity-55",
          )}
        >
          {saving ? "Salvando…" : submitLabel}
        </button>
        {showLogout ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="cta-destructive rounded-full px-[22px] py-3 text-sm font-semibold"
          >
            Sair da conta
          </button>
        ) : null}
        {layout === "onboarding" ? (
          <span className="text-[13px] text-mute">
            {selectedIds.length < 1
              ? "Escolha pelo menos um streaming."
              : `${selectedIds.length} selecionado(s)`}
          </span>
        ) : null}
      </div>
    </form>
  )
}
