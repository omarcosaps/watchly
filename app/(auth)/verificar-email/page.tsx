"use client"

import { useRouter } from "next/navigation"

import { useAccount } from "@/components/account-provider"
import { Wordmark } from "@/components/wordmark"

export default function VerificarEmailPage() {
  const router = useRouter()
  const { session, confirmEmail, signOut } = useAccount()

  const handleConfirm = () => {
    confirmEmail()
    router.replace("/onboarding")
  }

  const handleSignOut = () => {
    signOut()
    router.replace("/login")
  }

  return (
    <div className="glass w-full max-w-md rounded-3xl p-8">
      <Wordmark href="/verificar-email" className="text-2xl" />
      <h1 className="mt-6 text-4xl font-medium tracking-tight text-paper">Verifique seu email</h1>
      <p className="mt-4 text-mist">
        Enviamos um email para {session?.email ?? "sua conta"}. Confirme para continuar.
      </p>
      <button
        type="button"
        onClick={handleConfirm}
        className="cta-primary mt-8 h-12 w-full rounded-full font-semibold"
      >
        Já confirmei o email
      </button>
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-4 w-full text-sm text-mist underline-offset-4 hover:text-paper hover:underline"
      >
        Sair
      </button>
    </div>
  )
}
