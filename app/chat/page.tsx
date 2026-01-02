"use client"

import { useEffect, useRef, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft } from "lucide-react"
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

const BOOKING_GUIDE = "Đặt [Tên trung tâm] lúc [khung giờ] - xác nhận"

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      content:
        "Xin chào! Tôi là trợ lý AI của Sport DH. Tôi có thể giúp bạn tìm và đặt sân thể thao tại Đà Nẵng. Bạn cần gì?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const historyLoadedRef = useRef<string | null>(null)

  const normalizeAnswer = (answer: string) => {
    const cleaned = answer.replace(/<think>[\s\S]*?<\/think>/gi, "").trim()
    return cleaned || answer
  }

const sanitizeMessageContent = (content: string) => {
  if (!content) return content
  const cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim()
  return cleaned || content
}

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load session_id from localStorage on mount
  useEffect(() => {
    const savedSessionId = typeof window !== "undefined" ? localStorage.getItem("chat_session_id") : null
    if (savedSessionId) {
      setSessionId(savedSessionId)
    }
  }, [])

  // Load chat history when session_id is available
  useEffect(() => {
    const loadHistory = async () => {
      if (!sessionId || historyLoadedRef.current === sessionId) return // Already loaded for this session

      historyLoadedRef.current = sessionId
      setIsLoadingHistory(true)
      try {
        const history = await apiClient.getChatHistory(sessionId)
        if (history.messages && history.messages.length > 0) {
          const historyMessages: Message[] = history.messages.map((msg) => ({
            id: msg.id.toString(),
            type: msg.role === "user" ? "user" : "bot",
            content: sanitizeMessageContent(msg.content),
            timestamp: new Date(msg.created_at),
          }))
          setMessages(historyMessages)
        }
      } catch (error) {
        console.error("Failed to load chat history:", error)
        // Continue with welcome message if history load fails
        historyLoadedRef.current = null // Reset on error so we can retry
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadHistory()
  }, [sessionId])

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
        // Save session_id to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("chat_session_id", response.session_id)
        }
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


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 justify-center px-4 py-6">
        <div className="flex w-full max-w-5xl flex-col">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-1 px-2">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Quay lại
            </Button>
            <span>/</span>
            <span>Trợ lý AI Sport DH</span>
          </div>

          <Card className="flex min-h-[480px] flex-1 flex-col">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Trợ lý AI Sport DH</CardTitle>
                  <CardDescription>Hỏi tôi về sân thể thao, trung tâm và đặt sân tại Đà Nẵng</CardDescription>
                  <div className="mt-4 rounded-lg border bg-muted p-3">
                    <p className="text-sm font-medium text-primary mb-1">Cách đặt sân:</p>
                    <p className="text-sm text-muted-foreground">{BOOKING_GUIDE}</p>
                    <p className="text-xs text-muted-foreground mt-1">Ví dụ: Tôi đặt Sân bóng đá Mini Hòa Xuân lúc 18:30 - 19:30 - xác nhận</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-0">
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {isLoadingHistory && (
                  <div className="flex justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
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

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Nhập câu hỏi hoặc lệnh đặt sân..."
                    disabled={loading}
                  />
                  <Button onClick={handleSend} disabled={loading || !input.trim()} className="px-6">
                    Gửi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


