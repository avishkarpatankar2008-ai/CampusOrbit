import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"
import { AuthGuard } from "@/lib/auth-guard"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "CampusOrbit - Campus Rental Platform",
  description: "Share, connect, and grow with your campus community. Rent items from fellow students easily and affordably.",
  keywords: ["campus", "rental", "students", "share", "borrow", "college"],
  authors: [{ name: "CampusOrbit" }],
  openGraph: {
    title: "CampusOrbit - Campus Rental Platform",
    description: "Share, connect, and grow with your campus community.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF8F2" },
    { media: "(prefers-color-scheme: dark)", color: "#161711" },
  ],
  width: "device-width",
  initialScale: 1,
}

export const icons = {
  icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-wACIGHmlxJp4MhKo98g9BncFalgA6U.png",
  apple: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-wACIGHmlxJp4MhKo98g9BncFalgA6U.png",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-background">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          
          <AuthProvider>
              {children}
          </AuthProvider>

        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
