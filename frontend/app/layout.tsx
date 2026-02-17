import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/context/auth-context"
import { ResourceProvider } from "@/context/resource-context"
import { AppShell } from "@/components/layout/app-shell"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "ACADEX - Campus Academic Resource Sharing",
  description:
    "Share, discover, and rate academic resources with your campus community. Notes, papers, slides, and more.",
}

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_inter.variable} ${_spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ResourceProvider>
            <AppShell>{children}</AppShell>
          </ResourceProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
