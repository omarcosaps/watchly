import { Attribution } from "@/components/attribution"
import { GuestGuard } from "@/components/guest-guard"
import { Wordmark } from "@/components/wordmark"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className="relative flex min-h-dvh flex-col overflow-hidden bg-void">
        <div className="atmosphere pointer-events-none absolute inset-0" aria-hidden />
        <header className="relative z-10 px-6 py-6">
          <Wordmark href="/login" />
        </header>
        <main className="relative z-10 flex flex-1 items-start justify-center px-4 py-8">
          {children}
        </main>
        <Attribution />
      </div>
    </GuestGuard>
  )
}
