import type { Metadata } from "next";
import { Rajdhani, Inter, JetBrains_Mono, Bebas_Neue, Anton } from 'next/font/google';
import "./globals.css";

// Font configurations
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
  display: 'swap',
});

const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-anton',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Algorithm Institute of BattleRap",
  description: "Battle rap simulation and strategy game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${bebasNeue.variable} ${anton.variable} ${rajdhani.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#0a0a0a] text-zinc-100">
        {children}
      </body>
    </html>
  );
}
