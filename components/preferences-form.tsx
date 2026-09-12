"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { ProviderPicker } from "@/components/provider-picker"
import { fetchProviders } from "@/lib/api"
import { AccountError, ACCOUNT_ERROR_COPY, PRODUCT_COUNTRIES } from "@/lib/account/types"
import type { WatchProvider } from "@/lib/catalog/types"

type PreferencesFormProps = {
  submitLabel: string
  redirectTo?: string
  showAccount?: boolean
  onSaved?: () => void
}

export const PreferencesForm = ({
  submitLabel,
  redirectTo = "/",
  showAccount = false,
  onSaved,
}: PreferencesFormProps) => {
  const router = useRouter()
  const account = useAccount()
  const [providers, setProviders] = useState<WatchProvider[]>([])
  const [country, setCountry] = useState(account.preferences?.country ?? "BR")
  const [selectedIds, setSelectedIds] = useState<number[]>(account.preferences?.providerIds ?? [])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loadedCountry, setLoadedCountry] = useState<string | null>(null)
  const loading = loadedCountry !== country

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await fetchProviders(country)
        if (cancelled) return
        setProviders(data.providers)
        const valid = new Set(data.providers.map((provider) => provider.id))
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      account.savePreferences({ country, providerIds: selectedIds })
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
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {showAccount && account.session ? (
        <p className="text-sm text-mist">
          Conectado como {account.session.email}. Trocar país ou streamings não apaga sua
          watchlist.
        </p>
      ) : null}
      <fieldset>
        <legend className="mb-3 text-sm text-mist">País</legend>
        <div className="flex flex-wrap gap-2">
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
                className={cnCountry(selected)}
              >
                {item.name}
              </button>
            )
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm text-mist">Seus streamings</legend>
        {loading ? (
          <p className="text-mist">Carregando streamings…</p>
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
        <p className="mt-3 text-sm text-mist">
          {selectedIds.length < 1
            ? "Escolha pelo menos um streaming."
            : `${selectedIds.length} selecionado(s)`}
        </p>
      </fieldset>
      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-300" role="status">
          {success}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={selectedIds.length < 1 || loading}
        className="cta-primary h-12 w-fit rounded-full px-6 font-semibold disabled:cursor-not-allowed disabled:opacity-55"
      >
        {submitLabel}
      </button>
    </form>
  )
}

const cnCountry = (selected: boolean) => {
  return [
    "h-11 rounded-full border px-4 text-sm font-semibold transition-colors",
    selected
      ? "border-white/75 text-paper"
      : "border-white/16 text-white/60 hover:border-white/50 hover:text-white",
  ].join(" ")
}
