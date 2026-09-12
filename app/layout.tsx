import type { Metadata } from "next"
import { Geist } from "next/font/google"

import { AccountProvider } from "@/components/account-provider"
import { ToastProvider } from "@/components/toast-provider"

import "./globals.css"

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

export const metadata: Metadata = {
  title: {
    default: "Watchly",
    template: "%s · Watchly",
  },
  description: "Veja o que dá para assistir nos streamings que você já usa.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-void font-sans text-paper">
        <AccountProvider>
          <ToastProvider>{children}</ToastProvider>
        </AccountProvider>
      </body>
    </html>
  )
}
