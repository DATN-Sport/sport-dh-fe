import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ChatbotFloatingWrapper } from "@/components/chatbot-floating-wrapper"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sport DH - Đặt Sân Thể Thao Đà Nẵng",
  description: "Nền tảng đặt thuê sân thể thao hàng đầu tại Đà Nẵng",
  generator: "v0.app",
  icons: {
    icon: "/logo-web.png",
    shortcut: "/logo-web.png",
    apple: "/logo-web.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <ChatbotFloatingWrapper />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
