"use client"

import { useRouter } from "next/navigation"

import { useAccount } from "@/components/account-provider"
import { AuthForm, AuthSwitch, ExploreAsGuest } from "@/components/auth-form"
import { ACQUISITION_SOURCE_OPTIONS } from "@/lib/account/types"

export default function CadastroPage() {
  const router = useRouter()
  const { signUp } = useAccount()

  return (
    <>
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
        onSubmit={async (values) => {
          await signUp(values.email, values.password, values.acquisitionSource)
          router.replace("/onboarding")
        }}
        footer={<AuthSwitch prompt="Já tem conta?" href="/login" label="Entrar" />}
      />
      <ExploreAsGuest />
    </>
  )
}
