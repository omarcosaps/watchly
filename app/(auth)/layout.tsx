import { Attribution } from "@/components/attribution"
import { GuestGuard } from "@/components/guest-guard"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className="atmosphere-auth flex min-h-dvh flex-col items-center px-5 py-[52px]">
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-[18px]">
          {children}
        </div>
        <Attribution />
      </div>
    </GuestGuard>
  )
}
