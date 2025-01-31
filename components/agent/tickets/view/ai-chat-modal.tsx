import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { processChatMessage } from "./ai-chat-actions"
import { Loader2 } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AIChatModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketId: string
}

export function AIChatModal({ open, onOpenChange, ticketId }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi, I'm your AI assistant. How can I help you with this ticket?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ])

    try {
      // Process the message
      const response = await processChatMessage(ticketId, userMessage)

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response as any || "I processed your request.",
        },
      ])
    } catch (error) {
      console.error('Error processing message:', error)
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Assistant</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto py-2 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                  "w-full"
                )}
              >
                <div
                  className={cn(
                    "inline-block rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                    "max-w-[75%] break-words whitespace-pre-wrap"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-4 pl-0 pr-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              className="flex gap-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send"
                )}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 