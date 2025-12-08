"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, MessageCircle, Send, X, Maximize2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

export function Chatbot() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      content: "Xin chào! Tôi là trợ lý AI của Sport DH. Tôi có thể giúp bạn tìm và đặt sân thể thao. Bạn cần gì?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const normalizeAnswer = (answer: string) => {
    const cleaned = answer.replace(/<think>[\s\S]*?<\/think>/gi, "").trim()
    return cleaned || answer
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await apiClient.chatbot(input, sessionId ?? undefined)
      if (response.session_id) {
        setSessionId(response.session_id)
      }
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: normalizeAnswer(response.answer),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại sau.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window - mini floating */}
      {isOpen && (
        <Card
          className={cn(
            "fixed bottom-4 right-4 z-50 w-[min(420px,calc(100%-2rem))] max-h-[70vh] overflow-hidden shadow-2xl transition-all duration-200 ease-out",
            "flex flex-col bg-background",
          )}
        >
          <CardHeader className="border-b pb-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <CardTitle className="text-lg">Trợ lý AI Sport DH</CardTitle>
                  <CardDescription>Hỏi tôi về sân thể thao</CardDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 flex items-center gap-1 px-0 text-xs text-muted-foreground hover:text-primary"
                    onClick={() => {
                      setIsOpen(false)
                      router.push("/chat")
                    }}
                  >
                    <Maximize2 className="h-3 w-3" />
                    <span>Mở full chat</span>
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Đóng chatbot">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            {/* Messages */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.type === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2 break-words whitespace-pre-wrap",
                      message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {message.type === "bot" ? (
                      <div className="prose prose-sm max-w-none break-words dark:prose-invert [&_pre]:overflow-x-auto">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p className="mt-1 text-xs opacity-70">{message.timestamp.toLocaleTimeString("vi-VN")}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập câu hỏi của bạn..."
                  disabled={loading}
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
