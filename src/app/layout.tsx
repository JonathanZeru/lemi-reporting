import type { Metadata } from "next"
import { Suspense } from "react"
import NextTopLoader from "nextjs-toploader"
import { Providers } from "@/components/providers/providers"
import "./globals.css"
import { LoadingSpinner } from "@/components/loading"

export const metadata: Metadata = {
  title: "Prosperity Party Report System",
  description: "Lemi Kura Sub City Prosperity Party Report System",
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
        <NextTopLoader
          color="#0070f3"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
        />
        <Providers>
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </Providers>
      </body>
    </html>
  )
}

