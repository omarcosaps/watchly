"use client"

import { useState } from "react"

import { useAccount } from "@/components/account-provider"
import { AuthForm, AuthLinks } from "@/components/auth-form"

export default function RecuperarSenhaPage() {
  const { requestPasswordReset } = useAccount()
  const [success, setSuccess] = useState<string | null>(null)

  return (
    <AuthForm
      title="Recuperar senha"
      subtitle="Enviamos um link para você criar uma senha nova"
      submitLabel="Enviar link de redefinição"
      success={success}
      fields={[{ name: "email", label: "E-mail", type: "email", autoComplete: "email" }]}
      onSubmit={(values) => {
        requestPasswordReset(values.email)
        setSuccess(
          `Se existir uma conta para ${values.email.trim().toLowerCase()}, enviamos um link de redefinição de senha.`,
        )
      }}
      footer={
        <AuthLinks
          items={[
            { href: "/atualizar-senha", label: "Já tenho o link de redefinição" },
            { href: "/login", label: "Lembrou a senha? Voltar para o login" },
          ]}
        />
      }
    />
  )
}
