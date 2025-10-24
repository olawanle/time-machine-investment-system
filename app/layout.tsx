import type React from "react"
import type { Metadata, Viewport } from "next"

import { Analytics } from "@vercel/analytics/next"
import { PerformanceMonitor } from "@/components/performance-monitor"
import "./globals.css"

import { Geist, Geist_Mono } from 'next/font/google'

// Initialize fonts
const geist = Geist({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const geistMono = Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })

export const metadata: Metadata = {
  title: "ChronosTime - Professional Investment Platform",
  description: "AI-powered investment strategies with institutional-grade security. Join 50,000+ professional investors maximizing returns with advanced portfolio management.",
  keywords: "investment platform, portfolio management, AI trading, professional investing, financial technology",
  authors: [{ name: "ChronosTime" }],
  creator: "ChronosTime",
  publisher: "ChronosTime",
  robots: "index, follow",
  openGraph: {
    title: "ChronosTime - Professional Investment Platform",
    description: "AI-powered investment strategies with institutional-grade security",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChronosTime - Professional Investment Platform",
    description: "AI-powered investment strategies with institutional-grade security",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0066ff" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${geist.className} antialiased min-h-screen overflow-x-hidden`}>
        <div id="root" className="relative">
          {children}
        </div>
        <Analytics />
        <PerformanceMonitor />
      </body>
    </html>
  )
}
