import { AccountError } from "@/lib/account/types"

const mentions = (message: string, ...needles: string[]) => {
  const normalized = message.toLowerCase()
  return needles.some((needle) => normalized.includes(needle))
}

export const mapAuthError = (error: { message: string; code?: string }) => {
  const message = error.message
  const code = error.code ?? ""

  if (mentions(code, "email_exists", "user_already_exists") || mentions(message, "already registered", "already exists")) {
    return new AccountError("email_taken", "Já existe uma conta com esse email. Use Entrar.")
  }

  if (mentions(code, "invalid_credentials", "invalid_login") || mentions(message, "invalid login", "invalid credentials")) {
    return new AccountError("bad_credentials", "Senha incorreta.")
  }

  if (mentions(message, "user not found", "account not found")) {
    return new AccountError("account_not_found", "Conta não encontrada. Crie uma conta primeiro.")
  }

  return new Error(message || "Não deu para continuar")
}
