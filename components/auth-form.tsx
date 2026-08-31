"use client"

import Link from "next/link"
import { useState } from "react"

import { ACCOUNT_ERROR_COPY, AccountError } from "@/lib/account/types"

type AuthField = {
  name: string
  label: string
  type: string
  autoComplete: string
  required?: boolean
}

type AuthFormProps = {
  title: string
  submitLabel: string
  fields: AuthField[]
  onSubmit: (values: Record<string, string>) => void
  footer?: React.ReactNode
  success?: string | null
}

export const AuthForm = ({
  title,
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
    <div className="w-full max-w-md rounded-[28px] bg-panel p-8 ring-1 ring-white/8">
      <h1 className="font-display text-4xl italic tracking-tight text-paper">{title}</h1>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        {fields.map((field) => (
          <label key={field.name} className="flex flex-col gap-2 text-sm text-mist">
            {field.label}
            <input
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              required={field.required !== false}
              className="focus-pill h-12 rounded-full border border-white/8 bg-white/5 px-4 text-paper"
            />
          </label>
        ))}
        {error ? (
          <p className="text-paper" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-mist" role="status">
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
