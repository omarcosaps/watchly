import type { Metadata } from "next"
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google"

import { AccountProvider } from "@/components/account-provider"

import "./globals.css"

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
})

const display = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
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
    <html lang="pt-BR" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-void font-sans text-paper">
        <AccountProvider>{children}</AccountProvider>
      </body>
    </html>
  )
}
