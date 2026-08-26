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
      submitLabel="Enviar email"
      success={success}
      fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]}
      onSubmit={(values) => {
        requestPasswordReset(values.email)
        setSuccess("Se essa conta existir, enviamos um email para redefinir a senha.")
      }}
      footer={
        <AuthLinks
          items={[
            { href: "/atualizar-senha", label: "Já tenho o link de redefinição" },
            { href: "/login", label: "Voltar ao login" },
          ]}
        />
      }
    />
  )
}
