export type SessionStatus = "authenticated"

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

export const ACQUISITION_SOURCES = [
  "amigo",
  "redes",
  "google",
  "youtube",
  "blog",
  "loja",
  "outro",
] as const

export type AcquisitionSource = (typeof ACQUISITION_SOURCES)[number]

export const ACQUISITION_SOURCE_OPTIONS: {
  value: AcquisitionSource
  label: string
}[] = [
  { value: "amigo", label: "Indicação de um amigo" },
  { value: "redes", label: "Redes sociais" },
  { value: "google", label: "Busca no Google" },
  { value: "youtube", label: "YouTube ou podcast" },
  { value: "blog", label: "Notícia ou blog" },
  { value: "loja", label: "Loja de aplicativos" },
  { value: "outro", label: "Outro" },
]

export const isAcquisitionSource = (value: string): value is AcquisitionSource => {
  return (ACQUISITION_SOURCES as readonly string[]).includes(value)
}

export const PRODUCT_COUNTRIES = [
  { code: "BR", name: "Brasil" },
  { code: "US", name: "Estados Unidos" },
  { code: "PT", name: "Portugal" },
] as const

export const PRODUCT_COUNTRY_CODES = PRODUCT_COUNTRIES.map((country) => country.code)

export const GUEST_PREFERENCES: Preferences = {
  country: "BR",
  providerIds: [],
}

export type AccountErrorCode =
  | "invalid_email"
  | "short_password"
  | "email_taken"
  | "bad_credentials"
  | "account_not_found"
  | "acquisition_required"
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
  invalid_email: "Informe um email válido.",
  short_password: "A senha precisa de pelo menos 6 caracteres.",
  email_taken: "Já existe uma conta com esse email. Use Entrar.",
  bad_credentials: "Senha incorreta.",
  account_not_found: "Conta não encontrada. Crie uma conta primeiro.",
  acquisition_required: "Conte onde você conheceu o Watchly.",
  providers_required: "Escolha pelo menos um streaming disponível neste país para continuar.",
}
