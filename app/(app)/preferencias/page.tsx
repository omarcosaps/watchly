"use client"

import { PreferencesForm } from "@/components/preferences-form"
import { useEnterCascade } from "@/hooks/use-enter-cascade"
import { cn } from "@/lib/cn"

export default function PreferenciasPage() {
  const enter = useEnterCascade()

  return (
    <div className="mx-auto max-w-[720px]">
      <h1 className={cn("mb-1 text-[34px] font-black tracking-[-0.03em]", enter && "d-in")}>
        Perfil
      </h1>
      <PreferencesForm
        submitLabel="Salvar preferências"
        showAccount
        showLogout
        enter={enter}
      />
    </div>
  )
}
