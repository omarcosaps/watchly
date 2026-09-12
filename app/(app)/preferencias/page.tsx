"use client"

import { useRouter } from "next/navigation"

import { useAccount } from "@/components/account-provider"
import { PreferencesForm } from "@/components/preferences-form"

export default function PreferenciasPage() {
  const router = useRouter()
  const { signOut } = useAccount()

  const handleSignOut = () => {
    signOut()
    router.replace("/")
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-4xl font-semibold tracking-tight text-paper">Perfil</h1>
      <div className="mt-10">
        <PreferencesForm submitLabel="Salvar preferências" showAccount />
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-8 text-sm font-semibold text-mist hover:text-paper"
      >
        Sair da conta
      </button>
    </div>
  )
}
