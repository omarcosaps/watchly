"use client"

import Link from "next/link"
import { useState } from "react"

import { ACCOUNT_ERROR_COPY, AccountError } from "@/lib/account/types"
import { clearPendingWatchlist } from "@/lib/account/pending-watchlist"

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
  onSubmit: (values: Record<string, string>) => void
  footer?: React.ReactNode
  success?: string | null
}

export const AuthForm = ({
  title,
  subtitle,
  submitLabel,
  fields,
  onSubmit,
  footer,
  success,
}: AuthFormProps) => {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)
    const values: Record<string, string> = {}
    fields.forEach((field) => {
      values[field.name] = String(form.get(field.name) ?? "")
    })

    try {
      onSubmit(values)
    } catch (submitError) {
      if (submitError instanceof AccountError) {
        setError(ACCOUNT_ERROR_COPY[submitError.code])
        return
      }
      setError("Não deu para continuar")
    }
  }

  return (
    <div className="w-full max-w-md rounded-[28px] bg-panel/90 p-8 ring-1 ring-white/8">
      <h1 className="text-3xl font-semibold tracking-tight text-paper">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-mist">{subtitle}</p> : null}
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        {fields.map((field) => (
          <label key={field.name} className="flex flex-col gap-2 text-sm text-mist">
            {field.label}
            {field.options ? (
              <select
                name={field.name}
                required={field.required !== false}
                defaultValue=""
                className="focus-pill h-12 rounded-[13px] border border-white/8 bg-white/4 px-4 text-paper"
              >
                <option value="" className="bg-panel text-mist">
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
                className="focus-pill h-12 rounded-[13px] border border-white/8 bg-white/4 px-4 text-paper"
              />
            )}
          </label>
        ))}
        {error ? (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-mist" role="status">
            {success}
          </p>
        ) : null}
        <button
          type="submit"
          className="cta-primary mt-2 h-12 rounded-full font-semibold"
        >
          {submitLabel}
        </button>
      </form>
      {footer ? <div className="mt-6 text-sm text-mist">{footer}</div> : null}
    </div>
  )
}

export const AuthLinks = ({
  items,
}: {
  items: { href: string; label: string }[]
}) => {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="text-paper/80 underline-offset-4 hover:text-paper hover:underline">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
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
      className="mt-6 inline-flex text-sm font-semibold text-white/40 hover:text-white"
    >
      Explorar sem conta →
    </Link>
  )
}

export const AuthIntentNotice = ({ intent }: { intent?: string | null }) => {
  if (intent !== "save" && intent !== "watchlist") return null

  return (
    <p className="mb-6 max-w-md text-sm text-mist" role="status">
      Para adicionar filmes e séries à sua watchlist, entre na sua conta ou crie uma
      gratuitamente.
    </p>
  )
}
