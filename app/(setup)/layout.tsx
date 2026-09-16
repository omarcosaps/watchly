import { Attribution } from "@/components/attribution"
import { AuthGuard } from "@/components/auth-guard"

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="atmosphere-onboarding flex min-h-dvh flex-col items-center px-5 pt-safe sm:pt-[60px] sm:pb-[60px]">
        <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-center-safe pb-safe sm:pb-0">
          {children}
        </div>
        <Attribution />
      </div>
    </AuthGuard>
  )
}
