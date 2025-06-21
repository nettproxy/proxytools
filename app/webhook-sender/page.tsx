"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Send, User } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"

function spamWebhook(webhookUrl: string, message: string) {
  return fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to send webhook")
    }
    return response
  })
}

export default function WebhookSpammer() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const { theme } = useTheme()

  const handleSend = async () => {
    if (!webhookUrl || !message) {
      toast.error("Webhook URL and message are required.")
      return
    }

    setLoading(true)
    try {
      await spamWebhook(webhookUrl, message)
      toast.success("Message sent successfully!")
    } catch (error) {
      toast.error("Failed to send message.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container max-w-5xl mx-auto flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-white to-blue-500 bg-clip-text text-transparent">
            ProxyTools - Webhook Message Sender
          </h1>
          <Link href="/">
                <Button variant="outline" className="text-sm">
                  <User className="mr-2 h-4 w-4" /> Home
                </Button>
              </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Webhook Spammer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter Discord Webhook URL"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <Input
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={handleSend} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Send Message
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
