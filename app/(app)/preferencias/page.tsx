import { PreferencesForm } from "@/components/preferences-form"

export default function PreferenciasPage() {
  return (
    <div className="mx-auto max-w-[720px]">
      <h1 className="mb-1 text-[34px] font-black tracking-[-0.03em]">Perfil</h1>
      <PreferencesForm submitLabel="Salvar preferências" showAccount showLogout />
    </div>
  )
}
