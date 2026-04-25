"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { AppSidebar } from "@/components/app-sidebar"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getConversations, getMessages, type ChatConversation, type ChatMessage } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  MessageCircle,
  Send,
  Loader2,
  ArrowLeft,
  Search,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const conversationsFetcher = async () => {
  const result = await getConversations()
  return result.data?.conversations || []
}

const messagesFetcher = async (conversationId: string) => {
  const result = await getMessages(conversationId)
  return result.data?.messages || []
}

export default function ChatPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, hasPendingOtp } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const { data: conversations, isLoading: conversationsLoading } = useSWR<ChatConversation[]>(
    isAuthenticated ? "conversations" : null,
    conversationsFetcher
  )

  const { data: messages, isLoading: messagesLoading, mutate: mutateMessages } = useSWR<ChatMessage[]>(
    selectedConversation ? `messages-${selectedConversation.id}` : null,
    () => (selectedConversation ? messagesFetcher(selectedConversation.id) : [])
  )

  

  // WebSocket connection
  useEffect(() => {
    if (!selectedConversation || !isAuthenticated) return

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || ""}/api/chat/ws`
    
    try {
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data) as ChatMessage
        mutateMessages((prev) => [...(prev || []), message], false)
      }

      wsRef.current.onerror = () => {
        // WebSocket error - silent fail
      }
    } catch {
      // WebSocket connection failed - silent fail
    }

    return () => {
      wsRef.current?.close()
    }
  }, [selectedConversation, isAuthenticated, mutateMessages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || isSending) return

    setIsSending(true)

    // Optimistic update
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: user?.id || "",
      senderName: user?.name || "",
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    }

    mutateMessages((prev) => [...(prev || []), tempMessage], false)
    setNewMessage("")

    // Send via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        conversationId: selectedConversation.id,
        content: newMessage,
      }))
    }

    setIsSending(false)
  }

  const filteredConversations = conversations?.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex">
        <AppSidebar />

        <main className="flex-1">
          <div className="mx-auto h-[calc(100vh-4rem)] max-w-6xl p-4 lg:p-8">
            <Card className="flex h-full overflow-hidden border-border bg-card">
              {/* Conversations List */}
              <div
                className={cn(
                  "w-full border-r border-border md:w-80",
                  selectedConversation && "hidden md:block"
                )}
              >
                <div className="border-b border-border p-4">
                  <h2 className="mb-4 text-lg font-semibold text-foreground">Messages</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <ScrollArea className="h-[calc(100%-5rem)]">
                  {conversationsLoading ? (
                    <div className="space-y-2 p-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg p-3">
                          <div className="h-10 w-10 animate-skeleton rounded-full bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-24 animate-skeleton rounded bg-muted" />
                            <div className="h-3 w-32 animate-skeleton rounded bg-muted" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !filteredConversations || filteredConversations.length === 0 ? (
                    <div className="p-4">
                      <EmptyState
                        icon={<MessageCircle className="h-6 w-6 text-muted-foreground" />}
                        title="No conversations"
                        description="Start a conversation by messaging an item owner."
                      />
                    </div>
                  ) : (
                    <div className="p-2">
                      {filteredConversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
                            selectedConversation?.id === conv.id
                              ? "bg-primary/10"
                              : "hover:bg-muted"
                          )}
                        >
                          {conv.participantAvatar ? (
                            <img
                              src={conv.participantAvatar}
                              alt={conv.participantName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                              {conv.participantName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate font-medium text-foreground">
                                {conv.participantName}
                              </p>
                              {conv.lastMessageTime && (
                                <span className="shrink-0 text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: false })}
                                </span>
                              )}
                            </div>
                            {conv.lastMessage && (
                              <p className="truncate text-sm text-muted-foreground">
                                {conv.lastMessage}
                              </p>
                            )}
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                              {conv.unreadCount}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Chat Area */}
              <div className={cn(
                "flex flex-1 flex-col",
                !selectedConversation && "hidden md:flex"
              )}>
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 border-b border-border p-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      {selectedConversation.participantAvatar ? (
                        <img
                          src={selectedConversation.participantAvatar}
                          alt={selectedConversation.participantName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                          {selectedConversation.participantName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {selectedConversation.participantName}
                        </p>
                      </div>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      {messagesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : !messages || messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-sm text-muted-foreground">
                            No messages yet. Start the conversation!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => {
                            const isOwn = message.senderId === user?.id
                            return (
                              <div
                                key={message.id}
                                className={cn(
                                  "chat-message-enter flex",
                                  isOwn ? "justify-end" : "justify-start"
                                )}
                              >
                                <div
                                  className={cn(
                                    "max-w-[75%] rounded-2xl px-4 py-2",
                                    isOwn
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-foreground"
                                  )}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <p
                                    className={cn(
                                      "mt-1 text-xs",
                                      isOwn
                                        ? "text-primary-foreground/70"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>

                    {/* Message Input */}
                    <form
                      onSubmit={handleSendMessage}
                      className="flex items-center gap-2 border-t border-border p-4"
                    >
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isSending}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!newMessage.trim() || isSending}
                        className="btn-glow"
                      >
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <EmptyState
                      icon={<MessageCircle className="h-8 w-8 text-muted-foreground" />}
                      title="Select a conversation"
                      description="Choose a conversation from the list to start messaging."
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
