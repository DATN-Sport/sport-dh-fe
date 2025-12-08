"use client"

import { usePathname } from "next/navigation"
import { Chatbot } from "@/components/chatbot"

export function ChatbotFloatingWrapper() {
  const pathname = usePathname()

  // Ẩn floating chatbot trên trang full chat
  if (pathname === "/chat") {
    return null
  }

  return <Chatbot />
}


