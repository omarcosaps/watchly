import { mutateState } from "@/lib/account/mock/storage"
import {
  AccountError,
  isAcquisitionSource,
  type AcquisitionSource,
  type Session,
} from "@/lib/account/types"

const TAKEN_EMAIL = "usado@watchly.app"
const WRONG_PASSWORD = "errada"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateEmail = (email: string) => {
  const normalized = email.trim().toLowerCase()
  if (!EMAIL_PATTERN.test(normalized)) {
    throw new AccountError("invalid_email", "Informe um email válido.")
  }
  return normalized
}

export const validatePassword = (password: string) => {
  if (password.length < 6) {
    throw new AccountError(
      "short_password",
      "A senha precisa de pelo menos 6 caracteres.",
    )
  }
}

export const validateAcquisitionSource = (value: string): AcquisitionSource => {
  const normalized = value.trim()
  if (!isAcquisitionSource(normalized)) {
    throw new AccountError(
      "acquisition_required",
      "Conte onde você conheceu o Watchly.",
    )
  }
  return normalized
}

export const signUp = (
  email: string,
  password: string,
  acquisitionSource: string,
): Session => {
  const normalized = validateEmail(email)
  validatePassword(password)
  const source = validateAcquisitionSource(acquisitionSource)

  if (normalized === TAKEN_EMAIL) {
    throw new AccountError(
      "email_taken",
      "Já existe uma conta com esse email. Use Entrar.",
    )
  }

  const session: Session = { email: normalized, status: "authenticated" }

  mutateState((current) => {
    if (current.accounts[normalized]) {
      throw new AccountError(
        "email_taken",
        "Já existe uma conta com esse email. Use Entrar.",
      )
    }

    return {
      session,
      accounts: {
        ...current.accounts,
        [normalized]: {
          password,
          acquisitionSource: source,
          preferences: null,
          watchlist: [],
        },
      },
    }
  })

  return session
}

export const signIn = (email: string, password: string): Session => {
  const normalized = validateEmail(email)
  validatePassword(password)

  const session: Session = { email: normalized, status: "authenticated" }

  mutateState((current) => {
    const user = current.accounts[normalized]

    if (!user) {
      throw new AccountError(
        "account_not_found",
        "Conta não encontrada. Crie uma conta primeiro.",
      )
    }

    if (password === WRONG_PASSWORD || user.password !== password) {
      throw new AccountError("bad_credentials", "Senha incorreta.")
    }

    return {
      ...current,
      session,
    }
  })

  return session
}

export const signOut = () => {
  mutateState((current) => ({
    ...current,
    session: null,
  }))
}

export const confirmEmail = (): Session => {
  const session = mutateState((current) => current).session

  if (!session) {
    throw new AccountError("account_not_found", "Conta não encontrada. Crie uma conta primeiro.")
  }

  return session
}

export const requestPasswordReset = (email: string) => {
  validateEmail(email)
}

export const updatePassword = (password: string) => {
  validatePassword(password)
}
