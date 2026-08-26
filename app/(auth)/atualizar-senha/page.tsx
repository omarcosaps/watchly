"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { useAccount } from "@/components/account-provider"
import { AuthForm, AuthLinks } from "@/components/auth-form"

export default function AtualizarSenhaPage() {
  const router = useRouter()
  const { updatePassword } = useAccount()
  const [success, setSuccess] = useState<string | null>(null)

  return (
    <AuthForm
      title="Nova senha"
      submitLabel="Salvar senha"
      success={success}
      fields={[
        {
          name: "password",
          label: "Nova senha",
          type: "password",
          autoComplete: "new-password",
        },
      ]}
      onSubmit={(values) => {
        updatePassword(values.password)
        setSuccess("Senha atualizada. Entre de novo com a nova senha.")
        window.setTimeout(() => router.replace("/login"), 800)
      }}
      footer={<AuthLinks items={[{ href: "/login", label: "Voltar ao login" }]} />}
    />
  )
}
