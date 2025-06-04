import type React from "react"
import type { Metadata } from "next"
import { Providers } from '@/app/providers';
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/app/components/Navbar"
import { ThemeProvider } from "@/app/components/ThemeProvider"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Beast",
  description: "Clone of the game classic MS-DOS game Beast",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} h-screen flex flex-col overflow-hidden`}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <Suspense fallback={<div className="h-14 border-b"></div>}>
              <Navbar />
            </Suspense>
            <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
