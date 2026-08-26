import { PreferencesForm } from "@/components/preferences-form"

export default function PreferenciasPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm text-mist">Conta</p>
      <h1 className="font-display mt-1 text-5xl italic tracking-tight text-paper">Preferências</h1>
      <p className="mt-3 max-w-xl text-mist">
        Trocar o país ou os streamings atualiza o catálogo. A watchlist permanece.
      </p>
      <div className="mt-10">
        <PreferencesForm submitLabel="Salvar preferências" />
      </div>
    </div>
  )
}
