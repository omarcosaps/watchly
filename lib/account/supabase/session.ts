import { loadAccountForUser, loadGuestAccount } from "@/lib/account/supabase/load"
import { getAccountClient } from "@/lib/account/supabase/client"
import { mapAuthError } from "@/lib/account/supabase/map-error"
import { getAccountSnapshot } from "@/lib/account/store"
import { AccountError, type Session } from "@/lib/account/types"
import {
  validateAcquisitionSource,
  validateEmail,
  validatePassword,
} from "@/lib/account/validation"

const requireConfig = () => {
  try {
    return getAccountClient()
  } catch {
    throw new Error("Supabase não configurado")
  }
}

const recoveryRedirect = () => {
  if (typeof window === "undefined") {
    return "/auth/callback?next=/atualizar-senha"
  }

  return `${window.location.origin}/auth/callback?next=/atualizar-senha`
}

const emailIsRegistered = async (email: string) => {
  const supabase = requireConfig()
  const { data, error } = await supabase.rpc("email_registered", { p_email: email })

  if (error) {
    return false
  }

  return data === true
}

export const signUp = async (
  email: string,
  password: string,
  acquisitionSource: string,
): Promise<Session> => {
  const normalized = validateEmail(email)
  validatePassword(password)
  const source = validateAcquisitionSource(acquisitionSource)
  const supabase = requireConfig()

  const { data, error } = await supabase.auth.signUp({
    email: normalized,
    password,
    options: {
      data: {
        acquisition_source: source,
      },
    },
  })

  if (error) {
    throw mapAuthError(error)
  }

  const user = data.user
  const sessionEmail = data.session?.user.email ?? user?.email ?? normalized

  if (!data.session || !user) {
    throw new Error("Não deu para entrar. Confirme se a verificação de e-mail está desligada.")
  }

  await loadAccountForUser(user.id, sessionEmail)

  return {
    email: sessionEmail,
    status: "authenticated",
  }
}

export const signIn = async (email: string, password: string): Promise<Session> => {
  const normalized = validateEmail(email)
  validatePassword(password)
  const supabase = requireConfig()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalized,
    password,
  })

  if (error) {
    const exists = await emailIsRegistered(normalized)
    if (!exists) {
      throw new AccountError(
        "account_not_found",
        "Conta não encontrada. Crie uma conta primeiro.",
      )
    }

    throw new AccountError("bad_credentials", "Senha incorreta.")
  }

  const user = data.user
  const sessionEmail = user.email ?? normalized
  await loadAccountForUser(user.id, sessionEmail)

  return {
    email: sessionEmail,
    status: "authenticated",
  }
}

export const signOut = async () => {
  const supabase = requireConfig()
  await supabase.auth.signOut()
  loadGuestAccount()
}

export const confirmEmail = async (): Promise<Session> => {
  const session = getAccountSnapshot().session

  if (!session) {
    throw new AccountError("account_not_found", "Conta não encontrada. Crie uma conta primeiro.")
  }

  return session
}

export const requestPasswordReset = async (email: string) => {
  const normalized = validateEmail(email)
  const supabase = requireConfig()

  await supabase.auth.resetPasswordForEmail(normalized, {
    redirectTo: recoveryRedirect(),
  })
}

export const updatePassword = async (password: string) => {
  validatePassword(password)
  const supabase = requireConfig()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    throw mapAuthError(error)
  }

  await signOut()
}
