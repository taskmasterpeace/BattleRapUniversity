import type React from "react"
import type { Metadata } from "next"
import { Rajdhani, Inter, JetBrains_Mono, Anton, Press_Start_2P } from "next/font/google"
import "./globals.css"
import { PageTransition } from "@/components/ui/page-transition"
import { BattlerProvider } from "@/contexts/battler-context"

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

// Flyer System: heavy condensed poster display + pixel accent
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
})

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press",
})

export const metadata: Metadata = {
  title: "Battle Rap University",
  description: "Battle Rap University - Battle Rap Manager & Simulation Game",
  icons: {
    icon: "/favicon.ico",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${rajdhani.variable} ${inter.variable} ${jetbrainsMono.variable} ${anton.variable} ${pressStart.variable} font-sans antialiased bg-zinc-950 text-zinc-100`}
      >
        <BattlerProvider>
          <PageTransition>{children}</PageTransition>
        </BattlerProvider>
      </body>
    </html>
  )
}
