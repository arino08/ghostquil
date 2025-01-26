import { Metadata } from "next"
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Navbar from "@/components/navbar"
import { Providers } from "./providers/providers"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "GhostQuil",
  description: "Anonymous remarks platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Providers>
    <body className={cn('min-h-screen ', GeistSans.className)}>
      <Navbar />
      <main className="pt-16"> {/* Add top padding equal to navbar height */}
        {children}
      </main>
      <Toaster />
    </body>
    </Providers>
    </html>
  )
}