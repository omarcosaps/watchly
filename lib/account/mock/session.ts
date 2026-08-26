import { mutateAccount } from "@/lib/account/mock/storage"
import { AccountError, type Session } from "@/lib/account/types"

const TAKEN_EMAIL = "usado@watchly.app"
const PENDING_EMAIL = "pendente@watchly.app"
const WRONG_PASSWORD = "errada"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateEmail = (email: string) => {
  const normalized = email.trim().toLowerCase()
  if (!EMAIL_PATTERN.test(normalized)) {
    throw new AccountError("invalid_email", "Email inválido")
  }
  return normalized
}

export const validatePassword = (password: string) => {
  if (password.length < 6) {
    throw new AccountError("short_password", "A senha precisa ter pelo menos 6 caracteres")
  }
}

export const signUp = (email: string, password: string): Session => {
  const normalized = validateEmail(email)
  validatePassword(password)

  if (normalized === TAKEN_EMAIL) {
    throw new AccountError("email_taken", "Esse email já tem conta")
  }

  const status = normalized === PENDING_EMAIL ? "email_pending" : "authenticated"

  const account = mutateAccount((current) => ({
    ...current,
    session: { email: normalized, status },
  }))

  return account.session as Session
}

export const signIn = (email: string, password: string): Session => {
  const normalized = validateEmail(email)
  validatePassword(password)

  if (password === WRONG_PASSWORD) {
    throw new AccountError("bad_credentials", "Email ou senha não conferem")
  }

  const status = normalized === PENDING_EMAIL ? "email_pending" : "authenticated"

  const account = mutateAccount((current) => ({
    ...current,
    session: { email: normalized, status },
  }))

  return account.session as Session
}

export const signOut = () => {
  mutateAccount((current) => ({
    ...current,
    session: null,
  }))
}

export const confirmEmail = (): Session => {
  const account = mutateAccount((current) => {
    if (!current.session) return current
    return {
      ...current,
      session: { ...current.session, status: "authenticated" },
    }
  })

  if (!account.session) {
    throw new AccountError("bad_credentials", "Email ou senha não conferem")
  }

  return account.session
}

export const requestPasswordReset = (email: string) => {
  validateEmail(email)
}

export const updatePassword = (password: string) => {
  validatePassword(password)
}
