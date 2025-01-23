import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers/providers"

export const metadata: Metadata = {
  title: "Prosperity Pary Report System",
  description: "Lemi Kura Sub City Prosperity Pary Report System"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
    <head>
      <link rel="icon" href="/logo.png" type="image/svg+xml" />
    </head>
      <body className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-gray-900 dark:to-gray-800 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

