import type { Metadata } from "next";
import { Rajdhani, Inter, JetBrains_Mono, Bebas_Neue, Anton } from 'next/font/google';
import "./globals.css";
import GlobalNav from '@/components/nav/GlobalNav';
import QueryProvider from '@/components/providers/QueryProvider';
import { Toaster } from '@/components/ui/Toast';

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
  title: "Battle Rap University",
  description: "Battle rap career simulation — build your battler, prep your bars, take the stage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${bebasNeue.variable} ${anton.variable} ${rajdhani.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#0a0a0a] text-zinc-100">
        <QueryProvider>
          <GlobalNav />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
