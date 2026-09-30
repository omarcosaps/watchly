import {
  ACCOUNT_ERROR_COPY,
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

const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

export const AVATAR_MAX_BYTES = 2_097_152

export const validateAvatarFile = (file: { type: string; size: number }) => {
  if (!(AVATAR_MIME_TYPES as readonly string[]).includes(file.type)) {
    throw new AccountError("invalid_avatar_type", ACCOUNT_ERROR_COPY.invalid_avatar_type)
  }

  if (file.size > AVATAR_MAX_BYTES) {
    throw new AccountError("avatar_too_large", ACCOUNT_ERROR_COPY.avatar_too_large)
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
