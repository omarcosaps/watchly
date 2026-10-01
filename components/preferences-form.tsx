"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { PencilIcon } from "@/components/icons"
import { usePageMotionOptional } from "@/components/page-motion"
import { ProviderPicker } from "@/components/provider-picker"
import { fetchProviders } from "@/lib/api"
import { AccountError, ACCOUNT_ERROR_COPY, PRODUCT_COUNTRIES } from "@/lib/account/types"
import { validateAvatarFile } from "@/lib/account/validation"
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
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [loadedCountry, setLoadedCountry] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loading = loadedCountry !== country
  const shownAvatarUrl = previewUrl ?? account.avatarUrl

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

  useEffect(() => {
    if (!previewFile) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(previewFile)
    setPreviewUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [previewFile])

  const handleOpenAvatarPicker = () => {
    if (avatarBusy) return
    fileInputRef.current?.click()
  }

  const handleAvatarFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || avatarBusy) return

    setAvatarSuccess(null)

    try {
      validateAvatarFile(file)
    } catch (validationError) {
      setAvatarError(
        validationError instanceof AccountError
          ? validationError.message
          : "Escolha uma foto em JPG, PNG ou WebP.",
      )
      return
    }

    setAvatarError(null)
    setPreviewFile(file)
    setAvatarBusy(true)

    try {
      await account.saveAvatar(file)
      setPreviewFile(null)
      setPreviewUrl(null)
      setAvatarSuccess("Foto do perfil atualizada.")
    } catch (saveError) {
      setPreviewFile(null)
      setPreviewUrl(null)
      setAvatarError(
        saveError instanceof AccountError ? saveError.message : "Não deu para salvar a foto.",
      )
    } finally {
      setAvatarBusy(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (avatarBusy) return
    setAvatarSuccess(null)
    setAvatarError(null)
    setAvatarBusy(true)

    try {
      await account.removeAvatar()
    } catch (removeError) {
      setAvatarError(
        removeError instanceof AccountError
          ? removeError.message
          : "Não deu para remover a foto.",
      )
    } finally {
      setAvatarBusy(false)
    }
  }

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
        <div className={cn("mb-[30px]", enter && "d-in")}>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/18 text-[15px] font-extrabold text-white">
                {shownAvatarUrl ? (
                  <img
                    src={shownAvatarUrl}
                    alt="Foto do perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initialsFromEmail(account.session.email)
                )}
              </span>
              <button
                type="button"
                onClick={handleOpenAvatarPicker}
                disabled={avatarBusy}
                aria-label={account.avatarUrl ? "Trocar foto" : "Enviar foto"}
                className="absolute -right-0.5 -bottom-0.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-void text-white transition-colors duration-[150ms] hover:bg-white/16 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="min-w-0">
              <h1 className="text-[34px] font-black tracking-[-0.03em]">Perfil</h1>
              <p className="truncate text-sm font-semibold text-white/80">{account.session.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                {account.avatarUrl ? (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenAvatarPicker}
                      disabled={avatarBusy}
                      className={avatarActionClass}
                    >
                      Trocar foto
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={avatarBusy}
                      className={avatarActionClass}
                    >
                      Remover
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenAvatarPicker}
                    disabled={avatarBusy}
                    className={avatarActionClass}
                  >
                    Enviar foto
                  </button>
                )}
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Escolher foto do perfil"
            disabled={avatarBusy}
            onChange={handleAvatarFile}
            className="sr-only"
          />
          {avatarError ? (
            <p className="mt-3 text-[13.5px] text-alert" role="alert">
              {avatarError}
            </p>
          ) : null}
          {avatarSuccess ? (
            <p className="mt-3 text-[13.5px] text-positive" role="status">
              {avatarSuccess}
            </p>
          ) : null}
        </div>
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
          "flex flex-col items-stretch gap-3 pb-safe sm:flex-row sm:items-center sm:gap-4 sm:pb-0",
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
            "w-full scroll-mb-safe rounded-full font-bold transition-colors duration-[150ms] sm:w-auto",
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
            className="cta-destructive w-full scroll-mb-safe rounded-full px-[22px] py-3 text-sm font-semibold sm:w-auto"
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

const initialsFromEmail = (email: string) => {
  return (email.split("@")[0] ?? "").slice(0, 2).toUpperCase()
}

const avatarActionClass =
  "cursor-pointer text-sm font-semibold text-white/70 transition-colors duration-[150ms] hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
