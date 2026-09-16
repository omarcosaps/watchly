import { Attribution } from "@/components/attribution"
import { GuestGuard } from "@/components/guest-guard"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className="atmosphere-auth flex min-h-dvh flex-col items-center px-5 pt-safe sm:pt-[52px] sm:pb-[52px]">
        <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-center-safe gap-[18px] pb-8 sm:pb-0">
          {children}
        </div>
        <Attribution />
      </div>
    </GuestGuard>
  )
}
