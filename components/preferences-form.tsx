"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { ProviderPicker } from "@/components/provider-picker"
import { fetchMeta, fetchProviders } from "@/lib/api"
import { AccountError, ACCOUNT_ERROR_COPY } from "@/lib/account/types"
import type { CountryOption, WatchProvider } from "@/lib/catalog/types"

type PreferencesFormProps = {
  submitLabel: string
  redirectTo?: string
}

export const PreferencesForm = ({ submitLabel, redirectTo = "/" }: PreferencesFormProps) => {
  const router = useRouter()
  const account = useAccount()
  const [countries, setCountries] = useState<CountryOption[]>([])
  const [providers, setProviders] = useState<WatchProvider[]>([])
  const [country, setCountry] = useState(account.preferences?.country ?? "BR")
  const [selectedIds, setSelectedIds] = useState<number[]>(account.preferences?.providerIds ?? [])
  const [error, setError] = useState<string | null>(null)
  const [loadedCountry, setLoadedCountry] = useState<string | null>(null)
  const loading = loadedCountry !== country

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const meta = await fetchMeta()
        if (!cancelled) setCountries(meta.countries)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Não deu para carregar os países")
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

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

    try {
      account.savePreferences({ country, providerIds: selectedIds })
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
      <label className="flex max-w-sm flex-col gap-2 text-sm text-mist">
        País
        <select
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          className="focus-pill press-pill glass h-12 rounded-full px-4 text-paper"
        >
          {countries.length === 0 ? <option value="BR">Brasil</option> : null}
          {countries.map((item) => (
            <option key={item.code} value={item.code} className="bg-panel text-paper">
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="mb-3 text-sm text-mist">Seus streamings</legend>
        {loading ? (
          <p className="text-mist">Carregando streamings…</p>
        ) : (
          <ProviderPicker
            providers={providers}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
          />
        )}
      </fieldset>
      {error ? (
        <p className="text-paper" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={selectedIds.length < 1 || loading}
        className="cta-primary h-12 w-fit rounded-full px-6 font-semibold disabled:opacity-40"
      >
        {submitLabel}
      </button>
    </form>
  )
}
