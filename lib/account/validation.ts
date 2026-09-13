import {
  AccountError,
  isAcquisitionSource,
  type AcquisitionSource,
} from "@/lib/account/types"

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
