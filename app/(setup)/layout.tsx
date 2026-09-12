import { Attribution } from "@/components/attribution"
import { AuthGuard } from "@/components/auth-guard"

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="atmosphere-onboarding flex min-h-dvh flex-col items-center px-5 py-[60px]">
        <div className="flex w-full flex-1 items-center justify-center">
          {children}
        </div>
        <Attribution />
      </div>
    </AuthGuard>
  )
}
