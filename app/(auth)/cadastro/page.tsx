"use client"

import { useRouter } from "next/navigation"

import { useAccount } from "@/components/account-provider"
import { AuthForm, AuthLinks, ExploreAsGuest } from "@/components/auth-form"
import { ACQUISITION_SOURCE_OPTIONS } from "@/lib/account/types"

export default function CadastroPage() {
  const router = useRouter()
  const { signUp } = useAccount()

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <AuthForm
        title="Criar sua conta"
        subtitle="Seja bem-vindo ao Watchly"
        submitLabel="Criar conta"
        fields={[
          { name: "email", label: "E-mail", type: "email", autoComplete: "email" },
          { name: "password", label: "Senha", type: "password", autoComplete: "new-password" },
          {
            name: "acquisitionSource",
            label: "Onde conheceu o Watchly",
            placeholder: "Onde você conheceu o Watchly?",
            options: ACQUISITION_SOURCE_OPTIONS,
          },
        ]}
        onSubmit={(values) => {
          signUp(values.email, values.password, values.acquisitionSource)
          router.replace("/onboarding")
        }}
        footer={
          <div className="flex flex-col gap-3">
            <AuthLinks items={[{ href: "/login", label: "Já tem conta? Entrar" }]} />
            <ExploreAsGuest />
          </div>
        }
      />
    </div>
  )
}
