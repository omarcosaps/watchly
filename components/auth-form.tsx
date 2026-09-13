"use client"

import Link from "next/link"
import { useState } from "react"

import { ACCOUNT_ERROR_COPY, AccountError } from "@/lib/account/types"
import { clearPendingWatchlist } from "@/lib/account/pending-watchlist"
import { cn } from "@/lib/cn"

type AuthField = {
  name: string
  label: string
  type?: string
  autoComplete?: string
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
}

type AuthFormProps = {
  title: string
  subtitle?: string
  submitLabel: string
  fields: AuthField[]
  onSubmit: (values: Record<string, string>) => void | Promise<void>
  notice?: React.ReactNode
  beforeSubmit?: React.ReactNode
  footer?: React.ReactNode
  success?: string | null
}

export const AuthForm = ({
  title,
  subtitle,
  submitLabel,
  fields,
  onSubmit,
  notice,
  beforeSubmit,
  footer,
  success,
}: AuthFormProps) => {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)
    const values: Record<string, string> = {}
    fields.forEach((field) => {
      values[field.name] = String(form.get(field.name) ?? "")
    })

    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (submitError) {
      if (submitError instanceof AccountError) {
        setError(ACCOUNT_ERROR_COPY[submitError.code])
        return
      }
      setError("Não deu para continuar")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fade-up w-full max-w-[404px] rounded-[22px] border border-white/6 bg-[linear-gradient(158deg,#191c22_0%,#14161b_52%,#101216_100%)] px-[34px] pt-[34px] pb-7 shadow-[0_28px_70px_rgba(0,0,0,0.55)]">
      <h1 className="text-[30px] font-black leading-none tracking-[-0.035em] text-paper">{title}</h1>
      {subtitle ? <p className="mt-[9px] text-[14.5px] text-white/48">{subtitle}</p> : null}
      {notice}
      <form onSubmit={handleSubmit} className="mt-[26px] flex flex-col gap-[17px]">
        {fields.map((field) => (
          <label key={field.name} className="flex flex-col gap-2">
            <span className="text-[11px] font-bold tracking-[0.09em] text-mute uppercase">
              {field.label}
            </span>
            {field.options ? (
              <select
                name={field.name}
                required={field.required !== false}
                defaultValue=""
                disabled={submitting}
                className="field-select"
              >
                <option value="" className="bg-panel text-mute">
                  {field.placeholder ?? "Selecione"}
                </option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value} className="bg-panel text-paper">
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={field.name}
                type={field.type ?? "text"}
                autoComplete={field.autoComplete}
                required={field.required !== false}
                disabled={submitting}
                className="field-input"
              />
            )}
          </label>
        ))}
        {beforeSubmit}
        {error ? (
          <p className="text-[13px] leading-normal text-alert" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-[13px] leading-normal text-positive" role="status">
            {success}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="cta-primary mt-[3px] w-full rounded-full py-3.5 text-[15px] font-bold disabled:cursor-not-allowed disabled:opacity-55"
        >
          {submitting ? "Aguarde…" : submitLabel}
        </button>
      </form>
      {footer ? <div className="mt-4 text-center text-[13.5px] text-white/48">{footer}</div> : null}
    </div>
  )
}

export const AuthSwitch = ({
  prompt,
  href,
  label,
}: {
  prompt?: string
  href: string
  label: string
}) => {
  return (
    <>
      {prompt}
      <Link
        href={href}
        className={cn(
          "font-bold text-white underline underline-offset-[3px]",
          prompt && "ml-1.5",
        )}
      >
        {label}
      </Link>
    </>
  )
}

export const ExploreAsGuest = () => {
  const handleClick = () => {
    clearPendingWatchlist()
  }

  return (
    <Link
      href="/"
      onClick={handleClick}
      className="text-[13px] font-semibold text-white/40 hover:text-white"
    >
      Explorar sem conta →
    </Link>
  )
}

export const AuthIntentNotice = ({ intent }: { intent?: string | null }) => {
  if (intent !== "save" && intent !== "watchlist") return null

  return (
    <div
      className="mt-5 flex items-start gap-[11px] rounded-[4px_12px_12px_4px] border border-white/9 border-l-2 border-l-white/55 bg-white/[0.045] px-[15px] py-[13px]"
      role="status"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,.72)"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
        className="mt-0.5 flex-none"
      >
        <rect x="4" y="10.5" width="16" height="10.5" rx="3" />
        <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      </svg>
      <p className="text-pretty text-[13.5px] leading-[1.55] text-white/88">
        Para adicionar filmes e séries à sua watchlist, entre na sua conta ou crie uma
        gratuitamente.
      </p>
    </div>
  )
}
