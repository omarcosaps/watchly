export type SessionStatus = "authenticated" | "email_pending"

export type Session = {
  email: string
  status: SessionStatus
}

export type Preferences = {
  country: string
  providerIds: number[]
}

export type WatchlistItem = {
  tmdbId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  year: number | null
  createdAt: string
  watched: boolean
}

export type AccountErrorCode =
  | "invalid_email"
  | "short_password"
  | "email_taken"
  | "bad_credentials"
  | "email_pending"
  | "providers_required"

export class AccountError extends Error {
  constructor(
    public code: AccountErrorCode,
    message: string,
  ) {
    super(message)
    this.name = "AccountError"
  }
}

export const ACCOUNT_ERROR_COPY: Record<AccountErrorCode, string> = {
  invalid_email: "Email inválido",
  short_password: "A senha precisa ter pelo menos 6 caracteres",
  email_taken: "Esse email já tem conta",
  bad_credentials: "Email ou senha não conferem",
  email_pending: "Verifique seu email para continuar",
  providers_required: "Escolha pelo menos um streaming",
}
